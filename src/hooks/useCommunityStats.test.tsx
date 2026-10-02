import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { ResourceUnavailableRpcError, type Address } from "viem";
import type { Deployment } from "@/lib/deployment";

const readContract = vi.fn();

vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal<typeof import("viem")>();
  return { ...actual, createPublicClient: vi.fn(() => ({ readContract })) };
});

const { useCommunityStats } = await import("@/hooks/useCommunityStats");

function deploymentFor(chainId: number, networkName: string): Deployment {
  return {
    status: "local",
    networkName,
    registryAddress: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    explorerBaseUrl: null,
    chainId,
    rpcUrl: "http://127.0.0.1:8545",
    currencySymbol: "ETH",
  };
}

function Probe({ deployment, address = "0x1111111111111111111111111111111111111111" }: { deployment: Deployment; address?: Address }) {
  const { community } = useCommunityStats({
    deployment,
    address,
    wrongChain: false,
  });
  return <span data-testid="total">{String(community.totalCareActions)}</span>;
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 300));

describe("useCommunityStats initial and latest read recovery", () => {
  const deployment = deploymentFor(1952, "X Layer testnet");
  const temporaryFailure = () => new ResourceUnavailableRpcError(new Error("Resource unavailable"));

  beforeEach(() => {
    vi.useFakeTimers();
    readContract.mockReset();
  });
  afterEach(() => { vi.useRealTimers(); });

  it("keeps an initial transient failure loading, then recovers without manual retry", async () => {
    readContract.mockRejectedValueOnce(temporaryFailure()).mockResolvedValue(BigInt(7));
    const { result } = renderHook(() => useCommunityStats({ deployment, address: null, wrongChain: false }));
    await act(async () => {});
    expect(result.current.community).toMatchObject({ isLoading: true, totalCareActions: null, errorMessage: null });
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });

    expect(result.current.finale.mission).toMatchObject({ kind: "ready", totalCareActions: 7 });
    expect(readContract).toHaveBeenCalledTimes(2);
    for (const [args] of readContract.mock.calls) expect(args.blockNumber).toBeUndefined();
  });

  it("stops an unavailable initial read after three attempts and keeps the garden unknown", async () => {
    readContract.mockRejectedValue(temporaryFailure());
    const { result } = renderHook(() => useCommunityStats({ deployment, address: null, wrongChain: false }));
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });

    expect(readContract).toHaveBeenCalledTimes(3);
    expect(result.current.community).toMatchObject({ isLoading: false, totalCareActions: null });
    expect(result.current.finale.mission.kind).toBe("unavailable");
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(readContract).toHaveBeenCalledTimes(3);
  });

  it("gives a manual latest retry the same bounded transient recovery", async () => {
    readContract.mockRejectedValueOnce(new Error("Terminal initial read failure"));
    const { result } = renderHook(() => useCommunityStats({ deployment, address: null, wrongChain: false }));
    await act(async () => {});
    expect(result.current.finale.mission.kind).toBe("unavailable");
    readContract.mockRejectedValueOnce(temporaryFailure()).mockResolvedValue(BigInt(7));

    await act(async () => { result.current.finale.onRetry(); });
    expect(result.current.community).toMatchObject({ isLoading: true, totalCareActions: null });
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(result.current.finale.mission).toMatchObject({ kind: "ready", totalCareActions: 7 });
    expect(readContract).toHaveBeenCalledTimes(3);
    for (const [args] of readContract.mock.calls) expect(args.blockNumber).toBeUndefined();
  });

  it("cancels a pending initial retry when the wallet network changes", async () => {
    readContract.mockRejectedValueOnce(temporaryFailure()).mockResolvedValue(BigInt(7));
    const { result, rerender } = renderHook(
      ({ wrongChain }) => useCommunityStats({ deployment, address: null, wrongChain }),
      { initialProps: { wrongChain: false } },
    );
    await act(async () => {});
    expect(result.current.community.isLoading).toBe(true);
    rerender({ wrongChain: true });
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(readContract).toHaveBeenCalledTimes(1);
    expect(result.current.community).toMatchObject({
      isLoading: false, totalCareActions: null, errorMessage: "Community total is unavailable on this network.",
    });

    rerender({ wrongChain: false });
    await act(async () => {});
    expect(result.current.community.totalCareActions).toBe(7);
    expect(readContract).toHaveBeenCalledTimes(2);
  });
});

