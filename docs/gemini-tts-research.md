# Gemini TTS vs MiniMax speech-2.8-turbo — Nicelingo expansion research

Date: 2026-10-19. Sources: primary/official only (Google AI Gemini API docs, Cloudflare AI Gateway docs, MiniMax platform docs). Anything not confirmable from those sources is flagged **Unconfirmed**.

Scope note: this covers the Gemini API TTS models (Gemini Developer API). Google Cloud Text-to-Speech (cloud.google.com) is a separate product/API with its own voice catalogue and per-character pricing; it is not covered here and should not be conflated with Gemini TTS.

## 1. Gemini TTS models and language coverage

### Models that officially exist

| Model ID | Status | Notes |
|---|---|---|
| `gemini-2.5-flash-preview-tts` | Preview, shutdown 2026-11-17 | Replacement: `gemini-3.8-flash-tts` / `gemini-3.8-flash-lite-tts` |
| `gemini-2.5-pro-preview-tts` | Preview, shutdown 2026-11-17 | Same replacement |
| `gemini-3.1-flash-tts-preview` | Preview, shutdown 2026-11-17 | Same replacement |
| `gemini-3.8-flash-tts` | Current flagship (Sep 2026) | 130 languages |
| `gemini-3.8-flash-lite-tts` | Current high-throughput tier (Sep 2026) | 101 languages |

