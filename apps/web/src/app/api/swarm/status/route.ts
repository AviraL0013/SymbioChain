import {
  BackendError,
  getViewerStatus,
  viewerResponse,
} from "@/lib/server/backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return viewerResponse(() => {
    if (new URL(request.url).search)
      throw new BackendError(400, "Unexpected query parameters.");
    return getViewerStatus();
  });
}
