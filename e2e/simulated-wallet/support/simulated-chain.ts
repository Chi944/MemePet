/**
 * SIMULATED WALLET BROWSER REGRESSION harness for B2 scenarios.
 *
 * Fictional, deterministic RPC and /api/companion answers for a local
 * production build. Every non-local request is blocked and recorded. Nothing
 * here signs, submits or reaches a public network.
 */
import { expect, type Page, type Request, type Route } from "@playwright/test";
import { decodeFunctionData, encodeFunctionResult, getAddress, type Hex } from "viem";
import { DEPLOYMENT } from "../../../src/lib/deployment";
import { petRegistryAbi } from "../../../src/lib/pet-registry-abi";
import { mapConfirmedPetProgress } from "../../../src/lib/pet-progress";

export const SIMULATED_LABEL = "SIMULATED WALLET BROWSER REGRESSION";

/** Fictional digit-only addresses, so the checksum display equals the input. */
export const ACCOUNT_A = "0x1000000000000000000000000000000000000001";
export const ACCOUNT_B = "0x2000000000000000000000000000000000000002";

const CHAIN_ID = DEPLOYMENT.chainId!;
const REGISTRY = DEPLOYMENT.registryAddress!;
const RPC_URL = DEPLOYMENT.rpcUrl!;
export const BLOCK_NUMBER = BigInt(4_200_000);
export const BLOCK_TIME_MS = Date.parse("2026-10-02T12:00:00.000Z");
export const BLOCK_DAY = BigInt(Math.floor(BLOCK_TIME_MS / 86_400_000));
export const BLOCK_HASH = `0x${"ab".repeat(32)}` as Hex;

/** A pet answer: confirmed care count, a genuine no-pet, or a failed read. */
export type PetAnswer = number | "no-pet" | "fail";
export type TotalAnswer = number | "fail";

type RequestKind = "pet" | "community" | "companion" | "transaction" | "receipt";
export interface SimulatedRequest {
  readonly kind: RequestKind;
  /** Lower-case owner for pet/companion, transaction hash for recovery reads. */
  readonly address: string | null;
}

interface Hold {
  readonly match: (request: SimulatedRequest) => boolean;
  readonly arrived: Promise<void>;
  readonly released: Promise<void>;
  markArrived: () => void;
  release: () => void;
  taken: boolean;
}

export interface HeldAnswer {
  /** Resolves when the matching request reaches the simulated network. */
  readonly arrived: Promise<void>;
  /** Releases the answer captured at request time. */
  readonly release: () => void;
  /** Resolves after the browser received (or aborted) the late answer. */
  readonly settled: Promise<"delivered" | "aborted">;
}

/**
 * Mutable fictional chain state. Answers are captured when a request arrives,
 * so a held request can return an older value after the state has changed.
 */
export class SimulatedChain {
  readonly pets = new Map<string, PetAnswer>();
  readonly companion = new Map<string, PetAnswer>();
  readonly lastCareDays = new Map<string, bigint>();
  blockNumber = BLOCK_NUMBER;
  communityTotal: TotalAnswer = 42;
  /** JSON-RPC wire values, owned entirely by the simulated recovery tests. */
  readonly transactions = new Map<string, Record<string, unknown> | null>();
  readonly receipts = new Map<string, Record<string, unknown> | null>();
  readonly rpcRequests: { method: string; params: unknown[] }[] = [];
  readonly requests: SimulatedRequest[] = [];
  readonly blocked: string[] = [];
  private readonly holds: Hold[] = [];
  private readonly pendingDeliveries = new Set<Hold>();
  private readonly deliveryErrors: string[] = [];
  private readonly settledByHold = new Map<Hold, {
    resolve: (value: "delivered" | "aborted") => void;
    reject: (error: Error) => void;
  }>();

  setPet(address: string, answer: PetAnswer, options: { companion?: boolean; caredToday?: boolean } = {}) {
    this.pets.set(address.toLowerCase(), answer);
    this.lastCareDays.set(address.toLowerCase(), options.caredToday ? BLOCK_DAY : BLOCK_DAY - BigInt(1));
    if (options.companion !== false) this.companion.set(address.toLowerCase(), answer);
  }

