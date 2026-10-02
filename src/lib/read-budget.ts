import { readWithRetry } from "./receipt-read-retry";

export const RPC_READ_HTTP_OPTIONS = { timeout: 4_000, retryCount: 0 } as const;
export const RPC_READ_BUDGET_MS = 15_000;

/**
 * Bound a read snapshot, including its retry delays. The HTTP transport limits
 * each request; this deadline also stops a stalled adapter from holding the UI.
 * Call canRead between requests so an expired or superseded snapshot cannot
 * start more work. A late response is ignored. Never wrap wallet writes or
 * receipt confirmation in this short read budget.
 */
export async function readWithBudget<T>(
  read: (canRead: () => boolean) => Promise<T | undefined>,
  isCurrent: () => boolean = () => true,
): Promise<T | undefined> {
  let active = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const canRead = () => active && isCurrent();

  try {
    return await Promise.race([
      readWithRetry(() => read(canRead), canRead),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          active = false;
          reject(new Error("The RPC read budget expired."));
        }, RPC_READ_BUDGET_MS);
      }),
    ]);
  } finally {
    active = false;
    if (timer !== undefined) clearTimeout(timer);
  }
}
