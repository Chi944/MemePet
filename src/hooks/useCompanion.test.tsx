import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Address } from "viem";
import type { Deployment } from "@/lib/deployment";
import type { PersonalityProfile } from "@/types/companion";
import { useCompanion, type UseCompanionArgs } from "./useCompanion";

const personality = vi.hoisted(() => ({ style: "playful" as PersonalityProfile["style"] }));
vi.mock("./usePersonality", () => ({ usePersonality: () => ({
  profile: { version: 1, exploreCount: 0, practiseCount: 0, style: personality.style },
  storageStatus: "available", onInteract: vi.fn(), onReset: vi.fn(),
}) }));

const walletA = "0x1111111111111111111111111111111111111111" as Address;
const walletB = "0x2222222222222222222222222222222222222222" as Address;
const deployment: Deployment = {
  status: "testnet", chainId: 1952, registryAddress: "0x3333333333333333333333333333333333333333",
  networkName: "X Layer testnet", currencySymbol: "OKB", explorerBaseUrl: null,
  rpcUrl: "https://example.test/rpc",
};
const initial: UseCompanionArgs = { deployment, address: walletA, wrongChain: false };
const fetchMock = vi.fn<typeof fetch>();

function envelope(facts: unknown, address: Address = walletA) {
  return { schemaVersion: 1, scope: { chainId: deployment.chainId,
    registryAddress: deployment.registryAddress, walletAddress: address }, facts };
}

