from control_plane.telemetry_aggregator import collect_all


if __name__ == "__main__":
    snapshots = collect_all()
    for s in snapshots:
        print(f"Telemetry: {s}")

    assert len(snapshots) >= 1, "Expected at least one telemetry snapshot"
    assert snapshots[0].disk_total_bytes > 0, "Expected disk_total_bytes > 0"

    print("OK")