from control_plane.raft.log import LogEntry
from control_plane.metadata_registry import register, record_replica
from shared.object_model import Object
from datetime import datetime


def apply(entry: LogEntry) -> None:
    if entry.command == "register_object":
        obj = Object(
            object_id=entry.args["object_id"],
            size_bytes=entry.args["size_bytes"],
            checksum=entry.args["checksum"],
            created_at=datetime.fromisoformat(entry.args["created_at"]),
        )
        register(obj)
    elif entry.command == "record_replica":
        record_replica(entry.args["object_id"], entry.args["node_id"])
    else:
        raise ValueError(f"Unknown command: {entry.command}")