import { test } from "@playwright/test";
import { SIMULATED_LABEL } from "./support/simulated-chain";

/**
 * NOT RUN / TODO. These depend on the lead's B5 recovery adapter, which stays
 * gated on genuine final wallet acceptance. They are declared as fixme so the
 * report shows them as skipped, never as passing placeholders.
 */
test.describe(`${SIMULATED_LABEL}: transaction recovery after refresh (NOT RUN — awaits B5 adapter)`, () => {
  const cases = [
    "refresh while pending shows the saved public hash and Check status reads it",
    "a confirmed receipt with failed fact reads stays confirmed-awaiting-facts",
    "a reverted receipt awards nothing",
    "a replacement hash is shown separately and is not a confirmation",
    "malformed, oversized and foreign-scope records are ignored",
    "unavailable storage still shows the returned hash",
    "account, network and provider changes hide another scope's record",
    "Check status never requests a signature or submits again",
  ];
  for (const name of cases) {
    test.fixme(`SIMULATED TODO: ${name}`, async () => {});
  }
});
