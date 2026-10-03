#!/usr/bin/env node
// Public, read-only preparation. This does not connect a wallet or prove browser acceptance.
// Node 24 (the repository runtime): node docs/qa/wallet-preflight.mjs
import { pathToFileURL } from "node:url";
import { encodeFunctionData } from "viem";
import { DEPLOYMENT } from "../../src/lib/deployment.ts";
import { petRegistryAbi } from "../../src/lib/pet-registry-abi.ts";
import { mapConfirmedPetProgress } from "../../src/lib/pet-progress.ts";

export const DEMO_ACCOUNTS = Object.freeze([
  { label: "Account 1", address: "0x3876722934FF2D3dC998656864BD5E8BBe1D5774" },
  { label: "Account 2", address: "0x86F7De84EBB97c875e1494675Bfcd664f0773CE9" },
  { label: "Account 3", address: "0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a" },
  { label: "Account 4", address: "0x0A9312A3943A371e8fcA64E8a41769E4766203e6" },
].map(Object.freeze));

const UINT32_MAX = (1n << 32n) - 1n;
const UINT64_MAX = (1n << 64n) - 1n;
const UINT256_MAX = (1n << 256n) - 1n;
const DAY = 86_400n;
const MAX_DATE_SECONDS = 8_640_000_000_000n - DAY;
const MAX_RESPONSE_BYTES = 65_536;
const READ_METHODS = new Set(["eth_chainId", "eth_getBlockByNumber", "eth_call", "eth_getBalance", "eth_getCode"]);

class PreflightError extends Error {}
const fail = (message) => { throw new PreflightError(message); };

function quantity(value, maximum = UINT256_MAX) {
  if (typeof value !== "string" || !/^0x(?:0|[1-9a-f][0-9a-f]*)$/i.test(value) || value.length > 66) {
    fail("Invalid RPC quantity; no preflight snapshot was produced.");
  }
  const parsed = BigInt(value);
  if (parsed > maximum) fail("RPC quantity exceeds its supported range; no preflight snapshot was produced.");
  return parsed;
}

function words(value, count) {
  if (typeof value !== "string" || value.length !== 2 + count * 64 || !/^0x[0-9a-f]+$/i.test(value)) {
    fail("Invalid registry response; no preflight snapshot was produced.");
  }
  return Array.from({ length: count }, (_, index) => BigInt(`0x${value.slice(2 + index * 64, 66 + index * 64)}`));
}

function header(value, expectedHeight) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      typeof value.hash !== "string" || !/^0x[0-9a-f]{64}$/i.test(value.hash) || /^0x0{64}$/i.test(value.hash)) {
    fail("Invalid block header; no preflight snapshot was produced.");
  }
  const number = quantity(value.number);
  const timestamp = quantity(value.timestamp, MAX_DATE_SECONDS);
  if (expectedHeight !== undefined && number !== expectedHeight) fail("Block height changed; rerun the preflight.");
  return { number, timestamp, hash: value.hash.toLowerCase() };
}

const iso = (seconds) => new Date(Number(seconds) * 1000).toISOString();
const hex = (value) => `0x${value.toString(16)}`;
function okb(wei) {
  const fraction = (wei % 10n ** 18n).toString().padStart(18, "0").replace(/0+$/, "");
  return `${wei / 10n ** 18n}${fraction ? `.${fraction}` : ""}`;
}

async function responseJson(response) {
  if (!response || !response.ok || !response.body || typeof response.body.getReader !== "function") {
    fail("The public RPC request failed; no preflight snapshot was produced.");
  }
  const declaredSize = response.headers?.get("content-length");
  if (declaredSize !== null && declaredSize !== undefined &&
      (!/^\d+$/.test(declaredSize) || Number(declaredSize) > MAX_RESPONSE_BYTES)) {
    fail("RPC response exceeded the size limit; no preflight snapshot was produced.");
  }
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) fail("Invalid RPC response body; no preflight snapshot was produced.");
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) fail("RPC response exceeded the size limit; no preflight snapshot was produced.");
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } finally {
    // Do not wait on an uncooperative stream while enforcing the request deadline.
    void reader.cancel().catch(() => {});
  }
}

