import { expect, test } from "@playwright/test";
import { ACCOUNT_A, ACCOUNT_B, SIMULATED_LABEL, SimulatedChain, petPage, settleFrames } from "./support/simulated-chain";
import { WRITE_OR_SIGN, installSimulatedWallets } from "./support/simulated-provider";

test.describe(`${SIMULATED_LABEL}: account changes and stale answers`, () => {
  let chain: SimulatedChain;

  test.beforeEach(async ({ page, baseURL }) => {
    test.info().annotations.push({ type: "evidence", description: `${SIMULATED_LABEL}. Fictional provider, RPC and API answers; no extension, signature or transaction.` });
    chain = new SimulatedChain();
    chain.setPet(ACCOUNT_A, 3);
    chain.setPet(ACCOUNT_B, 8);
    await chain.install(page, baseURL!);
  });

  test.afterEach(() => chain.expectNoUnexpectedTraffic());

  async function singleWallet(page: import("@playwright/test").Page) {
    // One provider with A already granted: the app restores it without a prompt.
    return installSimulatedWallets(page, [{
      global: "ethereum", name: "MetaMask", grantedAccounts: [ACCOUNT_A], connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0",
    }]);
  }

  test("SIMULATED: A → B discards A's late pet and recap answers", async ({ page }) => {
    const wallets = await singleWallet(page);
    const oldPet = chain.hold("pet", ACCOUNT_A);
    const oldRecap = chain.hold("companion", ACCOUNT_A);
    const ui = petPage(page);

    await page.goto("/pet");
    await Promise.all([oldPet.arrived, oldRecap.arrived]);
    await expect(ui.wallet).toHaveText(ACCOUNT_A);
    await expect(ui.pet).toHaveText("Reading…");

    await wallets.setAccounts("MetaMask", [ACCOUNT_B]);
    await expect(ui.wallet).toHaveText(ACCOUNT_B);
    await expect(ui.growth).toHaveText("80 growth points");
    await expect(ui.recapCares).toHaveText("8");

    oldPet.release();
    oldRecap.release();
    // The late pet answer must genuinely reach the page. The late recap answer
    // is recorded as delivered or aborted; either way it must not be displayed.
    expect(await oldPet.settled).toBe("delivered");
    test.info().annotations.push({ type: "late recap answer", description: await oldRecap.settled });
    await settleFrames(page);

    await expect(ui.wallet).toHaveText(ACCOUNT_B);
    await expect(ui.growth).toHaveText("80 growth points");
    await expect(ui.recapCares).toHaveText("8");
    await expect(page.getByText("30 growth points", { exact: true })).toHaveCount(0);
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  });

  test("SIMULATED: A → B → A shows A's newer read, never the original late answer", async ({ page }) => {
    const wallets = await singleWallet(page);
    const oldPet = chain.hold("pet", ACCOUNT_A);
    const oldRecap = chain.hold("companion", ACCOUNT_A);
    const ui = petPage(page);

    await page.goto("/pet");
    await Promise.all([oldPet.arrived, oldRecap.arrived]);
    // The held answers captured 3 cares. A later read of A sees 4.
    chain.setPet(ACCOUNT_A, 4);

    await wallets.setAccounts("MetaMask", [ACCOUNT_B]);
    await expect(ui.growth).toHaveText("80 growth points");
    await wallets.setAccounts("MetaMask", [ACCOUNT_A]);
    await expect(ui.wallet).toHaveText(ACCOUNT_A);
    await expect(ui.growth).toHaveText("40 growth points");
    await expect(ui.recapCares).toHaveText("4");

    oldPet.release();
    oldRecap.release();
    // The late pet answer must genuinely reach the page. The late recap answer
    // is recorded as delivered or aborted; either way it must not be displayed.
    expect(await oldPet.settled).toBe("delivered");
    test.info().annotations.push({ type: "late recap answer", description: await oldRecap.settled });
    await settleFrames(page);

    // Same address string, older session: the 3-care answer must not land.
    await expect(ui.growth).toHaveText("40 growth points");
    await expect(ui.recapCares).toHaveText("4");
    await expect(page.getByText("30 growth points", { exact: true })).toHaveCount(0);
    expect(chain.count("pet", ACCOUNT_A)).toBeGreaterThanOrEqual(2);
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  });

  test("SIMULATED: an emptied account list removes the previous wallet's facts", async ({ page }) => {
    const wallets = await singleWallet(page);
    const ui = petPage(page);

    await page.goto("/pet");
    await expect(ui.growth).toHaveText("30 growth points");
    await expect(ui.recapCares).toHaveText("3");

    await wallets.setAccounts("MetaMask", []);
    await expect(ui.wallet).toHaveText("Not connected");
    await expect(ui.pet).toHaveText("Connect to view");
    await expect(ui.growth).toHaveCount(0);
    await expect(ui.recap.getByText("Connect a wallet to read MemePet activity.")).toBeVisible();
  });
});
