// One-time audio generation for lesson manifests.
// Usage: CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... node scripts/generate-audio.mjs [en|es|de|fr|th] [NN]
// Text comes from scripts/manifests/{lang}-{NN}.json (dumped from the
// curriculum source), so generated clips always match what the app serves.
// Providers: en/es use Workers AI Aura-2; de/fr/th/zh use Google
// Gemini Flash TTS via AI Gateway (base64 WAV, converted to MP3 via
// ffmpeg; ~$0.0004 per short clip). Gemini replaced MiniMax (de, zh)
// and MeloTTS (fr) in Oct 2026 on voice picks (Charon+Aoede; Thai
// keeps Sulafat+Charon). Inworld TTS-2/Dennis was tried first but
// mispronounces a German verb form (3/3 draws); MiniMax reads it
// correctly (2/2). Thai reads scoreText (script), never the romanized
// display text; Sulafat won the shootout 8/8 in-budget over Zephyr
// (7/8), Kore, Aoede, and Leda.
// Re-runnable: skips files that already exist. Prints sizes only, never secrets.
import { mkdirSync, existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TEXT_OVERRIDES } from "../content/tts-overrides.mjs";

// Voice-scoped TTS prompt override lookup. A string value keeps its
// existing behavior (applies wherever overrides are honored). An object
// value { voice: text, default?: text } applies per voice slot, so one
// voice can get a phonetic respell without touching the others' QA'd
// clips. Returns null when no override applies.
function overrideText(phrase, voice) {
  const o = TEXT_OVERRIDES[phrase.id];
  if (typeof o === "string") return o;
  if (o && typeof o === "object")
    return o[voice ?? "default"] ?? o.default ?? null;
  return null;
}

const VOICES = {
  en: { provider: "workers-aura", model: "@cf/deepgram/aura-2-en", speaker: "luna" },
  es: { provider: "workers-aura", model: "@cf/deepgram/aura-2-es", speaker: "aquila" },
  fr: { provider: "gateway-gemini", model: "google/gemini-3.8-flash-tts", speaker: "Charon" },
  zh: { provider: "gateway-gemini", model: "google/gemini-3.8-flash-tts", speaker: "Charon" },
  th: { provider: "gateway-gemini", model: "google/gemini-3.8-flash-tts", speaker: "Sulafat" },
  de: { provider: "gateway-gemini", model: "google/gemini-3.8-flash-tts", speaker: "Charon" },
};

