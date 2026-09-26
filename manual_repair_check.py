from control_plane.storage_client import put_object, get_object
from control_plane.metadata_registry import get_replica_nodes
from control_plane.repair import find_under_replicated, run_repair_pass
import time


if __name__ == "__main__":
    object_id = f"repair-test-{int(time.time())}"
    test_data = b"data for 3-node repair testing"

    print("=== Creating test object with 3 nodes up ===")
    obj = put_object(object_id, test_data)
    original_replicas = get_replica_nodes(object_id)
    print(f"Original replicas: {original_replicas}")
    assert len(original_replicas) == 2, f"Expected 2 replicas, got {len(original_replicas)}"

    print("OK (object created with 2 replicas)")

    # Tell user which of the original replica nodes to stop
    # We'll stop the first one in the list
    node_to_stop = original_replicas[0]
    other_replica = original_replicas[1]

    print(f"\n=== Stop {node_to_stop} now (Ctrl+C in its terminal) ===")
    print(f"(Leave {other_replica} and node-3 running)")
    input("Press Enter after stopping the node...")

    print("\n=== Checking for under-replicated objects ===")
    under_replicated = find_under_replicated()
    print(f"Under-replicated objects: {under_replicated}")
    assert object_id in under_replicated, f"Expected {object_id} to be under-replicated"

    print("OK (object correctly identified as under-replicated)")

    print("\n=== Running repair pass ===")
    results = run_repair_pass()
    print(f"Repair results: {results}")
    assert results.get(object_id) is True, f"Expected repair to return True, got {results.get(object_id)}"

    print("OK (repair succeeded - new replica written)")

    print("\n=== Verifying new replica set ===")
    new_replicas = get_replica_nodes(object_id)
    print(f"New replicas: {new_replicas}")
    # The other_replica should still be there, plus one new node (node-3)
    assert other_replica in new_replicas, f"Expected {other_replica} to still be a replica"
    # A new node should have been added (node-3)
    new_nodes = [n for n in new_replicas if n not in original_replicas]
    assert len(new_nodes) >= 1, f"Expected at least one NEW node as replica, got {new_replicas}"
    new_node = new_nodes[0]
    print(f"Confirmed: new replica added on {new_node} (was not in original {original_replicas})")

    # Verify data integrity
    retrieved = get_object(object_id)
    assert retrieved == test_data, f"Data mismatch after repair: expected {test_data}, got {retrieved}"
    print("OK (data integrity verified)")

    print("\n=== REPAIR PROVEN END-TO-END ===")
    print(f"Original replicas: {original_replicas}")
    print(f"After {node_to_stop} died + repair: {new_replicas}")
    print(f"New replica written to: {new_node}")