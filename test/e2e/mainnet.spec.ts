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
  page.on("response", (r) => {
    if (/json|javascript|html/.test(r.headers()["content-type"] ?? ""))
      responseChecks.push(
        r
          .text()
          .then((body) => {
            if (secrets.some((s) => body.includes(s))) leaks++;
          })
          .catch(() => {}),
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
    page.getByRole("heading", { name: "Mainnet Mission Control." }),
  ).toBeVisible({ timeout: 90000 });
  await expect(
    page.getByText(expectedBalance, { exact: false }).first(),
  ).toBeVisible({
    timeout: 90000,
  });
  await expect(
    page.getByText("Treasury paused", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Recorded simulation. No on-chain funds or NFTs."),
  ).toHaveCount(0);
  await page.route("**/api/swarm/mainnet", (route) =>
    route.fulfill({ status: 503, body: "{}", contentType: "application/json" }),
  );
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Mainnet connection unavailable" }),
  ).toContainText("stale");
  await expect(
    page.getByText(expectedBalance, { exact: false }).first(),
  ).toBeVisible();
  await page.unroute("**/api/swarm/mainnet");
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
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
  await expect(page.getByRole("dialog")).toContainText(
    /Total balance: [\d,.]+ NEAR/,
    { timeout: 30000 },
  );
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
    ["/topology", "Mainnet Agents."],
    ["/nfts", "Mainnet Receipts."],
    ["/business", "Business Readiness."],
    ["/operator", "Execution Controls."],
    ["/testnet", "Testnet rehearsal"],
    ["/cycles", "Mainnet Transactions."],
  ]) {
    await page.goto(path!);
    await expect(page.getByRole("heading", { name: title! })).toBeVisible({
      timeout: 60000,
    });
    if (path === "/testnet") {
      await expect(
        page.getByText("PAPER backend", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByText("Test-token distribution · PASSED", { exact: true }),
      ).toBeVisible();
      await expect(
        page.locator(
          'a[href="https://testnet.nearblocks.io/txns/2Asero1kxG7xfM633fuahR4Xuk3izeRvWnrTLevkLR4c"]',
        ),
      ).toBeVisible();
      await expect(
        page.getByText("TEE deployment approval · BLOCKED", { exact: true }),
      ).toBeVisible();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
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
  expect(leaks).toBe(0);
  expect(backendCalls).toBe(0);
  expect(errors).toEqual([]);
});
