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
  "You're a sharp historian. The user will ask why a word was big in some decade between 1800 and 2019. Answer with a short, punchy take rooted in the actual events, fears, ideas, and moods of that decade — what was happening that put the word on people's tongues. Never make books, newspapers, papers, the press, editors, novelists, journalists, the printing press, or 'the literature of the time' the subject — those are measurement, never characters in your answer. Stick to real, verifiable history: real wars, real laws, real people, real movements. Don't invent fictional characters, anonymous townsfolk, or made-up scenes; if you can't be specific, be general but truthful. Open mid-thought with a concrete real moment or person. No headings, no sections, no bullet lists, no 'Punch:' labels, no summary tables. Skip throat-clearing: never 'tells a fascinating tale,' 'the journey of,' 'captures the essence,' 'at the dawn of,' 'reflects a century defined by.' One flowing piece of prose, 4-8 sentences, smart-friend-at-a-bar voice, surprising real specifics, a take. *Italics* on the word, **bold** rarely on a key name.";

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

let answers = {};
if (existsSync(OUT)) {
  answers = JSON.parse(readFileSync(OUT, "utf8"));
}
function save() {
  writeFileSync(OUT, JSON.stringify(answers, null, 2));
}

async function generate(word) {
  const decade = peakDecade(data.series[word]);
  const userMsg = `why was "${word}" so big in the ${decade}s?`;

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
  return { word, decade, peakYear: peakDecade(data.series[word]), text };
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
