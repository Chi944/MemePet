import type { CommunityIdentityState } from "@/types/finale-community";
import type { Deployment } from "./deployment";

/** Text-only identity evidence, not a token integration or permission to use artwork.
 * Independently checked against the official OKX announcement and mainnet RPC
 * block 72009389. See docs/qa/evidence/FINALE_INTEGRATION_2026-09-30.md.
 */
const xdogReference: CommunityIdentityState = {
  kind: "verified-reference",
  name: "XDOG",
  chainId: 196,
  networkLabel: "X Layer mainnet",
  tokenAddress: "0x0cc24c51BF89c00c5afFBfCf5E856C25ecBdb48e",
  sourceUrl: "https://web3.okx.com/help/announcement-on-xdog-and-penguin-listing-on-okx-boost-ranking",
  checkedAtIso: "2026-09-30T14:27:07.577Z",
  dataMode: "live",
};

/** Local or future deployments must not silently inherit this reference choice. */
export function communityReferenceFor(deployment: Deployment): CommunityIdentityState {
  return deployment.status === "testnet" && deployment.chainId === 1952 &&
    deployment.registryAddress?.toLowerCase() === "0xe844152262d243a7b90f6e07ff7a67f1d7fed216"
    ? xdogReference : { kind: "unconfigured" };
}
