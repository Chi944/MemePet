"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import type { Deployment } from "@/lib/deployment";
import { createStandardReply } from "@/lib/companion/standard-reply";
import { parseCompanionResponse, unavailableCompanionFacts } from "@/lib/companion/response";
import type {
  CompanionFactsState, CompanionPanelProps, CompanionQuestion, CompanionReplyState, PersonalityPanelProps,
} from "@/types/companion";
import { usePersonality } from "./usePersonality";

export interface UseCompanionArgs {
  readonly deployment: Deployment;
  readonly address: Address | null;
  readonly wrongChain: boolean;
  readonly confirmedBlockNumber?: bigint;
  readonly isWriting?: boolean;
}

interface Session {
  readonly key: string;
  readonly generation: number;
  active: boolean;
  floor?: bigint;
  receipt?: bigint;
  knownPet: boolean;
  inputKey: string;
  contextKey: string | null;
  controller: AbortController | null;
}

interface View {
  readonly scopeKey: string;
  readonly inputKey: string;
  readonly generation: number;
  readonly facts: CompanionFactsState;
  readonly reply: CompanionReplyState;
}

const loadingFacts: CompanionFactsState = { kind: "loading", dataMode: "live" };

/** Read-only presentation adapter. No wallet provider, signer, or model call. */
export function useCompanion({
  deployment, address, wrongChain, confirmedBlockNumber, isWriting = false,
}: UseCompanionArgs): { companion: CompanionPanelProps; personality: PersonalityPanelProps } {
  const registry = deployment.registryAddress;
  const chainId = deployment.chainId;
  const configured = deployment.status !== "not-deployed" &&
    typeof registry === "string" && /^0x[\da-f]{40}$/i.test(registry) &&
    typeof chainId === "number" && Number.isSafeInteger(chainId) && chainId > 0 && Boolean(deployment.rpcUrl);
  const validAddress = address !== null && /^0x[\da-f]{40}$/i.test(address);
  const canRead = configured && validAddress && !wrongChain && !isWriting;
  const scopeKey = `${address?.toLowerCase() ?? "none"}:${chainId}:${registry?.toLowerCase()}:${deployment.rpcUrl}:${deployment.status}:${wrongChain}`;
  const inputKey = `${scopeKey}:${isWriting}:${confirmedBlockNumber?.toString() ?? "latest"}`;
  const [view, setView] = useState<View>(() => ({
    scopeKey, inputKey, generation: 0, facts: loadingFacts, reply: { kind: "idle" },
  }));
  const [revision, setRevision] = useState(0);
  const sessionRef = useRef<Session | null>(null);

  if (view.inputKey !== inputKey) {
    // Reset during render so old wallet evidence is never committed, even in
    // the render before effect cleanup. The generation also isolates A-B-A.
    setView({ scopeKey, inputKey, generation: view.generation + (view.scopeKey !== scopeKey ? 1 : 0),
      facts: loadingFacts, reply: { kind: "idle" } });
  }
  const generation = view.generation;
  const profile = usePersonality({ chainId, registryAddress: registry, address,
    enabled: configured && validAddress && !wrongChain });

  useEffect(() => {
    const session: Session = { key: scopeKey, generation, active: true, knownPet: false,
      inputKey: "", contextKey: null, controller: null };
    sessionRef.current = session;
    return () => { session.active = false; session.controller?.abort(); };
  }, [scopeKey, generation]);

  useEffect(() => {
    const session = sessionRef.current;
    if (!session || !session.active || session.key !== scopeKey || session.generation !== generation) return;
    session.inputKey = inputKey;
    session.contextKey = null;
    if (!canRead || !address || !registry || !chainId) return;

    const controller = new AbortController();
    session.controller = controller;
    let current = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const isCurrent = () => current && session.active && sessionRef.current === session &&
      session.controller === controller && !controller.signal.aborted;
    // Only the first read for a newly confirmed receipt is pinned. Retry and
    // receipt dismissal may read a newer latest block, but never below floor.
    let pin: bigint | undefined;
    if (confirmedBlockNumber !== undefined && (session.receipt === undefined || confirmedBlockNumber > session.receipt)) {
      session.receipt = confirmedBlockNumber;
      session.floor = session.floor === undefined || confirmedBlockNumber > session.floor ? confirmedBlockNumber : session.floor;
      pin = session.floor;
    }
    const minimumBlock = session.floor;

    void (async () => {
      try {
        const operation = (async () => {
          const response = await fetch("/api/companion", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, ...(pin === undefined ? {} : { blockNumber: pin.toString() }) }),
            signal: controller.signal, cache: "no-store",
          });
          if (!response.ok || !response.headers.get("content-type")?.toLowerCase().includes("application/json")) {
            throw new Error("Unavailable companion response");
          }
          return response.json() as Promise<unknown>;
        })();
        const value = await Promise.race([operation, new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error("Companion read timed out")), 20_000);
        })]);
        if (!isCurrent()) return;
        const facts = parseCompanionResponse(value, { address, registryAddress: registry, chainId,
          minimumBlock, knownPet: session.knownPet });
        if (facts.kind === "ready") {
          session.floor = BigInt(facts.snapshot.blockNumber);
          session.knownPet = true;
          session.contextKey = facts.snapshot.contextKey;
        }
        setView((previous) => previous.inputKey === inputKey && previous.generation === generation
          ? { ...previous, facts, reply: { kind: "idle" } } : previous);
      } catch {
        if (isCurrent()) {
          setView((previous) => previous.inputKey === inputKey && previous.generation === generation
            ? { ...previous, facts: unavailableCompanionFacts(), reply: { kind: "idle" } } : previous);
        }
      } finally {
        if (timeout !== undefined) clearTimeout(timeout);
        controller.abort();
      }
    })();
    return () => { current = false; controller.abort(); if (timeout !== undefined) clearTimeout(timeout); };
  }, [address, canRead, chainId, confirmedBlockNumber, generation, inputKey, registry, revision, scopeKey]);

  const onRetry = useCallback(() => {
    const session = sessionRef.current;
    if (!canRead || !session?.active || session.key !== scopeKey || session.generation !== generation || session.inputKey !== inputKey) return;
    session.controller?.abort();
    session.contextKey = null;
    setView((previous) => previous.inputKey === inputKey && previous.generation === generation
      ? { ...previous, facts: loadingFacts, reply: { kind: "idle" } } : previous);
    setRevision((value) => value + 1);
  }, [canRead, generation, inputKey, scopeKey]);

  const onAsk = useCallback((question: CompanionQuestion) => {
    const session = sessionRef.current;
    if (!canRead || !session?.active || session.key !== scopeKey || session.generation !== generation ||
      session.inputKey !== inputKey || (question !== "progress" && question !== "next-care" && question !== "contribution")) return;
    setView((previous) => {
      if (previous.inputKey !== inputKey || previous.generation !== generation ||
        (previous.facts.kind === "ready" && previous.facts.snapshot.contextKey !== session.contextKey)) return previous;
      return { ...previous, reply: createStandardReply(previous.facts, question, profile.profile) };
    });
  }, [canRead, generation, inputKey, profile.profile, scopeKey]);

  const facts: CompanionFactsState = !address ? { kind: "needs-wallet", dataMode: "live" }
    : !configured || !validAddress ? unavailableCompanionFacts()
    : wrongChain ? { kind: "wrong-network", dataMode: "live", expectedChainId: chainId! }
    : isWriting || view.inputKey !== inputKey ? loadingFacts : view.facts;
  const storedReply: CompanionReplyState = canRead && view.inputKey === inputKey
    ? view.reply : { kind: "idle" };
  // A style change rephrases the same verified snapshot locally. It must not
  // leave an old introduction under the new style or trigger another read.
  const reply = storedReply.kind === "answer" && storedReply.source === "standard" &&
    facts.kind === "ready" && storedReply.contextKey === facts.snapshot.contextKey
    ? createStandardReply(facts, storedReply.question, profile.profile)
    : storedReply;
  return {
    companion: { facts, personality: profile.profile,
      reply, onAsk, onRetry },
    personality: { ...profile, dataMode: "live" },
  };
}
