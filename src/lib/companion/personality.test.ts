import { describe, expect, it } from "vitest";
import { defaultPersonality, parsePersonality, recordPersonalityInteraction } from "./personality";

describe("browser-local personality preferences", () => {
  it("round-trips preferences and derives the style instead of trusting saved text", () => {
    const profile = recordPersonalityInteraction(defaultPersonality(), "explore");
    expect(parsePersonality(JSON.stringify({ ...profile, style: "focused" }))).toEqual(profile);
    expect(profile.style).toBe("curious");
  });

  it("resets malformed, negative, fractional, overflowing, and unsupported storage", () => {
    const invalid = [null, "broken", "null", "[]", JSON.stringify({ version: 2, exploreCount: 1, practiseCount: 0 }),
      ...[-1, 0.5, Number.MAX_SAFE_INTEGER + 1, "1"].map(exploreCount => JSON.stringify({ version: 1, exploreCount, practiseCount: 0 }))];
    for (const value of invalid) expect(parsePersonality(value)).toEqual(defaultPersonality());
  });

  it("keeps interactions immutable, with a playful tie and a focused practise preference", () => {
    const initial = defaultPersonality();
    const curious = recordPersonalityInteraction(initial, "explore");
    const tied = recordPersonalityInteraction(curious, "practise");
    const focused = recordPersonalityInteraction(tied, "practise");
    expect(initial).toEqual(defaultPersonality());
    expect(tied.style).toBe("playful");
    expect(focused.style).toBe("focused");
    expect(Object.keys(focused).sort()).toEqual(["exploreCount", "practiseCount", "style", "version"]);
  });
});