// Per-phrase voice overrides for clips where the default speaker misreads
// (QA-proven). Key is the manifest phrase id, value is the speaker name.
const VOICE_OVERRIDES = {
  // Complements aquila slurs (onset elision); alvaro renders them clean (QA Oct 2026).
  // [REVIEW] "mar" (sea) transcribes as "marzo" (March) in 5 nadaba-phrases;
  // judged Whisper LM bias (bare "En el mar." does it too; TTS rarely invents
  // syllables; sea image disambiguates). Native pass to confirm by ear.
  "es-145-girl-drinking-water": "alvaro",
  "es-148-man-dancing-home": "alvaro",
  "es-150-man-working-home": "alvaro",
  "es-151-man-swimming-sea": "alvaro",
  "es-153-doctor-drinking-coffee": "alvaro",
  "es-153-driver-drinking-coffee": "alvaro",
  "es-153-farmer-drinking-coffee": "alvaro",
  "es-154-farmer-cooking-fish": "alvaro",
  "es-155-doctor-playing-ball": "alvaro",
  "es-157-cat-running-park": "alvaro",
  "es-158-bird-drinking-water": "alvaro",
  "es-158-dog-drinking-water": "alvaro",
  "es-163-cyclist-eating-apple": "alvaro",
  "es-163-swimmer-drinking-juice": "alvaro",
  "es-164-cyclist-swimming-sea": "alvaro",
  "es-164-player-swimming-sea": "alvaro",
  "es-164-runner-swimming-sea": "alvaro",
  "es-164-swimmer-swimming-sea": "alvaro",
  "es-167-dancer-listening-music": "alvaro",
  "es-167-guitarist-listening-music": "alvaro",
  "es-194-grandfather-drinking-milk": "alvaro",
  "es-194-grandmother-drinking-milk": "alvaro",
  "es-195-grandmother-walking-park": "alvaro",
  "es-196-grandfather-listening-music": "alvaro",
  "es-198-baker-working-home": "alvaro",
  "es-198-cleaner-working-home": "alvaro",
  "es-199-cleaner-walking-park": "alvaro",
  "es-201-kitten-drinking-water": "alvaro",
  "es-201-puppy-drinking-water": "alvaro",
  "es-202-kitten-playing-ball": "alvaro",
  "es-203-chick-playing-ball": "alvaro",
  "es-203-kitten-running-park": "alvaro",
  "es-203-puppy-playing-ball": "alvaro",
  "es-206-man-dancing-home": "alvaro",
  "es-211-cat-eating-bread": "alvaro",
  "es-211-dog-eating-bread": "alvaro",
  "es-211-rabbit-playing-ball": "alvaro",
  "es-212-kitten-sleeping-home": "alvaro",
  "es-001-man-drinking": "alvaro",
  "es-001-woman-drinking": "alvaro",
  "es-001-boy-drinking": "alvaro",
  "es-001-girl-drinking": "alvaro",
  "es-003-dog-running": "alvaro",
  "es-003-dog-sleeping": "alvaro",
  "es-003-cat-running": "alvaro",
  "es-003-cat-sleeping": "alvaro",
  "es-005-man-swimming": "alvaro",
  "es-005-woman-swimming": "alvaro",
  "es-005-boy-swimming": "alvaro",
  "es-005-girl-swimming": "alvaro",
  "es-007-dog-eating": "alvaro",
  "es-007-dog-drinking": "alvaro",
  "es-007-cat-eating": "alvaro",
  "es-007-cat-drinking": "alvaro",
  "es-007-bird-drinking": "alvaro",
  "es-007-horse-drinking": "alvaro",
  "es-011-dog-jumping": "alvaro",
  "es-011-dog-sleeping": "alvaro",
  "es-011-cat-jumping": "alvaro",
  "es-011-cat-sleeping": "alvaro",
  "es-014-man-swimming": "alvaro",
  "es-014-woman-swimming": "alvaro",
  "es-014-boy-swimming": "alvaro",
  "es-014-girl-swimming": "alvaro",
  "es-017-swimmer-running": "alvaro",
  "es-017-swimmer-jumping": "alvaro",
  "es-019-runner-drinking": "alvaro",
  "es-019-swimmer-eating": "alvaro",
  "es-019-swimmer-drinking": "alvaro",
  "es-019-player-drinking": "alvaro",
  "es-019-cyclist-drinking": "alvaro",
  "es-020-runner-swimming": "alvaro",
  "es-020-swimmer-swimming": "alvaro",
  "es-020-player-swimming": "alvaro",
  "es-020-cyclist-swimming": "alvaro",
  "es-020-swimmer-running": "alvaro",
  "es-020-runner-running": "alvaro",
  "es-022-dancer-clapping": "alvaro",
  "es-023-dancer-singing": "alvaro",
  "es-023-dancer-listening": "alvaro",
  "es-026-grandfather-drinking": "alvaro",
  "es-026-grandmother-drinking": "alvaro",
  "es-026-uncle-drinking": "alvaro",
  "es-026-cousin-drinking": "alvaro",
  "es-027-grandfather-sleeping": "alvaro",
  "es-027-grandmother-sleeping": "alvaro",
  "es-029-cleaner-eating": "alvaro",
  "es-030-cleaner-working": "alvaro",
  "es-030-cleaner-talking": "alvaro",
  "es-030-baker-working": "alvaro",
  "es-031-cleaner-reading": "alvaro",
  "es-031-cleaner-working": "alvaro",
  "es-032-cleaner-walking": "alvaro",
  "es-032-baker-walking": "alvaro",
  "es-033-puppy-drinking": "alvaro",
  "es-033-kitten-drinking": "alvaro",
  "es-033-bunny-drinking": "alvaro",
  "es-033-chick-drinking": "alvaro",
  "es-033-kitten-eating": "alvaro",
  "es-035-kitten-running": "alvaro",
  "es-035-kitten-playing": "alvaro",
  "es-035-bunny-playing": "alvaro",
  // Default speaker misreads a clipped noun 2/2 (MiniMax tianmei era);
  // Aoede is the Gemini stand-in for this phrase.
  "zh-044-chick-sleeping": "Aoede",
  // Charon slurs "Schreibt" to "Schreit" across draws; Aoede is exact.
  "de-218-woman-writing": "Aoede",
  "de-218-girl-writing": "Aoede",
  // Default speaker reduces the noun onset 8/8 (~75); Charon keeps it (92).
  "th-007-dog-drinking": "Charon",
  // Default speaker draws 67-class takes 8/8; Zephyr keeps onset (92).
  "th-007-bird-drinking": "Zephyr",
  // Sulafat/Zephyr cap at 83-84 on the verb ending (15+ draws); Puck 95.
  "th-010-woman-laughing": "Puck",
  // Sulafat/Zephyr drop the noun's final consonant (77-82); Puck 86.
  "th-021-guitarist-singing": "Puck",
  // Sulafat/Zephyr/Charon cap 69-81 on vowel reductions; Puck 94.
  "th-022-dancer-smiling": "Puck",
  // Sulafat/Puck/Zephyr cap at 82 on the onsets; Charon 86.
  "th-023-guitarist-singing": "Charon",
  // Sulafat/Puck cap 79-84 on the verb ending; Charon keeps noun+verb (95).
  "th-024-singer-laughing": "Charon",
  // Sulafat caps 75-84; Puck keeps noun + ending (95).
  "th-024-drummer-laughing": "Puck",
  // Sulafat/Puck cap 79-84 on noun+verb; Charon keeps both (95).
  "th-024-dancer-laughing": "Charon",
  // Sulafat/Puck/Zephyr cap 56-83 on the noun's final consonant; Charon 94.
  "th-030-waiter-talking": "Charon",
  // Sulafat/Zephyr/Charon mangle noun+verb (33-58); Puck exact (100).
  "th-032-cook-walking": "Puck",
  // Sulafat/Zephyr/Charon cap 72-84 on the final consonant; Puck 94.
  "th-029-waiter-eating": "Puck",
  // Sulafat/Puck/Zephyr cap 43-67 on noun+verb; Charon keeps both (92).
  "th-032-cook-smiling": "Charon",
};

