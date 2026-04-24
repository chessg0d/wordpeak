import { writeFileSync, readFileSync, existsSync } from "node:fs";

const WORDS = [
  "internet", "computer", "email", "smartphone", "blog", "website", "google",
  "typewriter", "telegram", "phonograph", "gramophone", "zeppelin",
  "war", "peace", "slavery", "depression", "revolution", "democracy",
  "christmas", "easter", "halloween", "thanksgiving",
  "radio", "television", "newspaper", "magazine",
  "thou", "whilst", "ye", "hath", "shall",
  "cool", "awesome", "rad", "groovy", "dude",
  "horse", "carriage", "automobile", "airplane", "bicycle",
  "king", "queen", "president", "dictator",
  "god", "religion", "science", "philosophy",
  "love", "hate", "fear", "hope",
  "child", "woman", "man", "family",
  "money", "gold", "silver", "dollar",
  "vietnam", "korea", "iraq", "afghanistan",
  "beatles", "elvis", "madonna",
  "cocaine", "marijuana", "alcohol", "tobacco",
  "feminism", "racism", "capitalism", "communism",
  "dinosaur", "robot", "spaceship",
  "doctor", "lawyer", "farmer", "soldier",
  "freedom", "liberty", "justice",
];

const YEAR_START = 1800;
const YEAR_END = 2019;
const CORPUS = "en-2019";
const OUT = new URL("./data.json", import.meta.url);

async function fetchNgram(word) {
  const url = `https://books.google.com/ngrams/json?content=${encodeURIComponent(word)}&year_start=${YEAR_START}&year_end=${YEAR_END}&corpus=${CORPUS}&smoothing=3&case_insensitive=true`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("retry-after")) || 0;
    const err = new Error("rate limited");
    err.rateLimited = true;
    err.retryAfter = retryAfter;
    throw err;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.length) return null;
  const all = json.find((e) => e.type === "CASE_INSENSITIVE");
  if (all) return all.timeseries;
  return json[0].timeseries;
}

let existing = { yearStart: YEAR_START, yearEnd: YEAR_END, series: {} };
if (existsSync(OUT)) {
  existing = JSON.parse(readFileSync(OUT, "utf8"));
}
const data = existing.series;

function save() {
  writeFileSync(OUT, JSON.stringify({ yearStart: YEAR_START, yearEnd: YEAR_END, series: data }));
}

let backoff = 2000;
for (const word of WORDS) {
  if (data[word]) continue;
  let attempts = 0;
  while (attempts < 6) {
    try {
      process.stdout.write(`${word}... `);
      const series = await fetchNgram(word);
      if (series && series.length) {
        data[word] = series;
        save();
        console.log("ok");
        backoff = Math.max(2000, backoff * 0.8);
      } else {
        console.log("empty");
      }
      await new Promise((r) => setTimeout(r, 1500));
      break;
    } catch (err) {
      if (err.rateLimited) {
        const waitMs = err.retryAfter ? err.retryAfter * 1000 : backoff;
        console.log(`429, wait ${Math.round(waitMs / 1000)}s`);
        await new Promise((r) => setTimeout(r, waitMs));
        backoff = Math.min(60000, backoff * 2);
        attempts++;
      } else {
        console.log(`fail: ${err.message}`);
        break;
      }
    }
  }
}

save();
console.log(`\nTotal words in data.json: ${Object.keys(data).length}`);
