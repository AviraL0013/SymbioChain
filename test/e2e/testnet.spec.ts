import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

test("testnet evidence keeps recorded signatures and simulations distinct", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  const secrets = (process.env.E2E_TESTNET_SECRETS ?? "")
    .split(",")
    .filter(Boolean);
  const leaks: string[] = [];
  const inspected: Promise<void>[] = [];
  const backendOrigin =
    process.env.E2E_BACKEND_ORIGIN ?? "http://127.0.0.1:3314";
  let directBackendRequests = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).origin === backendOrigin)
      directBackendRequests++;
    if (
      secrets.some((secret) =>
        (
          JSON.stringify(request.headers()) + (request.postData() ?? "")
        ).includes(secret),
      )
    )
      leaks.push("request");
  });
  page.on("requestfinished", (request) => {
    inspected.push(
      (async () => {
        const response = await request.response();
        if (
          !response ||
          !/json|javascript|html/.test(response.headers()["content-type"] ?? "")
        )
          return;
        const body = await response.text();
        if (secrets.some((secret) => body.includes(secret)))
          leaks.push("response");
      })().catch(() => {}),
    );
  });
  const response = await request.get("/api/swarm/testnet");
  expect(response.status()).toBe(200);
  const report = await response.json();
  expect(report.profile).toBe("TESTNET_REHEARSAL");
  expect(report.network).toBe("testnet");
  expect(report.settlement).toBe("SIMULATED");
  expect(report.mainnetTransactions).toBe(0);
  expect(report.paidInferenceRequests).toBe(0);
  await page.goto("/testnet");
  await expect(
    page.getByRole("heading", { name: "Testnet rehearsal" }),
  ).toBeVisible();
  await expect(
    page.getByText("Settlement / economics", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Hardware evidence does not establish", { exact: false }),
  ).toBeVisible();
  for (const check of report.checks) {
    if (check.id === "tee_deployment")
      await expect(
        page.getByText(`TEE deployment approval · ${check.status}`, {
          exact: true,
        }),
      ).toBeVisible();
    if (check.id === "inference")
      await expect(
        page.getByText(`Signed AI completion · ${check.status}`, {
          exact: true,
        }),
      ).toBeVisible();
  }
  for (const link of await page.locator('a[href*="nearblocks.io"]').all())
    expect(await link.getAttribute("href")).toMatch(
      /^https:\/\/testnet\.nearblocks\.io\/(address|txns)\//,
    );
  await page.screenshot({
    path: "artifacts/browser/testnet-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/browser/testnet-mobile.png",
    fullPage: true,
  });
  expect(directBackendRequests).toBe(0);
  expect(errors).toEqual([]);
  await Promise.all(inspected);
  expect(leaks).toEqual([]);
  mkdirSync("docs/validation", { recursive: true });
  writeFileSync(
    "docs/validation/testnet-browser.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        profile: report.profile,
        backendOrigin,
        frontendOrigin: new URL(page.url()).origin,
        contractId: report.contractId,
        checks: report.checks.map((c: { id: string; status: string }) => ({
          id: c.id,
          status: c.status,
        })),
        assertions: {
          sameOriginProxy: true,
          explicitSimulation: true,
          noHorizontalOverflowAt390px: true,
          pageErrors: errors.length,
          directBackendRequests,
          inspectedCredentialCount: secrets.length,
          credentialLeaks: leaks.length,
        },
        mainnetTransactions: 0,
        paidInferenceRequests: 0,
      },
      null,
      2,
    ) + "\n",
  );
  await page.route("**/api/swarm/testnet", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "unavailable" }),
    }),
  );
  await page.reload();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "The rehearsal report is unavailable" }),
  ).toBeVisible();
});
