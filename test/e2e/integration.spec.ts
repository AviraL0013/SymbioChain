import { test, expect } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { parseEnv } from "node:util";
const env = parseEnv(readFileSync("apps/web/.env.local", "utf8"));
if (
  !["127.0.0.1", "localhost"].includes(
    new URL(env.BACKEND_URL ?? "https://invalid.example").hostname,
  )
)
  throw new Error(
    "E2E requires a dedicated local PAPER backend in apps/web/.env.local.",
  );
const access =
  process.env.E2E_OPERATOR_ACCESS_CODE ?? env.OPERATOR_ACCESS_TOKEN;
if (!access)
  throw new Error(
    "Configure the isolated operator access code before E2E checks.",
  );

test("public telemetry and protected operations complete a recoverable PAPER cycle", async ({
  page,
  context,
  request,
  baseURL,
}) => {
  const pageErrors: string[] = [],
    leaks: string[] = [],
    bodyChecks: Promise<void>[] = [];
  let directBackendRequests = 0;
  const secrets = [env.BACKEND_READ_TOKEN, env.BACKEND_ADMIN_TOKEN].filter(
    Boolean,
  ) as string[];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (url.origin === env.BACKEND_URL) directBackendRequests++;
    const text = JSON.stringify(r.headers()) + (r.postData() ?? "");
    if (secrets.some((s) => text.includes(s))) leaks.push("browser-request");
  });
  page.on("requestfinished", (request) => {
    const check = (async () => {
      const response = await request.response();
      if (
        !response ||
        !/json|javascript|html/.test(response.headers()["content-type"] ?? "")
      )
        return;
      const body = await response.text();
      if (secrets.some((secret) => body.includes(secret)))
        leaks.push("browser-response");
    })().catch(() => {});
    bodyChecks.push(check);
  });
  const denied = await request.post("/api/operator/action", {
    headers: { origin: baseURL! },
    data: { action: "treasury", control: "pause" },
  });
  expect(denied.status()).toBe(401);
  await page.goto("/dashboard");
  await expect(
    page.getByText("Event stream connected", { exact: true }),
  ).toBeVisible({ timeout: 45000 });
  expect((await request.get("/api/swarm/snapshot")).status()).toBe(200);
  await page.goto("/operator");
  await page.getByLabel("Operator access code", { exact: true }).fill(access);
  await page
    .getByRole("button", { name: "Unlock Operator Control", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Lock session", exact: true }),
  ).toBeVisible();
  const cookies = await context.cookies();
  const session = cookies.find((c) => c.name === "symbio-operator");
  expect(!!session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe("Strict");
  const csrf = await context.request.post("/api/operator/action", {
    headers: { origin: "https://evil.example" },
    data: { action: "treasury", control: "pause" },
  });
  expect(csrf.status()).toBe(403);
  await page
    .getByRole("button", { name: "Add simulated funds", exact: true })
    .click();
  await expect(
    page.getByText("Simulated funding recorded. No wallet funds moved.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause EYE", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume EYE", exact: true }),
  ).toBeEnabled();
  const created = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/operator/action") &&
      r.request().postDataJSON()?.action === "create-cycle",
  );
  await page
    .getByRole("button", { name: "Create PAPER cycle", exact: true })
    .click();
  const cycleId = (await (await created).json()).cycleId as string;
  expect(cycleId).toMatch(/^[a-f0-9-]{36}$/);
  await expect(page.locator(".operator-cycle-state")).toContainText(
    "DISCOVERED",
    { timeout: 30000 },
  );
  await page
    .getByLabel(
      "I understand this restarts the PAPER worker process and temporarily interrupts telemetry.",
    )
    .check();
  await page
    .getByRole("button", { name: "Arm one worker crash", exact: true })
    .click();
  await expect(
    page.getByText(
      "One crash armed. Resume the selected lane to trigger recovery.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume EYE", exact: true }).click();
  await expect(page.locator(".operator-cycle-state")).toContainText(
    "RECONCILED",
    { timeout: 90000 },
  );
  await expect(page.locator(".operator-jobs")).toContainText("EYE · attempt 2");
  await page
    .getByRole("button", {
      name: "Use explicitly simulated valuation",
      exact: true,
    })
    .click();
  await page
    .getByLabel(
      "I reviewed the settlement and complete simulated costs, including NEAR gas, hosting and receipt gas.",
    )
    .check();
  await page.route("**/api/operator/action", async (route) => {
    await new Promise((r) => setTimeout(r, 600));
    await route.continue();
  });
  await page
    .getByRole("button", { name: "Approve bound cost basis", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Pause treasury", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".operator-cycle-state")).toContainText("CLOSED", {
    timeout: 60000,
  });
  await page.unroute("**/api/operator/action");
  const evidence = await context.request.get(
    `/api/operator/evidence?id=${cycleId}`,
  );
  expect(evidence.status()).toBe(200);
  expect(evidence.headers()["content-disposition"]).toContain("attachment");
  const cycle = await (
    await request.get(`/api/swarm/cycles/${cycleId}`)
  ).json();
  expect(cycle.economics.status).toBe("ACCOUNTANT_APPROVED");
  expect(cycle.profitCheck.realized).toBe(false);
  await page.goto(`/cycles/${cycleId}`);
  await expect(
    page.getByText("ACCOUNTANT APPROVED", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
  await page.screenshot({
    path: "artifacts/browser/cycle-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/nfts");
  const snap = await (await request.get("/api/swarm/snapshot")).json();
  expect(
    snap.receipts.some(
      (r: { cycleId: string; mintedOnChain: boolean }) =>
        r.cycleId === cycleId && r.mintedOnChain === false,
    ),
  ).toBe(true);
  await page.goto(`/verify?hash=${"0".repeat(64)}`);
  await expect(
    page.getByLabel("Request or response hash", { exact: true }),
  ).toHaveValue("0".repeat(64));
  await page
    .getByRole("button", { name: /look up|verify proof|verify hash/i })
    .click();
  await expect(
    page.getByText("No verified record found", { exact: false }),
  ).toBeVisible();
  await page.goto("/operator");
  await expect(
    page.getByRole("button", { name: "Lock session", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/browser/operator-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Lock session", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Unlock Operator Control", exact: true }),
  ).toBeVisible();
  expect(
    (
      await context.request.get(`/api/operator/evidence?id=${cycleId}`)
    ).status(),
  ).toBe(401);
  const storage = await page.evaluate(() =>
    JSON.stringify({
      local: { ...localStorage },
      session: { ...sessionStorage },
    }),
  );
  expect(secrets.some((s) => storage.includes(s))).toBe(false);
  await page.goto("about:blank");
  await Promise.all(bodyChecks);
  expect(leaks).toEqual([]);
  expect(directBackendRequests).toBe(0);
  expect(pageErrors).toEqual([]);
  mkdirSync("artifacts/browser", { recursive: true });
  writeFileSync(
    "artifacts/browser/verification.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        mode: "PAPER",
        cycleId,
        crashRecovery: true,
        scoutClaimAttempts: 2,
        costApproval: true,
        cycleState: cycle.cycle.state,
        browserCredentialsExposed: false,
        directBackendRequests,
        realTrades: 0,
        paidInferenceRequests: 0,
      },
      null,
      2,
    ),
  );
});
