import { viewerResponse } from "@/lib/server/backend";
import {
  requireOperator,
  requireSameOrigin,
  operatorBody,
} from "@/lib/server/operator-session";
import { performOperatorAction } from "@/lib/server/operator-backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function POST(request: Request) {
  return viewerResponse(async () => {
    requireSameOrigin(request);
    const token = requireOperator(request);
    return performOperatorAction(token, await operatorBody(request));
  });
}

export const maxDuration = 60;
