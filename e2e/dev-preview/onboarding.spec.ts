import { test, expect } from "@playwright/test";

for (const width of [320, 390, 1440]) {
  test(`FICTIONAL B1: local reset, wallet choice and progression at ${width}px`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 900 });
    const blocked: string[] = [];
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(baseURL!).origin || url.pathname.startsWith("/api/")) {
        blocked.push(url.href); return route.abort();
      }
      return route.continue();
    });
    await page.goto("/dev/beta");
    const surface = page.getByRole("region", { name: "Fictional onboarding and progression", exact: true });
    const connect = surface.getByRole("button", { name: "Connect chosen wallet", exact: true });
    await expect(connect).toBeDisabled();
    const radio = surface.getByRole("radio", { name: "OKX Wallet (fictional)" });
    await radio.focus(); await page.keyboard.press("Space");
    await expect(radio).toBeChecked(); await expect(connect).toBeEnabled();
    await connect.click();
    await expect(surface.getByLabel("Onboarding/progression callbacks:")).toHaveText("2");
    const state = surface.getByRole("combobox", { name: "Onboarding preview state" });
    await state.selectOption("cooldown");
    const instant = surface.locator("time");
    await expect(instant).toHaveAttribute("datetime", "2030-01-02T00:00:00.000Z");
    const local = await page.evaluate(() => new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "long" }).format(new Date("2030-01-02T00:00:00.000Z")));
    await expect(instant).toHaveText(local);
    await expect(surface.getByText(/One care per UTC calendar day/)).toBeVisible();
    await surface.getByRole("combobox", { name: "Personal milestone preview" }).selectOption("allReached");
    await surface.getByRole("combobox", { name: "Garden chapter preview" }).selectOption("allReached");
    await expect(surface.getByText("Earned", { exact: true })).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await instant.scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`b1-local-reset-${width}.png`) });
    await surface.getByRole("combobox", { name: "Personal milestone preview" }).selectOption("unavailable");
    await surface.getByRole("combobox", { name: "Garden chapter preview" }).selectOption("unavailable");
    await expect(surface.getByText("Earned", { exact: true })).toHaveCount(0);
    await surface.getByRole("button", { name: "Retry progression reads" }).click();
    await expect(surface.getByLabel("Onboarding/progression callbacks:")).toHaveText("3");
    expect(blocked).toEqual([]);
  });
}
