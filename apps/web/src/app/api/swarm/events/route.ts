import { eventStream } from "@/lib/server/event-stream";
import { viewerResponse } from "@/lib/server/backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export function GET(request: Request) {
  try {
    return eventStream(request);
  } catch (error) {
    return viewerResponse(async () => {
      throw error;
    });
  }
}
