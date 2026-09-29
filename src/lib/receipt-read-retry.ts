function isReadTemporarilyUnavailable(error: unknown): boolean {
  const visited = new Set<unknown>();
  let cause = error;
  let unavailableHeaderWrapper = false;
  let internalRpcCause = false;
  while (typeof cause === "object" && cause !== null && !visited.has(cause)) {
    visited.add(cause);
    const detail = cause as {
      name?: string; code?: number; status?: number; cause?: unknown;
      data?: unknown; raw?: unknown; signature?: unknown; reason?: unknown;
    };
    if (detail.name === "ContractFunctionRevertedError") {
      // viem can wrap an RPC -32603 (for example, "header not found") as a
      // contract revert. Only look through this specific provider message with
      // no revert payload and a nested -32603. ABI errors and other reasons
      // stay terminal; the wrapper name alone cannot classify the RPC failure.
      const unavailableState = typeof detail.reason === "string" &&
        /^header not found$/i.test(detail.reason.trim());
      if (detail.data !== undefined || detail.raw !== undefined ||
          detail.signature !== undefined || !unavailableState) return false;
      unavailableHeaderWrapper = true;
    }
    if (unavailableHeaderWrapper) {
      // Check the whole nested cause chain: viem may put an UnknownRpcError
      // (-1) above an actual execution-reverted code (3).
      if (detail.code === 3) return false;
      if (detail.code === -32603) internalRpcCause = true;
      cause = detail.cause;
      continue;
    }
    if (detail.name === "BlockNotFoundError" || detail.name === "TimeoutError") return true;
    if (detail.name === "HttpRequestError") {
      return detail.status === undefined || [408, 429, 500, 502, 503, 504].includes(detail.status);
    }
    if (typeof detail.code === "number" && [-1, -32000, -32001, -32002, -32005, -32007, -32603, 429].includes(detail.code)) {
      return true;
    }
    cause = detail.cause;
  }
  return unavailableHeaderWrapper && internalRpcCause;
}

/** Retry unavailable RPC state at one receipt block; never retry a wallet write. */
export async function readReceiptWithRetry<T>(
  blockNumber: bigint,
  read: (blockNumber: bigint) => Promise<T>,
  isCurrent: () => boolean,
): Promise<T | undefined> {
  for (let attempt = 0; ; attempt += 1) {
    if (!isCurrent()) return undefined;
    try {
      const result = await read(blockNumber);
      return isCurrent() ? result : undefined;
    } catch (error) {
      if (!isCurrent()) return undefined;
      if (attempt >= 2 || !isReadTemporarilyUnavailable(error)) throw error;
      await new Promise<void>((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
}
