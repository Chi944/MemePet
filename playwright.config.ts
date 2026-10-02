import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3417";

/** Local browser regressions with simulated wallets; never wallet acceptance. */
export default defineConfig({
  testDir: "./e2e/simulated-wallet",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  timeout: 20_000,
  expect: { timeout: 5_000 },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL,
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "SIMULATED-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Build first. Never reuse an unrelated server or visit the deployed site.
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3417",
    url: `${baseURL}/pet`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
