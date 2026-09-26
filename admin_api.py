from datetime import datetime
from dataclasses import asdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from control_plane.node_registry import list_nodes
from control_plane.health_checker import check_all
from control_plane.telemetry_aggregator import collect_all
from control_plane.metadata_registry import list_all, get_replica_nodes, lookup
from shared.object_model import Node, NodeHealth, TelemetrySnapshot, Object


app = FastAPI(title="Vault Admin API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _node_to_dict(node: Node) -> dict:
    return asdict(node)


def _health_to_dict(health: NodeHealth) -> dict:
    return {
        "node_id": health.node_id,
        "is_alive": health.is_alive,
        "last_checked": health.last_checked.isoformat(),
    }


def _telemetry_to_dict(telemetry: TelemetrySnapshot) -> dict:
    return {
        "node_id": telemetry.node_id,
        "disk_free_bytes": telemetry.disk_free_bytes,
        "disk_total_bytes": telemetry.disk_total_bytes,
        "timestamp": telemetry.timestamp.isoformat(),
    }


def _object_to_dict(obj: Object) -> dict:
    return {
        "object_id": obj.object_id,
        "size_bytes": obj.size_bytes,
        "checksum": obj.checksum,
        "created_at": obj.created_at.isoformat(),
    }


@app.get("/nodes")
def get_nodes() -> list[dict]:
    """Returns a list of {node_id, address} for every known node."""
    return [_node_to_dict(n) for n in list_nodes()]


@app.get("/health")
def get_health() -> list[dict]:
    """Returns a list of {node_id, is_alive, last_checked} for every node."""
    return [_health_to_dict(h) for h in check_all()]


@app.get("/telemetry")
def get_telemetry() -> list[dict]:
    """Returns a list of {node_id, disk_free_bytes, disk_total_bytes, timestamp} for every node."""
    return [_telemetry_to_dict(t) for t in collect_all()]


@app.get("/objects")
def get_objects() -> list[dict]:
    """Returns a list of object summaries with {object_id, size_bytes, checksum, created_at, replicas}. Each object's replicas field lists replica node IDs."""
    objects = []
    for obj in list_all():
        obj_dict = _object_to_dict(obj)
        obj_dict["replicas"] = get_replica_nodes(obj.object_id)
        objects.append(obj_dict)
    return objects


@app.get("/objects/{object_id}")
def get_object(object_id: str) -> dict:
    """Returns {object_id, size_bytes, checksum, created_at, replicas} for the given object ID, or 404 if not found."""
    obj = lookup(object_id)
    if obj is None:
        raise HTTPException(status_code=404, detail=f"Object {object_id} not found")
    obj_dict = _object_to_dict(obj)
    obj_dict["replicas"] = get_replica_nodes(object_id)
    return obj_dict


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)