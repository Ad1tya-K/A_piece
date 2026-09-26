import grpc
from datetime import datetime

from shared.object_model import Object
from storage_node import vault_storage_pb2, vault_storage_pb2_grpc
from control_plane.metadata_registry import get_replica_nodes
from control_plane.node_registry import list_nodes
from control_plane.telemetry_aggregator import collect_all
from control_plane.auction import compute_bids, select_winners, REPLICATION_FACTOR
from control_plane.health_checker import check_all
from control_plane.raft.log import log
from control_plane.raft.state_machine import apply


def _get_alive_nodes() -> list:
    health_results = check_all()
    alive_node_ids = {h.node_id for h in health_results if h.is_alive}
    all_nodes = list_nodes()
    return [n for n in all_nodes if n.node_id in alive_node_ids]


def put_object(object_id: str, data: bytes) -> Object:
    alive_nodes = _get_alive_nodes()
    if not alive_nodes:
        raise RuntimeError("no alive nodes available for write")

    snapshots = collect_all(alive_nodes)
    bids = compute_bids(snapshots, alive_nodes)
    winners = select_winners(bids, REPLICATION_FACTOR)

    first_obj = None
    any_success = False

    for bid in winners:
        try:
            with grpc.insecure_channel(bid.address) as channel:
                stub = vault_storage_pb2_grpc.VaultStorageStub(channel)
                response = stub.Put(vault_storage_pb2.PutRequest(object_id=object_id, data=data))
                obj = Object(
                    object_id=response.object_id,
                    size_bytes=response.size_bytes,
                    checksum=response.checksum,
                    created_at=datetime.fromtimestamp(response.created_at),
                )
                entry = log.append(0, "record_replica", {"object_id": object_id, "node_id": bid.node_id})
                apply(entry)
                if first_obj is None:
                    first_obj = obj
                any_success = True
        except grpc.RpcError as e:
            print(f"Warning: write to {bid.node_id} ({bid.address}) failed: {e}")

    if not any_success:
        raise RuntimeError(f"all replica writes failed for {object_id}")

    entry = log.append(
        0,
        "register_object",
        {
            "object_id": first_obj.object_id,
            "size_bytes": first_obj.size_bytes,
            "checksum": first_obj.checksum,
            "created_at": first_obj.created_at.isoformat(),
        },
    )
    apply(entry)
    return first_obj


def get_object(object_id: str) -> bytes:
    replica_node_ids = get_replica_nodes(object_id)
    if not replica_node_ids:
        raise FileNotFoundError(object_id)

    nodes = list_nodes()
    node_by_id = {n.node_id: n for n in nodes}

    for node_id in replica_node_ids:
        node = node_by_id.get(node_id)
        if node is None:
            continue
        try:
            with grpc.insecure_channel(node.address) as channel:
                stub = vault_storage_pb2_grpc.VaultStorageStub(channel)
                response = stub.Get(vault_storage_pb2.GetRequest(object_id=object_id))
                return response.data
        except grpc.RpcError:
            continue

    raise FileNotFoundError(object_id)