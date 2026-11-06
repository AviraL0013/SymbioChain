import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

test("business evidence keeps unproven cash flows explicit and retains stale labels", async ({
  page,
  request,
}) => {
  const secrets = (process.env.E2E_BUSINESS_SECRETS ?? "")
    .split(",")
    .filter(Boolean);
  const backendOrigin =
    process.env.E2E_BACKEND_ORIGIN ?? "http://127.0.0.1:3337";
  const errors: string[] = [],
    leaks: string[] = [];
  const reads: Promise<void>[] = [];
  let directBackendRequests = 0;
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (new URL(r.url()).origin === backendOrigin) directBackendRequests++;
    if (
      secrets.some((s) =>
        (JSON.stringify(r.headers()) + (r.postData() ?? "")).includes(s),
      )
    )
      leaks.push("request");
  });
  page.on("requestfinished", (r) => {
    reads.push(
      (async () => {
        const res = await r.response();
        if (
          !res ||
          !/json|javascript|html/.test(res.headers()["content-type"] ?? "")
        )
          return;
        const body = await res.text();
        if (secrets.some((s) => body.includes(s))) leaks.push("response");
      })().catch(() => {}),
    );
  });
  const response = await request.get("/api/swarm/business");
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({
    mode: "PAPER",
    simulated: true,
    revenueAtoms: "0",
    netAfterReportedCostsAtoms: null,
    computePurchaseImplemented: false,
    purchasedCreditsUsdMicros: "0",
    businessFundedNftDistributions: 0,
  });
  const funding = await request.get("/api/swarm/funding");
  expect(funding.status()).toBe(200);
  expect(await funding.json()).toMatchObject({
    nftFundingImplemented: true,
    nftFundingEnabled: false,
    completedDistributions: 0,
    computePurchaseImplemented: false,
  });
  await page.goto("/business");
  await expect(
    page.getByRole("heading", { name: "Business evidence" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Money received and costs reported" }),
  ).toBeVisible();
  await expect(
    page.getByText("Not implemented", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Implemented · disabled", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("No verified self-funding business is claimed.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Unknown", { exact: true }).first(),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/browser/business-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/browser/business-mobile.png",
    fullPage: true,
  });
  await page.route("**/api/swarm/business", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"UNAVAILABLE"}',
    }),
  );
  await expect(page.locator("p.app-field-error[role=alert]")).toContainText(
    "Retained values are stale",
    { timeout: 16000 },
  );
  await expect(page.getByText("Stale record", { exact: false })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Money received and costs reported" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("p.app-field-error[role=alert]")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Money received and costs reported" }),
  ).toHaveCount(0);
  await Promise.all(reads);
  expect(errors).toEqual([]);
  expect(leaks).toEqual([]);
  expect(directBackendRequests).toBe(0);
  mkdirSync("docs/validation", { recursive: true });
  writeFileSync(
    "docs/validation/business-browser.json",
    JSON.stringify(
      {
        scope: "ISOLATED_LOCAL_PAPER",
        checkedAt: new Date().toISOString(),
        mainnetTransactions: 0,
        paidInferenceRequests: 0,
        assertions: [
          "confirmed revenue is zero",
          "net and runway remain unknown",
          "purchase unavailable and funded distribution unproven",
          "NFT funding code implemented but disabled",
          "stale and unavailable states",
          "390px layout",
          "no credential exposure",
          "no direct browser-to-backend requests",
        ],
        pageErrors: errors.length,
        credentialLeaks: leaks.length,
        directBackendRequests,
      },
      null,
      2,
    ) + "\n",
  );
});
