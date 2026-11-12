import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";
import {
  BackendError,
  getViewerSnapshot,
  getViewerProof,
  getViewerCycle,
  getViewerEvents,
  getViewerStatus,
  getTestnetReport,
  getMainnetAcceptance,
  getMainnetActivation,
  getMainnetSettlement,
  getBusinessStatus,
  getBusinessFunding,
  viewerResponse,
} from "../apps/web/src/lib/server/backend";
import { emptyTestnetReport } from "../packages/shared/src/testnet-contract";

const original = {
  url: process.env.BACKEND_URL,
  token: process.env.BACKEND_READ_TOKEN,
};
const snapshot = {
  contractVersion: 1,
  mode: "PAPER",
  capturedAt: "2026-10-29T12:00:00.000Z",
  cursor: "1",
  treasury: {
    asset: "USDC",
    decimals: 6,
    balanceAtoms: "900719925474099312345678",
    availableAtoms: "900719925474099312345678",
    reservedAtoms: "0",
    grossTradingPnlAtoms: "0",
    minReserveAtoms: "2000000",
  },
  compute: { inferenceCostUsdMicros: "100", purchaseImplemented: false },
  survivalHours: null,
  paused: false,
  workers: [],
  history: [],
  decisions: [],
  transactions: [],
  receipts: [],
  events: [],
};
beforeEach(() => {
  process.env.BACKEND_URL = "https://backend.example";
  process.env.BACKEND_READ_TOKEN = "server-only-test-token";
});

test("keeps internal mainnet settlement separate from AI and revenue claims", async () => {
  const hash = "A".repeat(43);
  const receipt = { hash, url: `https://nearblocks.io/txns/${hash}` };
  const report = {
    contractVersion: 1,
    network: "mainnet",
    scope: "TEAM_FUNDED_INTERNAL_INTENTS_SETTLEMENT",
    checkedAt: "2026-11-12T05:27:14.583Z",
    funding: receipt,
    payments: ["brain", "hand"].map((role) => ({
      receipt,
      payer: `${role}.example.near`,
      recipient: "scout.example.near",
      amountYocto: "100000000000000000000",
      nonceConfirmed: true,
      nativeFeeYocto: "1",
    })),
    allowanceRepairs: [receipt, receipt],
    totalNetworkFeesYocto: "2",
    fundedCapitalYocto: "2000000000000000000000",
    storageCollateralYocto: "1250000000000000000000",
    totalPlanningCeilingYocto: "30000000000000000000000",
    paidInferenceRequests: 0,
    teeApprovalClaimed: false,
    externalRevenueProven: false,
    marketSwapPerformed: false,
  };
  const transport = mock.method(globalThis, "fetch", async () =>
    Response.json(report),
  );
  assert.deepEqual(await getMainnetSettlement(), report);
  assert.equal(
    String(transport.mock.calls[0]!.arguments[0]),
    "https://backend.example/api/evidence/mainnet-intents",
  );
  transport.mock.restore();
  for (const invalid of [
    { ...report, teeApprovalClaimed: true },
    { ...report, externalRevenueProven: true },
    { ...report, privateKey: "private-test-material" },
  ]) {
    const mocked = mock.method(globalThis, "fetch", async () =>
      Response.json(invalid),
    );
    const response = await viewerResponse(getMainnetSettlement);
    assert.equal(response.status, 502);
    assert.doesNotMatch(await response.text(), /private-test-material/);
    mocked.mock.restore();
  }
});
afterEach(() => {
  mock.restoreAll();
  for (const [name, value] of [
    ["BACKEND_URL", original.url],
    ["BACKEND_READ_TOKEN", original.token],
  ]) {
    if (value === undefined) delete process.env[name!];
    else process.env[name!] = value;
  }
});

test("uses only the configured origin with server authorization and no caching or redirects", async () => {
  const transport = mock.method(
    globalThis,
    "fetch",
    async (_url: URL, _options: RequestInit) => new Response("{}"),
  );
  await assert.rejects(
    getViewerSnapshot(),
    (error: unknown) => error instanceof BackendError && error.status === 502,
  );
  const [url, options] = transport.mock.calls[0]!.arguments;
  assert.equal(String(url), "https://backend.example/api/viewer/snapshot");
  assert.equal(options.cache, "no-store");
  assert.equal(options.redirect, "error");
  assert.equal(
    (options.headers as Record<string, string>).authorization,
    "Bearer server-only-test-token",
  );
});

