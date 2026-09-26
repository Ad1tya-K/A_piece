import grpc
from typing import Optional

from control_plane.metadata_registry import list_all, get_replica_nodes
from control_plane.health_checker import check_all
from control_plane.node_registry import list_nodes
from control_plane.auction import REPLICATION_FACTOR
from storage_node import vault_storage_pb2, vault_storage_pb2_grpc
from control_plane.storage_client import get_object
from control_plane.raft.log import log
from control_plane.raft.state_machine import apply


def find_under_replicated() -> list[str]:
    health_results = check_all()
    alive_node_ids = {h.node_id for h in health_results if h.is_alive}

    under_replicated = []
    for obj in list_all():
        replica_nodes = get_replica_nodes(obj.object_id)
        healthy_replicas = [n for n in replica_nodes if n in alive_node_ids]
        if len(healthy_replicas) < REPLICATION_FACTOR:
            under_replicated.append(obj.object_id)
    return under_replicated


def repair_object(object_id: str) -> bool:
    try:
        data = get_object(object_id)
    except FileNotFoundError:
        return False

    health_results = check_all()
    alive_node_ids = {h.node_id for h in health_results if h.is_alive}
    current_replicas = set(get_replica_nodes(object_id))

    # Find alive nodes that don't already have this object
    candidate_nodes = alive_node_ids - current_replicas
    if not candidate_nodes:
        return False

    # Pick the first candidate (simplest approach - no auction needed for repair)
    target_node_id = next(iter(candidate_nodes))
    all_nodes = list_nodes()
    target_node = next((n for n in all_nodes if n.node_id == target_node_id), None)
    if target_node is None:
        return False

    try:
        with grpc.insecure_channel(target_node.address) as channel:
            stub = vault_storage_pb2_grpc.VaultStorageStub(channel)
            stub.Put(vault_storage_pb2.PutRequest(object_id=object_id, data=data))
            entry = log.append(0, "record_replica", {"object_id": object_id, "node_id": target_node_id})
            apply(entry)
            return True
    except grpc.RpcError:
        return False


def run_repair_pass() -> dict[str, bool]:
    under_replicated = find_under_replicated()
    results = {}
    for obj_id in under_replicated:
        results[obj_id] = repair_object(obj_id)
    return results