function createRpc(fetchImpl, totalSignal, requestTimeoutMs) {
  let nextId = 0;
  return async (method, params) => {
    if (!READ_METHODS.has(method)) fail("Only public read methods are permitted.");
    if (totalSignal.aborted) fail("Preflight time budget expired; no snapshot was produced.");
    const requestStarted = performance.now();
    const id = ++nextId;
    const controller = new AbortController();
    let timer;
    let abortTotal;
    const deadline = new Promise((_, reject) => {
      abortTotal = () => {
        controller.abort();
        reject(new PreflightError("Preflight time budget expired; no snapshot was produced."));
      };
      totalSignal.addEventListener("abort", abortTotal, { once: true });
      timer = setTimeout(() => {
        controller.abort();
        reject(new PreflightError("Public RPC request timed out; no preflight snapshot was produced."));
      }, requestTimeoutMs);
    });
    const request = Promise.resolve().then(async () => {
      const response = await fetchImpl(DEPLOYMENT.rpcUrl, {
        method: "POST", redirect: "error", signal: controller.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
      });
      const body = await responseJson(response);
      if (!body || typeof body !== "object" || Array.isArray(body) || body.jsonrpc !== "2.0" ||
          body.id !== id || Object.hasOwn(body, "error") || !Object.hasOwn(body, "result")) {
        fail("Invalid or unsuccessful RPC reply; no preflight snapshot was produced.");
      }
      return body.result;
    });
    try {
      const result = await Promise.race([request, deadline]);
      if (performance.now() - requestStarted >= requestTimeoutMs) {
        fail("Public RPC request timed out; no preflight snapshot was produced.");
      }
      return result;
    } catch (error) {
      if (error instanceof PreflightError) throw error;
      fail("The public RPC could not be read; no preflight snapshot was produced.");
    } finally {
      clearTimeout(timer);
      totalSignal.removeEventListener("abort", abortTotal);
      controller.abort();
    }
  };
}

