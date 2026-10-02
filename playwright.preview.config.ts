import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

const baseURL = "http://127.0.0.1:3418";

/** Fictional developer UI only. Run separately from the production wallet simulations. */
export default defineConfig({
  ...baseConfig,
  testDir: "./e2e/dev-preview",
  use: { ...baseConfig.use, baseURL },
  projects: baseConfig.projects?.map((project) => ({
    ...project,
    name: "FICTIONAL-UI-preview-chromium",
  })),
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3418",
    url: `${baseURL}/dev/beta`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
