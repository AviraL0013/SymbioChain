import {
  BackendError,
  getMainnetTransaction,
  viewerResponse,
} from "@/lib/server/backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return viewerResponse(async () => {
    const query = [...new URL(request.url).searchParams];
    if (query.length !== 1 || query[0]?.[0] !== "hash")
      throw new BackendError(400, "Provide one transaction hash.");
    return getMainnetTransaction(query[0][1]);
  });
}
