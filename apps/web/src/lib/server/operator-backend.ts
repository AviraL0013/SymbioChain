import "server-only";
import { z } from "zod";
import {
  OperatorAction,
  OperatorCapabilities,
  OperatorPolicy,
  OperatorState,
  ManualTopupTask,
} from "@symbiochain/shared";
import { BackendError, readBackend } from "./backend";
export async function getOperatorState(token: string) {
  const capabilities = await readBackend(
    "/api/capabilities",
    OperatorCapabilities,
    {},
    token,
  );
  if (!capabilities.admin)
    throw new BackendError(
      503,
      "The operator backend credential is not administrative.",
    );
  if (capabilities.mode !== "PAPER")
    throw new BackendError(403, "These controls are restricted to PAPER mode.");
  return OperatorState.parse({
    capabilities,
    policy: await readBackend("/api/policy", OperatorPolicy, {}, token),
  });
}
export async function performOperatorAction(token: string, input: unknown) {
  const parsed = OperatorAction.safeParse(input);
  if (!parsed.success)
    throw new BackendError(400, "Invalid operation or fields.");
  const action = parsed.data;
  const { capabilities } = await getOperatorState(token);
  let path: string, body: unknown;
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-symbio-expected-mode": "PAPER",
  };
  switch (action.action) {
    case "report-compute-topup":
      path = "/api/business/compute-topups/report";
      body = action.report;
      break;
    case "treasury":
      path = `/api/admin/${action.control}`;
      body = {};
      break;
    case "agent":
      path = `/api/admin/agents/${action.role}/${action.control}`;
      body = {};
      break;
    case "fund":
      path = "/api/admin/fund";
      body = { amountAtoms: action.amountAtoms, reference: action.reference };
      break;
    case "create-cycle":
      path = "/api/cycles";
      body = action.proposal;
      headers["idempotency-key"] = action.idempotencyKey;
      break;
    case "policy":
      path = "/api/admin/policy";
      body = action.policy;
      break;
    case "approve-cost":
      path = `/api/admin/cycles/${action.cycleId}/cost-basis`;
      body = action.approval;
      break;
    case "arm-crash":
      if (!capabilities.crashDemoEnabled)
        throw new BackendError(
          403,
          "The backend crash demonstration is disabled.",
        );
      path = "/api/admin/demo/crash-worker";
      body = { cycleId: action.cycleId, role: action.role };
      break;
    case "cancel-crash":
      path = "/api/admin/demo/cancel-crash";
      body = {};
      break;
  }
  const result = await readBackend(
    path,
    z.unknown(),
    { method: "POST", headers, body: JSON.stringify(body) },
    token,
  );
  if (action.action === "create-cycle")
    return { ok: true, cycleId: z.object({ id: z.uuid() }).parse(result).id };
  return {
    ok: true,
    ...("cycleId" in action ? { cycleId: action.cycleId } : {}),
  };
}

export async function getManualTopups(token: string) {
  await getOperatorState(token);
  return readBackend(
    "/api/business/compute-topups",
    z.array(ManualTopupTask.refine((task) => task.simulated)).max(100),
    { headers: { "x-symbio-expected-mode": "PAPER" } },
    token,
  );
}
