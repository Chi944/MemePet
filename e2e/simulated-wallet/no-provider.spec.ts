import { expect, test } from "@playwright/test";

test("SIMULATED: no provider gives setup guidance and failed reads stay unknown", async ({ page, baseURL }) => {
  test.info().annotations.push({
    type: "evidence",
    description: "Simulated browser state and RPC failure. No wallet extension, signature or real transaction.",
  });

  const localOrigin = new URL(baseURL!).origin;
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    // The production page's API and RPC calls are intercepted before any
    // request leaves this browser. Never call route.fetch() for these fixtures.
    if (url.origin !== localOrigin || url.pathname.startsWith("/api/")) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "SIMULATED upstream unavailable" }),
      });
      return;
    }
    await route.continue();
  });
  await page.addInitScript(() => {
    Object.defineProperty(window, "ethereum", { value: undefined, configurable: true });
    Object.defineProperty(window, "okxwallet", { value: undefined, configurable: true });
  });

  await page.goto("/pet");
  await expect(page.getByRole("heading", { name: "Your pet", exact: true })).toBeVisible();
  await expect(page.getByText("Not installed", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Official OKX Wallet download" })).toBeVisible();

  await page.getByRole("button", { name: "Connect wallet", exact: true }).first().click();
  await expect(page.getByText("No injected wallet was found.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Adopt pet", exact: true })).toHaveCount(0);

  const communityTotal = page.getByText("Community cares", { exact: true }).locator("..").locator("dd");
  await expect(communityTotal).toHaveText("Unknown");
  await expect(page.getByRole("button", { name: "Retry community total", exact: true })).toBeVisible();
});
