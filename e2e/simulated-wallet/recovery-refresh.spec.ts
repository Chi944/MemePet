import { expect, test, type Page } from "@playwright/test";
import { decodeFunctionData, encodeFunctionData, type Address, type Hex } from "viem";
import { DEPLOYMENT } from "../../src/lib/deployment";
import { pendingTransactionStorageKey, serializePendingTransactionRecord } from "../../src/lib/pending-transaction-record";
import { petRegistryAbi } from "../../src/lib/pet-registry-abi";
import { ACCOUNT_A, ACCOUNT_B, BLOCK_HASH, BLOCK_NUMBER, SIMULATED_LABEL, SimulatedChain, petPage, settleFrames } from "./support/simulated-chain";
import { installSimulatedWallets, WRITE_OR_SIGN } from "./support/simulated-provider";

const HASH = ("0x" + "31".repeat(32)) as Hex;
const REPLACEMENT = ("0x" + "42".repeat(32)) as Hex;
const CARE_INPUT = encodeFunctionData({ abi: petRegistryAbi, functionName: "care" });
const scope = { chainId: DEPLOYMENT.chainId!, registryAddress: DEPLOYMENT.registryAddress! as Address, address: ACCOUNT_A } as const;
const storageKey = pendingTransactionStorageKey(scope)!;
const record = { version: 1, action: "care", ...scope, transactionHash: HASH } as const;
const savedRecord = serializePendingTransactionRecord(record)!;
const hex = (value: number | bigint) => "0x" + value.toString(16);

/** Fictional RPC wire values, never a public transaction or wallet signature. */
function transaction(hash: Hex = HASH, mined = false, input: Hex = CARE_INPUT) {
  return {
    hash, from: ACCOUNT_A, to: scope.registryAddress, chainId: hex(scope.chainId),
    input, value: "0x0", nonce: "0x7", gas: "0x186a0", gasPrice: "0x7",
    maxFeePerGas: "0x10", maxPriorityFeePerGas: "0x1", type: "0x2", accessList: [],
    r: "0x" + "1".repeat(64), s: "0x" + "2".repeat(64), v: "0x1", yParity: "0x1",
    blockNumber: mined ? hex(BLOCK_NUMBER) : null,
    blockHash: mined ? BLOCK_HASH : null, transactionIndex: mined ? "0x0" : null,
  };
}

function receipt(hash: Hex = HASH, status: "success" | "reverted" = "success") {
  return {
    transactionHash: hash, from: ACCOUNT_A, to: scope.registryAddress,
    blockNumber: hex(BLOCK_NUMBER), blockHash: BLOCK_HASH, transactionIndex: "0x0",
    status: status === "success" ? "0x1" : "0x0", type: "0x2", contractAddress: null,
    cumulativeGasUsed: "0x88c9", gasUsed: "0x88c9", effectiveGasPrice: "0x7",
    logs: [], logsBloom: "0x" + "0".repeat(512),
  };
}

function pending(chain: SimulatedChain) {
  chain.transactions.set(HASH, transaction());
  chain.receipts.set(HASH, null);
}

function mined(chain: SimulatedChain, status: "success" | "reverted" = "success") {
  chain.transactions.set(HASH, transaction(HASH, true));
  chain.receipts.set(HASH, receipt(HASH, status));
}

async function seedJournal(page: Page, value = savedRecord) {
  // Reload must consume actual storage, not recreate a removed record.
  await page.addInitScript(({ key, serialized }) => {
    if (sessionStorage.getItem("simulated-recovery-seeded") !== "yes") {
      localStorage.setItem(key, serialized);
      sessionStorage.setItem("simulated-recovery-seeded", "yes");
    }
  }, { key: storageKey, serialized: value });
}

async function walletA(page: Page, returnedTransactionHash?: string) {
  return installSimulatedWallets(page, [{
    global: "ethereum", name: "MetaMask", grantedAccounts: [ACCOUNT_A],
    connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0", returnedTransactionHash,
  }]);
}

const heading = (page: Page, name: string) => page.getByRole("heading", { name, exact: true });
const checkStatus = (page: Page) => page.getByRole("button", { name: "Check status", exact: true });

