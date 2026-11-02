import {
  BackendError,
  getViewerCycles,
  viewerResponse,
} from "@/lib/server/backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return viewerResponse(() => {
    const q = new URL(request.url).searchParams;
    if (
      [...q.keys()].some((k) => k !== "cursor") ||
      q.getAll("cursor").length > 1
    )
      throw new BackendError(400, "Invalid cycle query.");
    return getViewerCycles(q.get("cursor") ?? undefined);
  });
}
