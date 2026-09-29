import { getAddress, isAddress, type Address } from "viem";
import { getActiveDeployment } from "@/lib/deployment";
import { readCompanionFacts } from "@/lib/companion/read-facts";
import { createStandardReply } from "@/lib/companion/standard-reply";
import { defaultPersonality } from "@/lib/companion/personality";
import type { CompanionFactsState, CompanionQuestion } from "@/types/companion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1024;
const READ_TIMEOUT_MS = 20_000;
const QUESTIONS: readonly CompanionQuestion[] = ["progress", "next-care", "contribution"];
// Per-instance load shedding/coalescing only, not a distributed rate limiter.
// There are no paid model calls. All queries use the configured registry/RPC.
const inFlight = new Map<string, Promise<CompanionFactsState>>();
const unavailable = (): CompanionFactsState => ({
  kind: "unavailable", dataMode: "live",
  message: "Confirmed MemePet activity is unavailable. Retry the read.",
});

function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
  });
}

/** Public machine-readable description, not evidence of an OKX.AI listing. */
export async function GET() {
  const deployment = getActiveDeployment();
  return json({
    openapi: "3.1.0",
    info: {
      title: "MemePet Verified Recap", version: "1.0.0",
      description: "Free, read-only MemePet registry facts and standard explanations. No model inference, wallet signing, full-wallet history or financial advice.",
    },
    servers: [{ url: "https://memepet.vercel.app" }],
    "x-memepet": {
      configuredChainId: deployment.chainId,
      configuredRegistry: deployment.registryAddress,
      network: deployment.networkName,
      okxAiListing: "not-registered",
    },
    paths: {
      "/api/companion": {
        post: {
          operationId: "getMemePetRecap",
          summary: "Read one wallet's MemePet facts at one confirmed block",
          requestBody: { required: true, content: { "application/json": { schema: {
            type: "object", additionalProperties: false, required: ["address"],
            properties: {
              address: { type: "string", pattern: "^0x[a-fA-F0-9]{40}$", description: "Public wallet address; mixed-case addresses must have a valid checksum." },
              question: { type: "string", enum: QUESTIONS },
              blockNumber: { type: "string", pattern: "^(0|[1-9][0-9]{0,19})$", description: "Optional receipt block, at most uint64. Every registry read stays pinned to this block. Omit for latest." },
            },
          } } } },
          responses: {
            "200": { description: "schemaVersion 1, scope and facts (ready or no-pet); optional standard reply. Ready snapshots include source block/time and nullable community total." },
            "400": { description: "Invalid JSON, wallet, question, block or unsupported field" },
            "408": { description: "Request body timed out" },
            "413": { description: "Body exceeds 1024 bytes" },
            "415": { description: "Expected application/json" },
            "429": { description: "This service instance is busy; retry later" },
            "503": { description: "Confirmed facts unavailable; no fabricated pet or zero count" },
          },
        },
      },
    },
  });
}

class BodyError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

async function readSmallJson(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new BodyError(415, "Use application/json.");
  }
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) {
    throw new BodyError(413, "Request body is too large.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new BodyError(400, "A JSON body is required.");
  let expired = false;
  const timer = setTimeout(() => { expired = true; void reader.cancel().catch(() => undefined); }, 3000);
  let bytes = 0;
  let text = "";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (expired) throw new BodyError(408, "Request body timed out.");
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => undefined);
        throw new BodyError(413, "Request body is too large.");
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}

function parseInput(value: unknown): { address: Address; question?: CompanionQuestion; blockNumber?: bigint } | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !["address", "question", "blockNumber"].includes(key))) return null;
  if (typeof input.address !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(input.address) || !isAddress(input.address)) return null;
  if (input.question !== undefined && !QUESTIONS.includes(input.question as CompanionQuestion)) return null;
  let blockNumber: bigint | undefined;
  if (input.blockNumber !== undefined) {
    if (typeof input.blockNumber !== "string" || !/^(0|[1-9]\d{0,19})$/.test(input.blockNumber)) return null;
    blockNumber = BigInt(input.blockNumber);
    if (blockNumber > BigInt("18446744073709551615")) return null;
  }
  return { address: getAddress(input.address), question: input.question as CompanionQuestion | undefined, blockNumber };
}

async function boundedRead(input: Parameters<typeof readCompanionFacts>[0]) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      readCompanionFacts(input).catch(unavailable),
      new Promise<CompanionFactsState>(resolve => { timer = setTimeout(() => resolve(unavailable()), READ_TIMEOUT_MS); }),
    ]);
  } catch {
    return unavailable();
  } finally { clearTimeout(timer); }
}

export async function POST(request: Request) {
  let input: ReturnType<typeof parseInput>;
  try {
    input = parseInput(await readSmallJson(request));
  } catch (error) {
    return error instanceof BodyError
      ? json({ error: error.message }, error.status)
      : json({ error: "Invalid JSON request." }, 400);
  }
  if (!input) return json({ error: "Provide a valid public address, supported question and optional decimal blockNumber only." }, 400);

  const deployment = getActiveDeployment();
  const key = `${deployment.chainId}:${deployment.registryAddress}:${deployment.rpcUrl}:${input.address}:${input.blockNumber ?? "latest"}`;
  let pending = inFlight.get(key);
  if (!pending) {
    if (inFlight.size >= 4) return json({ error: "Service is busy. Retry shortly." }, 429, { "Retry-After": "2" });
    pending = boundedRead({ deployment, address: input.address, blockNumber: input.blockNumber });
    inFlight.set(key, pending);
    void pending.finally(() => { if (inFlight.get(key) === pending) inFlight.delete(key); });
  }
  const facts = await pending;
  const scope = { chainId: deployment.chainId, registryAddress: deployment.registryAddress, walletAddress: input.address };
  const reply = input.question ? createStandardReply(facts, input.question, defaultPersonality()) : undefined;
  return json({ schemaVersion: 1, scope, facts, ...(reply ? { reply } : {}) }, facts.kind === "ready" || facts.kind === "no-pet" ? 200 : 503);
}