test("rejects unexpected fields and LIVE responses at the server boundary", async () => {
  for (const invalid of [
    { ...snapshot, mode: "LIVE" },
    { ...snapshot, privateKey: "sensitive" },
    { ...snapshot, survivalHours: 24 },
  ]) {
    const transport = mock.method(globalThis, "fetch", async () =>
      Response.json(invalid),
    );
    const response = await viewerResponse(getViewerSnapshot);
    assert.equal(response.status, 502);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.doesNotMatch(
      await response.text(),
      /sensitive|privateKey|server-only-test-token/,
    );
    transport.mock.restore();
  }
});

test("accepts the PAPER contract without changing large integer values or unknown runway", async () => {
  mock.method(globalThis, "fetch", async () => Response.json(snapshot));
  assert.deepEqual(await getViewerSnapshot(), snapshot);
});
test("publishes testnet scope through server authorization and rejects expanded or misleading evidence", async () => {
  const report = emptyTestnetReport();
  const transport = mock.method(globalThis, "fetch", async () =>
    Response.json(report),
  );
  assert.deepEqual(await getTestnetReport(), report);
  assert.equal(
    String(transport.mock.calls[0]!.arguments[0]),
    "https://backend.example/api/evidence/testnet",
  );
  transport.mock.restore();
  for (const invalid of [
    { ...report, secret: "private-key" },
    { ...report, mainnetTransactions: 1 },
    { ...report, profile: "LIVE" },
  ]) {
    const mocked = mock.method(globalThis, "fetch", async () =>
      Response.json(invalid),
    );
    const response = await viewerResponse(getTestnetReport);
    assert.equal(response.status, 502);
    assert.doesNotMatch(await response.text(), /private-key/);
    mocked.mock.restore();
  }
});

test("accepts recorded workflow gates and destination transactions without publishing private state", async () => {
  const report = {
    ...emptyTestnetReport(),
    swarm: {
      profile: "TESTNET_SWARM",
      runId: "dd29a8af-1a32-400a-b2e2-0dd7cccfc418",
      updatedAt: new Date().toISOString(),
      stage: "BRAIN",
      status: "BLOCKED",
      settlement: "SIMULATED",
      economics: "SIMULATED",
      paidInferenceRequests: 0,
      billedUsdMicros: null,
      inference: null,
      execution: null,
      receiptTokenId: null,
      events: [
        {
          stage: "BRAIN",
          at: new Date().toISOString(),
          code: "TEE_DEPLOYMENT_UNAPPROVED",
        },
      ],
    },
    executions: [
      {
        chain: "eip155:11155111",
        source: "AUTHORIZATION_FIXTURE",
        sender: `0x${"11".repeat(20)}`,
        status: "CONFIRMED",
        code: "CONFIRMED",
        txHash: `0x${"22".repeat(32)}`,
        nativeFeeAtoms: "1",
      },
    ],
  };
  const transport = mock.method(globalThis, "fetch", async () =>
    Response.json(report),
  );
  assert.deepEqual(await getTestnetReport(), report);
  transport.mock.restore();
  for (const swarm of [
    { ...report.swarm, privatePrompt: "DO_NOT_LEAK" },
    { ...report.swarm, status: "CLOSED", stage: "CLOSED" },
  ]) {
    const invalid = mock.method(globalThis, "fetch", async () =>
      Response.json({ ...report, swarm }),
    );
    const response = await viewerResponse(getTestnetReport);
    assert.equal(response.status, 502);
    assert.doesNotMatch(await response.text(), /DO_NOT_LEAK|privatePrompt/);
    invalid.mock.restore();
  }
});

test("returns stored proof scope without claiming fresh verification", async () => {
  const proof = {
    contractVersion: 1,
    mode: "PAPER",
    scope: "RECORDED_VERIFICATION",
    freshAttestationPerformed: false,
    id: "4a4d06f2-7fcb-4bb7-92f9-b57bba90a258",
    model: "test-model",
    signer: null,
    measurement: null,
    requestHash: "a".repeat(64),
    responseHash: "b".repeat(64),
    verifiedAt: "2026-10-29T12:00:00.000Z",
  };
  mock.method(globalThis, "fetch", async () => Response.json(proof));
  assert.deepEqual(await getViewerProof("a".repeat(64)), proof);
});

