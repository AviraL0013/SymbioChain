import { getMainnetSettlement, viewerResponse } from "@/lib/server/backend";
export const dynamic = "force-dynamic";
export async function GET() {
  return viewerResponse(getMainnetSettlement);
}
