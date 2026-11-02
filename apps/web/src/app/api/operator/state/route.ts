import { viewerResponse } from "@/lib/server/backend";
import { requireOperator } from "@/lib/server/operator-session";
import { getOperatorState } from "@/lib/server/operator-backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return viewerResponse(() => getOperatorState(requireOperator(request)));
}

export const maxDuration = 60;
