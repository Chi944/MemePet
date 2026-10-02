import {
  type Address,
  createPublicClient,
  getAddress,
  http,
  isAddress,
} from "viem";
import { chainFromDeployment } from "./chains";
import { getActiveDeployment, isRegistryConfigured } from "./deployment";
import { mapPetOfToViewModel } from "./map-pet";
import { petRegistryAbi, type PetOfResult } from "./pet-registry-abi";
import { readWithBudget, RPC_READ_HTTP_OPTIONS } from "./read-budget";
import type { PetViewModel } from "@/types/view-models";

export type PublicPetSnapshot =
  | {
      readonly kind: "unconfigured";
      readonly owner: Address;
      readonly ownerLabel: string;
    }
  | {
      readonly kind: "no-pet";
      readonly owner: Address;
      readonly ownerLabel: string;
    }
  | {
      readonly kind: "pet";
      readonly owner: Address;
      readonly ownerLabel: string;
      readonly pet: PetViewModel;
    }
  | {
      readonly kind: "error";
      readonly owner: Address;
      readonly ownerLabel: string;
      readonly message: string;
    };

const READ_ERROR =
  "This wallet's pet could not be read from the registry. No preview pet is shown.";

/** Checksummed `0x` + 40 hex chars, or null. ENS names and garbage are rejected. */
export function parsePublicWalletAddress(value: string): Address | null {
  const trimmed = value.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return null;
  }

  if (!isAddress(trimmed)) {
    return null;
  }

  return getAddress(trimmed);
}

/** Display label such as `0x2ec8…1CA1`. */
export function shortenAddress(owner: Address): string {
  return `${owner.slice(0, 6)}…${owner.slice(-4)}`;
}

export function publicPetPath(owner: Address): string {
  return `/pet/${owner}`;
}

/**
 * Turns a confirmed petOf tuple, or a failed read, into a public snapshot.
 * A failed read is an error. exists=false is an honest empty state.
 * Neither path invents a pet.
 */
export function toPublicPetSnapshot(
  owner: Address,
  outcome:
    | { readonly ok: true; readonly result: PetOfResult }
    | { readonly ok: false },
): PublicPetSnapshot {
  const ownerLabel = shortenAddress(owner);

  if (!outcome.ok) {
    return {
      kind: "error",
      owner,
      ownerLabel,
      message: READ_ERROR,
    };
  }

  const mapped = mapPetOfToViewModel(outcome.result);
  if (mapped.kind === "no-pet") {
    return { kind: "no-pet", owner, ownerLabel };
  }

  return {
    kind: "pet",
    owner,
    ownerLabel,
    pet: mapped.pet,
  };
}

/** Server-side petOf read. No wallet, no fixture fallback. */
export async function readPublicPet(owner: Address): Promise<PublicPetSnapshot> {
  const deployment = getActiveDeployment();
  const ownerLabel = shortenAddress(owner);

  if (!isRegistryConfigured(deployment) || !deployment.registryAddress) {
    return { kind: "unconfigured", owner, ownerLabel };
  }

  const chain = chainFromDeployment(deployment);
  if (!chain || !deployment.rpcUrl) {
    return { kind: "unconfigured", owner, ownerLabel };
  }

  try {
    const registryAddress = getAddress(deployment.registryAddress);
    const publicClient = createPublicClient({
      chain,
      transport: http(deployment.rpcUrl, RPC_READ_HTTP_OPTIONS),
    });

    const result = await readWithBudget(() => publicClient.readContract({
      address: registryAddress,
      abi: petRegistryAbi,
      functionName: "petOf",
      args: [owner],
    }));

    if (!result) return toPublicPetSnapshot(owner, { ok: false });

    const mappedRaw: PetOfResult = {
      exists: result[0],
      communityId: result[1],
      careCount: result[2],
      lastCareDay: result[3],
    };

    return toPublicPetSnapshot(owner, { ok: true, result: mappedRaw });
  } catch {
    return toPublicPetSnapshot(owner, { ok: false });
  }
}
