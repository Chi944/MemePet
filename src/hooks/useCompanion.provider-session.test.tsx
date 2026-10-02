import { useLayoutEffect } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Address } from "viem";
import type { Deployment } from "@/lib/deployment";
import { companionFactsFixtures } from "@/fixtures/finale-fixtures";
import { useCompanion } from "./useCompanion";

// Simulated public API facts; personality uses the actual local-storage hook.
const address = "0x1111111111111111111111111111111111111111" as Address;
const registry = "0x3333333333333333333333333333333333333333";
const deployment: Deployment = {
  status: "testnet", chainId: 1952, registryAddress: registry,
  networkName: "X Layer testnet", currencySymbol: "OKB", explorerBaseUrl: null,
  rpcUrl: "https://example.test/rpc",
};
function response() {
  return new Response(JSON.stringify({
    schemaVersion: 1,
    scope: { chainId: 1952, registryAddress: registry, walletAddress: address },
    facts: {
      kind: "ready", dataMode: "live",
      snapshot: { ...companionFactsFixtures.ready.snapshot, walletAddress: address, registryAddress: registry },
    },
  }), { headers: { "Content-Type": "application/json" } });
}

beforeEach(() => localStorage.clear());
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

it("keeps the actual local personality store while replacing committed provider evidence", async () => {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response());
  vi.stubGlobal("fetch", fetchMock);
  const commits: { provider: string; facts: string; reply: string; exploreCount: number }[] = [];
  const { result, rerender } = renderHook(({ providerSessionKey }) => {
    const value = useCompanion({ deployment, address, wrongChain: false, providerSessionKey });
    useLayoutEffect(() => {
      commits.push({ provider: providerSessionKey, facts: value.companion.facts.kind,
        reply: value.companion.reply.kind, exploreCount: value.personality.profile.exploreCount });
    });
    return value;
  }, { initialProps: { providerSessionKey: "metamask" } });
  await waitFor(() => expect(result.current.companion.facts.kind).toBe("ready"));
  act(() => { result.current.personality.onInteract("explore"); });
  act(() => { result.current.companion.onAsk("progress"); });
  expect(result.current.companion.reply.kind).toBe("answer");
  const storedBefore = localStorage.getItem(`memepet:personality:v1:1952:${registry}:${address}`);
  const interactBefore = result.current.personality.onInteract;
  let resolveNext!: (value: Response) => void;
  fetchMock.mockReturnValueOnce(new Promise<Response>((resolve) => { resolveNext = resolve; }));

  rerender({ providerSessionKey: "okx" });
  expect(commits.filter((commit) => commit.provider === "okx")).toEqual([
    { provider: "okx", facts: "loading", reply: "idle", exploreCount: 1 },
  ]);
  expect(result.current.personality.profile).toMatchObject({ exploreCount: 1, style: "curious" });
  expect(result.current.personality.onInteract).toBe(interactBefore);
  expect(localStorage.getItem(`memepet:personality:v1:1952:${registry}:${address}`)).toBe(storedBefore);

  await act(async () => { resolveNext(response()); });
  expect(result.current.companion.facts.kind).toBe("ready");
  expect(result.current.companion.reply.kind).toBe("idle");
  act(() => { result.current.personality.onInteract("explore"); });
  expect(result.current.personality.profile.exploreCount).toBe(2);
  expect(localStorage.length).toBe(1);
});
