import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";
import { createRecoveryHarness, UPSTREAM } from "./rpc-recovery.mjs";

// Mocked upstream only: these tests prove proxy boundaries, not live recovery.
const call = (method = "eth_chainId", id = 1) => ({ jsonrpc: "2.0", id, method, params: [] });
const result = (payload) => Array.isArray(payload)
  ? payload.map((item) => ({ jsonrpc: "2.0", id: item.id, result: "0x7a0" }))
  : { jsonrpc: "2.0", id: payload.id, result: "0x7a0" };

async function setup(t, options = {}) {
  const forwarded = [];
  const harness = createRecoveryHarness({ port: 0, ...options, fetchImpl: options.fetchImpl ?? (async (url, init) => {
    forwarded.push({ url, init });
    return Response.json(result(JSON.parse(init.body)));
  }) });
  const url = await harness.start();
  t.after(() => harness.close());
  return { harness, url, forwarded };
}

function post(url, payload = call(), options = {}) {
  return fetch(url, {
    method: "POST", headers: { "content-type": "application/json", ...options.headers },
    body: JSON.stringify(payload), ...options,
  });
}

function rawRequest(url, { path, method = "POST", headers = {}, chunks, end = true } = {}) {
  let request;
  const response = new Promise((resolve, reject) => {
    request = httpRequest(url, { path: path ?? new URL(url).pathname, method, headers: { "content-type": "application/json", ...headers } }, (incoming) => {
      let body = "";
      incoming.setEncoding("utf8");
      incoming.on("data", (chunk) => { body += chunk; });
      incoming.on("end", () => resolve({ status: incoming.statusCode, headers: incoming.headers, body }));
    });
    request.on("error", reject);
    for (const chunk of chunks ?? [JSON.stringify(call())]) request.write(chunk);
    if (end) request.end();
  });
  return { request, response };
}

async function waitFor(predicate) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return;
    await delay(5);
  }
  assert.fail("Expected lifecycle condition did not occur.");
}

test("intentional failure → recovered fixed-upstream reads → failure, including an allowed batch", async (t) => {
  const { harness, url, forwarded } = await setup(t);
  assert.deepEqual(harness.status(), { mode: "fail", active: 0 });
  assert.equal((await post(url)).status, 503);
  assert.equal(forwarded.length, 0);
  harness.setMode("recover");
  const payload = ["eth_chainId", "eth_blockNumber", "eth_getBlockByNumber", "eth_call"].map(call);
  const response = await post(url, payload);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), result(payload));
  assert.equal(forwarded.length, 1);
  assert.equal(forwarded[0].url, UPSTREAM);
  assert.equal(forwarded[0].init.redirect, "error");
  assert.deepEqual(JSON.parse(forwarded[0].init.body), payload);
  harness.setMode("fail");
  assert.equal((await post(url)).status, 503);
  assert.equal(forwarded.length, 1);
  assert.throws(() => harness.setMode("anything"), /Expected fail or recover/);
});

test("write, signing and wallet methods reject the whole batch before forwarding", async (t) => {
  const { harness, url, forwarded } = await setup(t);
  harness.setMode("recover");
  for (const method of ["eth_sendTransaction", "eth_sendRawTransaction", "eth_sign", "personal_sign", "wallet_switchEthereumChain", "eth_getLogs"]) {
    assert.equal((await post(url, [call(), call(method, 2)])).status, 403, method);
  }
  assert.equal(forwarded.length, 0);
});

test("viem no-params chain/head reads forward unchanged, individually and in batches", async (t) => {
  const { harness, url, forwarded } = await setup(t);
  harness.setMode("recover");
  // viem omits optional params for these reads; JSON-RPC permits omission.
  const chain = { jsonrpc: "2.0", id: 0, method: "eth_chainId" };
  const head = { jsonrpc: "2.0", id: 1, method: "eth_blockNumber" };
  for (const payload of [chain, head, [chain, head]]) {
    const response = await post(url, payload);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), result(payload));
    assert.deepEqual(JSON.parse(forwarded.at(-1).init.body), payload);
  }
  assert.equal(forwarded.length, 3);
  for (const params of [null, {}, "", 0]) {
    assert.equal((await post(url, { ...chain, params })).status, 400);
  }
  assert.equal(forwarded.length, 3, "Explicit invalid params must not reach the upstream.");
});

