import {
  BackendError,
  getViewerSnapshot,
  viewerResponse,
} from "@/lib/server/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return viewerResponse(async () => {
    if ([...new URL(request.url).searchParams].length)
      throw new BackendError(
        400,
        "This endpoint does not accept query parameters.",
      );
    return getViewerSnapshot();
  });
}
