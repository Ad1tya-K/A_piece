import shutil
from datetime import datetime

from shared.object_model import TelemetrySnapshot
from storage_node.local_store import get_data_dir


def get_snapshot(node_id: str) -> TelemetrySnapshot:
    usage = shutil.disk_usage(get_data_dir())
    return TelemetrySnapshot(
        node_id=node_id,
        disk_free_bytes=usage.free,
        disk_total_bytes=usage.total,
        timestamp=datetime.now(),
    )