import { expect, test } from "@playwright/test";

const PHASES = [
  ["idle", "Transaction status"],
  ["checking", "Checking transaction status…"],
  ["pending", "Waiting for confirmation"],
  ["unknown", "Confirmation not known yet"],
  ["waitingFacts", "Confirmed — pet details not read yet"],
  ["confirmed", "Confirmed"],
  ["reverted", "Transaction reverted"],
  ["cancelled", "Transaction cancelled"],
  ["replaced", "Transaction replaced"],
] as const;

for (const width of [320, 390, 1440]) {
  test.describe(`FICTIONAL UI PREVIEW: beta panels at ${width}px`, () => {
    let blocked: string[];

    test.beforeEach(async ({ page, baseURL }) => {
      test.info().annotations.push({
        type: "evidence",
        description: "FICTIONAL UI PREVIEW. Local developer examples and callback counters only; no wallet, transaction recovery, storage or network data acceptance.",
      });
      blocked = [];
      const origin = new URL(baseURL!).origin;
      await page.setViewportSize({ width, height: 1000 });
      await page.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== origin || url.pathname === "/api" || url.pathname.startsWith("/api/")) {
          blocked.push(`${request.method()} ${url.origin}${url.pathname}`);
          await route.abort("blockedbyclient");
          return;
        }
        await route.continue();
      });
    });

    test.afterEach(() => {
      expect(blocked, "preview must not request API or non-local resources").toEqual([]);
    });

    test("all recovery states, callbacks, disclosure keys and reset stay fictional", async ({ page }) => {
      await page.goto("/dev/beta");
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Beta UI workbench");
      await expect(page.getByText("UI preview — fictional data", { exact: true })).toBeVisible();
      const banner = page.locator(".dev-banner");
      await expect(banner).toContainText("every value below is fictional");

      const state = page.getByRole("combobox", { name: "Recovery preview state", exact: true });
      const action = page.getByRole("combobox", { name: "Fictional transaction action", exact: true });
      const help = page.getByRole("combobox", { name: "Help preview content", exact: true });
      const counter = page.getByLabel("Check status callbacks:", { exact: true });
      const reset = page.getByRole("button", { name: "Reset preview", exact: true });
      await expect(state.locator("option")).toHaveCount(PHASES.length);
      await expect(counter).toHaveText("0");

      for (const [value, title] of PHASES) {
        await state.selectOption(value);
        await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
        if (value === "idle") {
          await expect(page.getByText("FICTIONAL_TRANSACTION_NOT_A_HASH", { exact: true })).toHaveCount(0);
        } else {
          await expect(page.getByText("FICTIONAL_TRANSACTION_NOT_A_HASH", { exact: true })).toBeVisible();
          await expect(page.getByText("Fictional recovery example", { exact: true }).locator("..").getByText("Preview data", { exact: true })).toBeVisible();
        }
        if (["idle", "confirmed", "reverted", "cancelled"].includes(value)) {
          await expect(page.getByRole("button", { name: /^(Check status|Checking…)$/ })).toHaveCount(0);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `no overflow for ${value}`).toBe(true);
      }
      await expect(page.getByText("FICTIONAL_REPLACEMENT_NOT_A_HASH", { exact: true })).toBeVisible();
      await page.screenshot({ path: test.info().outputPath(`beta-replaced-${width}.png`), fullPage: true });

      await action.selectOption("adopt");
      await expect(page.getByText("Adoption transaction", { exact: true })).toBeVisible();
      await state.selectOption("pending");
      await page.getByRole("button", { name: "Check status", exact: true }).click();
      await expect(counter).toHaveText("1");
      await expect(page.getByRole("heading", { name: "Waiting for confirmation", exact: true })).toBeVisible();

      await state.selectOption("checking");
      const checking = page.getByRole("button", { name: "Checking…", exact: true });
      await expect(checking).toHaveAttribute("aria-disabled", "true");
      // It remains in the natural tab sequence while activation is inert.
      await reset.focus();
      await page.keyboard.press("Tab");
      await expect(checking).toBeFocused();
      expect(await checking.evaluate((node) => node.matches(":focus-visible"))).toBe(true);
      expect(await checking.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe("none");
      await page.keyboard.press("Enter");
      await expect(counter).toHaveText("1");

      const question = page.locator("summary").filter({ hasText: "Fictional sample: what does checking status do?" });
      const disclosure = question.locator("..");
      await page.keyboard.press("Tab");
      await expect(question).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(disclosure).toHaveAttribute("open", "");
      await expect(page.getByText("In this workbench, Check status only increments the preview callback counter. It does not read a network or open a wallet.", { exact: true })).toBeVisible();
      await page.keyboard.press("Space");
      await expect(disclosure).not.toHaveAttribute("open");
      await page.keyboard.press("Enter");
      await expect(disclosure).toHaveAttribute("open", "");
      const focusClearance = await question.evaluate((summary) => {
        const answer = summary.parentElement?.querySelector("p");
        if (!answer) return -1;
        const style = getComputedStyle(summary);
        const outline = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);
        return answer.getBoundingClientRect().top - summary.getBoundingClientRect().bottom - outline;
      });
      expect(focusClearance, "expanded answer must clear the visible keyboard focus outline").toBeGreaterThanOrEqual(0);
      await expect(banner).toBeInViewport();
      await page.screenshot({ path: test.info().outputPath(`beta-help-keyboard-${width}.png`), fullPage: true });

      await reset.click();
      await expect(state).toHaveValue("pending");
      await expect(action).toHaveValue("care");
      await expect(counter).toHaveText("0");
      await expect(disclosure).not.toHaveAttribute("open");
      await help.selectOption("empty");
      await expect(page.getByText("Help answers are not available right now.", { exact: true })).toBeVisible();
      await expect(page.getByText(/Support contact unavailable\./)).toBeVisible();
      await reset.click();
      await expect(help).toHaveValue("examples");
      await expect(question).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.locator('a[href^="https:"]')).toHaveCount(3);
    });
  });
}
