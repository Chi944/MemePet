import { expect, test } from "@playwright/test";
import { ACCOUNT_A, SIMULATED_LABEL, SimulatedChain, petPage, settleFrames } from "./support/simulated-chain";
import { WRITE_OR_SIGN, installSimulatedWallets } from "./support/simulated-provider";

/**
 * Follow-up to the lead-owned provider-selection.spec.ts (explicit choice,
 * provider-specific operations, ignored unselected events). This file does not
 * duplicate that coverage: it checks that the same address on the same chain
 * through a different provider is a new read session.
 */
test.describe(`${SIMULATED_LABEL}: same address, different provider`, () => {
  let chain: SimulatedChain;

  test.beforeEach(async ({ page, baseURL }) => {
    test.info().annotations.push({ type: "evidence", description: `${SIMULATED_LABEL}. Two fictional providers share one fictional address; no extension, signature or transaction.` });
    chain = new SimulatedChain();
    chain.setPet(ACCOUNT_A, 3);
    await chain.install(page, baseURL!);
  });

  test.afterEach(() => chain.expectNoUnexpectedTraffic());

  async function twoWallets(page: import("@playwright/test").Page) {
    return installSimulatedWallets(page, [
      { global: "ethereum", name: "MetaMask", grantedAccounts: [], connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0" },
      { global: "okxwallet", name: "OKX Wallet", grantedAccounts: [], connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0" },
    ]);
  }

  async function choose(page: import("@playwright/test").Page, name: "MetaMask" | "OKX Wallet") {
    await page.getByRole("radio", { name, exact: true }).check();
    await page.getByRole("button", { name: "Connect wallet", exact: true }).first().click();
  }

  test("SIMULATED: the first provider's late answers do not carry into the second", async ({ page }) => {
    const wallets = await twoWallets(page);
    const ui = petPage(page);
    const oldPet = chain.hold("pet", ACCOUNT_A);
    const oldRecap = chain.hold("companion", ACCOUNT_A);

    await page.goto("/pet");
    await choose(page, "MetaMask");
    await expect(ui.wallet).toHaveText(ACCOUNT_A);
    await Promise.all([oldPet.arrived, oldRecap.arrived]);

    // The held answers captured 3 cares; the new session reads 5.
    chain.setPet(ACCOUNT_A, 5);
    await page.getByRole("radio", { name: "OKX Wallet", exact: true }).check();
    await expect(ui.wallet).toHaveText("Not connected");
    await page.getByRole("button", { name: "Connect wallet", exact: true }).first().click();
    await expect(ui.wallet).toHaveText(ACCOUNT_A);
    await expect(ui.growth).toHaveText("50 growth points");
    await expect(ui.recapCares).toHaveText("5");

    oldPet.release();
    oldRecap.release();
    // The late pet answer must genuinely reach the page. The late recap answer
    // is recorded as delivered or aborted; either way it must not be displayed.
    expect(await oldPet.settled).toBe("delivered");
    test.info().annotations.push({ type: "late recap answer", description: await oldRecap.settled });
    await settleFrames(page);

    await expect(ui.growth).toHaveText("50 growth points");
    await expect(ui.recapCares).toHaveText("5");
    await expect(page.getByText("30 growth points", { exact: true })).toHaveCount(0);

    const calls = await wallets.calls();
    expect(calls.filter(({ method }) => method === "eth_requestAccounts")).toEqual([
      { wallet: "MetaMask", method: "eth_requestAccounts" },
      { wallet: "OKX Wallet", method: "eth_requestAccounts" },
    ]);
    expect(calls.filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  });

  test("SIMULATED: a failed read under one provider is not shown after switching", async ({ page }) => {
    const wallets = await twoWallets(page);
    const ui = petPage(page);
    chain.setPet(ACCOUNT_A, "fail");

    await page.goto("/pet");
    await choose(page, "MetaMask");
    await expect(ui.pet).toHaveText("Read failed");

    chain.setPet(ACCOUNT_A, 3);
    await choose(page, "OKX Wallet");
    await expect(ui.wallet).toHaveText(ACCOUNT_A);
    await expect(ui.pet).toHaveText("Adopted");
    await expect(ui.growth).toHaveText("30 growth points");
    await expect(page.getByText("Pet data could not be loaded. No preview data is shown.")).toHaveCount(0);
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  });
});
