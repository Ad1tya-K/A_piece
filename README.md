# Vault

A fault-tolerant distributed object storage system (research prototype).

Requires Python 3.12+.

## Architecture

- **control_plane** — gRPC client, metadata registry (sqlite3), node registry, telemetry aggregator, auction engine, health checker, repair engine, admin API (FastAPI), Raft consensus (log, state machine, leader election), future: API gateway, placement policy, cluster manager
- **storage_node** — gRPC server, local block storage, checksum, telemetry agent, future: chunking, replication, repair
- **shared** — common data models (Object, Node, TelemetrySnapshot, Bid, NodeHealth)

## Run

Start storage nodes (three terminals):
```bash
python -m storage_node.main node-1 50051
python -m storage_node.main node-2 50052
python -m storage_node.main node-3 50053
```

Start admin API (separate terminal):
```bash
python -m control_plane.admin_api
```

Run manual end-to-end check (with storage nodes running):
```bash
python -m control_plane.manual_check
```

Run manual telemetry check (with storage nodes running):
```bash
python -m control_plane.manual_telemetry_check
```

Run manual health check (with storage nodes running):
```bash
python -m control_plane.manual_health_check
```

Run manual repair check (with storage nodes running):
```bash
python -m control_plane.manual_repair_check
```

Run Raft consensus verification:
```bash
python -m control_plane.raft.manual_raft_check
```

## Admin API Endpoints (GET, no auth)

```
GET /nodes          → list of nodes (node_id, address)
GET /health         → list of node health (node_id, is_alive, last_checked)
GET /telemetry      → list of telemetry (node_id, disk_free_bytes, disk_total_bytes, timestamp)
GET /objects        → list of all objects with replica nodes
GET /objects/{id}   → single object metadata + replicas, or 404
```

## Current State (Step 16b Complete)

### Core Storage & Replication
- ✅ Raw file I/O (`storage_node/local_store.py`)
- ✅ SHA-256 checksums (`local_store.compute_checksum`)
- ✅ Object model (`shared/object_model.Object`)
- ✅ Node model (`shared/object_model.Node`)
- ✅ Telemetry model (`shared/object_model.TelemetrySnapshot`)
- ✅ Bid model (`shared/object_model.Bid`)
- ✅ NodeHealth model (`shared/object_model.NodeHealth`)
- ✅ Object store wiring (`storage_node/object_store.py`)
- ✅ gRPC service (Put/Get/GetTelemetry, `storage_node/vault_storage.proto`)
- ✅ gRPC server (`storage_node/grpc_server.py`, configurable port)
- ✅ gRPC client (`control_plane/storage_client.py`)
- ✅ Metadata registry with sqlite3 persistence (`control_plane/metadata_registry.py`)
- ✅ Static node registry with 3 nodes (`control_plane/node_registry.py`)
- ✅ Telemetry agent (`storage_node/telemetry_agent.py`)
- ✅ Telemetry aggregator (`control_plane/telemetry_aggregator.py`)
- ✅ Auction engine (`control_plane/auction.py`) — free-space-ratio scoring
- ✅ Multi-replica writes (`REPLICATION_FACTOR = 2`, `select_winners`)
- ✅ Replica tracking (`object_replicas` table, `record_replica`/`get_replica_nodes`)
- ✅ Replica-aware reads (`get_object` tries real replica nodes in order)
- ✅ Multi-node storage with separate data dirs (`./data/{node_id}/`)
- ✅ Health checker (`control_plane/health_checker.py`) — 2s timeout, reuses GetTelemetry
- ✅ Auction filters dead nodes before bidding (`put_object` pre-filters via health)
- ✅ Repair engine (`control_plane/repair.py`) — `find_under_replicated`, `repair_object`, `run_repair_pass`
- ✅ Admin API (`control_plane/admin_api.py`) — FastAPI + uvicorn, 5 read-only endpoints
- ✅ Manual health check (`control_plane/manual_health_check.py`) — detects node failure
- ✅ Manual repair check (`control_plane/manual_repair_check.py`) — **proves end-to-end repair with new replica written to third node**
- ✅ Manual integration test (`control_plane/manual_check.py` → prints "OK" + multi-replica write + fallback read)

### Raft Consensus (Step 16b)
- ✅ Command log model (`control_plane/raft/log.py`) — `LogEntry` (index, term, command, args), in-memory `Log`
- ✅ State machine (`control_plane/raft/state_machine.py`) — `apply()` dispatches `register_object`/`record_replica` to metadata_registry
- ✅ Raft RPC protocol (`control_plane/raft/rpc.proto`) — `RequestVote`, `AppendEntries` with JSON-encoded args
- ✅ Static peer registry (`control_plane/raft/peers.py`) — 2 control-plane nodes (cp-1, cp-2)
- ✅ Raft node state machine (`control_plane/raft/node.py`) — leader election, randomized timeouts, RequestVote/AppendEntries handlers, log replication, commit index advancement
- ✅ Manual verification (`control_plane/raft/manual_raft_check.py`) — tests all core mechanisms
- ✅ Per-node metadata DB isolation (`control_plane_metadata_{cp-1,cp-2}.db`)

### Known Limitation (per Step 16b requirements)
- 2-node Raft cluster has no fault tolerance for leader election
- If leader dies, remaining node cannot elect new leader (split vote, no majority)
- This is expected behavior for even-numbered clusters
- Adding 3rd control-plane node resolves this (Step 16c/16d)

## Next Steps

- Background repair scheduler / daemon loop (now has repair logic to invoke)
- Gossip / failure detection (peer-to-peer)
- Erasure coding (beyond full-copy replication)
- Admin API authentication / write endpoints
- Truthfulness / anti-manipulation in auction
- Step 16c: Wire storage writes through distributed Raft log
- Step 16d: Add 3rd control-plane node for fault-tolerant leader election