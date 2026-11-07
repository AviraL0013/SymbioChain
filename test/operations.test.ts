import { afterEach, test, mock } from "node:test";
import assert from "node:assert/strict";
import { OperatingStatus } from "../packages/shared/src/operating-contract";
import { getOperatingStatus } from "../apps/web/src/lib/server/backend";
import {
  getManualTopups,
  performOperatorAction,
} from "../apps/web/src/lib/server/operator-backend";

const before = {
  url: process.env.BACKEND_URL,
  token: process.env.BACKEND_READ_TOKEN,
};
afterEach(() => {
  mock.restoreAll();
  if (before.url === undefined) delete process.env.BACKEND_URL;
  else process.env.BACKEND_URL = before.url;
  if (before.token === undefined) delete process.env.BACKEND_READ_TOKEN;
  else process.env.BACKEND_READ_TOKEN = before.token;
});
const status = {
  contractVersion: 1,
  capturedAt: "2026-11-07T03:32:25.060Z",
  mode: "PAPER",
  tee: {
    status: "QUARANTINED",
    inferenceGate: "CLOSED",
    auditCapturedAt: "2026-11-07T03:32:25.060Z",
    signedInferenceVerified: false,
    demoInference: "LOCAL_SIMULATION",
  },
  bridge: {
    status: "HUMAN_IN_THE_LOOP",
    waitingOperator: 1,
    operatorReported: 0,
    providerVerifiedPurchases: 0,
    automaticPurchasesEnabled: false,
  },
  revenue: { status: "UNPROVEN", confirmedReceiptCount: 0 },
};
const setup = () => {
  process.env.BACKEND_URL = "https://backend.example";
  process.env.BACKEND_READ_TOKEN = "server-only-read-token";
};
test("operation publication refuses fabricated approvals, purchased credits and LIVE data", async () => {
  setup();
  for (const bad of [
    { ...status, tee: { ...status.tee, status: "VERIFIED" } },
    { ...status, bridge: { ...status.bridge, providerVerifiedPurchases: 1 } },
    { ...status, credential: "private" },
  ])
    assert.equal(OperatingStatus.safeParse(bad).success, false);
  for (const mode of ["PAPER", "LIVE"]) {
    mock.method(globalThis, "fetch", async () =>
      Response.json({ ...status, mode }),
    );
    if (mode === "PAPER") assert.deepEqual(await getOperatingStatus(), status);
    else await assert.rejects(getOperatingStatus(), /unsupported/);
    mock.restoreAll();
  }
});

const capabilities = {
  mode: "PAPER",
  admin: true,
  crashDemoEnabled: false,
  requestedShareBps: 0,
  computePurchaseImplemented: false,
};
const policy = {
  mode: "PAPER",
  paused: false,
  revision: 1,
  maxTradeAtoms: "10000000",
  maxDailySpendAtoms: "50000000",
  minReserveAtoms: "2000000",
  minNetProfitAtoms: "10000",
  maxSlippageBps: 50,
  allowedAssets: ["USDC"],
  allowedChains: ["near:paper"],
  allowedRecipients: ["paper.treasury"],
  updatedAt: status.capturedAt,
};
const task = {
  reference: "topup:00000000-0000-4000-8000-000000000001",
  organizationId: "PAPER_ORGANIZATION",
  spendBudgetAtoms: "1000000",
  requestedCreditUsdMicros: "1000000",
  state: "WAITING_OPERATOR",
  simulated: true,
  providerVerified: false,
};
test("private top-up tasks and reports retain admin credentials server-side and enforce PAPER", async () => {
  setup();
  const calls: { path: string; options: RequestInit }[] = [];
  mock.method(globalThis, "fetch", async (url: URL, options: RequestInit) => {
    calls.push({ path: url.pathname, options });
    return Response.json(
      url.pathname === "/api/capabilities"
        ? capabilities
        : url.pathname === "/api/policy"
          ? policy
          : url.pathname === "/api/business/compute-topups"
            ? [task]
            : {
                reference: task.reference,
                state: "OPERATOR_REPORTED_UNVERIFIED",
                providerVerified: false,
              },
    );
  });
  assert.deepEqual(await getManualTopups("private-admin"), [task]);
  const report = {
    reference: task.reference,
    organizationId: task.organizationId,
    receiptDigest: "a".repeat(64),
    reportedCreditUsdMicros: "1000000",
    fundingSource: "OPERATOR_FUNDED",
  };
  await assert.rejects(
    performOperatorAction("private-admin", {
      action: "report-compute-topup",
      report,
      acknowledged: false,
    }),
    /Invalid/,
  );
  assert.deepEqual(
    await performOperatorAction("private-admin", {
      action: "report-compute-topup",
      report,
      acknowledged: true,
    }),
    { ok: true },
  );
  const sent = calls.at(-1)!;
  assert.equal(sent.path, "/api/business/compute-topups/report");
  assert.equal(
    (sent.options.headers as Record<string, string>)["x-symbio-expected-mode"],
    "PAPER",
  );
  assert.equal(
    (sent.options.headers as Record<string, string>).authorization,
    "Bearer private-admin",
  );
  assert.deepEqual(JSON.parse(String(sent.options.body)), report);
  mock.restoreAll();
  const changed = mock.method(globalThis, "fetch", async () =>
    Response.json({ ...capabilities, mode: "LIVE" }),
  );
  await assert.rejects(getManualTopups("private-admin"), /restricted to PAPER/);
  assert.equal(changed.mock.calls.length, 1);
});
