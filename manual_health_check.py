from control_plane.health_checker import check_all


if __name__ == "__main__":
    print("=== Health check with both nodes running ===")
    health_results = check_all()
    for h in health_results:
        print(f"  {h.node_id}: is_alive={h.is_alive}, last_checked={h.last_checked}")
    assert all(h.is_alive for h in health_results), "Expected all nodes alive"

    print("OK (both nodes alive)")

    print("\n=== Stop node-2 now (Ctrl+C in its terminal) ===")
    input("Press Enter after stopping node-2...")

    print("\n=== Health check after node-2 stopped ===")
    health_results = check_all()
    for h in health_results:
        print(f"  {h.node_id}: is_alive={h.is_alive}, last_checked={h.last_checked}")

    node1 = next(h for h in health_results if h.node_id == "node-1")
    node2 = next(h for h in health_results if h.node_id == "node-2")
    assert node1.is_alive, "Expected node-1 to still be alive"
    assert not node2.is_alive, "Expected node-2 to be dead"

    print("OK (node-2 correctly detected as dead)")