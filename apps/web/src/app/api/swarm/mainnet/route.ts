import {
  BackendError,
  getMainnetSnapshot,
  viewerResponse,
} from "@/lib/server/backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export function GET(request: Request) {
  return viewerResponse(async () => {
    if ([...new URL(request.url).searchParams].length)
      throw new BackendError(400, "Query parameters are not supported.");
    return getMainnetSnapshot();
  });
}
