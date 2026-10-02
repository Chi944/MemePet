"use client";

import { useId, useSyncExternalStore } from "react";
import type { OnboardingPanelProps, OnboardingState } from "@/types/beta";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./onboarding.module.css";

const COPY: Record<OnboardingState["kind"], { title: string; body: string }> = {
  "needs-wallet": { title: "Bring your wallet", body: "Install a supported wallet, then return here. On mobile, open MemePet inside your wallet app’s browser." },
  "needs-connection": { title: "Connect your chosen wallet", body: "Choose an available wallet app, then connect to read your pet. Review the connection request in that wallet." },
  connecting: { title: "Waiting for your wallet", body: "Review the current connection request in your chosen wallet. A connection has not been confirmed yet." },
  "wrong-network": { title: "Switch to the care network", body: "Your wallet is on a different network. Review the network switch in your chosen wallet." },
  loading: { title: "Checking your pet", body: "Waiting for confirmed pet information. No adoption or care result is assumed while this check is in progress." },
  unavailable: { title: "Pet information unavailable", body: "We cannot confirm whether this wallet has a pet or can care. Retry the read before taking an action." },
  "needs-adoption": { title: "Ready to meet Mochi", body: "The current read found no pet for this wallet. Use the adoption action on your pet page when you are ready; adoption is complete only after confirmation." },
  ready: { title: "Ready for a little care", body: "The current confirmed state allows care. Use the care action on your pet page and wait for confirmation before expecting progress." },
  cooldown: { title: "Your next little care", body: "Your pet has already received care for this UTC day. Your next reset is shown in your local time below." },
};

/** Require an explicit ISO instant. Never guess the timezone of an ambiguous date. */
function localReset(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(iso);
  if (!match) return null;
  const [, year, month, day] = match;
  const days = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  if (Number(month) < 1 || Number(month) > 12 || Number(day) < 1 || Number(day) > days) return null;
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "long",
    }).format(date);
  } catch {
    return null;
  }
}

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function LocalCareReset({ iso }: { readonly iso: string }) {
  // React's hydration snapshot keeps server timezone text out of the initial UI.
  // No timer, storage or eligibility calculation is involved.
  const isClient = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const label = isClient ? localReset(iso) : undefined;
  return <p className={styles.resetTime} role="status">
    {label === undefined ? "Preparing your local reset time…" : label === null
      ? "Reset time unavailable. Care availability still follows confirmed network state."
      : <>Next reset in your local time: <time dateTime={iso}>{label}</time>.</>}
  </p>;
}

export function OnboardingPanel({ state, onConnect, onSwitchNetwork, onRetry, connectDisabled = false }: OnboardingPanelProps) {
  const id = useId();
  const copy = COPY[state.kind];
  const xLayerTestnet = state.isTestnet && /x layer/i.test(state.networkLabel) && state.gasSymbol === "OKB";
  return (
    <Card className={styles.panel} aria-labelledby={`${id}-title`} aria-busy={state.kind === "connecting" || state.kind === "loading"}>
      <div className={styles.header}><p className={styles.eyebrow}>Getting started</p><Badge>{state.networkLabel}</Badge></div>
      <h2 id={`${id}-title`}>{copy.title}</h2>
      <p>{copy.body}</p>
      {state.kind === "unavailable" && <p className={styles.message} role="status">{state.message}</p>}
      {state.kind === "cooldown" && <LocalCareReset iso={state.availableAtIso} />}
      <div className={styles.actions}>
        {state.kind === "needs-connection" && <Button disabled={connectDisabled} onClick={() => { if (!connectDisabled) onConnect(); }}>Connect chosen wallet</Button>}
        {state.kind === "wrong-network" && <Button onClick={() => onSwitchNetwork()}>Switch to {state.networkLabel}</Button>}
        {(state.kind === "unavailable" || state.kind === "loading") && <Button tone="secondary" aria-disabled={state.kind === "loading"} onClick={() => { if (state.kind === "unavailable") onRetry(); }}>{state.kind === "loading" ? "Reading pet…" : "Retry pet read"}</Button>}
      </div>
      <p className={styles.note}>One care per UTC calendar day. Local time is a guide; confirmed network state determines when you can care. No missed-day loss.</p>
      <details className={styles.guidance} open={state.kind === "needs-wallet" ? true : undefined}>
        <summary>Wallet and network setup</summary>
        <p>Use a desktop wallet extension or open this site in your mobile wallet’s browser. WalletConnect and automatic app deep links are not supported here.</p>
        <ul className={styles.links}>
          <li><a href="https://support.metamask.io/start/getting-started-with-metamask/">Official MetaMask installation guide</a></li>
          <li><a href="https://web3.okx.com/download">Official OKX Wallet download</a></li>
        </ul>
        <p>{state.networkLabel} uses {state.isTestnet ? "test " : ""}{state.gasSymbol} for gas. {state.isTestnet ? "Test tokens are for testing; no purchase is needed for this beta." : "Follow the setup for the displayed network."}</p>
        {xLayerTestnet && <p><a href="https://web3.okx.com/xlayer/faucet">Official X Layer testnet faucet</a>. Availability and eligibility are set by the faucet; an allocation is not guaranteed.</p>}
        <p>Never enter a seed phrase or private key into MemePet. Wallet installation and account setup happen only in the official wallet app.</p>
      </details>
    </Card>
  );
}
