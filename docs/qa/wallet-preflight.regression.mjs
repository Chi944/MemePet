import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { DEMO_ACCOUNTS, readWalletPreflight, runCli } from "./wallet-preflight.mjs";

const execFileAsync = promisify(execFile);
const word = (value) => BigInt(value).toString(16).padStart(64, "0");
const abi = (...values) => `0x${values.map(word).join("")}`;
const quantity = (value) => `0x${BigInt(value).toString(16)}`;
const HEIGHT = "0xc8";
const DAY = 20_000n;
const HEADER = { number: HEIGHT, hash: `0x${"1".repeat(64)}`, timestamp: quantity(DAY * 86_400n + 43_200n) };
const METHODS = new Set(["eth_chainId", "eth_getBlockByNumber", "eth_call", "eth_getBalance", "eth_getCode"]);

function harness({ reply, transport } = {}) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    assert.equal(url, "https://testrpc.xlayer.tech/terigon");
    assert.equal(options.method, "POST");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    const call = JSON.parse(options.body);
    assert.ok(METHODS.has(call.method), `Not a read-only method: ${call.method}`);
    calls.push(call);
    let fallback;
    if (call.method === "eth_chainId") fallback = "0x7a0";
    if (call.method === "eth_getBlockByNumber") fallback = { ...HEADER };
    if (call.method === "eth_getCode") fallback = "0x6000";
    if (call.method === "eth_getBalance") fallback = quantity(2_000_000_000_000_000n);
    if (call.method === "eth_call") {
      assert.equal(call.params[0].to, "0xe844152262D243a7B90F6e07FF7A67F1d7FeD216");
      const data = call.params[0].data;
      if (data === "0xf7279776") fallback = abi(1);
      else if (data === `0x4f26bd5c${word(1)}`) fallback = abi(12);
      else {
        assert.match(data, /^0xa8379ea2[0-9a-f]{64}$/i);
        const address = `0x${data.slice(-40)}`;
        assert.ok(DEMO_ACCOUNTS.some((account) => account.address.toLowerCase() === address.toLowerCase()));
        fallback = abi(1, 1, address.toLowerCase() === DEMO_ACCOUNTS[3].address.toLowerCase() ? 1 : 3, DAY - 1n);
      }
    }
    const result = reply ? await reply(call, fallback, calls) : fallback;
    if (transport) return transport(call, result, options, calls);
    return Response.json({ jsonrpc: "2.0", id: call.id, result });
  };
  return { calls, fetchImpl };
}

function petReply(values) {
  return (call, fallback) => call.method === "eth_call" && call.params[0].data.startsWith("0xa8379ea2") ? abi(...values) : fallback;
}

test("import has no RPC calls or CLI output", async () => {
  const scriptUrl = new URL("./wallet-preflight.mjs", import.meta.url).href;
  const { stdout, stderr } = await execFileAsync(process.execPath, ["--input-type=module", "-e", `
    globalThis.fetch = () => { throw new Error('Import attempted a network request'); };
    await import(${JSON.stringify(scriptUrl)});
  `], { timeout: 10_000 });
  assert.equal(stdout, "");
  // Native TS stripping may emit Node's informational module-format warning.
  assert.ok(stderr === "" || stderr.includes("[MODULE_TYPELESS_PACKAGE_JSON]"));
});

test("all account balances and registry reads pin one block and recheck its header/chain", async () => {
  const fake = harness();
  const result = await readWalletPreflight(fake);
  assert.equal(result.kind, "read-only-preflight");
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.registryCodePresent, true);
  assert.equal(result.block.number, "200");
  assert.equal(result.block.hash, HEADER.hash);
  assert.equal(result.block.utcDay, DAY.toString());
  assert.equal(result.communityTotalCares, "12");
  assert.equal(result.accounts.length, 4);
  assert.ok(fake.calls.filter(({ method }) => method === "eth_call" || method === "eth_getBalance" || method === "eth_getCode")
    .every(({ params }) => params[1] === HEIGHT));
  assert.deepEqual(fake.calls.filter(({ method }) => method === "eth_getBlockByNumber").map(({ params }) => params),
    [["latest", false], [HEIGHT, false]]);
  assert.equal(fake.calls.filter(({ method }) => method === "eth_chainId").length, 2);
  assert.equal(new Set(fake.calls.map(({ id }) => id)).size, fake.calls.length);
  assert.equal(result.accounts[3].oneCareWouldEvolveTo, "buddy");
  assert.equal(result.accounts[0].stage, "buddy");
  assert.equal(result.accounts[0].growthPoints, 30);
  assert.equal(result.accounts[0].oneCareWouldEvolveTo, null);
  assert.equal(result.accounts[0].careStatus, "due");
  assert.equal(result.accounts[0].balanceWei, "2000000000000000");
  assert.equal(result.accounts[0].balanceOkb, "0.002");
  assert.equal(result.accounts[0].gasSufficiency, "unverified");
  assert.match(result.limitations.join(" "), /not browser acceptance/);
  assert.doesNotThrow(() => JSON.stringify(result));
});

