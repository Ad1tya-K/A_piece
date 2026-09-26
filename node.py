import json
import random
import threading
import time
from dataclasses import dataclass
from typing import Optional

import grpc

from control_plane.raft.log import LogEntry, log
from control_plane.raft.peers import PEERS
from control_plane.raft.state_machine import apply
from control_plane.raft import rpc_pb2, rpc_pb2_grpc


ELECTION_TIMEOUT_MIN = 1.0   # 1 second
ELECTION_TIMEOUT_MAX = 2.0   # 2 seconds
HEARTBEAT_INTERVAL = 0.050   # 50ms


@dataclass
class RaftNode:
    node_id: str
    address: str
    peers: list[tuple[str, str]]  # list of (peer_id, peer_address)
    initial_delay: float = 0.0  # optional initial delay before starting election timer

    def __post_init__(self):
        self.current_term = 0
        self.voted_for: Optional[str] = None
        self.role = "follower"
        self.commit_index = 0
        self.last_applied = 0
        self._lock = threading.Lock()
        self._election_timer: Optional[threading.Timer] = None
        self._heartbeat_thread: Optional[threading.Thread] = None
        self._running = False

    def start(self):
        self._running = True
        if self.initial_delay > 0:
            threading.Timer(self.initial_delay, self._reset_election_timer).start()
        else:
            initial_delay = random.uniform(0, 1.0)
            threading.Timer(initial_delay, self._reset_election_timer).start()
        print(f"[{self.node_id}] Started as follower, term={self.current_term}")

    def stop(self):
        self._running = False
        if self._election_timer:
            self._election_timer.cancel()
        if self._heartbeat_thread:
            self._heartbeat_thread.join(timeout=1.0)
        print(f"[{self.node_id}] Stopped")

    def _reset_election_timer(self):
        if self._election_timer:
            self._election_timer.cancel()
        timeout = random.uniform(ELECTION_TIMEOUT_MIN, ELECTION_TIMEOUT_MAX)
        self._election_timer = threading.Timer(timeout, self._election_timeout)
        self._election_timer.daemon = True
        self._election_timer.start()

    def _election_timeout(self):
        # Quick check without holding lock for long
        with self._lock:
            if not self._running or self.role == "leader":
                return
        # Start election without holding lock
        self._start_election()

    # --- Internal state accessors (lock held briefly) ---
    def _get_election_state(self) -> tuple[int, str, int, int]:
        """Get state needed to start election. Lock held briefly."""
        with self._lock:
            return (self.current_term, self.node_id, 
                    len(log._entries), log._entries[-1].term if log._entries else 0)

    def _get_leader_replicate_state(self) -> tuple[int, str, list, int]:
        """Get state needed for leader replication. Lock held briefly."""
        with self._lock:
            if self.role != "leader":
                return None
            entries = []
            for e in log._entries:
                entries.append(rpc_pb2.LogEntry(
                    index=e.index, term=e.term, command=e.command,
                    args_json=json.dumps(e.args)
                ))
            return (self.current_term, self.node_id, entries, self.commit_index)

    def _get_vote_state(self) -> tuple[int, Optional[str], int, int]:
        """Get state for vote decision. Lock held briefly."""
        with self._lock:
            return (self.current_term, self.voted_for,
                    len(log._entries), log._entries[-1].term if log._entries else 0)

    def _get_append_entries_state(self) -> tuple[int, str, list]:
        """Get state for AppendEntries handler. Lock held briefly."""
        with self._lock:
            return (self.current_term, self.role, log._entries[:])

    def _become_follower_locked(self, term: int):
        """Transition to follower. Caller must hold lock."""
        self.role = "follower"
        self.current_term = term
        self.voted_for = None
        self._reset_election_timer()

    def _become_leader_locked(self):
        """Transition to leader. Caller must hold lock."""
        if self.role != "candidate":
            return
        self.role = "leader"
        print(f"[{self.node_id}] Became leader for term {self.current_term}")

    def _record_vote_locked(self, candidate_id: str):
        """Record vote. Caller must hold lock."""
        self.voted_for = candidate_id
        self._reset_election_timer()

    def _advance_commit_locked(self):
        """Advance commit index and apply. Caller must hold lock."""
        self.commit_index = len(log._entries)
        while self.last_applied < self.commit_index:
            self.last_applied += 1
            entry = log._entries[self.last_applied - 1]
            apply(entry)

    # --- Election logic (lock NOT held during RPCs) ---
    def _start_election(self):
        # 1. Get state under lock
        with self._lock:
            if not self._running or self.role == "leader":
                return
            self.role = "candidate"
            self.current_term += 1
            term = self.current_term
            self.voted_for = self.node_id
            print(f"[{self.node_id}] Starting election for term {term}")
        
        # 2. Get log state for RPC
        last_log_index = len(log._entries)
        last_log_term = log._entries[-1].term if log._entries else 0
        
        # 3. Send RequestVote RPCs (no lock held)
        votes_received = 1  # vote for self
        threads = []
        results = []
        
        def request_vote(peer_id, peer_address):
            try:
                print(f"[{self.node_id}] Sending RequestVote to {peer_id} at {peer_address}")
                with grpc.insecure_channel(peer_address) as channel:
                    stub = rpc_pb2_grpc.RaftStub(channel)
                    response = stub.RequestVote(
                        rpc_pb2.RequestVoteRequest(
                            term=term,
                            candidate_id=self.node_id,
                            last_log_index=last_log_index,
                            last_log_term=last_log_term,
                        ),
                        timeout=0.1,
                    )
                    print(f"[{self.node_id}] RequestVote response from {peer_id}: term={response.term}, vote_granted={response.vote_granted}")
                    results.append((peer_id, response))
            except grpc.RpcError as e:
                print(f"[{self.node_id}] RequestVote to {peer_id} failed: {e}")
                pass

        for peer_id, peer_address in self.peers:
            if peer_id != self.node_id:
                t = threading.Thread(target=request_vote, args=(peer_id, peer_address))
                t.daemon = True
                t.start()
                threads.append(t)

        for t in threads:
            t.join(timeout=0.5)

        # 4. Process results under lock
        with self._lock:
            if not self._running or self.role != "candidate" or self.current_term != term:
                return  # stale election
            
            votes_received = 1  # vote for self
            for peer_id, response in results:
                if response.term > self.current_term:
                    self._become_follower_locked(response.term)
                    return
                if self.role != "candidate" or response.term != term:
                    return
                if response.vote_granted:
                    votes_received += 1
                    print(f"[{self.node_id}] Received vote from {peer_id}, total={votes_received}")
                    if votes_received > len(self.peers) / 2:
                        self._become_leader_locked()
                        self._send_append_entries_locked()
                        self._start_heartbeat_loop_locked()

    def _become_follower(self, term: int):
        with self._lock:
            self._become_follower_locked(term)

    def _become_leader(self):
        with self._lock:
            self._become_leader_locked()

    # --- Leader heartbeat & replication (lock NOT held during RPCs) ---
    def _send_append_entries_locked(self):
        """Must be called with lock held."""
        if self.role != "leader":
            return
        for peer_id, peer_address in self.peers:
            if peer_id == self.node_id:
                continue
            threading.Thread(
                target=self._replicate_to_peer, args=(peer_id, peer_address), daemon=True
            ).start()

    def _replicate_to_peer(self, peer_id: str, peer_address: str):
        # 1. Get replication state under lock
        state = None
        with self._lock:
            if self.role != "leader":
                return
            state = self._get_leader_replicate_state()
        
        if state is None:
            return
        term, leader_id, entries, leader_commit = state
        
        # 2. Send AppendEntries RPC (no lock)
        try:
            with grpc.insecure_channel(peer_address) as channel:
                stub = rpc_pb2_grpc.RaftStub(channel)
                response = stub.AppendEntries(
                    rpc_pb2.AppendEntriesRequest(
                        term=term,
                        leader_id=leader_id,
                        prev_log_index=len(log._entries),
                        prev_log_term=log._entries[-1].term if log._entries else 0,
                        entries=entries,
                        leader_commit=leader_commit,
                    ),
                    timeout=0.1,
                )
        except grpc.RpcError:
            return
        
        # 3. Process response under lock
        with self._lock:
            if not self._running or self.role != "leader" or self.current_term != term:
                return
            if response.term > self.current_term:
                self._become_follower_locked(response.term)
                return
            if response.success:
                self._advance_commit_locked()

    def _start_heartbeat_loop_locked(self):
        """Must be called with lock held."""
        if self._heartbeat_thread and self._heartbeat_thread.is_alive():
            return
        self._heartbeat_thread = threading.Thread(
            target=self._heartbeat_loop, daemon=True
        )
        self._heartbeat_thread.start()

    def _heartbeat_loop(self):
        while True:
            with self._lock:
                if not self._running or self.role != "leader":
                    break
            self._send_append_entries_locked()
            time.sleep(HEARTBEAT_INTERVAL)

    # --- RPC Handlers (fast, lock held briefly) ---
    def RequestVote(self, request, context):
        print(f"[{self.node_id}] RequestVote received from {request.candidate_id}, term={request.term}")
        # 1. Get vote decision state
        current_term, voted_for, last_log_index, last_log_term = self._get_vote_state()
        print(f"[{self.node_id}] Vote decision: current_term={current_term}, voted_for={voted_for}, log_idx={last_log_index}, log_term={last_log_term}")
        
        # 2. Determine vote (no lock held for decision logic)
        if request.term > current_term:
            with self._lock:
                self._become_follower_locked(request.term)
            current_term = request.term
            voted_for = None
        
        vote_granted = False
        if request.term >= current_term:
            if voted_for is None or voted_for == request.candidate_id:
                if (request.last_log_term > last_log_term or
                    (request.last_log_term == last_log_term and
                     request.last_log_index >= last_log_index)):
                    vote_granted = True
        
        # 3. Update state if vote granted (brief lock)
        if vote_granted:
            with self._lock:
                self._record_vote_locked(request.candidate_id)
        
        print(f"[{self.node_id}] RequestVote response: term={current_term}, vote_granted={vote_granted}")
        
        return rpc_pb2.RequestVoteResponse(
            term=current_term,
            vote_granted=vote_granted,
        )

    def AppendEntries(self, request, context):
        # 1. Get state
        current_term, role, log_entries = self._get_append_entries_state()
        
        # 2. Term check and role transition
        if request.term > current_term:
            with self._lock:
                self._become_follower_locked(request.term)
            current_term = request.term
            role = "follower"
        
        success = False
        if request.term >= current_term:
            with self._lock:
                self._reset_election_timer()
            if role == "candidate":
                with self._lock:
                    self.role = "follower"
                role = "follower"
            
            # Check log consistency
            if request.prev_log_index == 0:
                success = True
            elif request.prev_log_index <= len(log_entries):
                prev_entry = log_entries[request.prev_log_index - 1]
                if prev_entry.term == request.prev_log_term:
                    success = True
            
            if success:
                # Build new entries
                new_entries = []
                for e in request.entries:
                    new_entries.append(LogEntry(
                        index=e.index, term=e.term, command=e.command,
                        args=json.loads(e.args_json)
                    ))
                
                # Apply log update under lock
                with self._lock:
                    insert_idx = request.prev_log_index
                    log._entries = log._entries[:insert_idx] + new_entries
                    
                    if request.leader_commit > self.commit_index:
                        self.commit_index = min(request.leader_commit, len(log._entries))
                    
                    # Apply newly committed entries
                    while self.last_applied < self.commit_index:
                        self.last_applied += 1
                        entry = log._entries[self.last_applied - 1]
                        apply(entry)
        
        return rpc_pb2.AppendEntriesResponse(
            term=current_term,
            success=success,
        )

    def propose(self, command: str, args: dict) -> bool:
        with self._lock:
            if self.role != "leader":
                return False
            entry = log.append(self.current_term, command, args)
            print(f"[{self.node_id}] Appended entry {entry.index}: {command}")
        
        # Send AppendEntries to peer
        self._send_append_entries_locked()
        
        # Wait for replication
        for _ in range(20):
            time.sleep(0.05)
            with self._lock:
                if self.commit_index >= entry.index:
                    break
        
        with self._lock:
            return self.commit_index >= entry.index

    def get_role(self) -> str:
        with self._lock:
            return self.role

    def get_log(self) -> list[LogEntry]:
        with self._lock:
            return log._entries[:]


def serve(node: RaftNode, port: int):
    import concurrent.futures
    server = grpc.server(concurrent.futures.ThreadPoolExecutor(max_workers=10))
    rpc_pb2_grpc.add_RaftServicer_to_server(node, server)
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    print(f"[{node.node_id}] gRPC server listening on port {port}")
    server.wait_for_termination()