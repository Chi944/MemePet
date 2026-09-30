"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CommunityPanel } from "@/components/community/CommunityPanel";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingHero } from "@/components/landing/LandingHero";
import { AppShell } from "@/components/ui/AppShell";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { useWallet } from "@/hooks/useWallet";
import {
  getActiveDeployment,
  isRegistryConfigured,
} from "@/lib/deployment";
import { unknownCommunityViewModel } from "@/lib/map-community";
import type { CommunityViewModel } from "@/types/view-models";
import { FinaleCommunitySection } from "./finale-community-section";

/**
 * No registry is connected, so the live total is genuinely unknown. This is a
 * live view model with an unknown value, never a fixture standing in for one.
 */
const unpublishedCommunity: CommunityViewModel = unknownCommunityViewModel({
  isLoading: false,
});

function LiveHomeCommunity() {
  const wallet = useWallet();
  const { finale } = useCommunityStats({
    deployment: wallet.deployment,
    address: wallet.address,
    wrongChain: wallet.wrongChain,
  });

  return <FinaleCommunitySection {...finale} deployment={wallet.deployment} />;
}

export function HomeScreen() {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === "development";
  const configured = isRegistryConfigured(getActiveDeployment());

  return (
    <AppShell>
      <LandingHero onGetStarted={() => router.push("/pet")} />
      <HowItWorks connected={configured} />
      <div id="community" className="community-section">
        {configured ? (
          <LiveHomeCommunity />
        ) : (
          <CommunityPanel community={unpublishedCommunity} />
        )}
      </div>

      {/* Shown in every environment: the reason a live total is unknown is
          part of the product, not a development-only aside. */}
      <p className="status-note">
        {configured
          ? "Community progress is read from the chain. If a read fails, the total stays unknown until it can be verified."
          : "Community progress will appear when a registry is connected. No live total is available yet."}
      </p>

      {isDevelopment ? (
        <nav aria-label="Developer previews">
          <p className="status-note">
            Development only — these previews use fictional data and are
            excluded from production builds.
          </p>
          <ul className="preview-links">
            <li>
              <Link href="/dev/pet">Pet UI preview</Link>
            </li>
            <li>
              <Link href="/dev/landing">Landing UI preview</Link>
            </li>
            <li>
              <Link href="/dev/community">Community UI preview</Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </AppShell>
  );
}
