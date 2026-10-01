#!/usr/bin/env node
// Local QA fault proxy, never a deployment endpoint or wallet RPC.
// Starts with intentional failures; type recover, fail or status in this terminal.
import { createServer } from "node:http";
import { createInterface } from "node:readline";
import { pathToFileURL } from "node:url";

export const UPSTREAM = "https://testrpc.xlayer.tech/terigon";
const ORIGINS = new Set(["http://127.0.0.1:3462", "http://localhost:3462"]);
const METHODS = new Set(["eth_chainId", "eth_blockNumber", "eth_getBlockByNumber", "eth_call"]);
const DEFAULT_LIMITS = { bodyBytes: 65_536, responseBytes: 2_097_152, batch: 20, concurrent: 4, timeoutMs: 8_000 };
const problem = (status, message) => Object.assign(new Error(message), { status });

function validateRpc(payload, batchLimit) {
  const calls = Array.isArray(payload) ? payload : [payload];
  if (calls.length === 0 || calls.length > batchLimit) throw problem(400, "Invalid batch size.");
  for (const call of calls) {
    if (!call || typeof call !== "object" || Array.isArray(call) || call.jsonrpc !== "2.0"
      || !Object.hasOwn(call, "id") || !(call.id === null || (typeof call.id === "number" && Number.isSafeInteger(call.id))
        || (typeof call.id === "string" && call.id.length <= 128))
      || (Object.hasOwn(call, "params") && (!Array.isArray(call.params) || call.params.length > 16))
      || Object.keys(call).some((key) => !["jsonrpc", "id", "method", "params"].includes(key))) {
      throw problem(400, "Invalid JSON-RPC request.");
    }
    if (!METHODS.has(call.method)) throw problem(403, "Only approved read methods are allowed.");
  }
}

function readBody(request, maxBytes, signal) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const finish = (error, value) => {
      request.off("data", onData).off("end", onEnd).off("error", onError);
      signal.removeEventListener("abort", onAbort);
      if (error) { request.resume(); reject(error); } else resolve(value);
    };
    const onData = (chunk) => {
      size += chunk.length;
      if (size > maxBytes) finish(problem(413, "Request body too large."));
      else chunks.push(chunk);
    };
    const onEnd = () => finish(null, Buffer.concat(chunks).toString("utf8"));
    const onError = () => finish(problem(400, "Request body interrupted."));
    const onAbort = () => finish(signal.reason);
    request.on("data", onData).on("end", onEnd).on("error", onError);
    signal.addEventListener("abort", onAbort, { once: true });
    if (signal.aborted) onAbort();
  });
}

async function readResponse(response, maxBytes, signal) {
  if (!response.ok || !response.body) {
    void response.body?.cancel().catch(() => {});
    throw problem(502, "Upstream read failed.");
  }
  const reader = response.body.getReader();
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      if (signal.aborted) throw signal.reason;
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw problem(502, "Upstream response too large.");
      chunks.push(Buffer.from(value));
    }
    const body = Buffer.concat(chunks).toString("utf8");
    try { JSON.parse(body); } catch { throw problem(502, "Upstream returned invalid JSON."); }
    return body;
  } finally {
    signal.removeEventListener("abort", cancel);
    cancel();
  }
}

