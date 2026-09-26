from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Object:
    object_id: str
    size_bytes: int
    checksum: str
    created_at: datetime


@dataclass(frozen=True, slots=True)
class Node:
    node_id: str
    address: str


@dataclass(frozen=True, slots=True)
class TelemetrySnapshot:
    node_id: str
    disk_free_bytes: int
    disk_total_bytes: int
    timestamp: datetime


@dataclass(frozen=True, slots=True)
class Bid:
    node_id: str
    address: str
    score: float


@dataclass(frozen=True, slots=True)
class NodeHealth:
    node_id: str
    is_alive: bool
    last_checked: datetime