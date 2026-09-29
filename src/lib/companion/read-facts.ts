import { createPublicClient, getAddress, http, isAddress, type Address } from "viem";
import type { CompanionFactsState } from "@/types/companion";
import { nextUtcDayStartIso, utcDayFromUnixSeconds } from "../care-cooldown";
import { chainFromDeployment } from "../chains";
import { isRegistryConfigured, type Deployment } from "../deployment";
import { APPROVED_COMMUNITY_ID, mapConfirmedPetProgress } from "../pet-progress";
import { petRegistryAbi } from "../pet-registry-abi";
import { readReceiptWithRetry } from "../receipt-read-retry";

const READ_ERROR = "Mochi's confirmed activity could not be read. Please retry the read.";
const READ_BUDGET_MS = 15_000;
const HTTP_TIMEOUT_MS = 4_000;
const MAX_UINT32 = 2 ** 32 - 1;
const MAX_UINT64 = (BigInt(1) << BigInt(64)) - BigInt(1);
const MAX_UINT256 = (BigInt(1) << BigInt(256)) - BigInt(1);
const MAX_DATE_SECONDS = BigInt(8_640_000_000_000);

function unavailable(): CompanionFactsState {
  return { kind: "unavailable", dataMode: "live", message: READ_ERROR };
}

function validBlock(block: {
  number: bigint | null;
  hash: string | null;
  timestamp: bigint;
}): block is { number: bigint; hash: `0x${string}`; timestamp: bigint } {
  return typeof block.number === "bigint" && block.number >= BigInt(0) &&
    block.number <= MAX_UINT256 && typeof block.hash === "string" &&
    /^0x[\da-f]{64}$/i.test(block.hash) && typeof block.timestamp === "bigint" &&
    block.timestamp >= BigInt(0) && block.timestamp <= MAX_DATE_SECONDS;
}

/**
 * Read-only, block-pinned facts from the configured registry, never fixtures.
 * A receipt block can anchor a post-transaction read. "Latest" is otherwise
 * resolved once; every contract read uses that exact height. A final hash check
 * rejects a snapshot if its source block changed during the reads.
 */
export async function readCompanionFacts({ deployment, address, blockNumber }: {
  readonly deployment: Deployment;
  readonly address: Address;
  readonly blockNumber?: bigint;
}): Promise<CompanionFactsState> {
  const startedAt = Date.now();
  // Reserve one HTTP timeout before starting a call so no new RPC request is
  // issued at the end of the overall budget. The route has its own outer bound.
  const canRead = () => Date.now() - startedAt < READ_BUDGET_MS - HTTP_TIMEOUT_MS;

  try {
    if (!isRegistryConfigured(deployment) || !deployment.registryAddress ||
        !isAddress(deployment.registryAddress) || !isAddress(address) ||
        !Number.isSafeInteger(deployment.chainId) || (deployment.chainId ?? 0) <= 0 ||
        !deployment.rpcUrl ||
        (blockNumber !== undefined && (typeof blockNumber !== "bigint" ||
          blockNumber < BigInt(0) || blockNumber > MAX_UINT256))) return unavailable();

    const chain = chainFromDeployment(deployment);
    if (!chain) return unavailable();
    const registryAddress = getAddress(deployment.registryAddress);
    const walletAddress = getAddress(address);
    const client = createPublicClient({
      chain,
      cacheTime: 0,
      transport: http(deployment.rpcUrl, { timeout: HTTP_TIMEOUT_MS, retryCount: 0 }),
    });

    if (!canRead() || await client.getChainId() !== deployment.chainId) return unavailable();
    if (!canRead()) return unavailable();
    const block = blockNumber === undefined
      ? await client.getBlock({ blockTag: "latest" })
      : await readReceiptWithRetry(blockNumber, (height) => client.getBlock({ blockNumber: height }), canRead);
    if (!block || !validBlock(block) ||
        (blockNumber !== undefined && block.number !== blockNumber)) return unavailable();

    const height = block.number;
    const result = await readReceiptWithRetry(height, (confirmedHeight) => client.readContract({
      address: registryAddress,
      abi: petRegistryAbi,
      functionName: "petOf",
      args: [walletAddress],
      blockNumber: confirmedHeight,
    }), canRead);
    if (!result || !Array.isArray(result) || result.length !== 4) return unavailable();
    const [exists, communityId, careCount, lastCareDay] = result;
    if (typeof exists !== "boolean" || !Number.isSafeInteger(communityId) ||
        communityId < 0 || communityId > MAX_UINT32 ||
        !Number.isSafeInteger(careCount) || careCount < 0 || careCount > MAX_UINT32 ||
        typeof lastCareDay !== "bigint" || lastCareDay < BigInt(0) ||
        lastCareDay > MAX_UINT64 || lastCareDay > utcDayFromUnixSeconds(block.timestamp) ||
        (careCount === 0 && lastCareDay !== BigInt(0)) ||
        (exists && communityId !== APPROVED_COMMUNITY_ID) ||
        (!exists && (communityId !== 0 || careCount !== 0 || lastCareDay !== BigInt(0)))) {
      return unavailable();
    }

    let communityTotalCares: number | null = null;
    if (exists) {
      try {
        // The optional total cannot spend the timeout needed to verify the
        // block hash. A slow shared read becomes unknown while pet facts stay.
        const canReadCommunity = () => Date.now() - startedAt < READ_BUDGET_MS - HTTP_TIMEOUT_MS * 2;
        const total = await readReceiptWithRetry(height, (confirmedHeight) => client.readContract({
          address: registryAddress,
          abi: petRegistryAbi,
          functionName: "communityStats",
          args: [APPROVED_COMMUNITY_ID],
          blockNumber: confirmedHeight,
        }), canReadCommunity);
        if (typeof total === "bigint" && total >= BigInt(careCount) &&
            total <= MAX_UINT64 && total <= BigInt(Number.MAX_SAFE_INTEGER)) {
          communityTotalCares = Number(total);
        }
      } catch {
        // Optional shared evidence must not erase a successfully read pet.
      }
    }

    if (!canRead()) return unavailable();
    const checkedBlock = await client.getBlock({ blockNumber: height });
    if (!validBlock(checkedBlock) || checkedBlock.number !== height ||
        checkedBlock.hash.toLowerCase() !== block.hash.toLowerCase() ||
        checkedBlock.timestamp !== block.timestamp || Date.now() - startedAt >= READ_BUDGET_MS) {
      return unavailable();
    }
    if (!exists) return { kind: "no-pet", dataMode: "live" };

    const blockTimestampIso = new Date(Number(block.timestamp) * 1000).toISOString();
    const observedAtIso = new Date().toISOString();
    const nextCareAtIso = careCount > 0 && lastCareDay === utcDayFromUnixSeconds(block.timestamp)
      ? nextUtcDayStartIso(lastCareDay)
      : blockTimestampIso;
    return {
      kind: "ready",
      dataMode: "live",
      snapshot: {
        contextKey: [deployment.chainId, registryAddress.toLowerCase(), walletAddress.toLowerCase(),
          height.toString(), block.hash.toLowerCase(), observedAtIso].join(":"),
        walletAddress,
        chainId: chain.id,
        registryAddress,
        blockNumber: height.toString(),
        blockTimestampIso,
        observedAtIso,
        careCount,
        ...mapConfirmedPetProgress(careCount),
        nextCareAtIso,
        communityTotalCares,
      },
    };
  } catch {
    // RPC errors may contain endpoint URLs, request bodies or provider details.
    return unavailable();
  }
}