// Per-phrase TTS-prompt overrides (TEXT_OVERRIDES, imported above) live
// in content/tts-overrides.mjs — content-owned, since prompts are
// lesson sentences. Fake stand-in ships in the code repo; the merge
// overlays the real file.

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lang = process.argv[2] ?? "en";
const lesson = process.argv[3] ?? "01";
const voice = VOICES[lang];
const manifestPath = join(root, "scripts", "manifests", `${lang}-${lesson}.json`);
if (!voice || !existsSync(manifestPath)) {
  console.error(`unknown combination ${lang} ${lesson}; want [en|es|de|fr|th] [NNN]`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const token = process.env.CLOUDFLARE_API_TOKEN;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token || !account) {
  console.error("missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID");
  process.exit(1);
}

async function synthAura(text, speaker) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${voice.model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, speaker, encoding: "mp3" }),
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { bytes: new Uint8Array(await res.arrayBuffer()), contentType: "audio/mpeg" };
}

async function synthMelotts(text) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${voice.model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: text, lang: voice.lang }),
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const wav = Buffer.from(data?.result?.audio ?? "", "base64");
  if (wav.length < 1000) throw new Error(`bad melotts payload: ${JSON.stringify(data).slice(0, 120)}`);
  return { wav };
}

async function synthGateway(text, speaker) {
  // Third-party input shapes differ per provider family: MiniMax takes
  // `format`, Inworld takes `output_format`.
  const input = voice.model.startsWith("minimax/")
    ? { text, voice_id: speaker, format: "mp3" }
    : { text, voice_id: speaker, output_format: "mp3" };
  // MiniMax flakes intermittently (HTTP 503 "upstream unavailable");
  // retry transient 5xx instead of failing the lesson.
  let res = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: voice.model, input }),
      },
    );
    if (res.ok || (res.status < 500 && res.status !== 429)) break;
    if (attempt < 4) await new Promise((r) => setTimeout(r, 3000 * attempt));
  }
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const url = data?.result?.audio ?? data?.result?.result?.audio;
  if (!url) throw new Error(`no audio URL: ${JSON.stringify(data).slice(0, 120)}`);
  const audio = await fetch(url);
  if (!audio.ok) throw new Error(`audio download HTTP ${audio.status}`);
  return { bytes: new Uint8Array(await audio.arrayBuffer()), contentType: "audio/mpeg" };
}

async function synthGemini(text, speaker) {
  // Gemini TTS takes `voice` (not voice_id) and returns base64 WAV inline
  // (no audio URL to download); the caller converts to MP3 via ffmpeg.
  let res = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: voice.model, input: { text, voice: speaker } }),
      },
    );
    if (res.ok || (res.status < 500 && res.status !== 429)) break;
    if (attempt < 4) await new Promise((r) => setTimeout(r, 3000 * attempt));
  }
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const payload = data?.result?.audio ?? "";
  const b64 = payload.includes(",") ? payload.split(",").pop() : payload;
  const wav = Buffer.from(b64, "base64");
  if (wav.length < 1000) throw new Error(`bad gemini payload: ${JSON.stringify(data).slice(0, 120)}`);
  return { wav };
}

