import {
  BackendError,
  getViewerCycle,
  viewerResponse,
} from "@/lib/server/backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return viewerResponse(async () => {
    if (new URL(request.url).search)
      throw new BackendError(400, "Unexpected query parameters.");
    return getViewerCycle((await context.params).id);
  });
}
