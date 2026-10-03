import { test, expect } from "@playwright/test";

for (const width of [320, 390, 1440]) {
  test(`READ-ONLY help: real content and keyboard navigation at ${width}px`, async ({ page, baseURL }) => {
    const unexpected: string[] = [];
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(baseURL!).origin || url.pathname.startsWith("/api/")) {
        unexpected.push(`${route.request().method()} ${url.origin}${url.pathname}`);
        return route.abort();
      }
      return route.continue();
    });
    await page.addInitScript(() => {
      Object.defineProperty(window, "ethereum", {
        configurable: true,
        get() { throw new Error("Help must not inspect a wallet provider"); },
      });
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/help");
    await expect(page).toHaveTitle("Help · MemePet");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mochi, made simple.");
    await expect(page.getByRole("link", { name: "Help", exact: true })).toHaveAttribute("aria-current", "page");
    const summaries = page.locator("summary");
    await expect(summaries).toHaveCount(10);
    await expect(page.getByText(/Support contact unavailable/)).toBeVisible();
    await summaries.first().focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(/The public MemePet app runs on X Layer testnet/)).toBeVisible();
    await expect(page.getByRole("link", { name: "X Layer testnet faucet (OKX)", exact: false })).toHaveAttribute("href", "https://web3.okx.com/xlayer/faucet");
    await page.keyboard.press("Space");
    await expect(page.getByText(/The public MemePet app runs on X Layer testnet/)).toBeHidden();
    for (const summary of await summaries.all()) {
      await summary.focus();
      await page.keyboard.press("Enter");
    }
    await expect(page.getByText(/Check status only reads the existing transaction/)).toBeVisible();
    await expect(page.getByText(/On Your pet, cosmetic milestones/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const external = await page.locator('a[target="_blank"]').evaluateAll((links) => links.map((link) => ({
      href: (link as HTMLAnchorElement).href, rel: (link as HTMLAnchorElement).rel,
    })));
    expect(external.map((link) => link.href)).toEqual(expect.arrayContaining([
      "https://web3.okx.com/download",
      "https://support.metamask.io/start/getting-started-with-metamask/",
      "https://web3.okx.com/xlayer/faucet",
      "https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information",
      "https://www.okx.com/web3/explorer/xlayer-test",
      "https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/",
    ]));
    for (const link of external) {
      expect(link.href).toMatch(/^https:\/\//);
      expect(link.rel.split(" ")).toContain("noreferrer");
    }
    await page.screenshot({ path: test.info().outputPath(`help-${width}.png`), fullPage: true });
    await page.getByRole("link", { name: "Go to your pet", exact: true }).focus();
    await expect(page.getByRole("link", { name: "Go to your pet", exact: true })).toHaveAttribute("href", "/pet");
    expect(unexpected).toEqual([]);
    expect(errors).toEqual([]);
  });
}
