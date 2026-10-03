import { expect, test } from "@playwright/test";
import { ACCOUNT_A, ACCOUNT_B, SIMULATED_LABEL, SimulatedChain, petPage } from "./support/simulated-chain";
import { WRITE_OR_SIGN, installSimulatedWallets } from "./support/simulated-provider";

type SimulatedControls = {
  calls: { wallet: string; method: string }[];
  emitFromMetaMask: () => void;
};

test("SIMULATED: modern discovery shows one OKX choice for distinct legacy and announced wrappers", async ({ page, baseURL }) => {
  test.info().annotations.push({ type: "evidence", description: `${SIMULATED_LABEL}. Distinct fictional OKX wrapper objects and coexisting MetaMask; no extension, real wallet or transaction.` });
  await page.setViewportSize({ width: 390, height: 1000 });
  const chain = new SimulatedChain();
  chain.setPet(ACCOUNT_A, 1);
  chain.setPet(ACCOUNT_B, 3);
  await chain.install(page, baseURL!);
  const wallets = await installSimulatedWallets(page, [
    { global: "ethereum", name: "MetaMask", grantedAccounts: [], connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0", announceProvider: "same-object" },
    { global: "okxwallet", name: "OKX Wallet", grantedAccounts: [], connectAccounts: [ACCOUNT_B], chainIdHex: "0x7a0", announceProvider: "distinct-wrapper" },
  ]);
  const ui = petPage(page);
  await page.goto("/pet");
  await expect(page.getByRole("radio")).toHaveCount(2);
  await expect(page.getByRole("radio", { name: "MetaMask", exact: true })).toHaveCount(1);
  await expect(page.getByRole("radio", { name: "OKX Wallet", exact: true })).toHaveCount(1);
  const connect = page.getByRole("button", { name: "Connect wallet", exact: true }).first();
  await expect(connect).toBeDisabled();
  expect(await wallets.calls()).toEqual([]);

  await page.getByRole("radio", { name: "OKX Wallet", exact: true }).check();
  expect(await wallets.calls()).toEqual([]);
  await connect.click();
  await expect(ui.wallet).toHaveText(ACCOUNT_B);
  await expect(ui.growth).toHaveText("30 growth points");
  const expectedConnect = [{ wallet: "OKX Wallet", method: "eth_requestAccounts" }];
  expect((await wallets.calls()).filter(({ method }) => method === "eth_requestAccounts")).toEqual(expectedConnect);
  expect((await wallets.announcedWrapperCalls()).filter(({ method }) => method === "eth_requestAccounts")).toEqual(expectedConnect);
  expect((await wallets.calls()).every(({ wallet }) => wallet === "OKX Wallet")).toBe(true);

  // A subsequent legacy rescan must not reintroduce the extra OKX object.
  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("ethereum#initialized"));
  });
  await expect(page.getByRole("radio")).toHaveCount(2);
  await expect(ui.wallet).toHaveText(ACCOUNT_B);
  await page.getByRole("radio", { name: "MetaMask", exact: true }).check();
  await expect(ui.wallet).toHaveText("Not connected");
  await connect.click();
  await expect(ui.wallet).toHaveText(ACCOUNT_A);
  await expect(ui.growth).toHaveText("10 growth points");
  expect((await wallets.calls()).filter(({ method }) => method === "eth_requestAccounts")).toEqual([
    ...expectedConnect,
    { wallet: "MetaMask", method: "eth_requestAccounts" },
  ]);
  expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  chain.expectNoUnexpectedTraffic();
});