test.describe(SIMULATED_LABEL + ": transaction recovery after refresh", () => {
  let chain: SimulatedChain;

  test.beforeEach(async ({ page, baseURL }) => {
    test.info().annotations.push({ type: "evidence", description: SIMULATED_LABEL + ". Fictional journal, providers, transactions and RPC replies. No extension, keys, signature or public-network submission." });
    chain = new SimulatedChain();
    chain.setPet(ACCOUNT_A, 3);
    chain.setPet(ACCOUNT_B, 2);
    chain.communityTotal = 13;
    await chain.install(page, baseURL!);
  });

  test.afterEach(() => chain.expectNoUnexpectedTraffic());

  test("SIMULATED: refresh while pending preserves the public hash and Check status recovers confirmed facts", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    const wallets = await walletA(page);
    await seedJournal(page);
    pending(chain);
    await page.goto("/pet");
    await expect(heading(page, "Waiting for confirmation")).toBeVisible();
    await expect(page.getByText(HASH, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Care for/ })).toHaveCount(0);

    await page.reload();
    await expect(heading(page, "Waiting for confirmation")).toBeVisible();
    await expect(page.getByText(HASH, { exact: true })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("recovery-pending-390.png"), fullPage: true });
    mined(chain);
    chain.blockNumber = BLOCK_NUMBER + BigInt(2);
    chain.setPet(ACCOUNT_A, 4, { caredToday: true });
    chain.communityTotal = 14;
    const beforeCheck = chain.rpcRequests.length;
    await checkStatus(page).click();
    await expect(heading(page, "Confirmed")).toBeVisible();
    await expect(petPage(page).growth).toHaveText("40 growth points");
    await expect(petPage(page).communityCares).toHaveText("14");
    expect(chain.rpcRequests.filter(({ method }) => method === "eth_getTransactionReceipt")
      .every(({ params }) => params[0] === HASH)).toBe(true);
    const recoveredPetRead = chain.rpcRequests.slice(beforeCheck).find(({ method, params }) =>
      method === "eth_call" && decodeFunctionData({ abi: petRegistryAbi, data: (params[0] as { data: Hex }).data }).functionName === "petOf");
    expect(recoveredPetRead?.params[1], "recovery reads facts at the receipt, even when the head is newer").toBe(hex(BLOCK_NUMBER));
    await page.screenshot({ path: test.info().outputPath("recovery-confirmed-390.png"), fullPage: true });
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  });

  test("SIMULATED: a confirmed receipt with failed facts stays awaiting facts until a read-only check succeeds", async ({ page }) => {
    const wallets = await walletA(page);
    await seedJournal(page);
    mined(chain);
    chain.setPet(ACCOUNT_A, "fail");
    await page.goto("/pet");
    await expect(heading(page, "Confirmed — pet details not read yet")).toBeVisible();
    await expect(page.getByText(HASH, { exact: true })).toBeVisible();
    await expect(page.getByText("40 growth points", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^(Care for|Adopt pet)/ })).toHaveCount(0);

    chain.setPet(ACCOUNT_A, 4, { caredToday: true });
    await checkStatus(page).click();
    await expect(heading(page, "Confirmed")).toBeVisible();
    await expect(petPage(page).growth).toHaveText("40 growth points");
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  });

  test("SIMULATED: a reverted receipt awards no progress", async ({ page }) => {
    const wallets = await walletA(page);
    await seedJournal(page);
    mined(chain, "reverted");
    await page.goto("/pet");
    await expect(heading(page, "Transaction reverted")).toBeVisible();
    await expect(page.getByText("The network included this transaction but it reverted. No progress was awarded for it.")).toBeVisible();
    await expect(petPage(page).growth).toHaveText("30 growth points");
    await expect(page.getByText("40 growth points", { exact: true })).toHaveCount(0);
    await expect(checkStatus(page)).toHaveCount(0);
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  });

  test("SIMULATED: a different replacement is shown separately and never treated as confirmed care", async ({ page }) => {
    const wallets = await walletA(page, HASH);
    pending(chain);
    chain.transactions.set(REPLACEMENT, transaction(REPLACEMENT, true, "0x1234"));
    chain.receipts.set(REPLACEMENT, receipt(REPLACEMENT));
    await page.goto("/pet");
    await expect(petPage(page).growth).toHaveText("30 growth points");
    await page.getByRole("button", { name: /^Care for/ }).click();
    await expect(heading(page, "Transaction replaced")).toBeVisible();
    await expect(page.getByText(HASH, { exact: true })).toBeVisible();
    await expect(page.getByText(REPLACEMENT, { exact: true })).toBeVisible();
    await expect(heading(page, "Confirmed")).toHaveCount(0);
    await expect(page.getByText("40 growth points", { exact: true })).toHaveCount(0);
    await checkStatus(page).click();
    await expect(heading(page, "Transaction replaced")).toBeVisible();
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method)))
      .toEqual([{ wallet: "MetaMask", method: "eth_sendTransaction" }]);
  });

  test("SIMULATED: malformed, oversized and foreign-scope records are ignored", async ({ page }) => {
    const wallets = await walletA(page);
    await page.goto("/pet");
    const invalid = [
      { label: "malformed JSON", value: "{not-json" },
      { label: "oversized record", value: savedRecord + " ".repeat(1025) },
      { label: "foreign account", value: JSON.stringify({ ...record, address: ACCOUNT_B }) },
      { label: "foreign chain", value: JSON.stringify({ ...record, chainId: 1 }) },
      { label: "foreign registry", value: JSON.stringify({ ...record, registryAddress: ACCOUNT_B }) },
    ];
    for (const { label, value } of invalid) {
      await test.step(label, async () => {
        await page.evaluate(({ key, serialized }) => localStorage.setItem(key, serialized), { key: storageKey, serialized: value });
        await page.reload();
        await expect(petPage(page).growth).toHaveText("30 growth points");
        await expect(page.getByRole("button", { name: /^Care for/ })).toBeVisible();
        await expect(page.getByText(HASH, { exact: true })).toHaveCount(0);
        await expect(checkStatus(page)).toHaveCount(0);
      });
    }
    expect(chain.count("transaction")).toBe(0);
    expect(chain.count("receipt")).toBe(0);
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  });

  test("SIMULATED: unavailable storage keeps the returned hash visible without another send", async ({ page }) => {
    const wallets = await walletA(page, HASH);
    pending(chain);
    await page.addInitScript(() => {
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key: string, value: string) {
        if (key.startsWith("memepet:pending-transaction:")) throw new DOMException("SIMULATED storage unavailable", "QuotaExceededError");
        return setItem.call(this, key, value);
      };
    });
    await page.goto("/pet");
    await page.getByRole("button", { name: /^Care for/ }).click();
    await expect(page.getByText(HASH, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/could not.*sav|storage.*unavailable|not.*saved/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^Care for/ })).toHaveCount(0);
    expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method)))
      .toEqual([{ wallet: "MetaMask", method: "eth_sendTransaction" }]);
  });

  test("SIMULATED: account, network and provider changes discard an old recovery response", async ({ page }) => {
    const wallets = await installSimulatedWallets(page, [
      { global: "ethereum", name: "MetaMask", grantedAccounts: [], connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0" },
      { global: "okxwallet", name: "OKX Wallet", grantedAccounts: [], connectAccounts: [ACCOUNT_A], chainIdHex: "0x7a0" },
    ]);
    await seedJournal(page);
    pending(chain);
    await page.goto("/pet");
    await page.getByRole("radio", { name: "MetaMask", exact: true }).check();
    await page.getByRole("button", { name: "Connect wallet", exact: true }).first().click();
    await expect(heading(page, "Waiting for confirmation")).toBeVisible();

    const held = chain.hold("receipt", HASH);
    await checkStatus(page).click();
    await held.arrived;
    await wallets.setAccounts("MetaMask", [ACCOUNT_B]);
    await expect(petPage(page).wallet).toHaveText(ACCOUNT_B);
    await expect(page.getByText(HASH, { exact: true })).toHaveCount(0);
    held.release();
    expect(await held.settled).toBe("delivered");
    await settleFrames(page);
    await expect(page.getByText(HASH, { exact: true })).toHaveCount(0);
    await expect(petPage(page).growth).toHaveText("20 growth points");

    await wallets.setAccounts("MetaMask", [ACCOUNT_A]);
    await expect(heading(page, "Waiting for confirmation")).toBeVisible();
    await wallets.setChain("MetaMask", "0x1");
    await expect(page.getByText(HASH, { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Care for/ })).toHaveCount(0);
    await wallets.setChain("MetaMask", "0x7a0");
    await expect(heading(page, "Waiting for confirmation")).toBeVisible();

    // The old provider's held fact response contains four cares, while the
    // new provider will see an unresolved hash. A stale result is observable.
    mined(chain);
    chain.setPet(ACCOUNT_A, 4, { caredToday: true });
    const oldProvider = chain.hold("pet", ACCOUNT_A);
    await checkStatus(page).click();
    await oldProvider.arrived;
    pending(chain);
    chain.setPet(ACCOUNT_A, 3);
    await page.getByRole("radio", { name: "OKX Wallet", exact: true }).check();
    await expect(petPage(page).wallet).toHaveText("Not connected");
    await expect(page.getByText(HASH, { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Connect wallet", exact: true }).first().click();
    await expect(heading(page, "Waiting for confirmation")).toBeVisible();
    oldProvider.release();
    expect(await oldProvider.settled).toBe("delivered");
    await settleFrames(page);
    await expect(heading(page, "Waiting for confirmation")).toBeVisible();
    await expect(page.getByText("40 growth points", { exact: true })).toHaveCount(0);
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method))).toEqual([]);
  });

  test("SIMULATED: duplicate Check status is inert and never requests a signature or sends again", async ({ page }) => {
    const wallets = await walletA(page);
    await seedJournal(page);
    pending(chain);
    await page.goto("/pet");
    await expect(heading(page, "Waiting for confirmation")).toBeVisible();
    const held = chain.hold("receipt", HASH);
    await checkStatus(page).click();
    await held.arrived;
    const reads = chain.count("receipt", HASH);
    const checking = page.getByRole("button", { name: "Checking…", exact: true });
    await expect(checking).toHaveAttribute("aria-disabled", "true");
    await checking.press("Enter");
    await checking.press("Enter");
    expect(chain.count("receipt", HASH)).toBe(reads);
    held.release();
    expect(await held.settled).toBe("delivered");
    await expect(heading(page, "Waiting for confirmation")).toBeVisible();
    chain.transactions.set(HASH, null);
    await checkStatus(page).click();
    await expect(heading(page, "Confirmation not known yet")).toBeVisible();
    await expect(page.getByText(HASH, { exact: true })).toBeVisible();
    expect(chain.rpcRequests.filter(({ method }) => /Transaction/.test(method))
      .every(({ params }) => params[0] === HASH)).toBe(true);
    expect((await wallets.calls()).filter(({ method }) => WRITE_OR_SIGN.test(method) || method === "eth_requestAccounts")).toEqual([]);
  });
});