// VOICE_FILTER limits generation to matching targets ("default" or an
// alt voice id), so a rollout can add one voice without regenerating
// the clips that already exist in R2.
const voiceFilter = process.env.VOICE_FILTER ?? null;
for (const phrase of manifest.phrases) {
  const targets = [
    { url: phrase.audioUrl, voice: null },
    ...Object.entries(phrase.audioUrls ?? {}).map(([v, url]) => ({ url, voice: v })),
  ].filter((t) => !voiceFilter || (t.voice ?? "default") === voiceFilter);
  for (const target of targets) {
  const dest = join(root, "public", target.url);
  if (existsSync(dest)) {
    console.log(`${phrase.id}[${target.voice ?? "default"}]: exists, skipping`);
    continue;
  }
  mkdirSync(dirname(dest), { recursive: true });
  try {
    // Alt voices always speak for themselves; overrides below apply to
    // the default voice only (they were QA'd as replacements for it).
    // VOICE_OVERRIDES are Aura speaker names (melotts ignores them);
    // gateway voices use them as voice_id (e.g. MiniMax zh override),
    // and Gemini voices use them as voice names.
    // Aquila cannot render Spanish future -á endings (wrong-language
    // gibberish or present-tense collapsing across draws), while alvaro
    // reads all 8 L3 phrases cleanly. L3 (097-144) is the future level,
    // so it defaults to alvaro; explicit overrides still win either way.
    const speaker =
      (target.voice
        ? voice.provider === "gateway-gemini"
          ? target.voice[0].toUpperCase() + target.voice.slice(1)
          : target.voice
        : null) ??
      VOICE_OVERRIDES[phrase.id] ??
      (lang === "es" && lesson >= "097" && lesson <= "144" ? "alvaro" : voice.speaker);
    if (voice.provider === "workers-melotts" || voice.provider === "gateway-gemini") {
      // MeloTTS renders "a + vowel-participle" as one blur that Whisper
      // hears as present tense, dropping the auxiliary (070). A comma
      // forces a micro-pause so the auxiliary survives;
      // manifest/reference text is unchanged and learners mimic the
      // clearer audio (evidenced: paused variant recovers the full word
      // count where the plain take drops one). Same treatment for the
      // "a ri" boundary, which otherwise collapses to a name-like
      // mishearing (072: comma-first strictly better in all 4 samples).
      // Gemini Thai reads scoreText: the display text is romanization,
      // which no TTS can render as Thai.
      const ttsText =
        voice.provider === "gateway-gemini"
          ? (overrideText(phrase, target.voice) ?? phrase.scoreText ?? phrase.text)
          : (overrideText(phrase, target.voice) ??
            phrase.text.replace(/ a ([aeiouéèê])/g, " a, $1").replace(/ a (ri\.)/g, " a, $1"));
      const { wav } =
        voice.provider === "gateway-gemini"
          ? await synthGemini(ttsText, speaker)
          : await synthMelotts(ttsText);
      const tmp = join(tmpdir(), `nicelingo-${phrase.id}-${target.voice ?? "default"}-${process.pid}.wav`);
      writeFileSync(tmp, wav);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-codec:a", "libmp3lame", "-q:a", "4", dest], { stdio: "pipe" });
      unlinkSync(tmp);
      console.log(`${phrase.id}: wrote mp3 via ${voice.provider === "gateway-gemini" ? "gemini+ffmpeg" : "melotts+ffmpeg"}`);
    } else {
      // Gateway voices (zh MiniMax) read scoreText when present: zh text
      // is pinyin, which the voice would render as gibberish. Single-label
      // languages carry no scoreText, so this falls through to text there.
      const { bytes, contentType } =
        voice.provider === "gateway"
          ? await synthGateway(overrideText(phrase, target.voice) ?? phrase.scoreText ?? phrase.text, speaker)
          : await synthAura(overrideText(phrase, target.voice) ?? phrase.text, speaker);
      writeFileSync(dest, bytes);
      console.log(`${phrase.id}[${target.voice ?? "default"}]: ${bytes.length} bytes (${contentType})`);
    }
  } catch (err) {
    console.error(`${phrase.id}[${target.voice ?? "default"}]: ${err.message}`);
    process.exit(1);
  }
  }
}
console.log("done");
