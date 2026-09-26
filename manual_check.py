from pathlib import Path
from control_plane.storage_client import put_object, get_object
from control_plane.metadata_registry import lookup, get_replica_nodes
from control_plane.telemetry_aggregator import collect_all
from control_plane.node_registry import list_nodes
from control_plane.auction import compute_bids, select_winners, REPLICATION_FACTOR


if __name__ == "__main__":
    object_id = "test-object-1"
    test_data = b"hello vault storage"

    snapshots = collect_all()
    nodes = list_nodes()
    bids = compute_bids(snapshots, nodes)
    winners = select_winners(bids, REPLICATION_FACTOR)
    print(f"Auction winners: {[(w.node_id, w.address, f'{w.score:.4f}') for w in winners]}")

    obj = put_object(object_id, test_data)
    print(f"Put response: {obj}")

    replica_nodes = get_replica_nodes(object_id)
    print(f"Replicas recorded at: {replica_nodes}")
    assert len(replica_nodes) >= REPLICATION_FACTOR, f"Expected at least {REPLICATION_FACTOR} replicas, got {len(replica_nodes)}"

    retrieved = get_object(object_id)
    assert retrieved == test_data, f"Expected {test_data}, got {retrieved}"

    registered = lookup(object_id)
    assert registered is not None, "Object not found in registry"
    assert registered.checksum == obj.checksum, "Checksum mismatch in registry"

    print("OK (multi-replica write + read)")

    # Simulate one replica failing by deleting its local file
    failed_node = replica_nodes[0]
    data_file = Path(f"./data/{failed_node}/{object_id}")
    if data_file.exists():
        data_file.unlink()
        print(f"Deleted replica from {failed_node}: {data_file}")
    else:
        print(f"Warning: replica file not found at {data_file}")

    # Read should still succeed from the other replica
    retrieved_after_failure = get_object(object_id)
    assert retrieved_after_failure == test_data, f"Expected {test_data} after replica failure, got {retrieved_after_failure}"

    print("OK (fallback read after replica loss)")