for (const width of [390, 1440]) {
  test(`SIMULATED: chosen provider owns connect, network and disconnect at ${width}px`, async ({ page, baseURL }) => {
    test.info().annotations.push({ type: "evidence", description: "Fictional EIP-1193 providers in Chromium; no extension, real wallet or transaction." });
    await page.setViewportSize({ width, height: 1000 });
    const localOrigin = new URL(baseURL!).origin;
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== localOrigin || url.pathname.startsWith("/api/")) {
        await route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"SIMULATED unavailable"}' });
      } else {
        await route.continue();
      }
    });
    await page.addInitScript(() => {
      const calls: { wallet: string; method: string }[] = [];
      function wallet(name: string, address: string, initialChain: string) {
        let accounts: string[] = [];
        let chainId = initialChain;
        const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
        const emit = (event: string, value: unknown) => {
          for (const listener of listeners.get(event) ?? []) listener(value);
        };
        return {
          isMetaMask: name === "MetaMask",
          isOkxWallet: name === "OKX Wallet",
          async request({ method, params }: { method: string; params?: { chainId: string }[] }) {
            calls.push({ wallet: name, method });
            if (method === "eth_accounts") return [...accounts];
            if (method === "eth_chainId") return chainId;
            if (method === "eth_requestAccounts") {
              accounts = [address];
              emit("accountsChanged", [...accounts]);
              return [...accounts];
            }
            if (method === "wallet_switchEthereumChain") {
              chainId = params![0].chainId;
              emit("chainChanged", chainId);
              return null;
            }
            if (method === "wallet_revokePermissions") {
              accounts = [];
              emit("accountsChanged", []);
              return null;
            }
            throw new Error(`Unexpected simulated request: ${method}`);
          },
          on(event: string, listener: (...args: unknown[]) => void) {
            const registered = listeners.get(event) ?? new Set();
            registered.add(listener);
            listeners.set(event, registered);
          },
          removeListener(event: string, listener: (...args: unknown[]) => void) {
            listeners.get(event)?.delete(listener);
          },
          simulateExternalChange() {
            accounts = ["0x3333333333333333333333333333333333333333"];
            chainId = "0x1";
            emit("accountsChanged", [...accounts]);
            emit("chainChanged", chainId);
            emit("disconnect", { code: 4900 });
          },
        };
      }
      const metamask = wallet("MetaMask", "0x1111111111111111111111111111111111111111", "0x1");
      const okx = wallet("OKX Wallet", "0x2222222222222222222222222222222222222222", "0x7a0");
      Object.defineProperty(window, "ethereum", { configurable: true, value: metamask });
      Object.defineProperty(window, "okxwallet", { configurable: true, value: okx });
      // Duplicate discovery paths must still render two wallets, not four.
      window.addEventListener("eip6963:requestProvider", () => {
        for (const [name, provider] of [["MetaMask", metamask], ["OKX Wallet", okx]] as const) {
          window.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: { info: { name }, provider } }));
        }
      });
      (window as Window & { __simulatedWallets?: SimulatedControls }).__simulatedWallets = {
        calls,
        emitFromMetaMask: () => metamask.simulateExternalChange(),
      };
    });

    await page.goto("/pet");
    await expect(page.getByRole("radio")).toHaveCount(2);
    await expect(page.getByRole("radio", { name: "OKX Wallet", exact: true })).toBeEnabled();
    const connect = page.getByRole("button", { name: "Connect wallet", exact: true }).first();
    await expect(connect).toBeDisabled();
    await expect(page.getByRole("button", { name: "Connect chosen wallet", exact: true })).toBeDisabled();
    await page.screenshot({ path: test.info().outputPath(`wallet-choice-${width}.png`), fullPage: true });
    const calls = () => page.evaluate(() => (window as Window & { __simulatedWallets?: SimulatedControls }).__simulatedWallets!.calls);
    expect(await calls()).toEqual([]);

    await page.getByRole("radio", { name: "OKX Wallet", exact: true }).check();
    expect(await calls()).toEqual([]);
    await connect.click();
    await expect(page.getByText("0x2222222222222222222222222222222222222222", { exact: true })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath(`selected-wallet-${width}.png`), fullPage: true });
    expect((await calls()).filter(({ method }) => method === "eth_requestAccounts")).toEqual([{ wallet: "OKX Wallet", method: "eth_requestAccounts" }]);
    const beforeUnselectedEvents = await calls();
    await page.evaluate(async () => {
      (window as Window & { __simulatedWallets?: SimulatedControls }).__simulatedWallets!.emitFromMetaMask();
      // Allow React effects and queued snapshots to settle without a fixed sleep.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
    await expect(page.getByText("0x2222222222222222222222222222222222222222", { exact: true })).toBeVisible();
    expect(await calls()).toEqual(beforeUnselectedEvents);

    await page.getByRole("radio", { name: "MetaMask", exact: true }).check();
    await expect(page.getByText("Not connected", { exact: true }).first()).toBeVisible();
    await connect.click();
    await expect(page.getByText("0x1111111111111111111111111111111111111111", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Switch network", exact: true }).first().click();
    await expect(page.getByText("1952", { exact: true })).toBeVisible();
    expect((await calls()).filter(({ method }) => method === "wallet_switchEthereumChain")).toEqual([{ wallet: "MetaMask", method: "wallet_switchEthereumChain" }]);
    await page.getByRole("button", { name: "Disconnect", exact: true }).click();
    await expect(page.getByText(/Wallet account access was revoked for this site/)).toBeVisible();
    expect((await calls()).filter(({ method }) => method === "wallet_revokePermissions")).toEqual([{ wallet: "MetaMask", method: "wallet_revokePermissions" }]);
    expect((await calls()).some(({ method }) => /sendTransaction|sign|approve/i.test(method))).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