// fetch/limit injection is solely for isolated regressions. CLI always uses the
// fixed upstream, default limits and loopback binding; it accepts no arguments.
export function createRecoveryHarness({ port = 18952, fetchImpl = fetch, limits = {} } = {}) {
  const cap = { ...DEFAULT_LIMITS, ...limits };
  if (!Number.isInteger(port) || port < 0 || port > 65535
    || Object.entries(cap).some(([key, value]) => !Object.hasOwn(DEFAULT_LIMITS, key)
      || !Number.isInteger(value) || value < 1 || value > DEFAULT_LIMITS[key])) {
    throw new Error("Invalid local harness configuration.");
  }
  let mode = "fail";
  const active = new Set();
  const server = createServer(async (request, response) => {
    const send = (status, body) => {
      if (response.destroyed || response.writableEnded) return;
      response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
      response.end(typeof body === "string" ? body : JSON.stringify({ error: body }));
    };
    const boundPort = server.address()?.port;
    if (![ `127.0.0.1:${boundPort}`, `localhost:${boundPort}` ].includes(request.headers.host)) {
      request.resume(); return send(403, { message: "Loopback Host required." });
    }
    const origin = request.headers.origin;
    if (origin !== undefined && !ORIGINS.has(origin)) {
      request.resume(); return send(403, { message: "Origin not allowed." });
    }
    if (origin) {
      response.setHeader("access-control-allow-origin", origin);
      response.setHeader("vary", "Origin");
    }
    if (request.url !== "/rpc") { request.resume(); return send(404, { message: "Not found." }); }
    if (request.method === "OPTIONS") {
      const requestedHeaders = (request.headers["access-control-request-headers"] ?? "").toLowerCase().split(",").map((v) => v.trim()).filter(Boolean);
      if (!origin || request.headers["access-control-request-method"] !== "POST"
        || requestedHeaders.some((header) => header !== "content-type")) {
        request.resume(); return send(403, { message: "Preflight not allowed." });
      }
      response.setHeader("access-control-allow-methods", "POST");
      response.setHeader("access-control-allow-headers", "Content-Type");
      request.resume(); response.writeHead(204); response.end(); return;
    }
    if (request.method !== "POST") { request.resume(); return send(405, { message: "POST required." }); }
    if (request.headers["content-type"]?.split(";")[0].trim().toLowerCase() !== "application/json") {
      request.resume(); return send(415, { message: "JSON required." });
    }
    if (Number(request.headers["content-length"]) > cap.bodyBytes) {
      request.resume(); return send(413, { message: "Request body too large." });
    }
    if (active.size >= cap.concurrent) { request.resume(); return send(429, { message: "Local harness busy." }); }
    const controller = new AbortController();
    active.add(controller);
    const timeout = setTimeout(() => controller.abort(problem(504, "Local read deadline exceeded.")), cap.timeoutMs);
    const disconnected = () => { if (!response.writableEnded) controller.abort(problem(499, "Client disconnected.")); };
    request.on("aborted", disconnected);
    response.on("close", disconnected);
    let onAbort;
    try {
      const work = async () => {
        const raw = await readBody(request, cap.bodyBytes, controller.signal);
        let payload;
        try { payload = JSON.parse(raw); } catch { throw problem(400, "Invalid JSON."); }
        validateRpc(payload, cap.batch);
        if (mode === "fail") throw problem(503, "Intentional local QA read failure; type recover in the harness terminal.");
        const upstream = await fetchImpl(UPSTREAM, {
          method: "POST", redirect: "error", headers: { "content-type": "application/json" },
          body: JSON.stringify(payload), signal: controller.signal,
        });
        return readResponse(upstream, cap.responseBytes, controller.signal);
      };
      const cancelled = new Promise((_, reject) => {
        onAbort = () => reject(controller.signal.reason);
        controller.signal.addEventListener("abort", onAbort, { once: true });
      });
      send(200, await Promise.race([work(), cancelled]));
    } catch (error) {
      send(error.status ?? 502, { message: error.status ? error.message : "Upstream read unavailable." });
    } finally {
      clearTimeout(timeout);
      controller.signal.removeEventListener("abort", onAbort);
      request.off("aborted", disconnected);
      response.off("close", disconnected);
      active.delete(controller);
    }
  });
  server.headersTimeout = 10_000;
  server.requestTimeout = 12_000;
  server.keepAliveTimeout = 1_000;
  return {
    async start() {
      await new Promise((resolve, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", resolve); });
      return `http://127.0.0.1:${server.address().port}/rpc`;
    },
    status: () => ({ mode, active: active.size }),
    setMode(next) {
      if (!["fail", "recover"].includes(next)) throw new Error("Expected fail or recover.");
      mode = next;
    },
    async close() {
      for (const controller of active) controller.abort(problem(503, "Local harness stopped."));
      await new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); });
    },
  };
}

async function main() {
  if (process.argv.length !== 2) throw new Error("Usage: node docs/qa/rpc-recovery.mjs (no arguments).");
  const harness = createRecoveryHarness();
  const url = await harness.start();
  console.log(`Local read-only QA proxy: ${url}\nMode: fail (intentional HTTP 503). Commands: recover, fail, status. Ctrl+C stops it.`);
  const terminal = createInterface({ input: process.stdin });
  let stopping = false;
  const stop = async () => { if (stopping) return; stopping = true; terminal.close(); await harness.close(); };
  terminal.on("line", (line) => {
    const command = line.trim().toLowerCase();
    if (["recover", "fail"].includes(command)) harness.setMode(command);
    if (["recover", "fail", "status"].includes(command)) console.log(harness.status());
    else console.log("Commands: recover, fail, status. Ctrl+C stops it.");
  });
  terminal.on("close", stop);
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
