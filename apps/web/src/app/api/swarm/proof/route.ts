import {
  BackendError,
  getViewerProof,
  viewerResponse,
} from "@/lib/server/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return viewerResponse(async () => {
    const query = new URL(request.url).searchParams;
    if (
      [...query.keys()].some((key) => key !== "hash") ||
      query.getAll("hash").length !== 1
    )
      throw new BackendError(400, "Supply exactly one proof hash.");
    return getViewerProof(query.get("hash") ?? "");
  });
}