  count(kind: RequestKind, address?: string) {
    return this.requests.filter((request) =>
      request.kind === kind && (address === undefined || request.address === address.toLowerCase())).length;
  }

  /** Hold the next request that matches until the test releases it. */
  hold(kind: RequestKind, address?: string): HeldAnswer {
    let markArrived!: () => void;
    let release!: () => void;
    const arrived = new Promise<void>((resolve) => { markArrived = resolve; });
    const released = new Promise<void>((resolve) => { release = resolve; });
    const hold: Hold = {
      match: (request) => request.kind === kind && (address === undefined || request.address === address.toLowerCase()),
      arrived, released, markArrived, release, taken: false,
    };
    const settled = new Promise<"delivered" | "aborted">((resolve, reject) => this.settledByHold.set(hold, { resolve, reject }));
    // A held request can fail before the scenario awaits it. Keep the original
    // promise rejecting for that assertion without an unhandled-rejection race.
    void settled.catch(() => {});
    this.holds.push(hold);
    return { arrived, release, settled };
  }

  /** Install the network guard and fakes. Call before navigation. */
  async install(page: Page, baseURL: string) {
    const localOrigin = new URL(baseURL).origin;
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (route.request().url() === RPC_URL || url.href === new URL(RPC_URL).href) {
        await this.answerRpc(route);
      } else if (url.origin === localOrigin && url.pathname === "/api/companion") {
        await this.answerCompanion(route);
      } else if (url.origin === localOrigin && !url.pathname.startsWith("/api/")) {
        await route.continue();
      } else {
        // Unexpected traffic of any method is blocked, not only writes.
        this.blocked.push(`${route.request().method()} ${url.origin}${url.pathname}`);
        await route.abort("blockedbyclient");
      }
    });
  }

  private async deliver(route: Route, request: SimulatedRequest, respond: () => Promise<void>) {
    this.requests.push(request);
    const hold = this.holds.find((entry) => !entry.taken && entry.match(request));
    if (!hold) {
      await respond();
      return;
    }
    hold.taken = true;
    const transportRequest = route.request();
    const page = transportRequest.frame().page();
    const completion = this.settledByHold.get(hold)!;
    this.pendingDeliveries.add(hold);
    let complete = false;
    const cleanup = () => {
      if (timer !== undefined) clearTimeout(timer);
      page.off("requestfinished", onFinished);
      page.off("requestfailed", onFailed);
      page.off("close", onClose);
      this.pendingDeliveries.delete(hold);
      this.settledByHold.delete(hold);
    };
    const finish = (result: "delivered" | "aborted") => {
      if (complete) return;
      complete = true;
      cleanup();
      completion.resolve(result);
    };
    const fail = (error: unknown) => {
      const failure = error instanceof Error ? error : new Error(String(error));
      this.deliveryErrors.push(failure.message);
      if (complete) return;
      complete = true;
      cleanup();
      completion.reject(failure);
    };
    const onFinished = (candidate: Request) => {
      if (candidate === transportRequest) finish("delivered");
    };
    const onFailed = (candidate: Request) => {
      if (candidate !== transportRequest) return;
      const failure = candidate.failure()?.errorText ?? "Unknown request failure";
      if (/abort|cancel/i.test(failure)) finish("aborted");
      else fail(new Error(`SIMULATED held ${request.kind} request failed unexpectedly: ${failure}`));
    };
    const onClose = () => fail(new Error(`SIMULATED page closed before held ${request.kind} request settled`));
    // Register before the test can change account and abort the request.
    // route.fulfill() may resolve even after browser cancellation; only the
    // exact Request's network events establish delivery versus abortion.
    page.on("requestfinished", onFinished);
    page.on("requestfailed", onFailed);
    page.on("close", onClose);
    const timer = setTimeout(() => fail(new Error(`SIMULATED held ${request.kind} request did not settle within 10 seconds`)), 10_000);
    hold.markArrived();
    await hold.released;
    try {
      await respond();
    } catch (error) {
      // A fulfilment/harness error is not evidence of a valid app abort.
      fail(error);
      throw error;
    }
  }

  private async answerRpc(route: Route) {
    const body = route.request().postDataJSON() as { id: number; method: string; params: unknown[] };
    this.rpcRequests.push({ method: body.method, params: body.params });
    const reply = (result: unknown) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify({ jsonrpc: "2.0", id: body.id, result }),
    });
    const unavailable = () => route.fulfill({
      status: 503, contentType: "application/json", body: '{"error":"SIMULATED RPC unavailable"}',
    });

    if (body.method === "eth_chainId") return reply(`0x${CHAIN_ID.toString(16)}`);
    if (body.method === "eth_blockNumber") return reply(`0x${this.blockNumber.toString(16)}`);
    if (body.method === "eth_getBlockByNumber") {
      const requested = body.params[0];
      const number = typeof requested === "string" && /^0x[0-9a-f]+$/i.test(requested)
        ? BigInt(requested) : this.blockNumber;
      const block = simulatedBlock(number);
      if (body.params[1] === true) {
        return reply({ ...block, transactions: [...this.transactions.values()].filter((transaction) =>
          transaction?.blockNumber === block.number) });
      }
      return reply(block);
    }
    if (body.method === "eth_getTransactionByHash" || body.method === "eth_getTransactionReceipt") {
      const hash = String(body.params[0]).toLowerCase();
      const kind = body.method === "eth_getTransactionByHash" ? "transaction" : "receipt";
      const answer = (kind === "transaction" ? this.transactions : this.receipts).get(hash) ?? null;
      return this.deliver(route, { kind, address: hash }, () => reply(answer));
    }
    if (body.method !== "eth_call") {
      this.blocked.push(`RPC ${body.method}`);
      return route.fulfill({ status: 200, contentType: "application/json",
        body: JSON.stringify({ jsonrpc: "2.0", id: body.id, error: { code: -32601, message: "SIMULATED: method not allowed" } }) });
    }

    const call = body.params[0] as { to: string; data: Hex };
    if (call.to.toLowerCase() !== REGISTRY.toLowerCase()) {
      this.blocked.push(`RPC eth_call ${call.to}`);
      return unavailable();
    }
    const decoded = decodeFunctionData({ abi: petRegistryAbi, data: call.data });
    if (decoded.functionName === "petOf") {
      const address = (decoded.args[0] as string).toLowerCase();
      const answer = this.pets.get(address) ?? "no-pet";
      const lastCareDay = this.lastCareDays.get(address) ?? BLOCK_DAY - BigInt(1);
      return this.deliver(route, { kind: "pet", address }, () => {
        if (answer === "fail") return unavailable();
        const exists = answer !== "no-pet";
        const careCount = exists ? answer : 0;
        return reply(encodeFunctionResult({
          abi: petRegistryAbi, functionName: "petOf",
          // Baselines are due by default; mined care fixtures explicitly set today.
          result: [exists, exists ? 1 : 0, careCount, exists && careCount > 0 ? lastCareDay : BigInt(0)],
        }));
      });
    }
    if (decoded.functionName === "communityStats") {
      const answer = this.communityTotal;
      return this.deliver(route, { kind: "community", address: null }, () => answer === "fail"
        ? unavailable()
        : reply(encodeFunctionResult({ abi: petRegistryAbi, functionName: "communityStats", result: BigInt(answer) })));
    }
    this.blocked.push(`RPC eth_call ${decoded.functionName}`);
    return unavailable();
  }

  private async answerCompanion(route: Route) {
    if (route.request().method() !== "POST") {
      this.blocked.push(`${route.request().method()} /api/companion`);
      return route.abort("blockedbyclient");
    }
    const { address } = route.request().postDataJSON() as { address: string };
    const key = address.toLowerCase();
    const answer = this.companion.get(key) ?? "no-pet";
    const total = this.communityTotal;
    const caredToday = this.lastCareDays.get(key) === BLOCK_DAY;
    return this.deliver(route, { kind: "companion", address: key }, () => answer === "fail"
      ? route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"SIMULATED unavailable"}' })
      : route.fulfill({ status: 200, contentType: "application/json",
        body: JSON.stringify(companionBody(address, answer, total === "fail" ? null : total, caredToday)) }));
  }

  /** Assert that nothing unexpected left the browser. */
  expectNoUnexpectedTraffic() {
    expect(this.blocked, "unexpected requests were blocked").toEqual([]);
    expect(this.deliveryErrors, "held response delivery must be observed without harness failures").toEqual([]);
    expect(this.pendingDeliveries.size, "every arrived held response must finish or abort").toBe(0);
  }
}

