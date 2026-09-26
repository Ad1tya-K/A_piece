from hashlib import sha256
from pathlib import Path

_DATA_ROOT = Path("./data")
_CURRENT_NODE_ID = "node-1"


def _data_dir() -> Path:
    return _DATA_ROOT / _CURRENT_NODE_ID


def set_node_id(node_id: str) -> None:
    global _CURRENT_NODE_ID
    _CURRENT_NODE_ID = node_id


def _ensure_dir() -> None:
    _data_dir().mkdir(parents=True, exist_ok=True)


def compute_checksum(data: bytes) -> str:
    return sha256(data).hexdigest()


def write(object_id: str, data: bytes) -> None:
    _ensure_dir()
    (_data_dir() / object_id).write_bytes(data)


def read(object_id: str) -> bytes:
    return (_data_dir() / object_id).read_bytes()


def get_data_dir() -> Path:
    _ensure_dir()
    return _data_dir()