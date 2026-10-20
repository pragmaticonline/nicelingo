// Level scene challenges and test out (Feature 4). One challenge
// per level: 3 scenes of 4 spoken lines, each line from a different
// unit's conversation scene, so the challenge tests the level's
// can-do situations (ordering, asking the way, reporting a problem)
// rather than photo narration. Normal pass: average 75+, no line
// below 40, one retry per line (better score counts). Test out runs
// the same scenes harder: average 85+, no line below 50, no retries;
// passing completes the whole level with viaTestOut milestones.
import { LEVELS, UNITS, conversations, lessons } from "../lessons/curriculum";
import type { ConversationManifest, LessonPhrase } from "../lessons/build";
import type { Milestone } from "./attempts";
import { shuffle } from "./checkpoint";

export const CHALLENGE_PASS = { avg: 75, min: 40 };
export const TESTOUT_PASS = { avg: 85, min: 50 };

export type ChallengeLine = LessonPhrase & {
  speaker: "A" | "B";
  alternatives?: LessonPhrase[];
};
export type ChallengeScene = { lines: ChallengeLine[] };

export function levelUnits(level: number): number[] {
  return LEVELS.find((l) => l.level === level)?.units ?? [];
}

export function levelLessons(level: number): string[] {
  return levelUnits(level).flatMap(
    (u) => UNITS.find((x) => x.unit === u)?.lessons ?? [],
  );
}

/** One challenge line per unit conversation scene: the learner says
 *  a line from the situation they learned (the cafe, the market, the
 *  taxi), so passing shows they can handle it, not recite a script.
 *  Returns null when any unit lacks a conversation scene. */
export function pickChallengeLines(
  scenes: (ConversationManifest | null | undefined)[],
  rng: () => number = Math.random,
): ChallengeLine[] | null {
  const lines: ChallengeLine[] = [];
  for (const scene of scenes) {
    const pool = scene?.lines ?? [];
    if (!pool.length) return null;
    lines.push(shuffle(pool, rng)[0]);
  }
  return lines;
}

/** 3 scenes x 4 lines; every line from a different unit's
 *  conversation, no phrase twice. Returns null when the level has
 *  too little content. */
export function buildChallengeScenes(
  lang: string,
  level: number,
  rng: () => number = Math.random,
): ChallengeScene[] | null {
  const units = levelUnits(level);
  if (units.length < 4) return null;
  const chosenUnits = shuffle(units, rng).slice(0, 12);
  if (chosenUnits.length < 12) return null;
  const lines = pickChallengeLines(
    chosenUnits.map((unit) => conversations[unit]?.[lang as keyof (typeof conversations)[number]]),
    rng,
  );
  if (!lines) return null;
  return [
    { lines: lines.slice(0, 4) },
    { lines: lines.slice(4, 8) },
    { lines: lines.slice(8, 12) },
  ];
}

/** Every milestone a passed test out writes: each unit checkpoint
 *  plus each unit conversation (decision 5), all labeled tested out.
 *  The caller still marks the photo lessons done separately. */
export function testOutMilestones(
  lang: string,
  level: number,
  now: string,
): Milestone[] {
  const units = levelUnits(level);
  return [
    ...units.map((unit): Milestone => ({
      kind: "checkpoint", lang, level, unit, score: 10, passed: true, viaTestOut: true, completedAt: now,
    })),
    ...units.map((unit): Milestone => ({
      kind: "conversation", lang, level, unit, score: 1, passed: true, viaTestOut: true, completedAt: now,
    })),
  ];
}

export function evaluateChallenge(
  scores: number[],
  mode: "challenge" | "testout",
): { passed: boolean; avg: number; min: number } {
  const t = mode === "testout" ? TESTOUT_PASS : CHALLENGE_PASS;
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const min = scores.length ? Math.min(...scores) : 0;
  return { passed: avg >= t.avg && min >= t.min, avg, min };
}
