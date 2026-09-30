"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CarePanel } from "@/components/pet/CarePanel";
import { PetScene } from "@/components/pet/PetScene";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { usePetRegistry } from "@/hooks/usePetRegistry";
import { useWallet } from "@/hooks/useWallet";
import { useCompanion } from "@/hooks/useCompanion";
import { CompanionPanel } from "@/components/companion/CompanionPanel";
import { FinaleCommunitySection } from "../finale-community-section";
import { resolveCareActionState } from "@/lib/care-action-machine";
import { publicPetPath } from "@/lib/public-pet";

export function PetLiveClient() {
  const wallet = useWallet();
  const registry = usePetRegistry({
    deployment: wallet.deployment,
    address: wallet.address,
    wrongChain: wallet.wrongChain,
    createWalletClient: wallet.createBrowserWalletClient,
  });
  const community = useCommunityStats({
    deployment: wallet.deployment,
    address: wallet.address,
    wrongChain: wallet.wrongChain,
  });
  const { companion } = useCompanion({
    deployment: wallet.deployment,
    address: wallet.address,
    wrongChain: wallet.wrongChain,
    confirmedBlockNumber: registry.confirmedBlockNumber,
    isWriting: registry.isSubmitting,
  });

  const dismissTx = registry.dismissTx;
  const refreshCommunity = community.refresh;
  const txKind = registry.txKind;
  const txPhase = registry.txPhase;
  const confirmedBlockNumber = registry.confirmedBlockNumber;

  useEffect(() => {
    if (txPhase !== "success") {
      return;
    }

    if (txKind === "care" && confirmedBlockNumber !== undefined) {
      refreshCommunity(confirmedBlockNumber);
    }

    const timer = window.setTimeout(dismissTx, 1600);

    return () => window.clearTimeout(timer);
  }, [confirmedBlockNumber, dismissTx, refreshCommunity, txKind, txPhase]);

  const action = useMemo(
    () =>
      resolveCareActionState({
        walletInstalled: wallet.installed,
        connected: wallet.address !== null,
        wrongChain: wallet.wrongChain,
        readStatus:
          registry.readStatus === "ready"
            ? "idle"
            : registry.readStatus === "loading"
              ? "loading"
              : registry.readStatus === "error"
                ? "error"
                : "idle",
        readErrorMessage: registry.readErrorMessage ?? undefined,
        hasPet: registry.hasPet,
        txPhase: registry.txPhase,
        txKind: registry.txKind,
        transactionHash: registry.transactionHash,
        txErrorMessage: registry.txErrorMessage ?? undefined,
        careEnabled: true,
        cooldownAvailableAtIso: registry.cooldownAvailableAtIso,
      }),
    [
      registry.cooldownAvailableAtIso,
      registry.hasPet,
      registry.readErrorMessage,
      registry.readStatus,
      registry.transactionHash,
      registry.txErrorMessage,
      registry.txKind,
      registry.txPhase,
      wallet.address,
      wallet.installed,
      wallet.wrongChain,
    ],
  );

  const celebrate = registry.celebrateStageUp;

  return (
    <div className="pet-live">
      <Card className="pet-live-status">
        <div className="pet-gate-head">
          <p className="eyebrow">Your daily companion</p>
          <Badge tone="live">
            {wallet.deployment.networkName ?? "Configured network"}
          </Badge>
        </div>
        <h1>Your pet</h1>
        <p className="lede">
          A little care, once a day. Connect your wallet to find your pet.
          Progress updates after your transaction is confirmed and read back
          from the chain.
        </p>
        <dl className="pet-live-meta">
          <div>
            <dt>Wallet</dt>
            <dd>
              {!wallet.installed
                ? "Not installed"
                : wallet.address
                  ? wallet.address
                  : "Not connected"}
            </dd>
          </div>
          <div>
            <dt>Chain</dt>
            <dd>
              {wallet.chainId === null
                ? "Unknown"
                : wallet.wrongChain
                  ? `${wallet.chainId} (switch required)`
                  : String(wallet.chainId)}
            </dd>
          </div>
          <div>
            <dt>Pet</dt>
            <dd>
              {!wallet.address
                ? "Connect to view"
                : wallet.wrongChain
                  ? "Switch network to view"
                  : registry.readStatus === "loading"
                    ? "Reading…"
                    : registry.readStatus === "error"
                      ? "Read failed"
                      : registry.hasPet
                        ? "Adopted"
                        : "None yet"}
            </dd>
          </div>
          <div>
            <dt>Community cares</dt>
            <dd aria-live="polite">
              {community.community.isLoading
                ? "Reading…"
                : community.community.totalCareActions === null
                  ? "Unknown"
                  : String(community.community.totalCareActions)}
            </dd>
          </div>
        </dl>
        {community.community.errorMessage && !wallet.wrongChain ? (
          <p className="status-note" role="status">
            {community.community.errorMessage} Retry only reads the chain; it does not send a transaction.
          </p>
        ) : null}
        {!wallet.installed ? (
          <div className="wallet-setup">
            <p>Connect with a browser wallet.</p>
            <a href="https://web3.okx.com/download" target="_blank" rel="noreferrer">
              Get OKX Wallet <span aria-hidden="true">↗</span>
            </a>
            <p className="status-note">
              Install the extension in this browser, set up and unlock your wallet, then reload this page.
              Already have one? Check that you are using the same browser profile.
            </p>
          </div>
        ) : null}
        <div className="pet-gate-actions">
          {community.community.errorMessage && !wallet.wrongChain ? (
            <Button tone="secondary" onClick={community.retry}>
              Retry community total
            </Button>
          ) : null}
          {wallet.address || wallet.connecting || wallet.disconnectStatus === "pending" ? (
            <Button
              tone="secondary"
              onClick={() => void wallet.disconnect()}
              disabled={wallet.disconnectStatus === "pending"}
            >
              {wallet.disconnectStatus === "pending"
                ? "Disconnecting…"
                : wallet.connecting
                  ? "Cancel connection"
                  : "Disconnect"}
            </Button>
          ) : (
            <Button onClick={() => void wallet.connect()} disabled={wallet.connecting}>
              {wallet.connecting ? "Connecting…" : "Connect wallet"}
            </Button>
          )}
          {wallet.wrongChain ? (
            <Button onClick={() => void wallet.switchNetwork()}>
              Switch network
            </Button>
          ) : null}
          {wallet.address &&
          !wallet.wrongChain &&
          registry.readStatus === "ready" &&
          !registry.hasPet ? (
            <Button
              onClick={() => void registry.adopt()}
              disabled={registry.isSubmitting}
            >
              Adopt pet
            </Button>
          ) : null}
        </div>
        {wallet.address && registry.hasPet ? (
          <SharePetLink path={publicPetPath(wallet.address)} />
        ) : null}
        {wallet.errorMessage ? (
          <p className="pet-live-error" role="alert">{wallet.errorMessage}</p>
        ) : null}
        {wallet.disconnectStatus === "manual" ? (
          <p className="pet-live-error" role="alert">
            MemePet is disconnected, but wallet access could not be confirmed as revoked.
            In MetaMask, open the account menu, choose Dapp connections, select this site,
            then Disconnect. In another wallet, use its connected-sites settings.
            Reject any open wallet requests. Disconnecting does not revoke token approvals.
          </p>
        ) : wallet.disconnectStatus === "revoked" ? (
          <p className="status-note" role="status">
            MemePet is disconnected. Wallet account access was revoked for this site.
            Reject any open wallet requests; disconnecting does not revoke token approvals.
          </p>
        ) : null}
      </Card>

      {registry.hasPet && registry.pet ? (
        <div className="pet-live-grid">
          <PetScene pet={registry.pet} celebrate={celebrate} />
          <CarePanel
            pet={registry.pet}
            action={action}
            onCare={() => void registry.care()}
            onConnect={() => void wallet.connect()}
            onSwitchNetwork={() => void wallet.switchNetwork()}
          />
        </div>
      ) : (
        <div className="pet-live-empty-grid">
          <section className="pet-live-invitation" aria-labelledby="pet-invitation-title">
            <Image src="/pets/hatchling.png" alt="Mochi mascot illustration" width={320} height={320} sizes="(max-width: 800px) 35vw, 208px" />
            <div>
              <h2 id="pet-invitation-title">A small companion.<br />A new daily ritual.</h2>
              <p>Adopt, care, and grow together. Your wallet keeps your place, even when you take a day off.</p>
              <small>Mascot illustration. No wallet pet is displayed here.</small>
            </div>
          </section>
          <CarePanel
            pet={null}
            action={action}
            onCare={() => void registry.care()}
            onConnect={() => void wallet.connect()}
            onSwitchNetwork={() => void wallet.switchNetwork()}
          />
        </div>
      )}
      <div className="pet-finale-grid">
        <section className="pet-recap" aria-labelledby="pet-recap-title">
          <div>
            <p className="eyebrow">Read-only recap</p>
            <h2 id="pet-recap-title">Ask Mochi about your progress</h2>
            <p className="status-note">
              Standard explanations of confirmed MemePet activity. These questions do not send transactions.
            </p>
          </div>
          <CompanionPanel {...companion} />
        </section>
        <FinaleCommunitySection {...community.finale} deployment={wallet.deployment} />
      </div>
    </div>
  );
}

function SharePetLink({ path }: { readonly path: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="share-pet">
      <Link className="link-button" href={path}>
        Share your pet
      </Link>
      <Button tone="secondary" onClick={() => void copyLink()}>
        {copied ? "Link copied" : "Copy link"}
      </Button>
      <p className="share-pet-note">
        Opens a public read-only page. Nothing is posted for you.
      </p>
    </div>
  );
}
