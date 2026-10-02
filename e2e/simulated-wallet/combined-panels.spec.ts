import { expect, test, type Page } from "@playwright/test";
import { ACCOUNT_A, ACCOUNT_B, SIMULATED_LABEL, SimulatedChain, petPage } from "./support/simulated-chain";
import { installSimulatedWallets } from "./support/simulated-provider";

/** Pet, recap and garden must describe the same wallet and community read. */
async function expectAgreement(page: Page, careCount: number, communityTotal: number) {
  const ui = petPage(page);
  await expect(ui.growth).toHaveText(`${careCount * 10} growth points`);
  await expect(ui.recapCares).toHaveText(String(careCount));
  await expect(ui.recap.getByText(`${careCount * 10} points`, { exact: false }).first()).toBeVisible();
  await expect(ui.communityCares).toHaveText(String(communityTotal));
  await expect(page.getByText(`${communityTotal} confirmed care actions`, { exact: true })).toBeVisible();

  const evidence = ui.recap.locator("details");
  if (!(await evidence.evaluate((node) => (node as HTMLDetailsElement).open))) {
    await evidence.getByText("View verified evidence").click();
  }
  await expect(ui.recap.getByLabel("Shared community").locator("dd")).toHaveText(String(communityTotal));
  await expect(ui.recap.getByLabel("Your pet at this read").getByText("Your care actions", { exact: true })
    .locator("..").locator("dd")).toHaveText(String(careCount));
}

for (const width of [390, 1440]) {
  test.describe(`${SIMULATED_LABEL}: combined panels at ${width}px`, () => {
    let chain: SimulatedChain;

    test.beforeEach(async ({ page, baseURL }) => {
      test.info().annotations.push({ type: "evidence", description: `${SIMULATED_LABEL}. Fictional provider, RPC and API answers; no extension, signature or transaction.` });
      await page.setViewportSize({ width, height: 1000 });
      chain = new SimulatedChain();
      chain.setPet(ACCOUNT_A, 3);
      chain.setPet(ACCOUNT_B, 8);
      chain.communityTotal = 42;
      await chain.install(page, baseURL!);
    });

    test.afterEach(() => chain.expectNoUnexpectedTraffic());

    test(`SIMULATED: pet, recap and garden agree for A, then for B at ${width}px`, async ({ page }) => {
      const wallets = await installSimulatedWallets(page, [{
        global: "ethereum", name: "MetaMask", grantedAccounts: [ACCOUNT_A], connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0",
      }]);
      const ui = petPage(page);

      await page.goto("/pet");
      await expect(ui.wallet).toHaveText(ACCOUNT_A);
      await expectAgreement(page, 3, 42);
      await page.screenshot({ path: test.info().outputPath(`combined-a-${width}.png`), fullPage: true });

      chain.communityTotal = 43;
      await wallets.setAccounts("MetaMask", [ACCOUNT_B]);
      await expect(ui.wallet).toHaveText(ACCOUNT_B);
      await expectAgreement(page, 8, 43);
      await expect(page.getByText("30 growth points", { exact: true })).toHaveCount(0);
      await expect(page.getByText("42 confirmed care actions", { exact: true })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: test.info().outputPath(`combined-b-${width}.png`), fullPage: true });
    });

    test(`SIMULATED: a failed community read is unknown in every panel at ${width}px`, async ({ page }) => {
      await installSimulatedWallets(page, [{
        global: "ethereum", name: "MetaMask", grantedAccounts: [ACCOUNT_A], connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0",
      }]);
      chain.communityTotal = "fail";
      const ui = petPage(page);

      await page.goto("/pet");
      await expect(ui.growth).toHaveText("30 growth points");
      await expect(ui.recapCares).toHaveText("3");
      await expect(ui.communityCares).toHaveText("Unknown");
      await expect(ui.garden).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Retry reading", exact: true })).toBeVisible();
      await ui.recap.getByText("View verified evidence").click();
      await expect(ui.recap.getByLabel("Shared community").locator("dd")).toHaveText("Unknown");
    });
  });
}