describe("useCommunityStats read stability", () => {
  beforeEach(() => {
    readContract.mockReset();
    readContract.mockResolvedValue(BigInt(1));
  });

  it("supplies the garden adapter from confirmed totals without inventing an identity", async () => {
    readContract.mockResolvedValue(BigInt(20));
    const { result } = renderHook(() => useCommunityStats({
      deployment: deploymentFor(1952, "X Layer testnet"), address: null, wrongChain: false,
    }));
    expect(result.current.finale.mission.kind).toBe("loading");
    await waitFor(() => expect(result.current.finale.mission).toMatchObject({
      kind: "ready", totalCareActions: 20, target: 20, isComplete: true, dataMode: "live",
    }));
    expect(result.current.finale.identity.kind).toBe("unconfigured");
    expect(result.current.finale.onRetry).toBe(result.current.retry);

    readContract.mockRejectedValueOnce(new Error("read failed"));
    await act(async () => { result.current.finale.onRetry(); });
    await waitFor(() => expect(result.current.finale.mission.kind).toBe("unavailable"));
    expect(result.current.finale.community.totalCareActions).toBeNull();
  });

  it("starts unavailable on the wrong network and does not pretend retry can read", async () => {
    const deployment = deploymentFor(1952, "X Layer testnet");
    const { result, rerender } = renderHook(
      ({ wrongChain }) => useCommunityStats({ deployment, address: null, wrongChain }),
      { initialProps: { wrongChain: true } },
    );
    expect(result.current.community).toMatchObject({
      isLoading: false, totalCareActions: null,
      errorMessage: "Community total is unavailable on this network.",
    });
    expect(result.current.finale.mission.kind).toBe("unavailable");
    act(() => { result.current.finale.onRetry(); result.current.refresh(BigInt(11)); });
    expect(result.current.finale.mission.kind).toBe("unavailable");
    expect(readContract).not.toHaveBeenCalled();

    rerender({ wrongChain: false });
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(1));
    expect(readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: undefined }));
  });

  it.each([
    { registryAddress: null },
    { chainId: null },
    { rpcUrl: null },
    { rpcUrl: "" },
    { networkName: null },
    { status: "not-deployed" as const },
  ])("keeps missing configuration unavailable before and after retry: %j", (missing) => {
    const deployment = { ...deploymentFor(1952, "X Layer testnet"), ...missing };
    const { result } = renderHook(() => useCommunityStats({ deployment, address: null, wrongChain: false }));
    expect(result.current.community).toMatchObject({ isLoading: false, totalCareActions: null });
    expect(result.current.community.errorMessage).toMatch(/configured/);
    expect(result.current.finale.mission.kind).toBe("unavailable");
    act(() => { result.current.retry(); result.current.refresh(BigInt(11)); });
    expect(result.current.finale.mission.kind).toBe("unavailable");
    expect(readContract).not.toHaveBeenCalled();
  });

  it("clears a confirmed garden when configuration becomes unreadable and recovers after restoration", async () => {
    const deployment = deploymentFor(1952, "X Layer testnet");
    const { result, rerender } = renderHook(
      ({ currentDeployment }: { currentDeployment: Deployment }) => useCommunityStats({
        deployment: currentDeployment, address: null, wrongChain: false,
      }),
      { initialProps: { currentDeployment: deployment } },
    );
    await waitFor(() => expect(result.current.finale.mission.kind).toBe("ready"));
    readContract.mockClear();
    rerender({ currentDeployment: { ...deployment, rpcUrl: null } });
    expect(result.current.finale.mission.kind).toBe("unavailable");
    expect(result.current.community.totalCareActions).toBeNull();
    act(() => { result.current.finale.onRetry(); });
    expect(readContract).not.toHaveBeenCalled();

    rerender({ currentDeployment: deployment });
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(1));
    expect(readContract).toHaveBeenCalledTimes(1);
  });

  // Regression: chainFromDeployment builds a fresh chain object for any id
  // outside X Layer. Unmemoised, that identity churn re-fired this effect on
  // every render — measured at >7000 reads in 400ms on Anvil.
  it("issues a bounded number of reads on a non-X-Layer chain", async () => {
    render(<Probe deployment={deploymentFor(31337, "Anvil local")} />);
    await settle();
    expect(readContract.mock.calls.length).toBeLessThan(5);
  });

  it("issues a bounded number of reads on X Layer", async () => {
    render(<Probe deployment={deploymentFor(196, "X Layer")} />);
    await settle();
    expect(readContract.mock.calls.length).toBeLessThan(5);
  });

  // Regression: `address` was missing from the effect deps. The render-phase
  // cacheKey reset puts the panel back into loading on an account switch, so
  // without the dep the effect never re-ran and the counter stuck on "Reading…".
  it("resolves the total again after the connected account changes", async () => {
    const deployment = deploymentFor(196, "X Layer");
    const { rerender, getByTestId } = render(
      <Probe deployment={deployment} key="stable" />,
    );
    await waitFor(() => expect(getByTestId("total")).toHaveTextContent("1"));

    readContract.mockClear();
    // Keep component type and key stable: a remount would conceal a missing
    // account dependency by starting a new effect even in the broken hook.
    rerender(<Probe deployment={deployment} address="0x2222222222222222222222222222222222222222" key="stable" />);
    await waitFor(() => expect(readContract).toHaveBeenCalled());
    await waitFor(() => expect(getByTestId("total")).toHaveTextContent("1"));
  });

  it("does not carry a receipt block into a different wallet session", async () => {
    const deployment = deploymentFor(31337, "Anvil local");
    const { result, rerender } = renderHook(
      ({ address }: { address: Address }) => useCommunityStats({
        deployment,
        address,
        wrongChain: false,
      }),
      { initialProps: { address: "0x1111111111111111111111111111111111111111" as Address } },
    );
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(1));
    await act(async () => { result.current.refresh(BigInt(11)); });
    expect(readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: BigInt(11) }));

    rerender({ address: "0x2222222222222222222222222222222222222222" });
    await waitFor(() => expect(result.current.community.isLoading).toBe(false));
    expect(readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: undefined }));
  });

  it("clears a receipt-bound total immediately and reads latest after a same-account provider change", async () => {
    const deployment = deploymentFor(1952, "X Layer testnet");
    const { result, rerender } = renderHook(
      ({ providerSessionKey }) => useCommunityStats({
        deployment, address: "0x1111111111111111111111111111111111111111", wrongChain: false, providerSessionKey,
      }),
      { initialProps: { providerSessionKey: "metamask" } },
    );
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(1));
    await act(async () => { result.current.refresh(BigInt(120)); });
    expect(readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: BigInt(120) }));
    let resolveNew!: (total: bigint) => void;
    readContract.mockReturnValueOnce(new Promise<bigint>((resolve) => { resolveNew = resolve; }));

    rerender({ providerSessionKey: "okx" });
    expect(result.current.community.totalCareActions).toBeNull();
    expect(result.current.finale.mission.kind).toBe("loading");
    expect(readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: undefined }));
    await act(async () => { resolveNew(BigInt(3)); });
    expect(result.current.community.totalCareActions).toBe(3);
  });

  it.each(["success", "failure"])("ignores a late receipt read %s after same-account provider A → B → A", async (outcome) => {
    const deployment = deploymentFor(1952, "X Layer testnet");
    const { result, rerender } = renderHook(
      ({ providerSessionKey }) => useCommunityStats({
        deployment, address: "0x1111111111111111111111111111111111111111", wrongChain: false, providerSessionKey,
      }),
      { initialProps: { providerSessionKey: "metamask" } },
    );
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(1));
    let resolveOld!: (total: bigint) => void;
    let rejectOld!: (error: Error) => void;
    readContract.mockReturnValueOnce(new Promise<bigint>((resolve, reject) => { resolveOld = resolve; rejectOld = reject; }));
    await act(async () => { result.current.refresh(BigInt(120)); });
    readContract.mockResolvedValue(BigInt(4));
    rerender({ providerSessionKey: "okx" });
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(4));
    rerender({ providerSessionKey: "metamask" });
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(4));

    await act(async () => {
      if (outcome === "success") resolveOld(BigInt(2));
      else rejectOld(new Error("Old provider receipt state unavailable"));
    });
    expect(result.current.community.totalCareActions).toBe(4);
    expect(result.current.community.errorMessage).toBeNull();
    expect(readContract).toHaveBeenCalledTimes(4);
    for (const [args] of readContract.mock.calls.slice(2)) expect(args.blockNumber).toBeUndefined();
  });

  it("retries a temporarily unavailable community read at the same receipt block", async () => {
    const deployment = deploymentFor(1952, "X Layer testnet");
    const { result } = renderHook(() => useCommunityStats({ deployment, address: null, wrongChain: false }));
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(1));
    readContract.mockRejectedValueOnce(new ResourceUnavailableRpcError(new Error("Receipt state unavailable")));
    readContract.mockResolvedValue(BigInt(2));

    await act(async () => { result.current.refresh(BigInt(11)); });
    expect(result.current.community.isLoading).toBe(true);
    expect(result.current.community.totalCareActions).toBeNull();
    expect(result.current.community.errorMessage).toBeNull();
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(2), { timeout: 3000 });

    expect(readContract).toHaveBeenCalledTimes(3);
    for (const [args] of readContract.mock.calls.slice(1)) {
      expect(args.blockNumber).toBe(BigInt(11));
    }
  });

  it("stops after three unavailable receipt reads and leaves the total unknown", async () => {
    const deployment = deploymentFor(1952, "X Layer testnet");
    const { result } = renderHook(() => useCommunityStats({ deployment, address: null, wrongChain: false }));
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(1));
    readContract.mockRejectedValue(new ResourceUnavailableRpcError(new Error("Receipt state unavailable")));
    await act(async () => { result.current.refresh(BigInt(11)); });
    await waitFor(() => expect(result.current.community.isLoading).toBe(false), { timeout: 4000 });

    expect(readContract).toHaveBeenCalledTimes(4);
    expect(result.current.community.totalCareActions).toBeNull();
    expect(result.current.community.errorMessage).toMatch(/could not be loaded/i);
    for (const [args] of readContract.mock.calls.slice(1)) {
      expect(args.blockNumber).toBe(BigInt(11));
    }
  });

  it("cancels a delayed community retry when the wallet session changes", async () => {
    const deployment = deploymentFor(1952, "X Layer testnet");
    const { result, rerender } = renderHook(
      ({ address }: { address: Address }) => useCommunityStats({ deployment, address, wrongChain: false }),
      { initialProps: { address: "0x1111111111111111111111111111111111111111" as Address } },
    );
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(1));
    readContract.mockRejectedValueOnce(new ResourceUnavailableRpcError(new Error("Receipt state unavailable")));
    await act(async () => { result.current.refresh(BigInt(11)); });
    expect(readContract).toHaveBeenCalledTimes(2);

    readContract.mockResolvedValue(BigInt(2));
    rerender({ address: "0x2222222222222222222222222222222222222222" });
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(2));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 650)); });

    expect(readContract).toHaveBeenCalledTimes(3);
    expect(readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: undefined }));
    expect(result.current.community.totalCareActions).toBe(2);
    expect(result.current.community.errorMessage).toBeNull();
  });

  it("discards an in-flight manual retry when the wallet session changes", async () => {
    const deployment = deploymentFor(1952, "X Layer testnet");
    const { result, rerender } = renderHook(
      ({ address }: { address: Address }) => useCommunityStats({ deployment, address, wrongChain: false }),
      { initialProps: { address: "0x1111111111111111111111111111111111111111" as Address } },
    );
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(1));
    readContract.mockRejectedValueOnce(new Error("Receipt state unavailable"));
    await act(async () => { result.current.refresh(BigInt(11)); });
    expect(result.current.community.totalCareActions).toBeNull();

    let resolveRetry!: (total: bigint) => void;
    readContract.mockReturnValueOnce(new Promise<bigint>((resolve) => { resolveRetry = resolve; }));
    await act(async () => { result.current.retry(); });
    expect(result.current.community.isLoading).toBe(true);
    expect(readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: BigInt(11) }));

    readContract.mockResolvedValue(BigInt(3));
    rerender({ address: "0x2222222222222222222222222222222222222222" });
    await waitFor(() => expect(result.current.community.totalCareActions).toBe(3));
    expect(readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: undefined }));
    await act(async () => { resolveRetry(BigInt(2)); });

    expect(readContract).toHaveBeenCalledTimes(4);
    expect(result.current.community.totalCareActions).toBe(3);
    expect(result.current.community.errorMessage).toBeNull();
  });
});
