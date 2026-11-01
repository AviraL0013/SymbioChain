import { z } from "zod";
import { BackendError, viewerResponse } from "@/lib/server/backend";
import {
  issueOperatorSession,
  operatorCookie,
  operatorBody,
  requireSameOrigin,
  sessionStatus,
} from "@/lib/server/operator-session";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return viewerResponse(async () => sessionStatus(request));
}
export function POST(request: Request) {
  return viewerResponse(async () => {
    requireSameOrigin(request);
    const parsed = z
      .object({ accessCode: z.string().min(1).max(256) })
      .strict()
      .safeParse(await operatorBody(request));
    if (!parsed.success)
      throw new BackendError(400, "Enter your operator access code.");
    return new Response(JSON.stringify({ authenticated: true }), {
      headers: {
        "content-type": "application/json",
        "cache-control": "private, no-store",
        "set-cookie": operatorCookie(
          issueOperatorSession(parsed.data.accessCode),
        ),
      },
    });
  });
}
export function DELETE(request: Request) {
  return viewerResponse(async () => {
    requireSameOrigin(request);
    return new Response(JSON.stringify({ authenticated: false }), {
      headers: {
        "content-type": "application/json",
        "cache-control": "private, no-store",
        "set-cookie": operatorCookie("", true),
      },
    });
  });
}
