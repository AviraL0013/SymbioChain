import { test, expect } from "@playwright/test";
import { formatNear } from "../../apps/web/src/features/mainnet/format";

test("shows real mainnet data, verifies a receipt, and connects without permissions or payments", async ({
  page,
  request,
}) => {
  const response = await request.get("/api/swarm/mainnet");
  expect(response.status()).toBe(200);
  const state = await response.json();
  const treasury = state.accounts.find(
    (a: { role: string }) => a.role === "TREASURY",
  );
  const expectedBalance = formatNear(treasury.balanceYocto);
  let backendCalls = 0;
  const errors: string[] = [];
  const secrets = (process.env.E2E_MAINNET_SECRETS ?? "")
    .split(",")
    .filter(Boolean);
  let leaks = 0;
  const responseChecks: Promise<void>[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (
      r
        .url()
        .startsWith(process.env.E2E_BACKEND_ORIGIN ?? "http://127.0.0.1:3401")
    )
      backendCalls++;
    if (
      secrets.some((s) =>
        (JSON.stringify(r.headers()) + (r.postData() ?? "")).includes(s),
      )
    )
      leaks++;
  });
  page.on("requestfinished", (request) => {
    responseChecks.push(
      (async () => {
        const r = await request.response();
        if (
          r &&
          /json|javascript|html/.test(r.headers()["content-type"] ?? "")
        ) {
          const body = await r.text();
          if (secrets.some((s) => body.includes(s))) leaks++;
        }
      })().catch(() => {}),
    );
  });
  await page.addInitScript(() => {
    const scope = window as unknown as {
      __walletCalls: {
        signIns: unknown[];
        transactions: number;
        disconnected: boolean;
      };
    };
    scope.__walletCalls = { signIns: [], transactions: 0, disconnected: false };
    window.addEventListener("near-selector-ready", () => {
      const adapter = {
        manifest: {
          id: "meteor-wallet",
          name: "Meteor Wallet Fixture",
          version: "1.0.0",
          type: "injected",
          description: "Isolated browser fixture",
          icon: "",
          website: "https://meteorwallet.app",
          executor: "",
          platform: ["web"],
          permissions: {},
          features: {
            signInWithoutAddKey: true,
            mainnet: true,
            testnet: false,
          },
        },
        signIn: async (input: unknown) => {
          scope.__walletCalls.signIns.push(input);
          return [{ accountId: "solidvideo4090.near" }];
        },
        getAccounts: async () => [{ accountId: "solidvideo4090.near" }],
        signOut: async () => {
          scope.__walletCalls.disconnected = true;
        },
        signAndSendTransaction: async () => {
          scope.__walletCalls.transactions++;
          throw Error("No transaction allowed");
        },
        signAndSendTransactions: async () => {
          scope.__walletCalls.transactions++;
          throw Error("No transaction allowed");
        },
      };
      window.dispatchEvent(
        new CustomEvent("near-wallet-injected", { detail: adapter }),
      );
    });
  });
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Swarm overview", exact: true }),
  ).toBeVisible({ timeout: 90000 });
  await expect(
    page.getByText(expectedBalance, { exact: false }).first(),
  ).toBeVisible({
    timeout: 90000,
  });
  await expect(
    page
      .locator(".mn-readiness")
      .getByText(state.paused ? "Paused" : "Active", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Recorded simulation. No on-chain funds or NFTs."),
  ).toHaveCount(0);
  await page.route("**/api/swarm/mainnet", (route) =>
    route.fulfill({ status: 503, body: "{}", contentType: "application/json" }),
  );
  await page.getByRole("button", { name: "Refresh data", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Mainnet connection unavailable" }),
  ).toContainText("stale");
  await expect(
    page.getByText(expectedBalance, { exact: false }).first(),
  ).toBeVisible();
  await page.unroute("**/api/swarm/mainnet");
  await page.getByRole("button", { name: "Refresh data", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Mainnet connection unavailable" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Verify", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Confirmed on mainnet", { exact: true }),
  ).toBeVisible({ timeout: 60000 });
  await page
    .getByRole("button", { name: "Connect wallet", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Connect Meteor", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /solidvideo/ })).toBeVisible({
    timeout: 30000,
  });
  await page.getByRole("button", { name: /solidvideo/ }).click();
  await expect(page.getByRole("dialog")).toContainText("solidvideo4090.near");
  await expect(
    page.getByRole("dialog").locator(".wallet-account dl > div").first(),
  ).toContainText(/Total balance[\d,.]+ NEAR/, { timeout: 30000 });
  await page.getByRole("button", { name: "Disconnect wallet" }).click();
  await expect(
    page.getByRole("button", { name: "Connect Meteor", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  const calls = await page.evaluate(
    () =>
      (
        window as unknown as {
          __walletCalls: {
            signIns: { network?: string; addFunctionCallKey?: unknown }[];
            transactions: number;
            disconnected: boolean;
          };
        }
      ).__walletCalls,
  );
  expect(calls.signIns).toHaveLength(1);
  expect(calls.signIns[0]?.network).toBe("mainnet");
  expect(calls.signIns[0]?.addFunctionCallKey).toBeUndefined();
  expect(calls.transactions).toBe(0);
  expect(calls.disconnected).toBe(true);
  for (const [path, title] of [
    ["/topology", "Meet your agents"],
    ["/nfts", "Execution receipts"],
    ["/business", "Business overview"],
    ["/operator", "Execution controls"],
    ["/evidence", "Execution evidence"],
    ["/cycles", "Transaction activity"],
  ]) {
    await page.goto(path!);
    await expect(page.getByRole("heading", { name: title! })).toBeVisible({
      timeout: 60000,
    });
    if (path === "/evidence") {
      await expect(
        page
          .locator(".evidence-group > summary")
          .filter({ hasText: "Service escrow round trip" }),
      ).toBeVisible({ timeout: 60000 });
      for (const group of await page.locator(".evidence-group").all()) {
        await group.locator("summary").click();
      }
      await expect(
        page.getByRole("heading", {
          name: "Current mainnet state",
        }),
      ).toBeVisible();
      await expect(
        page.getByText("NEAR MAINNET", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Confirmed mainnet funding" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", {
          name: "View confirmed funding transaction ↗",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("region", { name: "Execution still gated" })
          .getByText("QUARANTINED", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Recorded mainnet acceptance" }),
      ).toBeVisible();
      const activation = page.getByRole("region", {
        name: "Bounded mainnet activation",
      });
      await expect(
        activation.getByRole("heading", { name: "Bounded mainnet activation" }),
      ).toBeVisible();
      await expect(
        activation.getByText(
          "Inference blocked by application-level TEE workload measurement policy.",
          { exact: true },
        ),
      ).toBeVisible({ timeout: 60000 });
      await expect(
        activation.getByText("ACTIVE", { exact: true }),
      ).toBeVisible();
      await expect(
        activation.getByText("Confirmed owner-activation receipts:", {
          exact: false,
        }),
      ).toContainText("7 / 7 · COMPLETE");
      await expect(
        activation.locator('a[href^="https://nearblocks.io/txns/"]'),
      ).toHaveCount(7);

      await expect(
        page.getByRole("heading", {
          name: "Confirmed mainnet service balance round trip",
        }),
      ).toBeVisible();
      await expect(
        page.getByText("Mainnet execution coverage is incomplete.", {
          exact: false,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "View service deposit ↗" }),
      ).toHaveAttribute(
        "href",
        "https://nearblocks.io/txns/5TJYtz6mgKmLCUtm671nad5yLiUCGE3c7exe91WXgtiN",
      );
      await expect(
        page.getByRole("link", { name: "View returned service credit ↗" }),
      ).toHaveAttribute(
        "href",
        "https://nearblocks.io/txns/8yY6i69VtQgknNxzTEz3qR9uxWEyUojCAiQi3HzbLEAC",
      );
      await expect(
        page.locator(
          'a[href*="testnet"], a[href*="sepolia"], a[href*="cluster=devnet"]',
        ),
      ).toHaveCount(0);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/evidence");
  for (const title of [
    "Initial treasury funding",
    "Service escrow round trip",
    "Historical mainnet acceptance audit",
  ]) {
    await page
      .locator(".evidence-group > summary")
      .filter({ hasText: title })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Confirmed mainnet funding" }),
  ).toBeVisible({ timeout: 60000 });
  await expect(
    page.getByRole("heading", {
      name: "Confirmed mainnet service balance round trip",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 390, height: 430 });
  const navigation = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  await navigation.click();
  await expect(
    page.getByRole("dialog", { name: "Workspace navigation" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Controls", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("link", { name: "Controls", exact: true }),
  ).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(navigation).toBeFocused();
  await page.screenshot({
    path: "artifacts/browser/mainnet-evidence-mobile.png",
    fullPage: true,
  });
  await page.route("**/api/swarm/mainnet/acceptance", (route) =>
    route.fulfill({ status: 503, body: "{}", contentType: "application/json" }),
  );
  await page.getByRole("button", { name: "Refresh current checks" }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Recorded mainnet acceptance report unavailable" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Recorded mainnet acceptance" })
      .getByText("STALE COPY", { exact: false }),
  ).toBeVisible();
  await page.unroute("**/api/swarm/mainnet/acceptance");
  await page.goto("/dashboard");
  await expect(
    page.getByText(expectedBalance, { exact: false }).first(),
  ).toBeVisible({
    timeout: 60000,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await Promise.all(responseChecks);
  const visible = await page.evaluate(() =>
    JSON.stringify({
      html: document.documentElement.outerHTML,
      local: { ...localStorage },
      session: { ...sessionStorage },
    }),
  );
  expect(secrets.some((s) => visible.includes(s))).toBe(false);
  expect(leaks).toBe(0);
  expect(backendCalls).toBe(0);
  expect(errors).toEqual([]);
});

test("transaction search uses readable actions and lookup distinguishes missing records from an outage", async ({
  page,
}) => {
  await page.goto("/cycles");
  const search = page.getByRole("textbox", {
    name: "Search recorded transactions",
  });
  await search.fill("no matching deployment record");
  await expect(
    page.getByText("No recorded transactions match this search."),
  ).toBeVisible();
  await search.fill("create treasury");
  await expect(page.locator(".mn-data-table tbody tr")).toHaveCount(1);
  await page.locator(".mn-route-detail summary").click();
  await expect(page.locator(".mn-route-detail")).toContainText("Signer");
  await expect(page.locator(".mn-route-detail")).toContainText("Receiver");
  const identifier = page
    .locator(".mn-data-table tbody tr")
    .first()
    .locator("td")
    .nth(1)
    .locator(".data-identifier-value");
  const identifierText = identifier.locator("code");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await expect
      .poll(() =>
        identifierText.evaluate(
          (element) =>
            element.clientWidth > 0 &&
            element.scrollWidth > element.clientWidth,
        ),
      )
      .toBe(true);
    await identifier.click();
    await expect
      .poll(() =>
        identifierText.evaluate(
          (element) =>
            element.clientWidth > 0 &&
            element.scrollWidth <= element.clientWidth,
        ),
      )
      .toBe(true);
    await identifier.click();
  }
  await page.goto("/verify");
  await page.route("**/api/swarm/mainnet/transaction?**", (route) =>
    route.fulfill({ status: 404, json: {} }),
  );
  await page
    .getByLabel("NEAR transaction hash", { exact: true })
    .fill("A".repeat(43));
  await page
    .getByRole("button", { name: "Verify transaction", exact: true })
    .click();
  await expect(
    page.getByText("No verified record found", { exact: true }),
  ).toBeVisible();
  await page.unroute("**/api/swarm/mainnet/transaction?**");
  await page.route("**/api/swarm/mainnet/transaction?**", (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page
    .getByRole("button", { name: "Verify transaction", exact: true })
    .click();
  await expect(
    page.getByText("Verification unavailable", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("No verified record found", { exact: true }),
  ).toHaveCount(0);
});