Sources: [Gemini deprecations](https://ai.google.dev/gemini-api/docs/deprecations), [Gemini models index](https://ai.google.dev/gemini-api/docs/models), [Gemini 3.8 Flash TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash-tts).

So yes — a `gemini-3.x` Flash TTS officially exists, in two forms: `gemini-3.1-flash-tts-preview` (being retired) and the current `gemini-3.8-flash-tts` / `gemini-3.8-flash-lite-tts`. There is no `gemini-3.x-pro-tts` in the official model list. Source: [models index](https://ai.google.dev/gemini-api/docs/models).

Do not build new work on the 2.5 or 3.1 TTS models: all three shut down 2026-11-17. Source: [deprecations](https://ai.google.dev/gemini-api/docs/deprecations).

### Language matrix for Nicelingo languages

Gemini columns are from the official supported-languages table, which lists languages by name/script (not BCP-47 locale). Source: [Text-to-speech guide — Supported languages](https://ai.google.dev/gemini-api/docs/speech-generation#languages) and [Gemini 3.8 Flash TTS — Supported languages](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash-tts). MiniMax column is from its official 40-language list. Source: [MiniMax Synchronous TTS guide — Supported Languages](https://platform.minimax.io/docs/guides/speech-t2a-websocket).

| Language | Gemini 3.8 Flash TTS | Gemini 3.8 Flash-Lite TTS | MiniMax speech-2.8 (40 langs) |
|---|---|---|---|
| German (de) | Yes | Yes | Yes |
| Mandarin Chinese (zh) | Yes — listed as Chinese (Hans script) and Chinese (Hant script); also Cantonese listed separately | Yes (same) | Yes — Chinese; Cantonese listed separately |
| Thai (th) | Yes | **No** | Yes |
| French (fr) | Yes | Yes | Yes |
| Spanish (es) | Yes | Yes | Yes |
| English (en) | Yes | Yes | Yes |
| Italian (it) | Yes | Yes | Yes |
| Portuguese (pt) | Yes | Yes | Yes |
| Japanese (ja) | Yes | Yes | Yes |
| Korean (ko) | Yes | Yes | Yes |
| Dutch (nl) | Yes | Yes | Yes |
| Polish (pl) | Yes | Yes | Yes |
| Swedish (sv) | Yes | **No** | Yes |
| Hindi (hi) | Yes | Yes | Yes |
| Indonesian (id) | Yes | Yes | Yes |
| Vietnamese (vi) | Yes | Yes | Yes |
| Turkish (tr) | Yes | Yes | Yes |
| Arabic (ar) | Yes — Standard Arabic (Arab script), Standard Arabic (Latn script), Egyptian Arabic | Yes (same) | Yes — Arabic |
| Russian (ru) | Yes | Yes | Yes |
| Ukrainian (uk) | **No — absent from the 130-language table** | **No** | Yes |

Key gaps to plan around:

- Gemini Flash-Lite TTS does **not** support Thai or Swedish (nor Finnish, Burmese, Lithuanian, Slovenian, Swahili, Tajik, Uyghur and several others). Thai — an existing Nicelingo language — requires the full `gemini-3.8-flash-tts`, not Lite. Source: [speech-generation languages table](https://ai.google.dev/gemini-api/docs/speech-generation#languages).
- Gemini 3.8 TTS (both tiers) does **not** list Ukrainian. MiniMax does. If Ukrainian becomes a course language, Gemini TTS alone cannot cover it per current docs.
- Mandarin locale granularity (`cmn-CN` vs `cmn-TW`): **Unconfirmed** as a selectable TTS locale. The Gemini TTS language table distinguishes script (Hans/Hant) and lists Cantonese separately, but does not publish BCP-47 locale codes (e.g. `cmn-CN`, `cmn-TW`, `zh-TW`) for synthesis. Locale-level selection exists only as a *filter* on the Extended Voice Library (`language_code` is a BCP-47 tag such as `en-US`), which implies regional voices exist but does not guarantee a `cmn-TW` voice. Sources: [speech-generation — Supported languages](https://ai.google.dev/gemini-api/docs/speech-generation#languages), [speech-generation — Extended Voice Library filtering](https://ai.google.dev/gemini-api/docs/speech-generation#voices). MiniMax likewise lists "Chinese" and "Cantonese" without a Taiwan-Mandarin locale; its `language_boost` enum has `Chinese` and `Chinese,Yue` only. Source: [MiniMax T2A HTTP API reference](https://platform.minimax.io/docs/api-reference/speech-t2a-http).
- Per-model language lists for the retiring 2.5/3.1 TTS models: **Unconfirmed** from current docs. The current speech-generation guide only tabulates the 3.8 models; the 2.5 model pages give token limits and capabilities but no language table. Do not rely on older third-party counts (e.g. "70+ languages") for procurement decisions. Sources: [Gemini 2.5 Flash TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-preview-tts), [Gemini 2.5 Pro TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro-preview-tts).

## 2. Voice catalogue

### Gemini

- 30 prebuilt studio voices for the 3.8 models: Zephyr (Bright), Puck (Upbeat), Charon (Informative), Kore (Firm), Fenrir (Excitable), Leda (Youthful), Orus (Firm), Aoede (Breezy), Callirrhoe (Easy-going), Autonoe (Bright), Enceladus (Breathy), Iapetus (Clear), Umbriel (Easy-going), Algieba (Smooth), Despina (Smooth), Erinome (Clear), Algenib (Gravelly), Rasalgethi (Informative), Laomedeia (Upbeat), Achernar (Soft), Alnilam (Firm), Schedar (Even), Gacrux (Mature), Pulcherrima (Forward), Achird (Friendly), Zubenelgenubi (Casual), Vindemiatrix (Gentle), Sadachbia (Lively), Sadaltager (Knowledgeable), Sulafat (Warm). Source: [speech-generation — Prebuilt voices](https://ai.google.dev/gemini-api/docs/speech-generation#voices).
- The prebuilt table gives a one-word style descriptor per voice. It does **not** assign gender, age, or language to prebuilt voices. Gender/pitch/accent metadata exists on Extended Voice Library entries, filterable via `GET /v1beta/voices` (`gender`: female/male/neutral; `pitch`: low/medium/high; plus `language_code`, `region_code`, `accent`, `persona`, `contexts`). Source: [speech-generation — Extended Voice Library and filtering](https://ai.google.dev/gemini-api/docs/speech-generation#voices).
- Beyond the 30, there are three more voice sources: Extended Voice Library ("hundreds" of voices across languages/accents), Voice design (custom persona from a text description, `voice_...` ID), and Voice replication (cloning). Custom voices: max 200 stored voices/project, 1-year TTL from last use; stateless keys 7-day TTL. Source: [speech-generation — Voice options](https://ai.google.dev/gemini-api/docs/speech-generation#voices).
- Same voices across languages? The docs present the 30 prebuilt voices as language-agnostic and state the model auto-detects input language (see below); no per-voice language restriction is documented for prebuilt voices. **Unconfirmed** whether every prebuilt voice renders every one of the 130 languages with equal quality — Google does not publish a voice × language matrix. The Extended Library is explicitly organised by language/accent, so for locale-specific casting use `client.voices.list(language_code=[...])` rather than assuming a prebuilt voice is optimal in-language. Source: [speech-generation](https://ai.google.dev/gemini-api/docs/speech-generation).
- Language specification: language is **auto-detected**, not specified. "The TTS models detect the input language automatically." There is no `language_code` synthesis parameter in the documented TTS request; the request carries text + `speech_config.voice`. Practical consequence: short or ambiguous phrases (loanwords, proper names, mixed-script) can be detected wrong — mitigate by QA transcription (Section 6). Source: [speech-generation — Supported languages](https://ai.google.dev/gemini-api/docs/speech-generation#languages).
- Style control is via natural language, not SSML: turn-level `speech_metadata.style` (e.g. "cheerful and friendly", "speaking slowly") plus inline angle-bracket vocal tags (`<laugh>`, `<sigh>`, `<short pause>`). Multi-speaker: up to 2 speakers per request with prebuilt voices. Source: [speech-generation](https://ai.google.dev/gemini-api/docs/speech-generation).

### MiniMax (for comparison)

- Voices are addressed by `voice_id`: system voices (e.g. `English_expressive_narrator`, `Chinese (Mandarin)_Lyrical_Voice`), cloned voices, and AI-designed voices; full catalogue via System Voice ID list / Get Voice API. Voices are language-labelled in their IDs, i.e. casting is per-language rather than one voice for all languages. Source: [MiniMax T2A HTTP API reference — voice_setting](https://platform.minimax.io/docs/api-reference/speech-t2a-http).
- Language handling: `language_boost` enum (Chinese, Chinese,Yue, English, Arabic, Russian, Spanish, French, Portuguese, German, Turkish, Dutch, Ukrainian, Vietnamese, Indonesian, Japanese, Italian, Korean, Thai, Polish, Romanian, Greek, Czech, Finnish, Hindi, Bulgarian, Danish, Hebrew, Malay, Persian, Slovak, Swedish, Croatian, Filipino, Hungarian, Norwegian, Slovenian, Catalan, Nynorsk, Tamil, Afrikaans) or `auto` for automatic detection. Source: [MiniMax T2A HTTP API reference](https://platform.minimax.io/docs/api-reference/speech-t2a-http).
- Voice design $3/voice, rapid cloning $1.50/voice (charged on first synthesis use). Source: [MiniMax Pricing Overview — Audio](https://platform.minimax.io/docs/pricing/overview#models/speech).

## 3. Pricing

### Gemini (per 1M tokens, Paid Tier, Standard unless noted)

Audio output tokens are metered at 25 tokens per second of audio. Source: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) (footnote on each TTS table: "Audio tokens correspond to 25 tokens per second of audio").

| Model | Input (text) $/1M tok | Output (audio) $/1M tok | Batch input/output |
|---|---|---|---|
| `gemini-2.5-flash-preview-tts` | $0.50 | $10.00 | $0.25 / $5.00 |
| `gemini-2.5-pro-preview-tts` | $1.00 | $20.00 | $0.50 / $10.00 |
| `gemini-3.1-flash-tts-preview` | $1.00 | $20.00 | $0.50 / $10.00 |
| `gemini-3.8-flash-tts` (to 2026-12-31) | $0.50 | $9.00 | $0.25 / $4.50 |
| `gemini-3.8-flash-tts` (from 2027-01-01) | $1.00 | $18.00 | $0.50 / $9.00 |
| `gemini-3.8-flash-lite-tts` (to 2026-12-31) | $0.50 | $6.00 | $0.25 / $3.00 |
| `gemini-3.8-flash-lite-tts` (from 2027-01-01) | $1.00 | $12.00 | $0.50 / $6.00 |

Source: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing). The 3.8 prices are introductory and double on 2027-01-01; budget at the 2027 rates. 2.5 Pro TTS has no free tier; the others list "Free of charge" on the free tier (subject to free-tier rate limits, Section 5). Flex/Priority tiers also exist for 3.8 (Flex = Batch price; Priority ≈ 1.8× Standard input, 1.8× output).

### Conversion to cost per 1M characters (estimate — read assumptions)

Gemini bills tokens, not characters, so a per-character figure requires assumptions. Stated assumptions (English-like text): ~4 characters per input text token → 1M characters ≈ 250k input tokens. Speech at ~800 characters/minute → 1M characters ≈ 1,250 minutes ≈ 75,000 seconds of audio ≈ 1.875M audio output tokens (at 25 tok/s). Output tokens dominate (>98% of cost).

| Model (Standard) | Input cost /1M chars | Output cost /1M chars | Total ≈ /1M chars | Batch total ≈ |
|---|---|---|---|---|
| 2.5 Flash TTS | $0.13 | $18.75 | **~$19** | ~$9 |
| 2.5 Pro / 3.1 Flash TTS | $0.25 | $37.50 | **~$38** | ~$19 |
| 3.8 Flash TTS (2026 price) | $0.13 | $16.88 | **~$17** | ~$9 |
| 3.8 Flash TTS (2027 price) | $0.25 | $33.75 | **~$34** | ~$17 |
| 3.8 Flash-Lite TTS (2026 price) | $0.13 | $11.25 | **~$11** | ~$6 |
| 3.8 Flash-Lite TTS (2027 price) | $0.25 | $22.50 | **~$23** | ~$11 |

Caveats: token-per-character and characters-per-minute vary by language (CJK tokenises differently and speaking rates differ), so treat these as order-of-magnitude planning numbers, not quotes. The conversion method (25 audio tok/s) is official; the text-token and speech-rate assumptions are ours.

At Nicelingo scale this is small either way: 1,500 clips × ~40 characters ≈ 60k characters per language ≈ ~$0.70–$2.30 per language on Gemini Standard (2026–2027 range), less on Batch — before re-takes.

### MiniMax

- `speech-2.8-turbo`: **$60 per 1M characters** (sync and async, same price). `speech-2.8-hd`: $100 per 1M characters. Legacy 2.6/02 models: same $60/$100. Source: [MiniMax Pricing Overview — Audio](https://platform.minimax.io/docs/pricing/overview#models/speech).
- MiniMax bills characters directly (`usage_characters` in the response), so its per-character cost is exact, not an estimate. Source: [MiniMax T2A HTTP API reference](https://platform.minimax.io/docs/api-reference/speech-t2a-http).
- Headline comparison: MiniMax Turbo ($60/1M chars flat) is ~3–5× the estimated Gemini Flash-Lite cost and ~2–3× Gemini 3.8 Flash at 2027 Standard prices; Gemini Batch roughly halves the Gemini figures. Gemini is cheaper for bulk offline generation; MiniMax pricing is simpler to predict.

## 4. Cloudflare AI Gateway support

- Officially supported provider path: `google-ai-studio`. Base URL `https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/google-ai-studio`, then append the native Gemini REST path, e.g. `v1/models/{model}:generateContent`. Auth via `x-goog-api-key` (own key), stored keys (BYOK), or Unified Billing; optional `cf-aig-authorization` gateway token. The `@google/genai` SDK can be pointed at the gateway via `httpOptions.baseUrl`. Source: [Cloudflare AI Gateway — Google AI Studio provider](https://developers.cloudflare.com/ai-gateway/usage/providers/google-ai-studio/).
- Does it support Gemini **TTS** specifically? **Unconfirmed.** The provider doc demonstrates `generateContent` with text models and describes generic proxying of Gemini requests; it does not name any TTS model, the Interactions API (`v1beta/interactions`, which the current 3.8 TTS guide uses), or audio responses. Because the gateway is a pass-through to the native REST path, a TTS `generateContent` call is *expected* to route, but that is an inference, not a documented guarantee — verify with one real TTS request through the gateway before building on it.
- Binary audio caveat: Gemini TTS returns audio as base64 inside JSON (`steps[].content[].data` / `output_audio.data`), not as a raw binary body, so the classic "gateway mangles binary" risk is low for unary calls. Source: [speech-generation — Single-speaker TTS](https://ai.google.dev/gemini-api/docs/speech-generation). AI Gateway docs note binary inside multipart payloads is not inspected (relevant to DLP, not TTS routing). Source: [AI Gateway llms-full](https://developers.cloudflare.com/ai-gateway/llms-full.txt).
- Streaming caveat: Gemini TTS streaming (`stream: true`) returns chunked raw PCM over the Interactions API. Streaming through AI Gateway is **Unconfirmed** for TTS; separately, AI Gateway buffers the full response when DLP response scanning is enabled on streaming requests. For offline clip generation you do not need streaming — use unary requests. Sources: [speech-generation — streaming](https://ai.google.dev/gemini-api/docs/speech-generation), [AI Gateway llms-full](https://developers.cloudflare.com/ai-gateway/llms-full.txt).
- Rate caveat: Unified Billing requests are capped at 200 requests/60s per gateway (does not apply to BYOK with your own Google key). Gateway cache limit 25 MB/request is irrelevant at clip scale. Source: [AI Gateway Limits](https://developers.cloudflare.com/ai-gateway/reference/limits/).
- Existing Nicelingo precedent (from project history, not a doc claim): German was already generated with MiniMax speech-2.8-turbo routed through AI Gateway third-party billing at ~$2.40/language. That shows MiniMax-via-Gateway works in production here; it does not evidence Gemini-TTS-via-Gateway.

## 5. API constraints for generating ~1,500 short clips per language

### Gemini TTS

- Input/output token limits (all current and retiring TTS models): input 8,192 tokens, output 16,384 tokens. At 25 audio tokens/second, max output ≈ 655 seconds (~11 minutes) of audio per request. A short phrase clip uses a tiny fraction of this; one phrase per request is comfortably within limits. Sources: [Gemini 3.8 Flash TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash-tts), [Gemini 2.5 Flash TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-preview-tts), [Gemini 3.1 Flash TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-tts-preview).
- No documented per-request *character* limit separate from the 8,192 input-token limit. **Unconfirmed:** any lower TTS-specific text cap — none is stated in the guide. Source: [speech-generation](https://ai.google.dev/gemini-api/docs/speech-generation).
- Output format (3.8 models): unary requests return WAV (`audio/wav`, RIFF header, 24 kHz mono 16-bit LE PCM) by default — write bytes straight to `.wav`. Streaming returns headerless raw PCM (`audio/l16`, 24 kHz mono). Also available: `audio/l16`, `audio/mulaw`, `audio/alaw`, with optional `sample_rate` (e.g. 24000/16000/8000). Older models (≤3.1) returned raw `audio/l16` by default — if reusing old code that wraps PCM in a WAV header, remove that step for 3.8. Source: [speech-generation — Audio output formats](https://ai.google.dev/gemini-api/docs/speech-generation#audio-output-formats).
- SSML: **not supported / not documented.** No SSML element is mentioned anywhere in the TTS guide; control is via `speech_metadata.style` + inline vocal tags + punctuation/capitalisation for emphasis. If the pipeline needs SSML (breaks, phonemes), Gemini TTS cannot provide it per current docs — use punctuation/`<short pause>` instead. Source: [speech-generation](https://ai.google.dev/gemini-api/docs/speech-generation).
- Multi-speaker: max 2 speakers per request (prebuilt voices only for single-request multi-speaker). Irrelevant for single-voice phrase clips. Source: [speech-generation — Limitations](https://ai.google.dev/gemini-api/docs/speech-generation#limitations).
- Rate limits: per-project (not per-key), tier-based; exact RPM/TPM for TTS are shown only in AI Studio (docs defer to [AI Studio rate limits](https://aistudio.google.com/rate-limit)). Documented Batch enqueued-token caps (relevant if using Batch API): Tier 1 — 2.5 Flash TTS 100,000, 2.5 Pro TTS 25,000; Tier 3 — 4,000,000 / 1,000,000 respectively. Batch: max 100 concurrent batch requests, 2 GB input file. Source: [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits). **Unconfirmed:** batch enqueued caps for the 3.8 TTS models (table lists the 2.5 TTS rows; 3.8 TTS rows were not in the published table at fetch time) and free-tier RPM/TPM numbers (an older snapshot showed 2.5 Flash Preview TTS at 10 RPM / 10,000 TPM / 100 RPD on the free tier — treat as indicative only). For 1,500 short clips/language, even Tier 1 is ample with a sequential or lightly concurrent script; expect the job to be minutes-to-tens-of-minutes per language, dominated by per-request latency, not quota.

### MiniMax speech-2.8-turbo

- Sync HTTP/WebSocket: text must be < 10,000 characters per request; streaming recommended over 3,000 characters. Async T2A: up to 1M characters per request. Sources: [MiniMax T2A HTTP API reference](https://platform.minimax.io/docs/api-reference/speech-t2a-http), [MiniMax Pricing Overview](https://platform.minimax.io/docs/pricing/overview#models/speech).
- Output: `mp3`, `pcm`, or `flac`; sample rates configurable (examples use 32,000 Hz); hex or URL delivery (URL valid 24h, non-streaming only). Pause markers `<#x#>`, inline Pinyin/IPA/Jyutping pronunciation overrides, and (2.8-only) interjection tags like `(laughs)`, `(sighs)`. No SSML either — its controls are proprietary equivalents. Source: [MiniMax T2A HTTP API reference](https://platform.minimax.io/docs/api-reference/speech-t2a-http).
- Rate limit: T2A 60 RPM for speech-2.8/2.6/02 models (pay-as-you-go). Audio Subscription plans raise RPM (10–800 by tier). Source: [MiniMax Rate Limits — Speech](https://platform.minimax.io/docs/guides/rate-limits#speech). At 60 RPM, 1,500 clips ≈ 25 minutes minimum per language if one clip per request.

## 6. Recommendation for the Nicelingo phrase-clip pipeline

Workload: ~1,500 short phrases per language, single voice to start, offline script, QA by transcription (existing pattern: generate → transcribe → compare → re-take failures).

1. **Default to Gemini `gemini-3.8-flash-lite-tts` where it covers the language; use `gemini-3.8-flash-tts` for Thai, Swedish, and any Lite-missing language.** Rationale: Lite is the cheapest Gemini tier (~$11/1M chars at 2026 Standard, ~$23 at 2027 prices; ~half on Batch) and is positioned by Google as the high-volume workhorse and the replacement for 3.1 Flash TTS Preview. Full Flash covers all current Nicelingo languages (de, zh, th, fr, es, en) plus every candidate language except Ukrainian. Sources: [pricing](https://ai.google.dev/gemini-api/docs/pricing), [speech-generation — When to use which model](https://ai.google.dev/gemini-api/docs/speech-generation#when-to-use-which-model).
2. **Keep MiniMax speech-2.8-turbo as the fallback, not the default, for new languages.** It is the proven path in this project (German course already shipped with it, including known mispronunciation re-takes), covers Ukrainian and Swedish/Thai without a tier split, and bills a predictable $60/1M chars. Use it where Gemini quality fails QA in a language, or for Ukrainian. Sources: [MiniMax pricing](https://platform.minimax.io/docs/pricing/overview#models/speech), [MiniMax languages](https://platform.minimax.io/docs/guides/speech-t2a-websocket).
3. **Pin one voice per language and record the choice in the generation script.** For Gemini, start with one prebuilt voice (e.g. Kore) across languages for consistency, but audition one Extended Voice Library voice filtered by `language_code` per language before the full run — prebuilt-voice quality per language is unconfirmed, and a regional voice may transcribe cleaner. For MiniMax, pick one language-labelled system `voice_id` per language. Keep the voice constant across re-takes so clips match.
4. **One phrase per unary (non-streaming) request; save WAV directly (Gemini) or MP3/PCM (MiniMax).** No Batch API needed at 1,500 clips — sequential requests with modest concurrency (respecting 60 RPM MiniMax / tier limits Gemini) finish quickly and make per-clip QA/re-take trivial. Use Gemini Batch only if scaling to many languages at once.
5. **QA loop (mandatory, both engines):** transcribe every clip (existing Whisper scoring path) and auto-flag mismatches for re-take, with per-language alias rules for known ASR confusions. This is doubly important for Gemini because language is auto-detected — assert the transcription language matches the target, especially for short phrases, names, and Hans/Hant Chinese. Cap re-takes (e.g. 3) then route stubborn phrases to the other engine or a different voice.
6. **Gateway:** generate offline with a direct Gemini API key / direct MiniMax key in the script (as with the existing MiniMax-via-Gateway setup, Gateway adds observability but TTS-through-Gateway is unconfirmed for Gemini). If Gemini-via-AI-Gateway is desired for billing consolidation, first prove one `gemini-3.8-flash-lite-tts` unary request end-to-end through `.../google-ai-studio/v1/models/{model}:generateContent` (or the Interactions path) and confirm the base64 audio survives intact.
7. **Budget guardrail:** at ~60k characters/language, expect roughly $1–$4 per language all-in (generation + re-takes) on either engine — cost is not the deciding factor; per-language transcription-QA pass rate is. Pilot one full lesson (~48 clips) per new language on both engines, compare QA pass rates, then commit.

### Unconfirmed items (need a live probe or a doc we could not find)

- `cmn-CN` vs `cmn-TW` (and other BCP-47 locale) selection for Gemini TTS synthesis; quality of each prebuilt voice in each language.
- Gemini TTS support through Cloudflare AI Gateway (any TTS model, unary or streaming).
- Per-model language lists and free-tier RPM/TPM for the retiring 2.5/3.1 TTS models; batch enqueued-token caps for 3.8 TTS.
- Any Gemini TTS per-request character cap below the 8,192 input-token limit; SSML support (none documented).
