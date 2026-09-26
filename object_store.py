from datetime import datetime

from shared.object_model import Object
from storage_node.local_store import compute_checksum, write, read


def put(object_id: str, data: bytes) -> Object:
    checksum = compute_checksum(data)
    write(object_id, data)
    return Object(
        object_id=object_id,
        size_bytes=len(data),
        checksum=checksum,
        created_at=datetime.now(),
    )


def get(object_id: str) -> bytes:
    return read(object_id)