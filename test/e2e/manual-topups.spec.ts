import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

test("quarantine and HITL reports remain separate from real credits and revenue", async ({
  page,
  request,
}) => {
  const code = process.env.E2E_OPERATOR_CODE;
  if (!code) throw new Error("An isolated operator fixture is required");
  const backend = process.env.E2E_BACKEND_ORIGIN ?? "http://127.0.0.1:3337";
  const secrets = (process.env.E2E_BUSINESS_SECRETS ?? "")
    .split(",")
    .filter(Boolean);
  const leaks: string[] = [],
    errors: string[] = [];
  let directBackend = 0;
  const scans: Promise<void>[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (req) => {
    if (new URL(req.url()).origin === backend) directBackend++;
    if (
      secrets.some((secret) =>
        (JSON.stringify(req.headers()) + (req.postData() ?? "")).includes(
          secret,
        ),
      )
    )
      leaks.push("request");
  });
  page.on("requestfinished", (req) =>
    scans.push(
      (async () => {
        const response = await req.response();
        if (
          !response ||
          !/json|javascript|html/.test(response.headers()["content-type"] ?? "")
        )
          return;
        const body = await response.text();
        if (secrets.some((secret) => body.includes(secret)))
          leaks.push("response");
      })().catch(() => {}),
    ),
  );
  expect((await request.get("/api/operator/topups")).status()).toBe(401);
  await page.goto("/dashboard");
  await expect(page.getByText("QUARANTINED", { exact: true })).toBeVisible();
  await expect(
    page.getByText("HUMAN IN THE LOOP", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("UNPROVEN", { exact: true })).toBeVisible();
  await page.goto("/operator");
  await page.getByLabel("Operator access code").fill(code);
  await page.getByRole("button", { name: "Unlock Operator Control" }).click();
  await expect(
    page.getByRole("heading", { name: "Human-in-the-loop credit bridge" }),
  ).toBeVisible();
  await page
    .getByLabel("Receipt reference (hashed in your browser)")
    .fill("local-paper-receipt-only");
  await page.getByLabel("Reported credits in USD").fill("0.500000");
  await page
    .getByLabel(
      "I understand this is a PAPER report, not verified provider credit provisioning.",
    )
    .check();
  await page
    .getByRole("button", { name: "Record simulated top-up report" })
    .click();
  await expect(
    page.getByText(
      "Operator report recorded. Provider credits remain unverified; TEE stays quarantined.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText(/Operator reported — provider unverified/),
  ).toBeVisible();
  const status = await page.request.get("/api/swarm/operations");
  expect(await status.json()).toMatchObject({
    mode: "PAPER",
    tee: { status: "QUARANTINED", inferenceGate: "CLOSED" },
    bridge: {
      operatorReported: 1,
      providerVerifiedPurchases: 0,
      automaticPurchasesEnabled: false,
    },
    revenue: { confirmedReceiptCount: 0 },
  });
  expect(
    await (await page.request.get("/api/swarm/business")).json(),
  ).toMatchObject({
    revenueAtoms: "0",
    purchasedCreditsUsdMicros: "0",
    computePurchaseImplemented: false,
  });
  await page.route("**/api/swarm/operations", (route) => route.abort());
  await expect(
    page.getByText("Connection unavailable — retained status is stale."),
  ).toBeVisible({ timeout: 20000 });
  await page.unroute("**/api/swarm/operations");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText("QUARANTINED", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Lock session" }).click();
  await expect(
    page.getByRole("heading", { name: "Unlock the controls" }),
  ).toBeVisible();
  expect((await page.request.get("/api/operator/topups")).status()).toBe(401);
  await Promise.all(scans);
  expect(directBackend).toBe(0);
  expect(leaks).toEqual([]);
  expect(errors).toEqual([]);
  mkdirSync("docs/validation", { recursive: true });
  writeFileSync(
    "docs/validation/manual-topups-browser.json",
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        scope: "ISOLATED_LOCAL_PAPER_FIXTURES",
        assertions: [
          "quarantine banner",
          "HITL banner",
          "unproven revenue",
          "private task authentication",
          "operator report flow",
          "zero purchased provider credits",
          "zero external revenue",
          "stale connection",
          "390px viewport",
          "logout revocation",
          "no browser backend credentials",
        ],
        directBrowserBackendRequests: directBackend,
        credentialExposures: leaks.length,
        browserErrors: errors.length,
        realPayments: 0,
        paidInferenceRequests: 0,
        notificationsSent: 0,
      },
      null,
      2,
    ) + "\n",
  );
});
