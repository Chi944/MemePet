import { expect, test } from "@playwright/test";
import { ACCOUNT_A, ACCOUNT_B, SimulatedChain } from "./support/simulated-chain";
import { installSimulatedWallets, WRITE_OR_SIGN } from "./support/simulated-provider";

for (const width of [320, 390, 1440]) {
  test(`SIMULATED: live B1 panels follow account, failed reads and retry at ${width}px`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 900 });
    const chain = new SimulatedChain();
    chain.setPet(ACCOUNT_A, 5);
    chain.setPet(ACCOUNT_B, "fail");
    chain.communityTotal = 50;
    await chain.install(page, baseURL!);
    const wallet = await installSimulatedWallets(page, [{ global: "ethereum", name: "MetaMask", grantedAccounts: [ACCOUNT_A], connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0" }]);
    await page.goto("/pet");
    const personal = page.getByRole("region", { name: "Personal milestones", exact: true });
    const garden = page.getByRole("region", { name: "Garden chapters", exact: true });
    await expect(personal).toContainText("5 personal confirmed cares");
    await expect(personal.getByText("Earned", { exact: true })).toHaveCount(1);
    await expect(garden).toContainText("50 community confirmed cares");
    await expect(garden.getByText("Earned", { exact: true })).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Ready for a little care", exact: true })).toBeVisible();
    await personal.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`beta-live-${width}.png`) });

    await wallet.setAccounts("MetaMask", [ACCOUNT_B]);
    await expect(personal).toContainText("Personal care total unavailable");
    await expect(personal.getByText("Earned", { exact: true })).toHaveCount(0);
    await expect(personal).not.toContainText("5 personal confirmed cares");
    await expect(page.getByRole("heading", { name: "Pet information unavailable" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Adopt pet", exact: true })).toHaveCount(0);
    chain.setPet(ACCOUNT_B, 20);
    await page.getByRole("button", { name: "Retry progression reads", exact: true }).click();
    await expect(personal).toContainText("20 personal confirmed cares");
    await expect(personal.getByText("Earned", { exact: true })).toHaveCount(3);
    await expect(personal).toContainText("All defined personal milestones reached.");
    await wallet.setAccounts("MetaMask", []);
    await expect(personal).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Connect your chosen wallet" })).toBeVisible();
    expect((await wallet.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
    expect(chain.blocked).toEqual([]);
  });
}
