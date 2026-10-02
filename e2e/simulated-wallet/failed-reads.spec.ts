import { expect, test } from "@playwright/test";
import { ACCOUNT_A, SIMULATED_LABEL, SimulatedChain, petPage } from "./support/simulated-chain";
import { WRITE_OR_SIGN, installSimulatedWallets } from "./support/simulated-provider";

const RECAP_ERROR = "Mochi's confirmed activity could not be read. Please retry the read.";

test.describe(`${SIMULATED_LABEL}: failed reads and read-only retry`, () => {
  let chain: SimulatedChain;

  test.beforeEach(async ({ page, baseURL }) => {
    test.info().annotations.push({ type: "evidence", description: `${SIMULATED_LABEL}. Fictional provider, RPC and API failures; no extension, signature or transaction.` });
    chain = new SimulatedChain();
    await chain.install(page, baseURL!);
  });

  test.afterEach(() => chain.expectNoUnexpectedTraffic());

  async function walletA(page: import("@playwright/test").Page) {
    return installSimulatedWallets(page, [{
      global: "ethereum", name: "MetaMask", grantedAccounts: [ACCOUNT_A], connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0",
    }]);
  }

  test("SIMULATED: failed pet, community and recap reads stay unknown, not zero or no-pet", async ({ page }) => {
    await walletA(page);
    chain.setPet(ACCOUNT_A, "fail");
    chain.communityTotal = "fail";
    const ui = petPage(page);

    await page.goto("/pet");
    await expect(ui.wallet).toHaveText(ACCOUNT_A);
    await expect(ui.pet).toHaveText("Read failed");
    await expect(page.getByText("Pet data could not be loaded. No preview data is shown.").first()).toBeVisible();
    await expect(ui.communityCares).toHaveText("Unknown");
    await expect(ui.recap.getByRole("alert")).toHaveText(RECAP_ERROR);
    await expect(page.getByRole("button", { name: "Retry reading", exact: true })).toBeVisible();

    // Unknown must never look like a genuine empty answer.
    await expect(page.getByRole("button", { name: "Adopt pet", exact: true })).toHaveCount(0);
    await expect(ui.pet).not.toHaveText("None yet");
    await expect(ui.growth).toHaveCount(0);
    await expect(ui.garden).toHaveCount(0);
    await expect(page.getByText(/^0 confirmed care actions$/)).toHaveCount(0);
    await page.screenshot({ path: test.info().outputPath("failed-reads-1280.png"), fullPage: true });
  });

  test("SIMULATED: a genuine no-pet and a zero total render differently from failures", async ({ page }) => {
    await walletA(page);
    chain.setPet(ACCOUNT_A, "no-pet");
    chain.communityTotal = 0;
    const ui = petPage(page);

    await page.goto("/pet");
    await expect(ui.pet).toHaveText("None yet");
    await expect(page.getByRole("button", { name: "Adopt pet", exact: true })).toBeVisible();
    await expect(ui.communityCares).toHaveText("0");
    await expect(page.getByText("0 confirmed care actions", { exact: true })).toBeVisible();
    await expect(ui.recap.getByText("No pet found in this wallet at the checked registry.")).toBeVisible();
  });

  test("SIMULATED: retry recovers each panel by reading only", async ({ page }) => {
    await page.clock.install();
    const wallets = await walletA(page);
    chain.setPet(ACCOUNT_A, "fail");
    chain.communityTotal = "fail";
    const ui = petPage(page);

    await page.goto("/pet");
    await expect(ui.pet).toHaveText("Read failed");
    await expect(ui.communityCares).toHaveText("Unknown");
    await expect(ui.recap.getByRole("alert")).toHaveText(RECAP_ERROR);

    // The network recovers. Nothing changes until a read is retried.
    chain.setPet(ACCOUNT_A, 3);
    chain.communityTotal = 42;

    const communityReads = chain.count("community");
    await page.getByRole("button", { name: "Retry community total", exact: true }).click();
    await expect(ui.communityCares).toHaveText("42");
    await expect(page.getByText("42 confirmed care actions", { exact: true })).toBeVisible();
    expect(chain.count("community")).toBeGreaterThan(communityReads);

    await ui.recap.getByRole("button", { name: "Retry read", exact: true }).click();
    await expect(ui.recapCares).toHaveText("3");

    // The pet read has no manual retry; it re-reads on its 30-second refresh.
    await expect(ui.pet).toHaveText("Read failed");
    await page.clock.fastForward(31_000);
    await expect(ui.pet).toHaveText("Adopted");
    await expect(ui.growth).toHaveText("30 growth points");

    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  });
});
