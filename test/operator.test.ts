import { test, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import {
  issueOperatorSession,
  requireOperator,
  operatorCookie,
  requireSameOrigin,
  operatorBody,
  sessionStatus,
} from "../apps/web/src/lib/server/operator-session";
import { performOperatorAction } from "../apps/web/src/lib/server/operator-backend";
import {
  BackendError,
  viewerResponse,
} from "../apps/web/src/lib/server/backend";
const names = [
  "BACKEND_URL",
  "BACKEND_READ_TOKEN",
  "BACKEND_ADMIN_TOKEN",
  "OPERATOR_ACCESS_TOKEN",
  "NODE_ENV",
] as const;
const original = Object.fromEntries(names.map((k) => [k, process.env[k]]));
const gate = "g".repeat(40),
  admin = "a".repeat(40),
  read = "r".repeat(40);
beforeEach(() =>
  Object.assign(process.env, {
    BACKEND_URL: "https://backend.example",
    BACKEND_READ_TOKEN: read,
    BACKEND_ADMIN_TOKEN: admin,
    OPERATOR_ACCESS_TOKEN: gate,
    NODE_ENV: "production",
  }),
);
afterEach(() => {
  mock.restoreAll();
  for (const name of names) {
    if (original[name] === undefined) delete process.env[name];
    else Object.assign(process.env, { [name]: original[name] });
  }
});
const request = (token: string) =>
  new Request("https://app.example/api/operator/state", {
    headers: { cookie: `__Host-symbio-operator=${token}` },
  });
test("keeps operator sessions signed, short-lived, HttpOnly and separate from backend credentials", () => {
  const token = issueOperatorSession(gate, 1000);
  assert.equal(requireOperator(request(token), 1001), admin);
  assert.throws(() => requireOperator(request(token), 2801), /expired/);
  assert.throws(() => requireOperator(request(token + "x"), 1001), /invalid/);
  assert.throws(() => issueOperatorSession(read), /Invalid operator/);
  assert.doesNotMatch(token, new RegExp(admin + "|" + read + "|" + gate));
  const cookie = operatorCookie(token);
  for (const flag of [
    "__Host-",
    "Secure",
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=1800",
  ])
    assert.ok(cookie.includes(flag));
  assert.match(operatorCookie("", true), /Max-Age=0/);
});
test("refuses unconfigured operator access and cross-origin writes", async () => {
  delete process.env.BACKEND_ADMIN_TOKEN;
  assert.deepEqual(sessionStatus(new Request("https://app.example")), {
    configured: false,
    authenticated: false,
  });
  assert.throws(() => issueOperatorSession(gate), /not configured/);
  for (const origin of [null, "https://evil.example"])
    assert.throws(
      () =>
        requireSameOrigin(
          new Request("https://app.example/api/operator/action", {
            headers: origin ? { origin } : {},
          }),
        ),
      /same-origin/,
    );
  requireSameOrigin(
    new Request("https://app.example/api/operator/action", {
      headers: {
        origin: "https://app.example",
        "sec-fetch-site": "same-origin",
      },
    }),
  );
  await assert.rejects(
    operatorBody(
      new Request("https://app.example", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "x".repeat(16385),
      }),
    ),
    /limit/,
  );
});
const capabilities = {
  mode: "PAPER",
  admin: true,
  crashDemoEnabled: true,
  requestedShareBps: 100,
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
  allowedAssets: ["USDC", "WNEAR"],
  allowedChains: ["near:paper", "eip155:31337"],
  allowedRecipients: ["paper.treasury"],
  updatedAt: "2026-11-01T00:00:00Z",
};
test("does not proxy unknown actions, invalid amounts or LIVE mutations", async () => {
  const transport = mock.method(globalThis, "fetch", async () =>
    Response.json({ ...capabilities, mode: "LIVE" }),
  );
  for (const input of [
    { action: "url", url: "/api/admin/pause" },
    { action: "fund", amountAtoms: "-1", reference: "test-ref" },
  ])
    await assert.rejects(performOperatorAction(admin, input));
  assert.equal(transport.mock.callCount(), 0);
  await assert.rejects(
    performOperatorAction(admin, { action: "treasury", control: "pause" }),
    /PAPER mode/,
  );
  assert.equal(transport.mock.callCount(), 1);
});
test("uses a fixed backend path and preserves the cycle idempotency key without returning credentials", async () => {
  const id = "54fd5ad6-ccbe-4972-a7d4-3bdb27be3141";
  const transport = mock.method(
    globalThis,
    "fetch",
    async (url: URL, init?: RequestInit) => {
      assert.equal(
        (init?.headers as Record<string, string>).authorization,
        `Bearer ${admin}`,
      );
      if (url.pathname === "/api/capabilities")
        return Response.json(capabilities);
      if (url.pathname === "/api/policy") return Response.json(policy);
      assert.equal(url.pathname, "/api/cycles");
      assert.equal(init?.method, "POST");
      assert.equal(
        (init?.headers as Record<string, string>)["x-symbio-expected-mode"],
        "PAPER",
      );
      assert.equal(
        (init?.headers as Record<string, string>)["idempotency-key"],
        "stable-cycle-key",
      );
      return Response.json({ id, secret: "backend-response-sentinel" });
    },
  );
  const result = await performOperatorAction(admin, {
    action: "create-cycle",
    idempotencyKey: "stable-cycle-key",
    proposal: {
      strategy: "round-trip",
      originChain: "near:paper",
      destinationChain: "eip155:31337",
      originAsset: "USDC",
      intermediateAsset: "WNEAR",
      amountAtoms: "5000000",
      recipient: "paper.treasury",
      refundTo: "paper.treasury",
      slippageBps: 50,
      expiresAt: "2099-01-01T00:00:00Z",
    },
  });
  assert.deepEqual(result, { ok: true, cycleId: id });
  assert.equal(transport.mock.callCount(), 3);
});
test("does not expose upstream error bodies through operator responses", async () => {
  mock.method(globalThis, "fetch", async (url: URL) =>
    url.pathname === "/api/capabilities"
      ? Response.json(capabilities)
      : url.pathname === "/api/policy"
        ? Response.json(policy)
        : new Response("secret-owner-material", { status: 409 }),
  );
  const response = await viewerResponse(() =>
    performOperatorAction(admin, { action: "treasury", control: "pause" }),
  );
  assert.equal(response.status, 409);
  assert.doesNotMatch(
    await response.text(),
    /secret-owner-material|aaaaaaaaaa|gggggggggg/,
  );
});

test("checks the actual HTTP authority when Next uses an internal URL", () => {
  requireSameOrigin(
    new Request("http://localhost:3300/api/operator/action", {
      headers: {
        host: "127.0.0.1:3300",
        origin: "http://127.0.0.1:3300",
        "sec-fetch-site": "same-origin",
      },
    }),
  );
  assert.throws(
    () =>
      requireSameOrigin(
        new Request("http://localhost:3300/api/operator/action", {
          headers: { host: "127.0.0.1:3300", origin: "http://localhost:3300" },
        }),
      ),
    /same-origin/,
  );
  assert.throws(
    () =>
      requireSameOrigin(
        new Request("https://app.example/api/operator/action", {
          headers: { host: "evil.example", origin: "https://app.example" },
        }),
      ),
    /same-origin/,
  );
});