function simulatedBlock(number = BLOCK_NUMBER) {
  const hex = (value: bigint | number) => `0x${value.toString(16)}`;
  const zero32 = `0x${"0".repeat(64)}`;
  return {
    number: hex(number), hash: number === BLOCK_NUMBER ? BLOCK_HASH : `0x${number.toString(16).padStart(64, "0")}`, parentHash: zero32,
    timestamp: hex(BLOCK_TIME_MS / 1000), nonce: "0x0000000000000000", difficulty: "0x0", totalDifficulty: "0x0",
    gasLimit: "0x1c9c380", gasUsed: "0x0", miner: `0x${"0".repeat(40)}`, extraData: "0x",
    logsBloom: `0x${"0".repeat(512)}`, transactionsRoot: zero32, stateRoot: zero32, receiptsRoot: zero32,
    sha3Uncles: zero32, mixHash: zero32, size: "0x200", baseFeePerGas: "0x7", transactions: [], uncles: [],
  };
}

function companionBody(address: string, answer: Exclude<PetAnswer, "fail">, communityTotal: number | null, caredToday = false) {
  const scope = { chainId: CHAIN_ID, walletAddress: getAddress(address), registryAddress: REGISTRY };
  if (answer === "no-pet") return { schemaVersion: 1, scope, facts: { kind: "no-pet", dataMode: "live" } };
  const blockIso = new Date(BLOCK_TIME_MS).toISOString();
  // Match the RPC fixture's explicit mined-care cooldown when present.
  const nextCareAtIso = caredToday ? new Date(Number(BLOCK_DAY + BigInt(1)) * 86_400_000).toISOString() : blockIso;
  return {
    schemaVersion: 1,
    scope,
    facts: {
      kind: "ready",
      dataMode: "live",
      snapshot: {
        contextKey: `simulated:${address.toLowerCase()}:${answer}:${communityTotal}`,
        walletAddress: getAddress(address), chainId: CHAIN_ID, registryAddress: REGISTRY,
        blockNumber: BLOCK_NUMBER.toString(), blockTimestampIso: blockIso, observedAtIso: blockIso,
        careCount: answer, ...mapConfirmedPetProgress(answer), nextCareAtIso,
        communityTotalCares: communityTotal,
      },
    },
  };
}

/** Wait until React has had a chance to commit a just-delivered late answer. */
export async function settleFrames(page: Page) {
  await page.evaluate(() => new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 150)))));
}

/** Visible-state locators on the live /pet route. */
export function petPage(page: Page) {
  const meta = page.locator("dl.pet-live-meta");
  const metaValue = (label: string) => meta.getByText(label, { exact: true }).locator("..").locator("dd");
  const recap = page.getByRole("region", { name: "Ask Mochi about your progress" });
  return {
    wallet: metaValue("Wallet"),
    pet: metaValue("Pet"),
    communityCares: metaValue("Community cares"),
    growth: page.getByText(/^\d+ growth points$/),
    recap,
    recapCares: recap.getByText("Your confirmed cares", { exact: true }).locator("..").locator("dd"),
    garden: page.getByRole("progressbar", { name: "Mochi garden progress" }),
  };
}