test("strict loopback Host and browser Origin, with bounded CORS preflight", async (t) => {
  const { url, forwarded } = await setup(t);
  for (const origin of ["https://memepet.vercel.app", "http://127.0.0.1:3000", "null", "http://evil.example"]) {
    const response = await post(url, call(), { headers: { "content-type": "application/json", origin } });
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  }
  for (const host of ["evil.example", "127.0.0.1:1", "localhost.evil.example", "[::1]:18952"]) {
    assert.equal((await rawRequest(url, { headers: { host } }).response).status, 403);
  }
  assert.equal((await rawRequest(url, { headers: { host: `localhost:${new URL(url).port}` } }).response).status, 503);
  for (const origin of ["http://127.0.0.1:3462", "http://localhost:3462"]) {
    const response = await post(url, call(), { headers: { "content-type": "application/json", origin } });
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
    const preflight = await fetch(url, { method: "OPTIONS", headers: {
      origin, "access-control-request-method": "POST", "access-control-request-headers": "content-type",
    } });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-methods"), "POST");
  }
  assert.equal((await fetch(url, { method: "OPTIONS", headers: {
    origin: "http://localhost:3462", "access-control-request-method": "PUT",
  } })).status, 403);
  assert.equal((await fetch(url, { method: "OPTIONS", headers: {
    origin: "http://localhost:3462", "access-control-request-method": "POST", "access-control-request-headers": "authorization",
  } })).status, 403);
  assert.equal((await fetch(url, { method: "OPTIONS" })).status, 403);
  // No Origin is intentional for same-host Next.js server reads.
  assert.equal((await post(url)).status, 503);
  assert.equal(forwarded.length, 0);
});

test("only POST /rpc with JSON is accepted; there is no HTTP mode-changing endpoint", async (t) => {
  const { harness, url, forwarded } = await setup(t);
  for (const suffix of ["/recover", "/fail", "/status", "/rpc?mode=recover"]) {
    assert.equal((await post(new URL(suffix, url))).status, 404);
  }
  for (const method of ["GET", "PUT", "DELETE"]) {
    assert.equal((await fetch(url, { method })).status, 405);
  }
  assert.equal((await post(url, call(), { headers: { "content-type": "text/plain" } })).status, 415);
  assert.equal(harness.status().mode, "fail");
  assert.equal(forwarded.length, 0);
});

test("invalid JSON, request shapes, oversized batches and declared/chunked bodies never forward", async (t) => {
  const { harness, url, forwarded } = await setup(t, { limits: { bodyBytes: 512, batch: 2 } });
  harness.setMode("recover");
  for (const payload of [null, [], [call(), call(), call()], {}, { ...call(), jsonrpc: "1.0" },
    { ...call(), params: {} }, { ...call(), id: true }, { ...call(), id: "x".repeat(129) },
    { ...call(), params: Array(17).fill(0) }, { ...call(), upstream: "https://evil.example" }]) {
    assert.equal((await post(url, payload)).status, 400);
  }
  const notification = call();
  delete notification.id;
  assert.equal((await post(url, notification)).status, 400);
  assert.equal((await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: "{" })).status, 400);
  assert.equal((await post(url, { ...call(), params: ["x".repeat(1024)] })).status, 413);
  const chunked = rawRequest(url, { chunks: ["x".repeat(300), "x".repeat(300)] });
  assert.equal((await chunked.response).status, 413);
  assert.equal(forwarded.length, 0);
  assert.equal(harness.status().active, 0);
});

