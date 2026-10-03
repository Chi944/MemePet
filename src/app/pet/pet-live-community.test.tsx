import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Address, WalletClient } from "viem";
import type { Deployment } from "@/lib/deployment";

const rpc = vi.hoisted(() => ({
  readContract: vi.fn(),
  getBlock: vi.fn(),
  getChainId: vi.fn(),
  getTransaction: vi.fn(),
  getTransactionReceipt: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  writeContract: vi.fn(),
}));
const wallet = vi.hoisted(() => ({ useWallet: vi.fn() }));
const fetchMock = vi.fn<typeof fetch>();

vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal<typeof import("viem")>();
  return { ...actual, createPublicClient: vi.fn(() => rpc) };
});
vi.mock("@/hooks/useWallet", () => wallet);

import { PetLiveClient } from "./pet-live-client";

const address = "0x1111111111111111111111111111111111111111" as Address;
const otherAddress = "0x2222222222222222222222222222222222222222" as Address;
const deployment: Deployment = {
  status: "local",
  networkName: "Anvil",
  registryAddress: "0x3333333333333333333333333333333333333333",
  chainId: 31337,
  rpcUrl: "http://127.0.0.1:8545",
  explorerBaseUrl: null,
  currencySymbol: "ETH",
};
const day = BigInt(20_000);
const receiptBlock = BigInt(11);
const hash = `0x${"a".repeat(64)}`;
const blockHash = `0x${"b".repeat(64)}`;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((accept, decline) => { resolve = accept; reject = decline; });
  return { promise, resolve, reject };
}

function communityTotal() {
  return screen.getByText("Community cares", { selector: "dt" }).nextElementSibling;
}

function garden() {
  return within(screen.getByRole("region", { name: "Mochi garden" }));
}

function recap() {
  return within(screen.getByRole("region", { name: "Ask Mochi about your progress" }));
}

function personality() {
  return within(screen.getByRole("region", { name: "Mochi, your way" }));
}

function interactionCount(label: "Explore interactions" | "Practise interactions") {
  return personality().getByText(label).parentElement?.querySelector("dd");
}

function companionResponse(walletAddress: Address = address, block = 10, careCount = 0) {
  const growthPoints = careCount * 10;
  return new Response(JSON.stringify({
    schemaVersion: 1,
    scope: { walletAddress, chainId: deployment.chainId, registryAddress: deployment.registryAddress },
    facts: { kind: "ready", dataMode: "live", snapshot: {
      contextKey: `${walletAddress}:${block}:${careCount}`,
      walletAddress, registryAddress: deployment.registryAddress, chainId: deployment.chainId,
      blockNumber: String(block), blockTimestampIso: "2026-09-30T12:00:00.000Z",
      observedAtIso: "2026-09-30T12:00:01.000Z", careCount, growthPoints,
      stage: growthPoints >= 50 ? "guardian" : growthPoints >= 20 ? "buddy" : "hatchling",
      nextStageAt: growthPoints >= 50 ? null : growthPoints >= 20 ? 50 : 20,
      nextCareAtIso: careCount === 0 ? "2026-09-30T12:00:00.000Z" : "2026-10-01T00:00:00.000Z",
      communityTotalCares: careCount,
    } },
  }), { headers: { "Content-Type": "application/json" } });
}

