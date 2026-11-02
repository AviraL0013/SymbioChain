import { test } from "node:test";
import assert from "node:assert/strict";
import { eventStream } from "../apps/web/src/lib/server/event-stream";
test("replays ordered event IDs, skips duplicates and resumes from Last-Event-ID", async () => {
  const controller = new AbortController(),
    cursors: string[] = [];
  const request = new Request("https://app.example/api/swarm/events?after=0", {
    headers: { "last-event-id": "10" },
    signal: controller.signal,
  });
  const response = eventStream(request, async (after) => {
    cursors.push(after);
    if (cursors.length === 2) {
      controller.abort();
      return {
        contractVersion: 1,
        mode: "PAPER",
        cursor: after,
        hasMore: false,
        events: [],
      };
    }
    return {
      contractVersion: 1,
      mode: "PAPER",
      cursor: "12",
      hasMore: true,
      events: ["11", "11", "12"].map((seq) => ({
        seq,
        topic: "cycle.updated",
        cycleId: null,
        timestamp: "2026-11-01T00:00:00Z",
      })),
    };
  });
  assert.match(response.headers.get("content-type") ?? "", /event-stream/);
  const text = await response.text();
  assert.deepEqual(cursors, ["10", "12"]);
  assert.equal((text.match(/id: 11\n/g) ?? []).length, 1);
  assert.ok(text.includes("id: 12\n"));
  assert.ok(text.includes("event: ready\n"));
});
test("refuses malformed cursors and reports a stream failure without upstream details", async () => {
  for (const query of [
    "after=-1",
    "url=https://evil.example",
    "after=9223372036854775808",
  ])
    assert.throws(
      () =>
        eventStream(
          new Request(`https://app.example/api/swarm/events?${query}`),
        ),
      /Invalid event/,
    );
  const response = eventStream(
    new Request("https://app.example/api/swarm/events"),
    async () => {
      throw Error("PRIVATE-UPSTREAM-SENTINEL");
    },
  );
  const text = await response.text();
  assert.match(text, /event: unavailable/);
  assert.doesNotMatch(text, /PRIVATE-UPSTREAM/);
});
