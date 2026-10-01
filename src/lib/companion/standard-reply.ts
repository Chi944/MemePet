import type {
  CompanionFactsState,
  CompanionQuestion,
  CompanionReplyState,
  PersonalityProfile,
} from "@/types/companion";

/** No model, network, or signer. Callers must supply validated confirmed facts. */
export function createStandardReply(
  facts: CompanionFactsState,
  question: CompanionQuestion,
  personality: PersonalityProfile,
): CompanionReplyState {
  if (facts.kind !== "ready") {
    const messages = {
      "needs-wallet": "Connect a wallet to read its MemePet activity.",
      "wrong-network": "Switch to the supported network to read MemePet activity.",
      loading: "Confirmed MemePet activity is still loading.",
      "no-pet": "This wallet has no pet in the checked registry.",
      unavailable: "Confirmed MemePet activity is unavailable. Retry the read.",
    };
    return { kind: "unavailable", message: messages[facts.kind] };
  }

  const pet = facts.snapshot;
  let detail: string;
  switch (question) {
    case "progress":
      detail = `This pet has ${pet.careCount} confirmed care action${pet.careCount === 1 ? "" : "s"}, ${pet.growthPoints} growth points, and is a ${pet.stage}.`;
      detail += pet.nextStageAt === null
        ? " It has reached the final current stage."
        : ` The next stage starts at ${pet.nextStageAt} points.`;
      break;
    case "next-care":
      detail = Date.parse(pet.nextCareAtIso) <= Date.parse(pet.blockTimestampIso)
        ? `Care was available as of block ${pet.blockNumber} (${pet.blockTimestampIso}, UTC).`
        : `The next eligible care time is ${pet.nextCareAtIso} (UTC).`;
      detail += " Check the live Care panel for the current status before confirming a transaction.";
      break;
    case "contribution":
      detail = `This pet has contributed ${pet.careCount} confirmed care action${pet.careCount === 1 ? "" : "s"}.`;
      detail += pet.communityTotalCares === null
        ? " The community total is unavailable; it is not zero."
        : ` The confirmed community total is ${pet.communityTotalCares}.`;
      break;
  }

  const intro = personality.style === "curious"
    ? "Here is what Mochi found:"
    : personality.style === "focused" ? "Mochi's progress check:" : "A little Mochi update:";
  return {
    kind: "answer",
    contextKey: pet.contextKey,
    question,
    source: "standard",
    text: `${intro} ${detail} Based on block ${pet.blockNumber} (${pet.blockTimestampIso}). This covers MemePet activity only.`,
  };
}
