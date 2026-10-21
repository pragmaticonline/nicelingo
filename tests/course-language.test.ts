// Course-language labels: every course page names its language in the
// visitor's interface language. Dict-driven, so these run on the fake
// public tree too (real codes come from i18n dicts; fallback needs no
// registry entry).
import { describe, expect, it } from "vitest";
import {
  courseBlurb,
  courseLearn,
  courseName,
  courseTitle,
} from "../src/lessons/languages";

describe("course language labels", () => {
  it("names courses in the UI language", () => {
    expect(courseName("en", "th")).toBe("Thai");
    expect(courseName("es", "th")).toBe("Tailand\xe9s");
    expect(courseName("es", "es")).toBe("Espa\xf1ol");
    expect(courseName("de", "fr")).toBe("Franz\xf6sisch");
    expect(courseName("fr", "de")).toBe("Allemand");
    expect(courseName("th", "zh")).toBe("\u0e08\u0e35\u0e19\u0e01\u0e25\u0e32\u0e07");
    expect(courseName("zh", "th")).toBe("\u6cf0\u8bed");
  });

  it("falls back to English, never to native script alone", () => {
    expect(courseName("en", "zz-unknown")).toBe("zz-unknown");
    expect(courseName("th", "zz-unknown")).toBe("zz-unknown");
  });

  it("builds Learn sentences in the UI language", () => {
    expect(courseLearn("en", "th")).toBe("Learn Thai");
    expect(courseLearn("es", "th")).toBe("Aprende tailand\xe9s");
    expect(courseLearn("de", "fr")).toBe("Lerne Franz\xf6sisch");
    expect(courseLearn("fr", "th")).toBe("Apprends le tha\xef");
    expect(courseLearn("fr", "en")).toBe("Apprends l'anglais");
    expect(courseLearn("th", "th")).toBe("\u0e40\u0e23\u0e35\u0e22\u0e19\u0e44\u0e17\u0e22");
  });

  it("builds titles and blurbs from the Learn sentence", () => {
    expect(courseTitle("en", "th")).toBe("Learn Thai \xb7 Nicelingo");
    expect(courseTitle("es", "th")).toBe("Aprende tailand\xe9s \xb7 Nicelingo");
    expect(courseBlurb("en", "th")).toBe(
      "Learn Thai with bite-size photo lessons and pronunciation scoring. Unit 1 free.",
    );
    expect(courseBlurb("de", "de")).toContain("Lerne Deutsch mit");
  });
});