/** Import-safe; injected fetch is for offline regressions. No wallet or private configuration is used. */
export async function readWalletPreflight({
  fetchImpl = globalThis.fetch, requestTimeoutMs = 5_000, totalTimeoutMs = 25_000,
} = {}) {
  if (typeof fetchImpl !== "function" || !Number.isInteger(requestTimeoutMs) || requestTimeoutMs < 1 || requestTimeoutMs > 60_000 ||
      !Number.isInteger(totalTimeoutMs) || totalTimeoutMs < 1 || totalTimeoutMs > 120_000) {
    fail("Invalid preflight transport limits.");
  }
  if (DEPLOYMENT.status !== "testnet" || DEPLOYMENT.chainId !== 1952 ||
      DEPLOYMENT.registryAddress !== "0xe844152262D243a7B90F6e07FF7A67F1d7FeD216" ||
      DEPLOYMENT.rpcUrl !== "https://testrpc.xlayer.tech/terigon") {
    fail("The committed deployment changed; review this preflight before use.");
  }
  const totalController = new AbortController();
  const startedAt = performance.now();
  const totalTimer = setTimeout(() => totalController.abort(), totalTimeoutMs);
  const rpc = createRpc(fetchImpl, totalController.signal, requestTimeoutMs);
  const assertChain = async () => {
    if (quantity(await rpc("eth_chainId", [])) !== 1952n) fail("Expected X Layer testnet (1952); no preflight snapshot was produced.");
  };
  try {
    await assertChain();
    const block = header(await rpc("eth_getBlockByNumber", ["latest", false]));
    const height = hex(block.number);
    const day = block.timestamp / DAY;
    const code = await rpc("eth_getCode", [DEPLOYMENT.registryAddress, height]);
    if (typeof code !== "string" || !/^0x(?:[0-9a-f]{2})+$/i.test(code)) {
      fail("Registry bytecode is absent or malformed; no preflight snapshot was produced.");
    }
    const call = (functionName, args = []) => rpc("eth_call", [{
      to: DEPLOYMENT.registryAddress,
      data: encodeFunctionData({ abi: petRegistryAbi, functionName, args }),
    }, height]);
    const [approvedRaw, totalRaw, accountReads] = await Promise.all([
      call("APPROVED_COMMUNITY_ID"), call("communityStats", [1]),
      Promise.all(DEMO_ACCOUNTS.map(async (account) => ({
        ...account,
        results: await Promise.all([call("petOf", [account.address]), rpc("eth_getBalance", [account.address, height])]),
      }))),
    ]);
    if (words(approvedRaw, 1)[0] !== 1n) fail("Unexpected approved community; no preflight snapshot was produced.");
    const total = words(totalRaw, 1)[0];
    if (total > UINT64_MAX) fail("Invalid community total; no preflight snapshot was produced.");
    const accounts = accountReads.map(({ label, address, results: [petRaw, balanceRaw] }) => {
      const [existsWord, community, count, lastDay] = words(petRaw, 4);
      if (existsWord > 1n || community > UINT32_MAX || count > UINT32_MAX || lastDay > UINT64_MAX || lastDay > day ||
          (count === 0n && lastDay !== 0n) || (existsWord === 1n && community !== 1n) ||
          (existsWord === 0n && (community !== 0n || count !== 0n || lastDay !== 0n))) {
        fail("Inconsistent pet state; no preflight snapshot was produced.");
      }
      const exists = existsWord === 1n;
      const balance = quantity(balanceRaw);
      const careCount = Number(count);
      const progress = exists ? mapConfirmedPetProgress(careCount) : null;
      const due = exists && (count === 0n || lastDay < day);
      const careStatus = !exists ? "no-pet" : due ? "due" : "cooldown";
      const nextProgress = due && count < UINT32_MAX ? mapConfirmedPetProgress(careCount + 1) : null;
      return {
        label, address, balanceWei: balance.toString(), balanceOkb: okb(balance), gasSufficiency: "unverified",
        exists, communityId: Number(community), careCount, lastCareDay: lastDay.toString(),
        growthPoints: progress?.growthPoints ?? null, stage: progress?.stage ?? null, careStatus,
        nextCareAtIso: !exists ? null : iso(due ? block.timestamp : (lastDay + 1n) * DAY),
        oneCareWouldEvolveTo: nextProgress && nextProgress.stage !== progress.stage ? nextProgress.stage : null,
      };
    });
    if (accounts.reduce((sum, account) => sum + BigInt(account.careCount), 0n) > total) {
      fail("Community total contradicts the account reads; no preflight snapshot was produced.");
    }
    const [checkedBlock] = await Promise.all([
      rpc("eth_getBlockByNumber", [height, false]).then((value) => header(value, block.number)), assertChain(),
    ]);
    if (totalController.signal.aborted || performance.now() - startedAt >= totalTimeoutMs) {
      fail("Preflight time budget expired; no snapshot was produced.");
    }
    if (checkedBlock.hash !== block.hash || checkedBlock.timestamp !== block.timestamp) {
      fail("The source block changed during the preflight; rerun it.");
    }
    return {
      schemaVersion: 1, kind: "read-only-preflight", chainId: 1952, registry: DEPLOYMENT.registryAddress, registryCodePresent: true,
      observedAtIso: new Date().toISOString(),
      block: { number: block.number.toString(), hash: block.hash, timestampIso: iso(block.timestamp), utcDay: day.toString() },
      communityTotalCares: total.toString(), accounts,
      limitations: [
        "Read-only preparation, not browser acceptance or permission to submit a transaction.",
        "Balances are public testnet OKB; gas sufficiency is unverified.",
        "Registry bytecode presence is checked, not bytecode identity or a security audit.",
        "Due status uses this block's time and may change; recheck before the genuine wallet session.",
      ],
    };
  } finally {
    clearTimeout(totalTimer);
    totalController.abort();
  }
}

export async function runCli(args = process.argv.slice(2)) {
  if (args.length !== 0) fail("Usage: node docs/qa/wallet-preflight.mjs (no arguments)");
  const snapshot = await readWalletPreflight();
  console.log(JSON.stringify(snapshot, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error instanceof PreflightError ? error.message : "Preflight failed; no snapshot was produced.");
    process.exitCode = 1;
  });
}
