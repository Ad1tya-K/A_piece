import grpc
from datetime import datetime

from shared.object_model import NodeHealth
from control_plane.node_registry import list_nodes
from storage_node import vault_storage_pb2, vault_storage_pb2_grpc


HEALTH_CHECK_TIMEOUT = 2.0


def check_all() -> list[NodeHealth]:
    health_results = []
    for node in list_nodes():
        is_alive = False
        try:
            with grpc.insecure_channel(node.address) as channel:
                stub = vault_storage_pb2_grpc.VaultStorageStub(channel)
                stub.GetTelemetry(
                    vault_storage_pb2.TelemetryRequest(),
                    timeout=HEALTH_CHECK_TIMEOUT,
                )
                is_alive = True
        except grpc.RpcError:
            pass
        health_results.append(
            NodeHealth(
                node_id=node.node_id,
                is_alive=is_alive,
                last_checked=datetime.now(),
            )
        )
    return health_results