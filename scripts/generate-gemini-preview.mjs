// Gemini voice-preview samples for languages where MiniMax is the
// current provider (de, zh): one sample sentence per candidate voice
// through the AI Gateway, written to /tmp/voice-preview-{lang}/ for
// Whisper QA and R2 upload (voice-preview/{lang}/{id}/sample.mp3).
// Usage: set -a && . /root/.env && set +a &&
//   node scripts/generate-gemini-preview.mjs [de] [zh]
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const token = process.env.CLOUDFLARE_API_TOKEN;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token || !account) throw new Error("need CLOUDFLARE_API_TOKEN/ACCOUNT_ID");

const LANGS = {
  de: { text: "Der Mann isst.", voices: ["Kore", "Aoede", "Charon", "Fenrir"] },
  zh: { text: "\u7537\u4EBA\u6B63\u5728\u5403\u3002", voices: ["Kore", "Aoede", "Charon", "Fenrir"] },
};

async function synth(text, voice) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-3.8-flash-tts", input: { text, voice } }),
    });
    if (res.ok) {
      const data = await res.json();
      const payload = data?.result?.audio ?? "";
      const wav = Buffer.from(payload.includes(",") ? payload.split(",").pop() : payload, "base64");
      if (wav.length < 1000) throw new Error("bad gemini payload");
      return wav;
    }
    if (res.status < 500 && res.status !== 429) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
    await new Promise((r) => setTimeout(r, 3000 * attempt));
  }
  throw new Error("gateway retries exhausted");
}

const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(LANGS);
for (const lang of want) {
  const { text, voices } = LANGS[lang];
  const dir = `/tmp/voice-preview-${lang}`;
  mkdirSync(dir, { recursive: true });
  for (const voice of voices) {
    const wav = await synth(text, voice);
    const tmp = join(tmpdir(), `nl-gemini-${lang}-${voice}.wav`);
    writeFileSync(tmp, wav);
    const dest = join(dir, `${voice.toLowerCase()}.mp3`);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-codec:a", "libmp3lame", "-q:a", "4", dest], { stdio: "pipe" });
    console.log(`${lang}/${voice.toLowerCase()}.mp3 written`);
  }
}
console.log("done");
