from concurrent import futures
import grpc

from storage_node.object_store import put, get
from storage_node.telemetry_agent import get_snapshot
from storage_node import vault_storage_pb2, vault_storage_pb2_grpc

NODE_ID = "node-1"


def set_node_id(node_id: str) -> None:
    global NODE_ID
    NODE_ID = node_id


class VaultStorageServicer(vault_storage_pb2_grpc.VaultStorageServicer):
    def Put(self, request, context):
        obj = put(request.object_id, request.data)
        return vault_storage_pb2.PutResponse(
            object_id=obj.object_id,
            size_bytes=obj.size_bytes,
            checksum=obj.checksum,
            created_at=int(obj.created_at.timestamp()),
        )

    def Get(self, request, context):
        data = get(request.object_id)
        return vault_storage_pb2.GetResponse(data=data)

    def GetTelemetry(self, request, context):
        snapshot = get_snapshot(NODE_ID)
        return vault_storage_pb2.TelemetryResponse(
            node_id=snapshot.node_id,
            disk_free_bytes=snapshot.disk_free_bytes,
            disk_total_bytes=snapshot.disk_total_bytes,
            timestamp=int(snapshot.timestamp.timestamp()),
        )


def serve(port: int = 50051) -> None:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    vault_storage_pb2_grpc.add_VaultStorageServicer_to_server(VaultStorageServicer(), server)
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    server.wait_for_termination()