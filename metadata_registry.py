import os
import sqlite3
from datetime import datetime
from pathlib import Path

from shared.object_model import Object


def _db_path() -> Path:
    env_path = os.environ.get("VAULT_METADATA_DB")
    if env_path:
        return Path(env_path)
    return Path("./control_plane_metadata.db")


def _init_db() -> None:
    with sqlite3.connect(_db_path()) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS objects (
                object_id TEXT PRIMARY KEY,
                size_bytes INTEGER NOT NULL,
                checksum TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS object_replicas (
                object_id TEXT NOT NULL,
                node_id TEXT NOT NULL,
                PRIMARY KEY (object_id, node_id)
            )
        """)


def register(obj: Object) -> None:
    _init_db()
    with sqlite3.connect(_db_path()) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO objects (object_id, size_bytes, checksum, created_at) VALUES (?, ?, ?, ?)",
            (obj.object_id, obj.size_bytes, obj.checksum, obj.created_at.isoformat()),
        )


def record_replica(object_id: str, node_id: str) -> None:
    _init_db()
    with sqlite3.connect(_db_path()) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO object_replicas (object_id, node_id) VALUES (?, ?)",
            (object_id, node_id),
        )


def get_replica_nodes(object_id: str) -> list[str]:
    _init_db()
    with sqlite3.connect(_db_path()) as conn:
        rows = conn.execute(
            "SELECT node_id FROM object_replicas WHERE object_id = ?",
            (object_id,),
        ).fetchall()
        return [row[0] for row in rows]


def lookup(object_id: str) -> Object | None:
    _init_db()
    with sqlite3.connect(_db_path()) as conn:
        row = conn.execute(
            "SELECT object_id, size_bytes, checksum, created_at FROM objects WHERE object_id = ?",
            (object_id,),
        ).fetchone()
        if row is None:
            return None
        return Object(
            object_id=row[0],
            size_bytes=row[1],
            checksum=row[2],
            created_at=datetime.fromisoformat(row[3]),
        )


def list_all() -> list[Object]:
    _init_db()
    with sqlite3.connect(_db_path()) as conn:
        rows = conn.execute(
            "SELECT object_id, size_bytes, checksum, created_at FROM objects"
        ).fetchall()
        return [
            Object(
                object_id=row[0],
                size_bytes=row[1],
                checksum=row[2],
                created_at=datetime.fromisoformat(row[3]),
            )
            for row in rows
        ]