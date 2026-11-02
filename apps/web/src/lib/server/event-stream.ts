import "server-only";
import type { ViewerEvents } from "@symbiochain/shared";
import { BackendError, getViewerEvents } from "./backend";
export function eventStream(
  request: Request,
  read: (after: string) => Promise<ViewerEvents> = getViewerEvents,
) {
  const url = new URL(request.url),
    q = url.searchParams;
  if ([...q.keys()].some((k) => k !== "after") || q.getAll("after").length > 1)
    throw new BackendError(400, "Invalid event query.");
  let cursor = request.headers.get("last-event-id") ?? q.get("after") ?? "0";
  if (!/^\d{1,19}$/.test(cursor) || BigInt(cursor) > 9223372036854775807n)
    throw new BackendError(400, "Invalid event cursor.");
  const encoder = new TextEncoder();
  let closed = false,
    timer: ReturnType<typeof setTimeout> | undefined,
    wake: () => void = () => {};
  let cleanup = () => {};
  const started = Date.now();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;
        clearTimeout(timer);
        wake();
        request.signal.removeEventListener("abort", close);
        try {
          controller.close();
        } catch {}
      };
      const send = (value: string) => {
        if (!closed) controller.enqueue(encoder.encode(value));
      };
      cleanup = close;
      request.signal.addEventListener("abort", close, { once: true });
      try {
        if (request.signal.aborted) {
          close();
          return;
        }
        send("retry: 5000\n: connected\n\n");
        while (!closed && Date.now() - started < 35000) {
          const result = await read(cursor);
          send("event: ready\ndata: {}\n\n");
          for (const event of result.events) {
            if (BigInt(event.seq) <= BigInt(cursor)) continue;
            send(
              `id: ${event.seq}\nevent: change\ndata: ${JSON.stringify(event)}\n\n`,
            );
            cursor = event.seq;
          }
          send(": heartbeat\n\n");
          await new Promise<void>((resolve) => {
            wake = resolve;
            timer = setTimeout(resolve, result.hasMore ? 1000 : 5000);
            if (closed) resolve();
          });
        }
      } catch {
        send(
          'event: unavailable\ndata: {"message":"Event stream interrupted; polling remains available."}\n\n',
        );
      } finally {
        close();
      }
    },
    cancel() {
      cleanup();
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "private, no-store, no-transform",
      "x-content-type-options": "nosniff",
      "x-accel-buffering": "no",
    },
  });
}