function payload(address: Address = walletA, block = 100, careCount = 1) {
  const growthPoints = careCount * 10;
  return envelope({ kind: "ready", dataMode: "live", snapshot: {
    contextKey: `${address}:${block}:${careCount}`, walletAddress: address, registryAddress: deployment.registryAddress,
    chainId: 1952, blockNumber: String(block), blockTimestampIso: "2026-09-30T12:00:00.000Z",
    observedAtIso: "2026-09-30T12:00:01.000Z", careCount, growthPoints,
    stage: growthPoints >= 50 ? "guardian" : growthPoints >= 20 ? "buddy" : "hatchling",
    nextStageAt: growthPoints >= 50 ? null : growthPoints >= 20 ? 50 : 20,
    nextCareAtIso: careCount === 0 ? "2026-09-30T12:00:00.000Z" : "2026-10-01T00:00:00.000Z",
    communityTotalCares: 10,
  } }, address);
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("useCompanion read-only session adapter", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(json(payload()));
    personality.style = "playful";
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it("reads genuine API facts and answers locally with personality, without another request", async () => {
    const { result, rerender } = renderHook((args: UseCompanionArgs) => useCompanion(args), { initialProps: initial });
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("ready"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ address: walletA });
    act(() => { result.current.companion.onAsk("progress"); });
    expect(result.current.companion.reply).toEqual(expect.objectContaining({ kind: "answer", source: "standard", text: expect.stringContaining("10 growth points") }));
    personality.style = "curious";
    rerender(initial);
    act(() => { result.current.companion.onAsk("contribution"); });
    expect(result.current.companion.reply).toEqual(expect.objectContaining({ text: expect.stringContaining("Here is what Mochi found:") }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.personality.dataMode).toBe("live");
  });

  it("distinguishes a missing pet from network errors and malformed responses", async () => {
    fetchMock.mockResolvedValueOnce(json(envelope({ kind: "no-pet", dataMode: "live" })));
    const { result } = renderHook(() => useCompanion(initial));
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("no-pet"));
    fetchMock.mockResolvedValueOnce(json(envelope({ kind: "no-pet", dataMode: "live" }), 503));
    act(() => { result.current.companion.onRetry(); });
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("unavailable"));
    fetchMock.mockResolvedValueOnce(new Response("<html>provider error</html>", { status: 200 }));
    act(() => { result.current.companion.onRetry(); });
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("unavailable"));
    fetchMock.mockResolvedValueOnce(json(payload(walletB)));
    act(() => { result.current.companion.onRetry(); });
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("unavailable"));
  });

  it("never fetches while disconnected, on the wrong network, or during a write", async () => {
    const disconnected: UseCompanionArgs = { ...initial, address: null };
    const { result, rerender } = renderHook((args: UseCompanionArgs) => useCompanion(args), { initialProps: disconnected });
    expect(result.current.companion.facts.kind).toBe("needs-wallet");
    rerender({ ...initial, wrongChain: true });
    expect(result.current.companion.facts.kind).toBe("wrong-network");
    rerender({ ...initial, isWriting: true });
    expect(result.current.companion.facts.kind).toBe("loading");
    act(() => { result.current.companion.onRetry(); result.current.companion.onAsk("progress"); });
    expect(fetchMock).not.toHaveBeenCalled();
    rerender(initial);
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("ready"));
  });

  it("clears facts immediately and discards A-B-A responses and saved callbacks", async () => {
    const firstA = deferred<Response>();
    const firstB = deferred<Response>();
    const secondA = deferred<Response>();
    fetchMock.mockReturnValueOnce(firstA.promise).mockReturnValueOnce(firstB.promise).mockReturnValueOnce(secondA.promise);
    const { result, rerender } = renderHook((args: UseCompanionArgs) => useCompanion(args), { initialProps: initial });
    const stale = result.current.companion;
    rerender({ ...initial, address: walletB });
    expect(result.current.companion.facts.kind).toBe("loading");
    rerender(initial);
    await act(async () => { secondA.resolve(json(payload(walletA, 120, 2))); });
    expect(result.current.companion.facts.kind).toBe("ready");
    await act(async () => { firstA.resolve(json(payload(walletA, 100))); firstB.resolve(json(payload(walletB, 110))); });
    act(() => { stale.onAsk("progress"); stale.onRetry(); });
    const facts = result.current.companion.facts;
    expect(facts.kind === "ready" && facts.snapshot.blockNumber).toBe("120");
    expect(result.current.companion.reply.kind).toBe("idle");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it("hides previous ready facts/replies on account and network changes", async () => {
    const { result, rerender } = renderHook((args: UseCompanionArgs) => useCompanion(args), { initialProps: initial });
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("ready"));
    act(() => { result.current.companion.onAsk("progress"); });
    fetchMock.mockReturnValueOnce(new Promise(() => {}));
    rerender({ ...initial, address: walletB });
    expect(result.current.companion.facts.kind).toBe("loading");
    expect(result.current.companion.reply.kind).toBe("idle");
    rerender({ ...initial, wrongChain: true });
    expect(result.current.companion.facts.kind).toBe("wrong-network");
    expect(result.current.companion.reply.kind).toBe("idle");
  });

  it("pins a confirmed receipt and never regresses after receipt dismissal or retry", async () => {
    const { result, rerender } = renderHook((args: UseCompanionArgs) => useCompanion(args), { initialProps: initial });
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("ready"));
    fetchMock.mockResolvedValueOnce(json(payload(walletA, 120, 2)));
    rerender({ ...initial, confirmedBlockNumber: BigInt(120) });
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("ready"));
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ address: walletA, blockNumber: "120" });
    fetchMock.mockResolvedValueOnce(json(payload(walletA, 100)));
    rerender(initial);
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("unavailable"));
    fetchMock.mockResolvedValueOnce(json(payload(walletA, 130, 2)));
    act(() => { result.current.companion.onRetry(); });
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("ready"));
    const facts = result.current.companion.facts;
    expect(facts.kind === "ready" && facts.snapshot.blockNumber).toBe("130");
    expect(JSON.parse(String(fetchMock.mock.calls[3][1]?.body))).toEqual({ address: walletA });
  });

  it("does not carry a receipt floor to another wallet", async () => {
    fetchMock.mockResolvedValueOnce(json(payload(walletA, 120, 2)));
    const confirmed: UseCompanionArgs = { ...initial, confirmedBlockNumber: BigInt(120) };
    const { result, rerender } = renderHook((args: UseCompanionArgs) => useCompanion(args), {
      initialProps: confirmed,
    });
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("ready"));
    fetchMock.mockResolvedValueOnce(json(envelope({ kind: "no-pet", dataMode: "live" }, walletB)));
    rerender({ ...initial, address: walletB });
    await waitFor(() => expect(result.current.companion.facts.kind).toBe("no-pet"));
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ address: walletB });
  });

  it("aborts an old read during a write and rejects its late result", async () => {
    const old = deferred<Response>();
    fetchMock.mockReturnValueOnce(old.promise);
    const { result, rerender } = renderHook((args: UseCompanionArgs) => useCompanion(args), { initialProps: initial });
    rerender({ ...initial, isWriting: true });
    await act(async () => { old.resolve(json(payload())); });
    expect(result.current.companion.facts.kind).toBe("loading");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it("times out even if a fetch implementation ignores abort", async () => {
    vi.useFakeTimers();
    const pending = deferred<Response>();
    fetchMock.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useCompanion(initial));
    await act(async () => { await vi.advanceTimersByTimeAsync(20_001); });
    expect(result.current.companion.facts.kind).toBe("unavailable");
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    await act(async () => { pending.resolve(json(payload())); });
    expect(result.current.companion.facts.kind).toBe("unavailable");
  });
});
