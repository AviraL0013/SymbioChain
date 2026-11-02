import { z } from "zod";
import {
  BackendError,
  readBackend,
  viewerResponse,
} from "@/lib/server/backend";
import { requireOperator } from "@/lib/server/operator-session";
import { getOperatorState } from "@/lib/server/operator-backend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export function GET(request: Request) {
  return viewerResponse(async () => {
    const token = requireOperator(request),
      q = new URL(request.url).searchParams;
    if ([...q.keys()].some((k) => k !== "id") || q.getAll("id").length !== 1)
      throw new BackendError(400, "Select one cycle.");
    const id = z.uuid().safeParse(q.get("id"));
    if (!id.success) throw new BackendError(400, "Invalid cycle identifier.");
    await getOperatorState(token);
    const evidence = await readBackend(
      `/api/cycles/${id.data}/evidence`,
      z.unknown(),
      {},
      token,
    );
    return new Response(JSON.stringify(evidence, null, 2), {
      headers: {
        "content-type": "application/json",
        "content-disposition": `attachment; filename="symbiochain-${id.data}.json"`,
      },
    });
  });
}
