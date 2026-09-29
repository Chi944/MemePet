// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CompanionFactsState } from "@/types/companion";

const read = vi.hoisted(() => vi.fn());
vi.mock("@/lib/companion/read-facts", () => ({ readCompanionFacts: read }));
vi.mock("@/lib/deployment", () => ({ getActiveDeployment: () => ({
  status: "testnet", chainId: 1952, registryAddress: "0x1111111111111111111111111111111111111111",
  rpcUrl: "https://rpc.invalid", networkName: "Test network", currencySymbol: "OKB", explorerBaseUrl: null,
}) }));
import { GET, POST } from "./route";

const address = "0x2222222222222222222222222222222222222222";
const facts: CompanionFactsState = { kind: "ready", dataMode: "live", snapshot: {
  contextKey: "TEST_READ", walletAddress: address, chainId: 1952,
  registryAddress: "0x1111111111111111111111111111111111111111",
  blockNumber: "11", blockTimestampIso: "2030-01-01T12:00:00.000Z", observedAtIso: "2030-01-01T12:00:01.000Z",
  careCount: 1, growthPoints: 10, stage: "hatchling", nextStageAt: 20,
  nextCareAtIso: "2030-01-02T00:00:00.000Z", communityTotalCares: null,
} };
function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://memepet.invalid/api/companion", {
    method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body),
  });
}

describe("free read-only companion service", () => {
  beforeEach(() => { read.mockReset(); read.mockResolvedValue(facts); });
  afterEach(() => vi.useRealTimers());

  it("describes its bounded interface without reading a wallet or claiming registration", async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.openapi).toBe("3.1.0");
    expect(body["x-memepet"].okxAiListing).toBe("not-registered");
    expect(read).not.toHaveBeenCalled();
  });

  it("returns JSON-safe same-block facts and an explicitly standard grounded answer", async () => {
    const response = await POST(request({ address, blockNumber: "11", question: "contribution" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(read).toHaveBeenCalledWith(expect.objectContaining({ address, blockNumber: BigInt(11) }));
    const body = await response.json();
    expect(body.facts).toEqual(facts);
    expect(body.reply.source).toBe("standard");
    expect(body.reply.contextKey).toBe("TEST_READ");
    expect(body.reply.text).toContain("community total is unavailable");
  });

  it("keeps a verified absent pet separate from unavailable reads", async () => {
    read.mockResolvedValueOnce({ kind: "no-pet", dataMode: "live" });
    const empty = await POST(request({ address }));
    expect(empty.status).toBe(200);
    expect((await empty.json()).facts.kind).toBe("no-pet");
    read.mockResolvedValueOnce({ kind: "unavailable", dataMode: "live", message: "Read unavailable" });
    const unavailable = await POST(request({ address }));
    expect(unavailable.status).toBe(503);
    expect((await unavailable.json()).facts.kind).toBe("unavailable");
  });

  it.each([
    null, [], { address: "bad" }, { address, question: "send money" }, { address, blockNumber: 11 },
    { address, blockNumber: "-1" }, { address, blockNumber: "1e3" }, { address, blockNumber: "18446744073709551616" },
    { address, rpcUrl: "http://127.0.0.1/admin" }, { address, registryAddress: address },
    { address, privateKey: "not-a-key" }, { address, facts: {} },
  ])("rejects unsupported input without making a chain call: %j", async input => {
    expect((await POST(request(input))).status).toBe(400);
    expect(read).not.toHaveBeenCalled();
  });

  it("limits actual streamed bytes even if Content-Length is absent or false", async () => {
    expect((await POST(request({ address, extra: "x".repeat(2000) }))).status).toBe(413);
    expect((await POST(request({ address, extra: "x".repeat(2000) }, { "content-length": "1" }))).status).toBe(413);
    expect((await POST(request({ address }, { "content-length": "99999" }))).status).toBe(413);
    expect(read).not.toHaveBeenCalled();
  });

  it("rejects unsupported content types and malformed JSON", async () => {
    expect((await POST(request({ address }, { "content-type": "text/plain" }))).status).toBe(415);
    expect((await POST(new Request("https://example.invalid", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }))).status).toBe(400);
    expect(read).not.toHaveBeenCalled();
  });

  it("sanitizes unexpected internal failures", async () => {
    read.mockRejectedValueOnce(new Error("PRIVATE_INTERNAL_URL"));
    const response = await POST(request({ address }));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("PRIVATE_INTERNAL_URL");
  });

  it("coalesces identical in-flight reads and sheds excess distinct reads", async () => {
    const resolvers: Array<(facts: CompanionFactsState) => void> = [];
    read.mockImplementation(() => new Promise<CompanionFactsState>(resolve => resolvers.push(resolve)));
    const active = [1, 2, 3, 4].map(block => POST(request({ address, blockNumber: String(block) })));
    await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(4));
    const same = POST(request({ address, blockNumber: "1" }));
    const excess = await POST(request({ address, blockNumber: "5" }));
    expect(excess.status).toBe(429);
    expect(excess.headers.get("retry-after")).toBe("2");
    for (const resolve of resolvers) resolve(facts);
    expect((await Promise.all([...active, same])).every(response => response.status === 200)).toBe(true);
    expect(read).toHaveBeenCalledTimes(4);
    read.mockResolvedValueOnce(facts);
    expect((await POST(request({ address }))).status).toBe(200);
  });

  it("bounds an unresponsive reader and releases its service slot", async () => {
    vi.useFakeTimers();
    read.mockImplementationOnce(() => new Promise(() => undefined));
    const pending = POST(request({ address }));
    await vi.waitFor(() => expect(read).toHaveBeenCalledOnce());
    await vi.advanceTimersByTimeAsync(20_001);
    const response = await pending;
    expect(response.status).toBe(503);
    expect((await response.json()).facts.kind).toBe("unavailable");
    read.mockResolvedValueOnce(facts);
    expect((await POST(request({ address }))).status).toBe(200);
  });

  it("cancels a stalled request body before any RPC", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const body = new ReadableStream({ cancel });
    const pending = POST(new Request("https://example.invalid", {
      method: "POST", headers: { "content-type": "application/json" }, body, duplex: "half",
    } as RequestInit));
    await vi.advanceTimersByTimeAsync(3001);
    expect((await pending).status).toBe(408);
    expect(cancel).toHaveBeenCalledOnce();
    expect(read).not.toHaveBeenCalled();
  });
});
