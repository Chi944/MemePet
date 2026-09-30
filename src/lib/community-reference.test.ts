import { describe, expect, it } from "vitest";
import { communityReferenceFor } from "./community-reference";
import { DEPLOYMENT, type Deployment } from "./deployment";

describe("deployment-scoped community reference", () => {
  it("uses the independently checked mainnet reference only for the known testnet registry", () => {
    expect(communityReferenceFor(DEPLOYMENT)).toEqual({
      kind: "verified-reference",
      name: "XDOG",
      chainId: 196,
      networkLabel: "X Layer mainnet",
      tokenAddress: "0x0cc24c51BF89c00c5afFBfCf5E856C25ecBdb48e",
      sourceUrl: "https://web3.okx.com/help/announcement-on-xdog-and-penguin-listing-on-okx-boost-ranking",
      checkedAtIso: "2026-09-30T14:27:07.577Z",
      dataMode: "live",
    });
    expect(DEPLOYMENT.chainId).toBe(1952);
  });

  it("recognizes the same registry independent of address casing", () => {
    const identity = communityReferenceFor({
      ...DEPLOYMENT,
      registryAddress: DEPLOYMENT.registryAddress!.toLowerCase(),
    });
    expect(identity.kind).toBe("verified-reference");
  });

  const otherDeployments: ReadonlyArray<[string, Partial<Deployment>]> = [
    ["another registry on the same testnet", { registryAddress: "0x1111111111111111111111111111111111111111" }],
    ["the reference token address used as a registry", { registryAddress: "0x0cc24c51BF89c00c5afFBfCf5E856C25ecBdb48e" }],
    ["a missing registry", { registryAddress: null }],
    ["a missing chain", { chainId: null }],
    ["the same registry address on mainnet", { chainId: 196, status: "mainnet" }],
    ["another testnet", { chainId: 11155111 }],
    ["a local deployment reusing the chain and registry", { status: "local" }],
    ["an undeployed configuration retaining the chain and registry", { status: "not-deployed" }],
  ];

  it.each(otherDeployments)("leaves %s unconfigured", (_label, override) => {
    expect(communityReferenceFor({ ...DEPLOYMENT, ...override })).toEqual({ kind: "unconfigured" });
  });
});