test("no pet is distinct from an adopted zero-care pet", async () => {
  const absent = await readWalletPreflight(harness({ reply: petReply([0, 0, 0, 0]) }));
  assert.ok(absent.accounts.every((account) => !account.exists && account.careStatus === "no-pet" &&
    account.stage === null && account.growthPoints === null && account.nextCareAtIso === null));
  const adopted = await readWalletPreflight(harness({ reply: petReply([1, 1, 0, 0]) }));
  assert.ok(adopted.accounts.every((account) => account.exists && account.careStatus === "due" &&
    account.stage === "hatchling" && account.growthPoints === 0));
});

test("chain day, not computer date, determines cooldown and exact UTC reset", async () => {
  const result = await readWalletPreflight(harness({ reply: petReply([1, 1, 1, DAY]) }));
  assert.ok(result.accounts.every((account) => account.careStatus === "cooldown" &&
    account.nextCareAtIso === new Date(Number((DAY + 1n) * 86_400n) * 1000).toISOString() &&
    account.oneCareWouldEvolveTo === null));
});

test("epoch-day zero follows the care-count guard", async () => {
  const result = await readWalletPreflight(harness({ reply(call, fallback) {
    if (call.method === "eth_getBlockByNumber") return { ...HEADER, timestamp: "0x1" };
    return petReply([1, 1, 1, 0])(call, fallback);
  } }));
  assert.ok(result.accounts.every((account) => account.careStatus === "cooldown"));
});

test("one due care at four cares predicts Guardian without awarding it", async () => {
  const result = await readWalletPreflight(harness({ reply(call, fallback) {
    if (call.method === "eth_call" && call.params[0].data.startsWith("0x4f26bd5c")) return abi(16);
    return petReply([1, 1, 4, DAY - 1n])(call, fallback);
  } }));
  assert.ok(result.accounts.every((account) => account.stage === "buddy" && account.growthPoints === 40 &&
    account.oneCareWouldEvolveTo === "guardian"));
});

test("zero and large balances retain exact decimal precision", async () => {
  const amounts = [0n, 1n, 1_234_567_890_123_456_789n, (1n << 256n) - 1n];
  const fake = harness({ reply(call, fallback) {
    if (call.method !== "eth_getBalance") return fallback;
    return quantity(amounts[DEMO_ACCOUNTS.findIndex(({ address }) => address === call.params[0])]);
  } });
  const result = await readWalletPreflight(fake);
  assert.deepEqual(result.accounts.map(({ balanceWei }) => balanceWei), amounts.map(String));
  assert.equal(result.accounts[0].balanceOkb, "0");
  assert.equal(result.accounts[1].balanceOkb, "0.000000000000000001");
  assert.equal(result.accounts[2].balanceOkb, "1.234567890123456789");
});

test("wrong initial chain stops before reading accounts", async () => {
  const fake = harness({ reply: () => "0x1" });
  await assert.rejects(readWalletPreflight(fake), /Expected X Layer testnet/);
  assert.deepEqual(fake.calls.map(({ method }) => method), ["eth_chainId"]);
});

test("a final chain switch invalidates the complete snapshot", async () => {
  const fake = harness({ reply(call, fallback, calls) {
    return call.method === "eth_chainId" && calls.filter(({ method }) => method === "eth_chainId").length === 2 ? "0x1" : fallback;
  } });
  await assert.rejects(readWalletPreflight(fake), /Expected X Layer testnet/);
});

test("final header hash, timestamp and height changes fail closed", async () => {
  for (const change of [{ hash: `0x${"2".repeat(64)}` }, { timestamp: quantity(DAY * 86_400n) }, { number: "0xc9" }]) {
    await assert.rejects(readWalletPreflight(harness({ reply(call, fallback) {
      return call.method === "eth_getBlockByNumber" && call.params[0] !== "latest" ? { ...fallback, ...change } : fallback;
    } })), /changed/);
  }
});

test("invalid block headers cannot become a baseline", async () => {
  for (const value of [null, [], {}, { ...HEADER, hash: `0x${"0".repeat(64)}` },
    { ...HEADER, hash: "private provider text" }, { ...HEADER, number: "0x00" },
    { ...HEADER, number: "-1" }, { ...HEADER, number: `0x1${"0".repeat(64)}` },
    { ...HEADER, timestamp: quantity(8_640_000_000_001n) }]) {
    await assert.rejects(readWalletPreflight(harness({ reply(call, fallback) {
      return call.method === "eth_getBlockByNumber" ? value : fallback;
    } })), /Invalid|range/);
  }
});

test("malformed ABI and inconsistent pet tuples fail rather than creating empty or earned state", async () => {
  for (const value of ["0x", abi(1), `${abi(1, 1, 1, DAY)}00`, abi(2, 1, 1, DAY),
    abi(1, 2, 1, DAY), abi(1, 1, 1n << 32n, DAY), abi(1, 1, 1, 1n << 64n),
    abi(1, 1, 1, DAY + 1n), abi(1, 1, 0, DAY), abi(0, 1, 0, 0), abi(0, 0, 1, 0)]) {
    await assert.rejects(readWalletPreflight(harness({ reply(call, fallback) {
      return call.method === "eth_call" && call.params[0].data.startsWith("0xa8379ea2") ? value : fallback;
    } })), /Invalid registry|Inconsistent pet/);
  }
});

