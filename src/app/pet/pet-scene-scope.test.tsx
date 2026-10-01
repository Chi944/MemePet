import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { getAddress, type Address } from "viem";
import type { Deployment } from "@/lib/deployment";
import { petFixtures } from "@/fixtures/ui-fixtures";

const adapters = vi.hoisted(() => ({
  useWallet: vi.fn(),
  usePetRegistry: vi.fn(),
  useCommunityStats: vi.fn(),
  useCompanion: vi.fn(),
  getActiveDeployment: vi.fn(),
  readPublicPet: vi.fn(),
}));

vi.mock("@/hooks/useWallet", () => ({ useWallet: adapters.useWallet }));
vi.mock("@/hooks/usePetRegistry", () => ({ usePetRegistry: adapters.usePetRegistry }));
vi.mock("@/hooks/useCommunityStats", () => ({ useCommunityStats: adapters.useCommunityStats }));
vi.mock("@/hooks/useCompanion", () => ({ useCompanion: adapters.useCompanion }));
vi.mock("@/lib/deployment", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/deployment")>(),
  getActiveDeployment: adapters.getActiveDeployment,
}));
vi.mock("@/lib/public-pet", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/public-pet")>(),
  readPublicPet: adapters.readPublicPet,
}));
vi.mock("@/components/ui/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/pet/PersonalityPanel", () => ({ PersonalityPanel: () => null }));
vi.mock("@/components/companion/CompanionPanel", () => ({ CompanionPanel: () => null }));
vi.mock("../finale-community-section", () => ({ FinaleCommunitySection: () => null }));
// Exercise the route's real reconciliation boundary independently of the
// component's stage-reset behavior. Both owners deliberately have a Buddy.
vi.mock("@/components/pet/PetScene", async () => {
  const { useState } = await import("react");
  return {
    PetScene() {
      const [earlier, setEarlier] = useState(false);
      return <button type="button" aria-pressed={earlier} onClick={() => setEarlier(true)}>View earlier form</button>;
    },
  };
});

import { PetLiveClient } from "./pet-live-client";
import PublicPetPage from "./[address]/page";

const ownerA = `0x${"a".repeat(40)}` as Address;
const ownerB = `0x${"b".repeat(40)}` as Address;
const registryA = `0x${"c".repeat(40)}`;
const registryB = `0x${"d".repeat(40)}`;
let deployment: Deployment;
let owner: Address;

beforeEach(() => {
  vi.clearAllMocks();
  owner = ownerA;
  deployment = {
    status: "local", networkName: "Anvil", chainId: 31337,
    registryAddress: registryA, rpcUrl: "http://127.0.0.1:8545",
    explorerBaseUrl: null, currencySymbol: "ETH",
  };
  adapters.getActiveDeployment.mockImplementation(() => deployment);
  adapters.useWallet.mockImplementation(() => ({
    installed: true, address: owner, chainId: deployment.chainId,
    deployment, wrongChain: false, connecting: false,
    disconnectStatus: null, errorMessage: null,
  }));
  adapters.usePetRegistry.mockReturnValue({
    hasPet: true, pet: petFixtures.buddy, readStatus: "ready",
    txPhase: "idle", txKind: null, isSubmitting: false,
    cooldownAvailableAtIso: null, celebrateStageUp: false,
  });
  adapters.useCommunityStats.mockReturnValue({
    community: { isLoading: false, totalCareActions: 2, errorMessage: null },
    finale: {},
  });
  adapters.useCompanion.mockReturnValue({ companion: {}, personality: {} });
  adapters.readPublicPet.mockImplementation(async (address: Address) => ({
    kind: "pet", owner: address, ownerLabel: address, pet: petFixtures.buddy,
  }));
});

for (const surface of ["live", "public"] as const) {
  async function page() {
    return surface === "live"
      ? <PetLiveClient />
      : PublicPetPage({ params: Promise.resolve({ address: owner }) });
  }

  describe(`${surface} earned-form selection scope`, () => {
    it.each(["owner", "chain", "registry"] as const)(
      "resets an earlier selection when the %s changes at the same earned stage",
      async (changed) => {
        const view = render(await page());
        const earlier = screen.getByRole("button", { name: "View earlier form" });
        fireEvent.click(earlier);
        expect(earlier).toHaveAttribute("aria-pressed", "true");

        if (changed === "owner") owner = ownerB;
        if (changed === "chain") deployment = { ...deployment, chainId: 1952 };
        if (changed === "registry") deployment = { ...deployment, registryAddress: registryB };
        view.rerender(await page());

        const current = screen.getByRole("button", { name: "View earlier form" });
        expect(current).not.toBe(earlier);
        expect(current).toHaveAttribute("aria-pressed", "false");
      },
    );

    it("retains selection during an ordinary same-scope rerender and casing-only address changes", async () => {
      const view = render(await page());
      const earlier = screen.getByRole("button", { name: "View earlier form" });
      fireEvent.click(earlier);
      view.rerender(await page());
      expect(screen.getByRole("button", { name: "View earlier form" })).toBe(earlier);
      expect(earlier).toHaveAttribute("aria-pressed", "true");

      owner = getAddress(ownerA);
      deployment = { ...deployment, registryAddress: getAddress(registryA) };
      view.rerender(await page());
      expect(screen.getByRole("button", { name: "View earlier form" })).toBe(earlier);
      expect(earlier).toHaveAttribute("aria-pressed", "true");
    });
  });
}