test("does not relay upstream errors or tokens", async () => {
  mock.method(
    globalThis,
    "fetch",
    async () => new Response("sensitive provider error", { status: 401 }),
  );
  const response = await viewerResponse(getViewerSnapshot);
  assert.equal(response.status, 503);
  assert.doesNotMatch(
    await response.text(),
    /sensitive|server-only-test-token/,
  );
});

test("refuses missing credentials, remote HTTP, and credentials embedded in the origin", async () => {
  const transport = mock.method(globalThis, "fetch", async () =>
    Response.json({}),
  );
  for (const url of [
    "http://backend.example",
    "https://user:secret@backend.example",
    "https://backend.example/path",
    "https://backend.example?url=anything",
  ]) {
    process.env.BACKEND_URL = url;
    assert.equal((await viewerResponse(getViewerSnapshot)).status, 503);
  }
  process.env.BACKEND_URL = "https://backend.example";
  delete process.env.BACKEND_READ_TOKEN;
  assert.equal((await viewerResponse(getViewerSnapshot)).status, 503);
  assert.equal(transport.mock.callCount(), 0);
});

test("proof lookup validates input before transport and distinguishes no record from invalid proof", async () => {
  const transport = mock.method(
    globalThis,
    "fetch",
    async (_url: URL) => new Response("", { status: 404 }),
  );
  assert.equal(
    (await viewerResponse(() => getViewerProof("https://evil.example"))).status,
    400,
  );
  assert.equal(transport.mock.callCount(), 0);
  const response = await viewerResponse(() =>
    getViewerProof(`0x${"A".repeat(64)}`),
  );
  assert.equal(response.status, 404);
  assert.match(await response.text(), /No recorded verified inference/);
  assert.equal(
    String(transport.mock.calls[0]!.arguments[0]),
    `https://backend.example/api/viewer/proof?hash=${"a".repeat(64)}`,
  );
});

test("validates cycle and replay identifiers before reaching the backend", async () => {
  const transport = mock.method(globalThis, "fetch", async () =>
    Response.json({}),
  );
  for (const value of [
    "../admin/pause",
    "https://evil.example",
    "-".repeat(36),
  ])
    await assert.rejects(async () => getViewerCycle(value));
  for (const value of ["-1", "1e4", "9223372036854775808", "1&token=secret"])
    await assert.rejects(async () => getViewerEvents(value));
  assert.equal(transport.mock.callCount(), 0);
});

test("bounds upstream response bodies and excludes unsupported status fields", async () => {
  let transport = mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response("{}", { headers: { "content-length": "2000001" } }),
  );
  await assert.rejects(
    getViewerStatus(),
    (e: unknown) => e instanceof BackendError && e.status === 502,
  );
  transport.mock.restore();
  const data = {
    contractVersion: 1,
    mode: "PAPER",
    capturedAt: "2026-11-01T00:00:00Z",
    model: "z-ai/glm-5.3-flash",
    liveTradingEnabled: false,
    measurementApprovalConfigured: false,
    deploymentActionsApprovalConfigured: false,
    computePurchaseImplemented: false,
    providerCreditBalanceKnown: false,
    computeControl: {
      source: "LOCAL_BUDGET",
      limitUsdMicros: "1000000",
      committedUsdMicros: "0",
      availableUsdMicros: "1000000",
      halted: false,
      providerBalanceVerified: false,
    },
  };
  transport = mock.method(globalThis, "fetch", async () => Response.json(data));
  assert.deepEqual(await getViewerStatus(), data);
  transport.mock.restore();
  mock.method(globalThis, "fetch", async () =>
    Response.json({ ...data, apiKey: "do-not-publish" }),
  );
  const response = await viewerResponse(getViewerStatus);
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /do-not-publish/);
});

