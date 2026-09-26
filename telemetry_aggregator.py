import grpc
from datetime import datetime
from typing import Optional

from shared.object_model import TelemetrySnapshot, Node
from control_plane.node_registry import list_nodes
from storage_node import vault_storage_pb2, vault_storage_pb2_grpc


def collect_all(nodes: Optional[list[Node]] = None) -> list[TelemetrySnapshot]:
    if nodes is None:
        nodes = list_nodes()
    snapshots = []
    for node in nodes:
        try:
            with grpc.insecure_channel(node.address) as channel:
                stub = vault_storage_pb2_grpc.VaultStorageStub(channel)
                response = stub.GetTelemetry(vault_storage_pb2.TelemetryRequest())
                snapshots.append(
                    TelemetrySnapshot(
                        node_id=response.node_id,
                        disk_free_bytes=response.disk_free_bytes,
                        disk_total_bytes=response.disk_total_bytes,
                        timestamp=datetime.fromtimestamp(response.timestamp),
                    )
                )
        except grpc.RpcError:
            continue
    return snapshots