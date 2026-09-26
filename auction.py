from shared.object_model import Bid, Node, TelemetrySnapshot

REPLICATION_FACTOR = 2


def compute_bids(snapshots: list[TelemetrySnapshot], nodes: list[Node]) -> list[Bid]:
    node_by_id = {n.node_id: n for n in nodes}
    bids = []
    for snap in snapshots:
        node = node_by_id.get(snap.node_id)
        if node is None:
            continue
        if snap.disk_total_bytes == 0:
            continue
        score = snap.disk_free_bytes / snap.disk_total_bytes
        bids.append(Bid(node_id=node.node_id, address=node.address, score=score))
    return bids


def select_winner(bids: list[Bid]) -> Bid:
    if not bids:
        raise ValueError("no bids available")
    return max(bids, key=lambda b: b.score)


def select_winners(bids: list[Bid], count: int) -> list[Bid]:
    if not bids:
        raise ValueError("no bids available")
    sorted_bids = sorted(bids, key=lambda b: b.score, reverse=True)
    return sorted_bids[:count]