// Conversation line audio: one clip per scene line, spoken by the
// line's speaker voice from the dumped conversation manifests
// (scripts/manifests/conv-{lang}-{unit}.json, via dump-manifests).
// English lines use Workers AI Aura-2 (speaker ids are the manifest
// voice names); clips are slowed to 85% like the Spanish scenes.
// Usage: set -a && . /root/.env && set +a &&
//   node scripts/generate-conv-audio.mjs en [unit ...]
import { mkdirSync, existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = process.env.CLOUDFLARE_API_TOKEN;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token || !account) throw new Error("need CLOUDFLARE_API_TOKEN/ACCOUNT_ID");

const lang = process.argv[2] ?? "en";
const MODELS = { en: "@cf/deepgram/aura-2-en", es: "@cf/deepgram/aura-2-es" };
// de/fr/th/zh conversation lines use Gemini via the AI Gateway
// (voice names come from the manifest: Charon/Aoede, Sulafat/Charon).
const GEMINI_LANGS = new Set(["de", "fr", "th", "zh"]);
const model = MODELS[lang];
if (!model && !GEMINI_LANGS.has(lang)) throw new Error(`no TTS model for ${lang}`);

async function synthGemini(text, speaker) {
  let res = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-3.8-flash-tts", input: { text, voice: speaker } }),
    });
    if (res.ok || (res.status < 500 && res.status !== 429)) break;
    if (attempt < 4) await new Promise((r) => setTimeout(r, 3000 * attempt));
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const payload = data?.result?.audio ?? "";
  const b64 = payload.includes(",") ? payload.split(",").pop() : payload;
  const wav = Buffer.from(b64, "base64");
  if (wav.length < 1000) throw new Error("bad gemini payload");
  return wav;
}

const units = process.argv.slice(3).length
  ? process.argv.slice(3).map(Number)
  : Array.from({ length: 12 }, (_, i) => i + 1);

async function synth(text, speaker) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text, speaker, encoding: "mp3" }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.length < 500) throw new Error(`short clip ${buf.length}b`);
  return buf;
}

let made = 0, skipped = 0;
for (const unit of units) {
  const scene = JSON.parse(readFileSync(join(root, "scripts/manifests", `conv-${lang}-${unit}.json`), "utf8"));
  const readPhrases = (scene.readCard?.questions ?? []).flatMap((q) => [q.prompt, ...q.options]);
  for (const line of [...scene.lines.flatMap((l) => [l, ...(l.alternatives ?? []).map((a) => ({ ...a, speaker: l.speaker }))]), ...readPhrases.map((p) => ({ ...p, speaker: "A" }))]) {
    const dest = join(root, "public", line.audioUrl);
    if (existsSync(dest)) { skipped++; continue; }
    const speaker = scene.speakers[line.speaker].voice;
    const raw = join(tmpdir(), `nl-conv-${line.id}.${GEMINI_LANGS.has(lang) ? "wav" : "mp3"}`);
    writeFileSync(raw, GEMINI_LANGS.has(lang) ? await synthGemini(line.scoreText ?? line.text, speaker) : await synth(line.text, speaker));
    mkdirSync(dirname(dest), { recursive: true });
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-filter:a", "atempo=0.85", dest], { stdio: "pipe" });
    unlinkSync(raw);
    made++;
    console.log(`${line.id} [${speaker}]: ${line.text}`);
  }
}
console.log(`done: ${made} made, ${skipped} skipped`);
