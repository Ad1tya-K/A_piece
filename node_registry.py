from shared.object_model import Node

NODES = [
    Node(node_id="node-1", address="localhost:50051"),
    Node(node_id="node-2", address="localhost:50052"),
    Node(node_id="node-3", address="localhost:50053"),
]


def list_nodes() -> list[Node]:
    return NODES