test("invalid approved community and contradictory community totals fail", async () => {
  for (const [selector, value] of [["0xf7279776", abi(2)], ["0x4f26bd5c", abi(1n << 64n)], ["0x4f26bd5c", abi(9)]]) {
    await assert.rejects(readWalletPreflight(harness({ reply(call, fallback) {
      return call.method === "eth_call" && call.params[0].data.startsWith(selector) ? value : fallback;
    } })), /community|Community/);
  }
});

test("empty or malformed registry code fails before any account reads", async () => {
  for (const value of ["0x", "0x0", "0xno-code", null]) {
    const fake = harness({ reply: (call, fallback) => call.method === "eth_getCode" ? value : fallback });
    await assert.rejects(readWalletPreflight(fake), /bytecode is absent or malformed/);
    assert.equal(fake.calls.some(({ method }) => method === "eth_getBalance" || method === "eth_call"), false);
  }
});

test("failed or malformed balances never produce a zero-balance account", async () => {
  for (const value of [null, "0x", "0x00", "-1", 1, `0x1${"0".repeat(64)}`]) {
    await assert.rejects(readWalletPreflight(harness({ reply(call, fallback) {
      return call.method === "eth_getBalance" ? value : fallback;
    } })), /quantity/);
  }
});

test("JSON-RPC envelope mismatch, error and missing result fail without provider text", async () => {
  for (const mutate of [
    (body) => ({ ...body, id: 999 }), (body) => ({ ...body, jsonrpc: "1.0" }),
    (body) => ({ ...body, error: { message: "SECRET_OR_PRIVATE_PROVIDER_DETAIL" } }),
    (body) => { const copy = { ...body }; delete copy.result; return copy; }, () => null, () => [],
  ]) {
    await assert.rejects(readWalletPreflight(harness({ transport(call, result) {
      return Response.json(mutate({ jsonrpc: "2.0", id: call.id, result }));
    } })), (error) => /Invalid or unsuccessful/.test(error.message) && !error.message.includes("SECRET"));
  }
});

test("HTTP, invalid JSON, invalid UTF-8 and transport errors are sanitized", async () => {
  for (const transport of [
    () => new Response("PRIVATE", { status: 500 }),
    () => new Response("PRIVATE_NOT_JSON"),
    () => new Response(new Uint8Array([0xff, 0xfe])),
    () => { throw new Error("PRIVATE_PROVIDER_CREDENTIALS"); },
  ]) {
    await assert.rejects(readWalletPreflight(harness({ transport })), (error) =>
      /no preflight snapshot was produced/.test(error.message) && !error.message.includes("PRIVATE"));
  }
});

test("declared or streamed oversized responses are bounded", async () => {
  for (const transport of [
    () => new Response("{}", { headers: { "content-length": "65537" } }),
    () => new Response("x".repeat(65_537)),
  ]) {
    await assert.rejects(readWalletPreflight(harness({ transport })), /size limit/);
  }
});

test("an uncooperative fetch times out without waiting for its promise", async () => {
  let signal;
  const started = performance.now();
  await assert.rejects(readWalletPreflight({ fetchImpl: (_url, options) => {
    signal = options.signal;
    return new Promise(() => {});
  }, requestTimeoutMs: 15, totalTimeoutMs: 100 }), /request timed out/);
  assert.ok(signal.aborted);
  assert.ok(performance.now() - started < 2_000);
});

test("a body that stalls after response headers is covered by the request deadline", async () => {
  const started = performance.now();
  await assert.rejects(readWalletPreflight({
    ...harness({ transport: () => new Response(new ReadableStream({ pull: () => new Promise(() => {}) })) }),
    requestTimeoutMs: 15, totalTimeoutMs: 100,
  }), /request timed out/);
  assert.ok(performance.now() - started < 2_000);
});

test("the whole-run deadline bounds multiple otherwise timely calls", async () => {
  const fake = harness({ async transport(call, result) {
    await new Promise((resolve) => setTimeout(resolve, 15));
    return Response.json({ jsonrpc: "2.0", id: call.id, result });
  } });
  await assert.rejects(readWalletPreflight({ ...fake, requestTimeoutMs: 100, totalTimeoutMs: 25 }), /time budget expired/);
});

test("invalid transport limits and CLI arguments fail before a network read", async () => {
  for (const options of [{ requestTimeoutMs: 0 }, { totalTimeoutMs: Infinity }, { totalTimeoutMs: 120_001 },
    { requestTimeoutMs: 60_001 }, { fetchImpl: null }]) {
    await assert.rejects(readWalletPreflight(options), /Invalid preflight transport limits/);
  }
  await assert.rejects(runCli(["--private-key", "do-not-use"]), /Usage/);
});
