import { useState } from "react";
import { createRoot } from "react-dom/client";
import { WalletChooser } from "@/components/onboarding/WalletChooser";
import { OnboardingPanel } from "@/components/onboarding/OnboardingPanel";
import { ProgressionPanel } from "@/components/progression/ProgressionPanel";
import { onboardingFixtures, walletChoiceFixtures, personalMilestoneFixtures, gardenChapterFixtures } from "@/fixtures/beta-fixtures";
import "@/app/globals.css";
import "./preview.css";

function Preview() {
  const [wallets, setWallets] = useState("both");
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState<keyof typeof onboardingFixtures>("connect");
  const [invalidDate, setInvalidDate] = useState(false);
  const [personal, setPersonal] = useState<keyof typeof personalMilestoneFixtures>("guardian");
  const [garden, setGarden] = useState<keyof typeof gardenChapterFixtures>("firstBloom");
  const [calls, setCalls] = useState({ select: 0, connect: 0, switchNetwork: 0, retry: 0 });
  const record = (key: keyof typeof calls) => setCalls((previous) => ({ ...previous, [key]: previous[key] + 1 }));
  const state = onboardingFixtures[onboarding];
  return <main className="b1-preview">
    <header><p className="b1-label">UI preview — fictional data</p><h1>B1 component workbench</h1><p>Local presentation only. No wallet, RPC, storage or model calls. Buttons record callback requests; they do not prove a wallet connection or transaction.</p></header>
    <section className="b1-controls" aria-label="Fictional preview controls">
      <label>Wallet fixtures<select value={wallets} onChange={(e) => { setWallets(e.target.value); setSelectedId(null); }}><option value="both">MetaMask + OKX (fictional)</option><option value="none">No wallet</option><option value="one">MetaMask only (fictional)</option></select></label>
      <label>Onboarding fixture<select value={onboarding} onChange={(e) => setOnboarding(e.target.value as keyof typeof onboardingFixtures)}>{Object.keys(onboardingFixtures).map((key) => <option key={key}>{key}</option>)}</select></label>
      <label>Personal fixture<select value={personal} onChange={(e) => setPersonal(e.target.value as keyof typeof personalMilestoneFixtures)}>{Object.keys(personalMilestoneFixtures).map((key) => <option key={key}>{key}</option>)}</select></label>
      <label>Garden fixture<select value={garden} onChange={(e) => setGarden(e.target.value as keyof typeof gardenChapterFixtures)}>{Object.keys(gardenChapterFixtures).map((key) => <option key={key}>{key}</option>)}</select></label>
      <label className="b1-check"><input type="checkbox" checked={busy} onChange={(e) => setBusy(e.target.checked)} />Wallet request busy</label>
      <label className="b1-check"><input type="checkbox" checked={invalidDate} onChange={(e) => setInvalidDate(e.target.checked)} />Invalid cooldown date (fictional)</label>
    </section>
    <div className="b1-onboarding">
      <WalletChooser choices={wallets === "none" ? [] : wallets === "one" ? walletChoiceFixtures.slice(0, 1) : walletChoiceFixtures} selectedId={selectedId} busy={busy} onSelect={(id) => { setSelectedId(id); record("select"); }} />
      <OnboardingPanel state={state.kind === "cooldown" && invalidDate ? { ...state, availableAtIso: "INVALID_FIXTURE_DATE" } : state} onConnect={() => record("connect")} onSwitchNetwork={() => record("switchNetwork")} onRetry={() => record("retry")} />
    </div>
    <ProgressionPanel personal={personalMilestoneFixtures[personal]} community={gardenChapterFixtures[garden]} onRetry={() => record("retry")} />
    <section aria-label="Fictional callback counters"><h2>Callback requests only</h2><p>Selected wallet: {selectedId ?? "none"}</p><dl>{Object.entries(calls).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section>
  </main>;
}
createRoot(document.getElementById("root")!).render(<Preview />);
