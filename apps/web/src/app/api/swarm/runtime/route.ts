import {
  BackendError,
  getRuntimeStatus,
  viewerResponse,
} from "@/lib/server/backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return viewerResponse(async () => {
    if ([...new URL(request.url).searchParams].length)
      throw new BackendError(400, "Query parameters are not supported.");
    return getRuntimeStatus();
  });
}
