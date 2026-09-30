"use client";
import { useState } from "react";
import type {
  CompanionFactsState,
  CompanionPanelProps,
  CompanionQuestion,
  CompanionReplyState,
  PersonalityProfile,
} from "@/types/companion";
import {
  companionFactsFixtures,
  companionReplyFixtures,
  personalityFixtures,
} from "@/fixtures/finale-fixtures";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CompanionPanel } from "./CompanionPanel";

type FactsKey = keyof typeof companionFactsFixtures;
type ReplyKey = keyof typeof companionReplyFixtures;
type PersonalityKey = keyof typeof personalityFixtures;

const factsKeys = Object.keys(companionFactsFixtures) as FactsKey[];
const replyKeys = Object.keys(companionReplyFixtures) as ReplyKey[];
const personalityKeys = Object.keys(personalityFixtures) as PersonalityKey[];

/** YeeWei's development state inspector. No wallet, RPC or model I/O. */
export function CompanionPreview() {
  const [factsKey, setFactsKey] = useState<FactsKey>("ready");
  const [replyKey, setReplyKey] = useState<ReplyKey>("idle");
  const [personalityKey, setPersonalityKey] = useState<PersonalityKey>("playful");
  const [askLog, setAskLog] = useState<CompanionQuestion[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const facts = companionFactsFixtures[factsKey] as CompanionFactsState;
  const reply = companionReplyFixtures[replyKey] as CompanionReplyState;
  const personality = personalityFixtures[personalityKey] as PersonalityProfile;

  const props: CompanionPanelProps = {
    facts,
    personality,
    reply,
    onAsk: (q) => setAskLog((prev) => [...prev, q]),
    onRetry: () => setRetryCount((n) => n + 1),
  };

  return (
    <main style={{ maxWidth: "48rem", margin: "2rem auto", padding: "0 1rem" }}>
      <Card style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <p
          style={{
            display: "inline-block",
            padding: "0.125rem 0.5rem",
            background: "#ffecc0",
            color: "#664d00",
            fontSize: "0.75rem",
            fontWeight: 600,
            borderRadius: "0.25rem",
            marginBottom: "0.75rem",
          }}
        >
          UI preview — fictional data
        </p>
        <h1 style={{ margin: "0 0 0.5rem" }}>Companion UI workbench</h1>
        <p style={{ margin: "0 0 1.25rem", fontSize: "0.875rem", opacity: 0.7 }}>
          No wallet, RPC or model calls. All data is fictional and for development
          inspection only. Fixtures are not live fallbacks.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginBottom: "1.25rem" }}>
          <fieldset style={{ border: "1px solid #ddd", borderRadius: "0.375rem", padding: "0.75rem 1rem" }}>
            <legend style={{ fontWeight: 600, padding: "0 0.25rem" }}>Facts state</legend>
            {factsKeys.map((key) => (
              <label key={key} style={{ display: "block", marginBottom: "0.25rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="facts"
                  value={key}
                  checked={factsKey === key}
                  onChange={() => setFactsKey(key)}
                  style={{ marginRight: "0.375rem" }}
                />
                {key}
              </label>
            ))}
          </fieldset>

          <fieldset style={{ border: "1px solid #ddd", borderRadius: "0.375rem", padding: "0.75rem 1rem" }}>
            <legend style={{ fontWeight: 600, padding: "0 0.25rem" }}>Reply state</legend>
            {replyKeys.map((key) => (
              <label key={key} style={{ display: "block", marginBottom: "0.25rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="reply"
                  value={key}
                  checked={replyKey === key}
                  onChange={() => setReplyKey(key)}
                  style={{ marginRight: "0.375rem" }}
                />
                {key}
              </label>
            ))}
          </fieldset>

          <fieldset style={{ border: "1px solid #ddd", borderRadius: "0.375rem", padding: "0.75rem 1rem" }}>
            <legend style={{ fontWeight: 600, padding: "0 0.25rem" }}>Personality</legend>
            {personalityKeys.map((key) => (
              <label key={key} style={{ display: "block", marginBottom: "0.25rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="personality"
                  value={key}
                  checked={personalityKey === key}
                  onChange={() => setPersonalityKey(key)}
                  style={{ marginRight: "0.375rem" }}
                />
                {key}
              </label>
            ))}
          </fieldset>
        </div>

        <div style={{ fontSize: "0.875rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
          <span>
            <strong>onAsk calls:</strong>{" "}
            {askLog.length === 0 ? "none" : askLog.join(", ")}
          </span>
          {askLog.length > 0 && (
            <Button tone="quiet" onClick={() => setAskLog([])}>
              Clear log
            </Button>
          )}
          <span>
            <strong>onRetry:</strong> {retryCount} time{retryCount === 1 ? "" : "s"}
          </span>
        </div>
      </Card>

      <CompanionPanel {...props} />
    </main>
  );
}
