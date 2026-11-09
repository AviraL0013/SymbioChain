import { test, expect } from "@playwright/test";

test("legacy rehearsal URL redirects to current mainnet evidence", async ({
  page,
}) => {
  await page.goto("/testnet");
  await expect(page).toHaveURL(/\/evidence$/);
  await expect(
    page.getByRole("heading", { name: "Execution evidence.", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recorded mainnet acceptance" }),
  ).toBeVisible();
  await expect(
    page.locator(
      'a[href*="testnet"], a[href*="sepolia"], a[href*="cluster=devnet"]',
    ),
  ).toHaveCount(0);
});