test("business evidence keeps unknown costs and rejects fabricated purchases or revenue", async () => {
  const data = {
    contractVersion: 1,
    capturedAt: "2026-11-05T12:00:00.000Z",
    coverage: "CLOSED_WINDOWS_ONLY",
    mode: "PAPER",
    simulated: true,
    asset: null,
    configured: false,
    confirmedReceiptCount: 0,
    revenueAtoms: "0",
    closedWindowCount: 0,
    receiptsAwaitingCostWindow: 0,
    netAfterReportedCostsAtoms: null,
    costVerification: "UNKNOWN",
    independentlyVerifiedBusinessProfit: false,
    fullBusinessRunway: null,
    reservedAtoms: "0",
    computePurchaseImplemented: false,
    purchasedCreditsUsdMicros: "0",
    businessFundedNftDistributions: 0,
    blockers: [
      "PROVIDER_PURCHASE_PROTOCOL_REQUIRED",
      "EARNED_PROCEEDS_NFT_SETTLEMENT_UNPROVEN",
    ],
  };
  let transport = mock.method(globalThis, "fetch", async () =>
    Response.json(data),
  );
  assert.deepEqual(await getBusinessStatus(), data);
  assert.equal(
    String(transport.mock.calls[0]!.arguments[0]),
    "https://backend.example/api/business/status",
  );
  transport.mock.restore();
  for (const invalid of [
    { ...data, computePurchaseImplemented: true },
    { ...data, purchasedCreditsUsdMicros: "10" },
    { ...data, revenueAtoms: "100" },
    { ...data, businessFundedNftDistributions: 1 },
    { ...data, mode: "LIVE" },
    { ...data, apiKey: "private" },
  ]) {
    transport = mock.method(globalThis, "fetch", async () =>
      Response.json(invalid),
    );
    const response = await viewerResponse(getBusinessStatus);
    assert.equal(response.status, 502);
    assert.doesNotMatch(await response.text(), /apiKey|server-only-test-token/);
    transport.mock.restore();
  }
});

test("NFT funding capability remains separate from actual paid distributions", async () => {
  const data = {
    contractVersion: 1,
    mode: "PAPER",
    nftFundingImplemented: true,
    nftFundingEnabled: false,
    computePurchaseImplemented: false,
    computePurchaseBlocker: "NO_PUBLIC_NEAR_AI_PURCHASE_PROTOCOL",
    completedDistributions: 0,
    spentInputAtoms: "0",
    distributedNearYocto: "0",
    allocatedNearYocto: "0",
    operations: [],
  };
  let t = mock.method(globalThis, "fetch", async () => Response.json(data));
  assert.deepEqual(await getBusinessFunding(), data);
  assert.equal(
    String(t.mock.calls[0]!.arguments[0]),
    "https://backend.example/api/business/funding",
  );
  t.mock.restore();
  for (const invalid of [
    { ...data, nftFundingEnabled: true },
    { ...data, completedDistributions: 1 },
    { ...data, computePurchaseImplemented: true },
    { ...data, mode: "LIVE" },
    { ...data, apiKey: "private" },
  ]) {
    t = mock.method(globalThis, "fetch", async () => Response.json(invalid));
    const response = await viewerResponse(getBusinessFunding);
    assert.equal(response.status, 502);
    assert.doesNotMatch(
      await response.text(),
      /private|apiKey|server-only-test-token/,
    );
    t.mock.restore();
  }
});