test("upstream failure, invalid JSON and oversized streamed response are bounded", async (t) => {
  for (const response of [new Response("no", { status: 500 }), new Response("not-json"), new Response(JSON.stringify({ result: "x".repeat(1000) }))]) {
    let cancelled = false;
    const { harness, url } = await setup(t, { limits: { responseBytes: 256 }, fetchImpl: async () => {
      const reader = response.body.getReader();
      return new Response(new ReadableStream({
        async pull(controller) { const item = await reader.read(); if (item.done) controller.close(); else controller.enqueue(item.value); },
        cancel() { cancelled = true; return reader.cancel(); },
      }), { status: response.status });
    } });
    harness.setMode("recover");
    assert.equal((await post(url)).status, 502);
    assert.equal(harness.status().active, 0);
    if (!response.ok) assert.equal(cancelled, true);
  }
});

test("deadline aborts upstream and frees the concurrency slot, then recovery works", async (t) => {
  let forwarded = 0;
  let aborted = false;
  const { harness, url } = await setup(t, { limits: { concurrent: 1, timeoutMs: 100 }, fetchImpl: async (_url, init) => {
    forwarded += 1;
    if (forwarded > 1) return Response.json(result(call()));
    return new Promise((_, reject) => init.signal.addEventListener("abort", () => {
      aborted = true; reject(init.signal.reason);
    }, { once: true }));
  } });
  harness.setMode("recover");
  const first = post(url);
  await waitFor(() => forwarded === 1);
  assert.equal((await post(url)).status, 429);
  assert.equal((await first).status, 504);
  assert.equal(aborted, true);
  assert.equal(harness.status().active, 0);
  assert.equal((await post(url)).status, 200);
});

test("stalled request body times out without forwarding and frees its slot", async (t) => {
  const { harness, url, forwarded } = await setup(t, { limits: { timeoutMs: 100 } });
  const stalled = rawRequest(url, { chunks: ["{"], end: false });
  assert.equal((await stalled.response).status, 504);
  stalled.request.destroy();
  assert.equal(forwarded.length, 0);
  assert.equal(harness.status().active, 0);
});

test("stalled upstream response body is cancelled at the deadline", async (t) => {
  let cancelled = false;
  const { harness, url } = await setup(t, { limits: { timeoutMs: 100 }, fetchImpl: async () => new Response(new ReadableStream({
    cancel() { cancelled = true; },
  })) });
  harness.setMode("recover");
  assert.equal((await post(url)).status, 504);
  assert.equal(cancelled, true);
  assert.equal(harness.status().active, 0);
});

test("unexpected upstream errors do not expose their raw messages", async (t) => {
  const { harness, url } = await setup(t, { fetchImpl: async () => { throw new Error("raw upstream payload must stay private"); } });
  harness.setMode("recover");
  const response = await post(url);
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: { message: "Upstream read unavailable." } });
});

test("client disconnect aborts an in-flight upstream read and releases the slot", async (t) => {
  let signal;
  const { harness, url } = await setup(t, { fetchImpl: async (_url, init) => {
    signal = init.signal;
    return new Promise((_, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }));
  } });
  harness.setMode("recover");
  const pending = rawRequest(url);
  const interrupted = pending.response.catch((error) => error);
  await waitFor(() => signal !== undefined);
  pending.request.destroy();
  await interrupted;
  await waitFor(() => harness.status().active === 0);
  assert.equal(signal.aborted, true);
});

test("shutdown aborts outstanding reads and closes its listener", async (t) => {
  let signal;
  const { harness, url } = await setup(t, { fetchImpl: async (_url, init) => {
    signal = init.signal;
    return new Promise((_, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }));
  } });
  harness.setMode("recover");
  const pending = post(url).catch((error) => error);
  await waitFor(() => signal !== undefined);
  await harness.close();
  await pending;
  await waitFor(() => harness.status().active === 0);
  assert.equal(signal.aborted, true);
  await assert.rejects(post(url));
});

test("configuration cannot widen default bounds", () => {
  for (const options of [{ port: -1 }, { limits: { batch: 21 } }, { limits: { bodyBytes: 0 } }, { limits: { other: 1 } }]) {
    assert.throws(() => createRecoveryHarness(options), /Invalid local harness configuration/);
  }
});