describe("live care refreshes the community counter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockImplementation(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { address: Address; blockNumber?: string };
      const block = Number(body.blockNumber ?? 10);
      return companionResponse(body.address, block, block >= Number(receiptBlock) ? 1 : 0);
    });
    wallet.useWallet.mockReturnValue({
      installed: true,
      choices: [{ id: "fixture-provider", label: "Fixture wallet" }],
      selectedId: "fixture-provider",
      selectionRequired: false,
      selectionBusy: false,
      providerSessionKey: "fixture-provider:1",
      selectWallet: vi.fn(),
      address,
      chainId: 31337,
      connecting: false,
      disconnectStatus: null,
      errorMessage: null,
      deployment,
      wrongChain: false,
      createBrowserWalletClient: () => rpc as unknown as WalletClient,
      connect: vi.fn(),
      disconnect: vi.fn(),
      switchNetwork: vi.fn(),
    });
    rpc.writeContract.mockResolvedValue(hash);
    rpc.getChainId.mockResolvedValue(31337);
    rpc.getTransaction.mockResolvedValue({
      hash, chainId: 31337, from: address, to: deployment.registryAddress,
      value: BigInt(0), input: "0x093a37ff", nonce: 1,
      blockNumber: receiptBlock, blockHash, transactionIndex: 0,
    });
    rpc.getTransactionReceipt.mockResolvedValue({
      transactionHash: hash, from: address, to: deployment.registryAddress,
      blockNumber: receiptBlock, blockHash, transactionIndex: 0, status: "success",
    });
  });

  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it.each([false, true])(
    "rereads confirmed care without retaining the pre-care total (latest RPC lags: %s)",
    async (latestLags) => {
      let confirmed = false;
      const receipt = deferred<{ status: string; blockNumber: bigint }>();
      rpc.waitForTransactionReceipt.mockReturnValue(receipt.promise);
      rpc.getBlock.mockImplementation(async ({ blockNumber }) => ({
        number: blockNumber ?? (confirmed ? receiptBlock : BigInt(10)),
        hash: blockHash,
        timestamp: day * BigInt(86400) + BigInt(3600),
      }));
      rpc.readContract.mockImplementation(async ({ functionName, blockNumber }) => {
        if (functionName === "communityStats") {
          // Some public RPC/cache paths can still answer a latest call with
          // the pre-care state while the receipt block is already readable.
          return blockNumber >= receiptBlock || (confirmed && !latestLags)
            ? BigInt(1)
            : BigInt(0);
        }
        return blockNumber >= receiptBlock
          ? [true, 1, 1, day]
          : [true, 1, 0, BigInt(0)];
      });

      await act(async () => { render(<PetLiveClient />); });
      expect(communityTotal()).toHaveTextContent("0");
      expect(garden().getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
      expect(garden().getByRole("img")).toHaveAccessibleName(/bare soil/);

      fireEvent.click(recap().getByRole("button", { name: "Explain progress" }));
      expect(recap().getByRole("region", { name: "Mochi's response" }))
        .toHaveTextContent("0 confirmed care actions, 0 growth points");

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Care for Mochi/ }));
      });
      expect(screen.queryByRole("button", { name: /Care for Mochi|Try care again/ })).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Waiting for confirmation" })).toBeInTheDocument();
      expect(within(screen.getByRole("region", { name: "Care for your pet" })).getByText(/submitted transaction still needs verification/)).toBeInTheDocument();
      expect(communityTotal()).toHaveTextContent("0");
      expect(recap().getByText("Loading MemePet activity…")).toBeInTheDocument();
      expect(recap().queryByRole("button", { name: "Explain progress" })).not.toBeInTheDocument();
      expect(recap().getByRole("region", { name: "Mochi's response" })).toBeEmptyDOMElement();
      expect(screen.queryByRole("region", { name: "Mochi, your way" })).not.toBeInTheDocument();

      await act(async () => {
        confirmed = true;
        receipt.resolve({ status: "success", blockNumber: receiptBlock });
      });
      expect(screen.getByText("10 growth points")).toBeInTheDocument();
      expect(communityTotal()).toHaveTextContent("1");
      expect(garden().getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
      expect(garden().getByText("19 more confirmed care actions until it blooms.")).toBeInTheDocument();
      fireEvent.click(recap().getByRole("button", { name: "Explain progress" }));
      expect(recap().getByRole("region", { name: "Mochi's response" }))
        .toHaveTextContent("1 confirmed care action, 10 growth points");
      expect(rpc.readContract).toHaveBeenCalledWith(expect.objectContaining({
        functionName: "communityStats",
        blockNumber: receiptBlock,
      }));
      await act(async () => { await vi.advanceTimersByTimeAsync(1600); });

      expect(communityTotal()).toHaveTextContent("1");
    },
  );

  it("recovers an unknown community total by retrying the receipt block without another transaction", async () => {
    let confirmed = false;
    const communityRead = deferred<bigint>();
    const recoveredRead = deferred<bigint>();
    let retrying = false;
    rpc.getBlock.mockImplementation(async ({ blockNumber }) => ({
      number: blockNumber ?? (confirmed ? receiptBlock : BigInt(10)),
      hash: blockHash,
      timestamp: day * BigInt(86400) + BigInt(3600),
    }));
    rpc.waitForTransactionReceipt.mockImplementation(async () => {
      confirmed = true;
      return { status: "success", blockNumber: receiptBlock };
    });
    rpc.readContract.mockImplementation(async ({ functionName, blockNumber }) => {
      if (functionName === "communityStats") {
        // Latest deliberately remains stale even after care succeeds.
        return blockNumber === receiptBlock
          ? retrying ? recoveredRead.promise : communityRead.promise
          : BigInt(0);
      }
      return blockNumber >= receiptBlock
        ? [true, 1, 1, day]
        : [true, 1, 0, BigInt(0)];
    });

    await act(async () => { render(<PetLiveClient />); });
    expect(communityTotal()).toHaveTextContent("0");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Care for Mochi/ }));
    });
    expect(screen.getByText("10 growth points")).toBeInTheDocument();
    expect(communityTotal()).toHaveTextContent("Reading…");

    await act(async () => { communityRead.reject(new Error("Receipt state unavailable")); });
    await act(async () => { await vi.advanceTimersByTimeAsync(1600); });
    expect(communityTotal()).toHaveTextContent("Unknown");
    expect(garden().queryByRole("progressbar")).not.toBeInTheDocument();
    expect(garden().queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Care unavailable" })).toBeDisabled();
    expect(screen.getByText(/Retry only reads the chain/)).toBeInTheDocument();

    await act(async () => {
      retrying = true;
      fireEvent.click(garden().getByRole("button", { name: "Retry reading" }));
    });
    expect(communityTotal()).toHaveTextContent("Reading…");
    expect(screen.queryByRole("button", { name: "Retry community total" })).not.toBeInTheDocument();
    expect(screen.getByText("10 growth points")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Care unavailable" })).toBeDisabled();
    expect(rpc.readContract).toHaveBeenLastCalledWith(expect.objectContaining({
      functionName: "communityStats",
      blockNumber: receiptBlock,
    }));

    await act(async () => { recoveredRead.resolve(BigInt(1)); });
    expect(communityTotal()).toHaveTextContent("1");
    expect(garden().getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.queryByText(/could not be loaded/)).not.toBeInTheDocument();
    expect(rpc.writeContract).toHaveBeenCalledTimes(1);
    expect(rpc.waitForTransactionReceipt).toHaveBeenCalledTimes(1);
  });

  it("answers all recap questions from the displayed snapshot without signing or fetching again", async () => {
    rpc.getBlock.mockResolvedValue({ number: BigInt(10), timestamp: day * BigInt(86400) });
    rpc.readContract.mockImplementation(async ({ functionName }) =>
      functionName === "communityStats" ? BigInt(4) : [true, 1, 0, BigInt(0)]);

    await act(async () => { render(<PetLiveClient />); });
    const requests = fetchMock.mock.calls.length;
    const response = recap().getByRole("region", { name: "Mochi's response" });
    fireEvent.click(recap().getByRole("button", { name: "Explain progress" }));
    expect(response).toHaveTextContent("Standard explanation");
    expect(response).toHaveTextContent("0 confirmed care actions, 0 growth points");
    fireEvent.click(recap().getByRole("button", { name: "Next care time" }));
    expect(response).toHaveTextContent("2026-09-30T12:00:00.000Z");
    fireEvent.click(recap().getByRole("button", { name: "Contribution" }));
    expect(response).toHaveTextContent("This pet has contributed 0 confirmed care actions");
    expect(response).toHaveTextContent("Based on block 10");
    expect(fetchMock).toHaveBeenCalledTimes(requests);
    expect(rpc.writeContract).not.toHaveBeenCalled();
    expect(rpc.waitForTransactionReceipt).not.toHaveBeenCalled();
  });

  it("updates the existing explanation style and resets preferences without changing earned care or reading again", async () => {
    rpc.getBlock.mockResolvedValue({ number: BigInt(10), timestamp: day * BigInt(86400) });
    rpc.readContract.mockImplementation(async ({ functionName }) =>
      functionName === "communityStats" ? BigInt(4) : [true, 1, 0, BigInt(0)]);
    await act(async () => { render(<PetLiveClient />); });

    expect(personality().getByRole("heading", { name: "Playful" })).toBeInTheDocument();
    expect(interactionCount("Explore interactions")).toHaveTextContent("0");
    expect(interactionCount("Practise interactions")).toHaveTextContent("0");
    const care = screen.getByRole("region", { name: "Care for your pet" });
    const careBefore = care.textContent;
    const requestsBefore = fetchMock.mock.calls.length;
    const readsBefore = rpc.readContract.mock.calls.length;
    fireEvent.click(recap().getByRole("button", { name: "Explain progress" }));
    const response = recap().getByRole("region", { name: "Mochi's response" });
    expect(response).toHaveTextContent("A little Mochi update:");

    fireEvent.click(personality().getByRole("button", { name: "Explore" }));
    expect(personality().getByRole("heading", { name: "Curious" })).toBeInTheDocument();
    expect(interactionCount("Explore interactions")).toHaveTextContent("1");
    expect(response).toHaveTextContent("Here is what Mochi found:");

    fireEvent.click(personality().getByRole("button", { name: "Practise" }));
    expect(personality().getByRole("heading", { name: "Playful" })).toBeInTheDocument();
    expect(response).toHaveTextContent("A little Mochi update:");
    fireEvent.click(personality().getByRole("button", { name: "Practise" }));
    expect(personality().getByRole("heading", { name: "Focused" })).toBeInTheDocument();
    expect(interactionCount("Practise interactions")).toHaveTextContent("2");
    expect(response).toHaveTextContent("Mochi's progress check:");

    fireEvent.click(personality().getByRole("button", { name: "Reset personality" }));
    expect(personality().getByRole("heading", { name: "Playful" })).toBeInTheDocument();
    expect(interactionCount("Explore interactions")).toHaveTextContent("0");
    expect(interactionCount("Practise interactions")).toHaveTextContent("0");
    expect(response).toHaveTextContent("A little Mochi update:");
    expect(response).toHaveTextContent("0 confirmed care actions, 0 growth points");
    expect(response).toHaveTextContent("Based on block 10");
    expect(screen.getByText("0 growth points")).toBeInTheDocument();
    expect(care.textContent).toBe(careBefore);
    expect(communityTotal()).toHaveTextContent("4");
    expect(fetchMock).toHaveBeenCalledTimes(requestsBefore);
    expect(rpc.readContract).toHaveBeenCalledTimes(readsBefore);
    expect(rpc.writeContract).not.toHaveBeenCalled();
    expect(rpc.waitForTransactionReceipt).not.toHaveBeenCalled();
  });

  it("restores saved personality after remount and keeps wallets A–B–A isolated", async () => {
    rpc.getBlock.mockResolvedValue({ number: BigInt(10), timestamp: day * BigInt(86400) });
    rpc.readContract.mockImplementation(async ({ functionName }) =>
      functionName === "communityStats" ? BigInt(4) : [true, 1, 0, BigInt(0)]);
    const firstWallet = wallet.useWallet.getMockImplementation()!();
    const firstView = await act(async () => render(<PetLiveClient />));
    fireEvent.click(personality().getByRole("button", { name: "Explore" }));
    expect(personality().getByRole("heading", { name: "Curious" })).toBeInTheDocument();
    firstView.unmount();

    const view = await act(async () => render(<PetLiveClient />));
    expect(personality().getByRole("heading", { name: "Curious" })).toBeInTheDocument();
    expect(interactionCount("Explore interactions")).toHaveTextContent("1");
    fireEvent.click(recap().getByRole("button", { name: "Explain progress" }));
    expect(recap().getByRole("region", { name: "Mochi's response" })).toHaveTextContent("Here is what Mochi found:");

    wallet.useWallet.mockReturnValue({ ...firstWallet, address: otherAddress });
    await act(async () => { view.rerender(<PetLiveClient />); });
    expect(personality().getByRole("heading", { name: "Playful" })).toBeInTheDocument();
    expect(interactionCount("Explore interactions")).toHaveTextContent("0");
    expect(recap().getByRole("region", { name: "Mochi's response" })).toBeEmptyDOMElement();
    fireEvent.click(personality().getByRole("button", { name: "Practise" }));
    fireEvent.click(recap().getByRole("button", { name: "Explain progress" }));
    expect(recap().getByRole("region", { name: "Mochi's response" })).toHaveTextContent("Mochi's progress check:");

    wallet.useWallet.mockReturnValue(firstWallet);
    await act(async () => { view.rerender(<PetLiveClient />); });
    expect(personality().getByRole("heading", { name: "Curious" })).toBeInTheDocument();
    expect(interactionCount("Explore interactions")).toHaveTextContent("1");
    expect(interactionCount("Practise interactions")).toHaveTextContent("0");
    expect(recap().getByRole("region", { name: "Mochi's response" })).toBeEmptyDOMElement();
    fireEvent.click(recap().getByRole("button", { name: "Explain progress" }));
    expect(recap().getByRole("region", { name: "Mochi's response" })).toHaveTextContent("Here is what Mochi found:");
    expect(screen.getByText("0 growth points")).toBeInTheDocument();
    expect(rpc.writeContract).not.toHaveBeenCalled();
  });

  it("clears the old wallet answer and ignores a late response after switching A–B–A", async () => {
    rpc.getBlock.mockResolvedValue({ number: BigInt(10), timestamp: day * BigInt(86400) });
    rpc.readContract.mockImplementation(async ({ functionName }) =>
      functionName === "communityStats" ? BigInt(4) : [true, 1, 0, BigInt(0)]);
    const slowOtherWallet = deferred<Response>();
    const firstWallet = wallet.useWallet.getMockImplementation()!();
    const view = await act(async () => render(<PetLiveClient />));
    fireEvent.click(recap().getByRole("button", { name: "Explain progress" }));

    fetchMock.mockReturnValueOnce(slowOtherWallet.promise);
    wallet.useWallet.mockReturnValue({ ...firstWallet, address: otherAddress });
    await act(async () => { view.rerender(<PetLiveClient />); });
    expect(recap().getByText("Loading MemePet activity…")).toBeInTheDocument();
    expect(recap().queryByTitle(address)).not.toBeInTheDocument();
    expect(recap().getByRole("region", { name: "Mochi's response" })).toBeEmptyDOMElement();

    fetchMock.mockResolvedValueOnce(companionResponse(address, 12, 1));
    wallet.useWallet.mockReturnValue(firstWallet);
    await act(async () => { view.rerender(<PetLiveClient />); });
    expect(recap().getByTitle(address)).toBeInTheDocument();
    await act(async () => { slowOtherWallet.resolve(companionResponse(otherAddress, 13, 2)); });
    expect(recap().queryByTitle(otherAddress)).not.toBeInTheDocument();
    fireEvent.click(recap().getByRole("button", { name: "Explain progress" }));
    expect(recap().getByRole("region", { name: "Mochi's response" }))
      .toHaveTextContent("1 confirmed care action, 10 growth points");
    expect(recap().getByRole("region", { name: "Mochi's response" })).toHaveTextContent("Based on block 12");
    expect(rpc.writeContract).not.toHaveBeenCalled();
  });

  it("hides recap facts and actions when the route switches network or disconnects", async () => {
    rpc.getBlock.mockResolvedValue({ number: BigInt(10), timestamp: day * BigInt(86400) });
    rpc.readContract.mockImplementation(async ({ functionName }) =>
      functionName === "communityStats" ? BigInt(4) : [true, 1, 0, BigInt(0)]);
    const firstWallet = wallet.useWallet.getMockImplementation()!();
    const view = await act(async () => render(<PetLiveClient />));
    fireEvent.click(recap().getByRole("button", { name: "Explain progress" }));
    const requests = fetchMock.mock.calls.length;
    expect(personality().getByRole("heading", { name: "Playful" })).toBeInTheDocument();

    wallet.useWallet.mockReturnValue({ ...firstWallet, wrongChain: true, chainId: 1 });
    await act(async () => { view.rerender(<PetLiveClient />); });
    expect(recap().getByText("Switch to chain 31337 to read MemePet activity.")).toBeInTheDocument();
    expect(recap().queryByRole("button", { name: "Explain progress" })).not.toBeInTheDocument();
    expect(recap().getByRole("region", { name: "Mochi's response" })).toBeEmptyDOMElement();
    expect(garden().queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Mochi, your way" })).not.toBeInTheDocument();

    wallet.useWallet.mockReturnValue({ ...firstWallet, address: null });
    await act(async () => { view.rerender(<PetLiveClient />); });
    expect(recap().getByText("Connect a wallet to read MemePet activity.")).toBeInTheDocument();
    expect(recap().queryByTitle(address)).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Mochi, your way" })).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(requests);
    expect(rpc.writeContract).not.toHaveBeenCalled();
  });
});