test("mainnet acceptance uses a fixed authorized route and refuses simulated or expanded records", async () => {
  const report = {
    contractVersion: 1,
    profile: "MAINNET_ACCEPTANCE",
    network: "mainnet",
    capturedAt: "2026-11-09T05:00:00.000Z",
    block: { height: "123", hash: "final" },
    summary: { passed: 0, blocked: 1, notRun: 0, complete: false },
    checks: [
      {
        id: "inference",
        label: "Paid AI",
        status: "BLOCKED",
        scope: "NOT_EXECUTED",
        detail: "Approval missing.",
        links: [],
      },
    ],
    transactions: [],
    serviceRoundTrip: null,
    runner: {
      paidInferenceRequests: 0,
      transactionsSubmitted: 0,
      readOnly: true,
    },
  };
  const transport = mock.method(
    globalThis,
    "fetch",
    async (_url: URL, _options: RequestInit) => Response.json(report),
  );
  assert.deepEqual(await getMainnetAcceptance(), report);
  const [url, options] = transport.mock.calls[0]!.arguments;
  assert.equal(String(url), "https://backend.example/api/evidence/mainnet");
  assert.equal(
    (options!.headers as Record<string, string>).authorization,
    "Bearer server-only-test-token",
  );
  transport.mock.restore();
  for (const invalid of [
    { ...report, network: "testnet" },
    { ...report, secret: "SECRET_SENTINEL" },
    { ...report, summary: { ...report.summary, complete: true } },
  ]) {
    const mocked = mock.method(globalThis, "fetch", async () =>
      Response.json(invalid),
    );
    const response = await viewerResponse(getMainnetAcceptance);
    assert.equal(response.status, 502);
    assert.doesNotMatch(
      await response.text(),
      /SECRET_SENTINEL|server-only-test-token/,
    );
    mocked.mock.restore();
  }
});

test("bounded activation keeps owner permission separate from AI approval and never exposes configuration credentials", async () => {
  const data = {
    contractVersion: 1,
    network: "mainnet",
    capturedAt: "2026-11-09T09:00:00.000Z",
    ownerActivation: "PENDING",
    paused: true,
    enabledWorkerCount: 0,
    executionEnabled: false,
    automaticTradingEnabled: false,
    monitorOnlyWorkers: true,
    preparationEnabled: false,
    monitors: [],
    configuration: {
      scope: "CONFIGURATION_PRESENCE",
      treasurySigningKeys: 3,
      dedicatedIntentsKeys: 2,
      evmRpcConfigured: true,
      nftReceiver: "solidvideo4090.near",
    },
    intentsRegistration: { brain: "NOT_REGISTERED", hand: "NOT_REGISTERED" },
    limits: {
      asset: "USDC",
      decimals: 6,
      onChainMaxTradeAtoms: "1",
      onChainMaxDailyAtoms: "1",
      configuredMaxTradeAtoms: "50000",
      configuredMaxDailyAtoms: "100000",
      matches: false,
      scope: "AUTHORIZED_CROSS_CHAIN_TRANSFERS",
      universalNativeSpendingCap: false,
      nativeReserveYocto: "100000000000000000000000",
      mpcSigningDepositLimitYocto: "1",
    },
    tee: {
      status: "QUARANTINED",
      reason: "APPLICATION_WORKLOAD_MEASUREMENT_POLICY",
      message:
        "Inference blocked by application-level TEE workload measurement policy.",
    },
    proof: {
      contractVersion: 1,
      profile: "BOUNDED_OWNER_ACTIVATION_TEE_QUARANTINED",
      status: "PENDING",
      requiredTransactions: 7,
      checkedAt: null,
      transactions: [],
      totalFeeYocto: "0",
      newStorageYocto: "0",
      ownerGasReserveReallocatedYocto: "0",
      treasuryTopupYocto: "0",
      paidInferenceRequests: 0,
      externalRevenueProven: false,
    },
    externalRevenueProven: false,
    automaticCreditPurchaseImplemented: false,
  };
  const transport = mock.method(
    globalThis,
    "fetch",
    async (_url: URL, _options: RequestInit) => Response.json(data),
  );
  assert.deepEqual(await getMainnetActivation(), data);
  const [url, options] = transport.mock.calls[0]!.arguments;
  assert.equal(String(url), "https://backend.example/api/mainnet/activation");
  assert.equal(
    (options.headers as Record<string, string>).authorization,
    "Bearer server-only-test-token",
  );
  transport.mock.restore();
  for (const invalid of [
    { ...data, apiKey: "SECRET_SENTINEL" },
    { ...data, limits: { ...data.limits, universalNativeSpendingCap: true } },
    { ...data, tee: { ...data.tee, status: "VERIFIED" } },
  ]) {
    const t = mock.method(globalThis, "fetch", async () =>
      Response.json(invalid),
    );
    const response = await viewerResponse(getMainnetActivation);
    assert.equal(response.status, 502);
    assert.doesNotMatch(
      await response.text(),
      /SECRET_SENTINEL|server-only-test-token/,
    );
    t.mock.restore();
  }
});
