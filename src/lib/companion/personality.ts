import type {
  PersonalityInteraction,
  PersonalityProfile,
  PersonalityStyle,
} from "@/types/companion";

function styleFor(explore: number, practise: number): PersonalityStyle {
  if (explore > practise) return "curious";
  if (practise > explore) return "focused";
  return "playful";
}

export function defaultPersonality(): PersonalityProfile {
  return { version: 1, exploreCount: 0, practiseCount: 0, style: "playful" };
}

/** Parse untrusted local storage. Style is derived, never accepted as fact. */
export function parsePersonality(serialized: string | null): PersonalityProfile {
  if (serialized === null) return defaultPersonality();
  try {
    const value: unknown = JSON.parse(serialized);
    if (typeof value !== "object" || value === null) return defaultPersonality();
    const record = value as Record<string, unknown>;
    const explore = record.exploreCount;
    const practise = record.practiseCount;
    if (
      record.version !== 1 ||
      typeof explore !== "number" || !Number.isSafeInteger(explore) || explore < 0 ||
      typeof practise !== "number" || !Number.isSafeInteger(practise) || practise < 0
    ) return defaultPersonality();
    return {
      version: 1,
      exploreCount: explore,
      practiseCount: practise,
      style: styleFor(explore, practise),
    };
  } catch {
    return defaultPersonality();
  }
}

/** Changes a browser preference only. Does not award points or call a service. */
export function recordPersonalityInteraction(
  profile: PersonalityProfile,
  interaction: PersonalityInteraction,
): PersonalityProfile {
  const explore = Math.min(Number.MAX_SAFE_INTEGER, profile.exploreCount + (interaction === "explore" ? 1 : 0));
  const practise = Math.min(Number.MAX_SAFE_INTEGER, profile.practiseCount + (interaction === "practise" ? 1 : 0));
  return {
    version: 1,
    exploreCount: explore,
    practiseCount: practise,
    style: styleFor(explore, practise),
  };
}
