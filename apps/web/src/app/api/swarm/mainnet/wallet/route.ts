import {
  BackendError,
  getMainnetWallet,
  viewerResponse,
} from "@/lib/server/backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return viewerResponse(async () => {
    const query = [...new URL(request.url).searchParams];
    if (query.length !== 1 || query[0]?.[0] !== "accountId")
      throw new BackendError(400, "Provide one NEAR account ID.");
    return getMainnetWallet(query[0][1]);
  });
}
