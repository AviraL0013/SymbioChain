import { defineConfig } from "@playwright/test";
const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3300";
if (!["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname))
  throw new Error(
    "Mutating browser checks require an isolated localhost deployment.",
  );
export default defineConfig({
  testDir: "test/e2e",
  workers: 1,
  fullyParallel: false,
  timeout: 180_000,
  reporter: "list",
  outputDir: "artifacts/browser",
  use: {
    baseURL,
    viewport: { width: 1440, height: 1100 },
    headless: true,
    launchOptions: {
      executablePath: process.env.E2E_CHROME_PATH,
      args: process.env.E2E_CHROME_PATH ? ["--no-sandbox"] : [],
    },
    screenshot: "only-on-failure",
    trace: "off",
  },
});
