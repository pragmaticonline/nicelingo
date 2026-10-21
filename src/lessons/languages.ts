import { lessons } from "./curriculum";
import { NAMES } from "./names";
import { fmt, t, type UiLang } from "../lib/i18n";

export type Availability = "complete" | "partial" | "hidden";

export type LanguageInfo = {
  code: string;
  /** English name, e.g. "Spanish". */
  name: string;
  /** The language's own name, e.g. "Español". */
  ownName: string;
  /** Short greeting in the language, for picker cards. */
  greeting: string;
  /** Flag emoji for menus/cards, so the language is identifiable
   *  even to someone who cannot read its name. */
  flag: string;
  /** Poolside tile color for picker cards and phone rows. */
  tileColor: string;
  /** Lesson count, derived from the lessons record. */
  lessons: number;
  status: Availability;
  /**
   * The paywall gates every lesson except Unit 1 (001-004) in every visible
   * language (see the /api/lessons route), so every non-hidden language
   * is covered. Hidden languages have nothing to unlock.
   */
  coveredBySubscription: boolean;
};

type LangCode = keyof (typeof lessons)[string] & keyof typeof NAMES;

// No hidden languages right now; the set stays for future courses.
const HIDDEN = new Set<string>([]);

const TOTAL = Object.keys(lessons).length;

function info(code: LangCode): LanguageInfo {
  const count = Object.keys(lessons).filter(
    (n) => lessons[n][code] != null,
  ).length;
  const status: Availability =
    HIDDEN.has(code) || count === 0
      ? "hidden"
      : count === TOTAL
        ? "complete"
        : "partial";
  return {
    code,
    ...NAMES[code],
    lessons: count,
    status,
    coveredBySubscription: status !== "hidden",
  };
}

export const LANGUAGES: LanguageInfo[] = (
  Object.keys(NAMES) as LangCode[]
).map(info);

/** Languages shown in the picker: everything except hidden. */
export function pickerLanguages(): LanguageInfo[] {
  return LANGUAGES.filter((l) => l.status !== "hidden");
}

const COURSE_KEY = { en: "courseNameEn", es: "courseNameEs", de: "courseNameDe", fr: "courseNameFr", th: "courseNameTh", zh: "courseNameZh" } as const;

/** Course name in the visitor's interface language, e.g. "Thai" / "tailandés".
 *  Falls back to English, then to the registry name, never to native alone. */
export function courseName(ui: UiLang, code: string): string {
  const d = t(ui) as unknown as Record<string, string>;
  const enDict = t("en") as unknown as Record<string, string>;
  const key = (COURSE_KEY as Record<string, string>)[code];
  const info = pickerLanguages().find((l) => l.code === code);
  return (key ? (d[key] ?? enDict[key]) : undefined) ?? info?.name ?? info?.ownName ?? code;
}

/** Course name shaped for the "Learn {language}" template: lowercase first
 *  for Spanish/French, with the French article (l' before vowels, le after). */
export function courseLearnName(ui: UiLang, code: string): string {
  const name = courseName(ui, code);
  if (ui === "fr") {
    const lower = name.charAt(0).toLowerCase() + name.slice(1);
    return (/^[aeiou]/i.test(lower) ? "l'" : "le ") + lower;
  }
  if (ui === "es") return name.charAt(0).toLowerCase() + name.slice(1);
  return name;
}

/** "Learn Thai" / "Aprende tailandés" / "Apprends le thaï" in the UI language. */
export function courseLearn(ui: UiLang, code: string): string {
  const d = t(ui);
  return fmt(d.learnCourse ?? t("en").learnCourse, { language: courseLearnName(ui, code) });
}

/** Full meta description: "{Learn {language}} with bite-size photo lessons…" */
export function courseBlurb(ui: UiLang, code: string): string {
  const d = t(ui);
  return `${courseLearn(ui, code)} ${d.courseBlurbInner ?? t("en").courseBlurbInner}`;
}

/** Page <title>: "Learn Thai · Nicelingo". */
export function courseTitle(ui: UiLang, code: string): string {
  return `${courseLearn(ui, code)} · Nicelingo`;
}

/** Oxford-joined covered names for coverage copy, partials tagged. */
export function coverageLine(): string {
  const names = LANGUAGES.filter((l) => l.coveredBySubscription).map((l) =>
    l.status === "partial" ? `${l.name} (Level 1 only)` : l.name,
  );
  return names.length > 1
    ? `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`
    : (names[0] ?? "");
}
