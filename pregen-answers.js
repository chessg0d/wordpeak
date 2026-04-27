// Pre-generate AI answers for every word in data.json using Gemini 3.1 Pro.
// Output: answers.json keyed by word. Resumable — skips words already in answers.json.
//
// Usage:
//   GEMINI_API_KEY=AIza... node pregen-answers.js
//
// Cost (~298 words × ~800 output tokens at $12/1M output) ≈ $3 total.
// Requires billing enabled on the Gemini API key.

import { writeFileSync, readFileSync, existsSync } from "node:fs";

const MODEL = "gemini-3.1-pro-preview";
const OUT = new URL("./answers.json", import.meta.url);
const DATA = new URL("./data.json", import.meta.url);
const SYSTEM_PROMPT =
  "You're a sharp historian explaining why an English word's Google Books Ngram chart looks the way it does. Cover the full arc — rise, peak, decline, any rebound — by walking through the real eras, movements, and events that pulled the word in and out of circulation. Bring depth: religious, political, scientific, literary, technological, and cultural angles where they apply, with real names, dates, and surprising specifics (e.g., the Methodist revival, abolitionist pamphlets, Dickens displacing theological vocabulary, Mercy Corps and NGO branding, Civil-rights rhetoric reaching for 'justice' over 'mercy'). Use this exact structure: (1) one or two opening sentences naming the deepest driver of the trajectory's shape; (2) 5-9 markdown bullet points (`- ` only), each opening with a **bold** key term — a movement, war, event, or shift — followed by 2-4 sentences of concrete detail; (3) one short standalone closing paragraph (2-3 sentences) on what the rise and fall reveals about people: moral anxieties, what we name, what we stop naming, what we reach for in crisis. Hard bans: no tables of any kind (no `|---|` syntax, no `<br>` tags), no `##`/`###` headings, no top-level numbered sections like '1. The raw trajectory,' no 'Bottom line:' / 'Take-away' / 'Quick reference' / 'TL;DR' sections, no horizontal rules. Never make books, newspapers, papers, the press, editors, novelists, journalists, or 'the literature of the time' the subject — they're measurement, never characters. Stick to real, verifiable history; don't invent people. Skip throat-clearing: never 'tells a fascinating tale,' 'the journey of,' 'captures the essence,' 'at the dawn of,' 'reflects a century defined by.' *Italics* on the target word, **bold** on key movements/events.";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("set GEMINI_API_KEY env var");
  process.exit(1);
}

const data = JSON.parse(readFileSync(DATA, "utf8"));
const words = Object.keys(data.series);
const yearStart = data.yearStart;

function peakDecade(series) {
  let max = -Infinity;
  let idx = 0;
  for (let i = 0; i < series.length; i++) {
    if (series[i] > max) { max = series[i]; idx = i; }
  }
  const peakYear = yearStart + idx;
  return Math.floor(peakYear / 10) * 10;
}

function decadalSamples(series) {
  let max = -Infinity;
  for (const v of series) if (v > max) max = v;
  const samples = [];
  for (let i = 0; i < series.length; i += 10) {
    samples.push(`${yearStart + i}:${Math.round((series[i] / max) * 100)}`);
  }
  const last = series.length - 1;
  if (last % 10 !== 0) {
    samples.push(`${yearStart + last}:${Math.round((series[last] / max) * 100)}`);
  }
  return samples.join(" ");
}

let answers = {};
if (existsSync(OUT)) {
  answers = JSON.parse(readFileSync(OUT, "utf8"));
}
function save() {
  writeFileSync(OUT, JSON.stringify(answers, null, 2));
}

async function generate(word) {
  const series = data.series[word];
  const userMsg = `why does ngram viewer of "${word}" look like this?\n(peak ${peakDecade(series)}s · trajectory by decade, 0-100 of own peak: ${decadalSamples(series)})\nadd more details, bullet point. what does the evolution of the chart show about the human condition?`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userMsg }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 5000,
        thinkingConfig: { thinkingLevel: "high", includeThoughts: false },
      },
    }),
  });

  if (res.status === 429) {
    const err = new Error("rate limited");
    err.rateLimited = true;
    throw err;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) throw new Error("no parts in response");
  const text = parts.filter((p) => !p.thought).map((p) => p.text).join("").trim();
  if (!text) throw new Error("empty text in response");
  return { word, peakYear: peakDecade(data.series[word]), text };
}

const todo = words.filter((w) => !answers[w]);
console.log(`words total: ${words.length}, already done: ${words.length - todo.length}, to fetch: ${todo.length}`);

let backoff = 2000;
for (const word of todo) {
  let attempts = 0;
  while (attempts < 6) {
    try {
      process.stdout.write(`${word}... `);
      const result = await generate(word);
      answers[word] = result;
      save();
      console.log(`ok (${result.text.length} chars)`);
      backoff = Math.max(2000, backoff * 0.8);
      await new Promise((r) => setTimeout(r, 800));
      break;
    } catch (err) {
      if (err.rateLimited) {
        console.log(`429, wait ${Math.round(backoff / 1000)}s`);
        await new Promise((r) => setTimeout(r, backoff));
        backoff = Math.min(60000, backoff * 2);
        attempts++;
      } else {
        console.log(`fail: ${err.message}`);
        break;
      }
    }
  }
}

console.log(`\ndone. ${Object.keys(answers).length}/${words.length} answers saved`);
