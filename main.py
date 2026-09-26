import logging
import signal
import sys

from storage_node.grpc_server import serve, set_node_id as set_grpc_node_id
from storage_node.local_store import set_node_id as set_store_node_id

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger(__name__)


def main() -> None:
    node_id = sys.argv[1] if len(sys.argv) > 1 else "node-1"
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 50051

    set_grpc_node_id(node_id)
    set_store_node_id(node_id)
    log.info(f"storage node {node_id} starting on port {port}")

    def shutdown(signum, frame):
        log.info(f"storage node {node_id} shutting down")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    serve(port)


if __name__ == "__main__":
    main()