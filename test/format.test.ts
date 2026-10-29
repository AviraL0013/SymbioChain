import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatAtoms,
  workerStatus,
} from "../apps/web/src/features/swarm/format";

test("formats exact atoms, negative values, zero and unknown values without float conversion", () => {
  assert.equal(
    formatAtoms("900719925474099312345678", 6),
    "900,719,925,474,099,312.345678",
  );
  assert.equal(formatAtoms("-1", 24), "−0.000000000000000000000001");
  assert.equal(formatAtoms("0", 0), "0");
  assert.equal(formatAtoms("1000000", 6), "1");
  assert.equal(formatAtoms(null, 6), "—");
});

test("does not claim a worker is online without a recent heartbeat", () => {
  assert.equal(workerStatus(undefined, undefined), "Unknown");
  const worker = {
    role: "SCOUT" as const,
    paused: false,
    heartbeat: "2026-10-29T10:00:00.000Z",
  };
  assert.equal(workerStatus(worker, "2026-10-29T10:00:30.000Z"), "Online");
  assert.equal(workerStatus(worker, "2026-10-29T10:03:00.000Z"), "Stale");
  assert.equal(
    workerStatus({ ...worker, paused: true }, "2026-10-29T10:00:30.000Z"),
    "Paused",
  );
});
