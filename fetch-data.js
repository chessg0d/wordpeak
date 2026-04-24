import { writeFileSync, readFileSync, existsSync } from "node:fs";

const WORDS = [
  // technology
  "internet", "computer", "email", "smartphone", "blog", "website", "google",
  "typewriter", "telegram", "phonograph", "gramophone", "zeppelin",
  "laptop", "tablet", "iphone", "android", "facebook", "twitter", "youtube",
  "netflix", "amazon", "microsoft", "software", "algorithm", "database",
  "keyboard", "printer", "fax", "pager", "walkman", "ipod", "cassette",
  "vinyl", "floppy", "bluetooth", "wifi", "firewall", "hacker", "virus",
  "spam", "browser", "streaming", "podcast", "emoji", "selfie", "meme",
  "hashtag", "bitcoin", "cryptocurrency", "metaverse", "drone",
  "satellite", "rocket", "telescope", "microscope", "calculator",
  // transport
  "horse", "carriage", "automobile", "airplane", "bicycle",
  "motorcycle", "locomotive", "steamship", "submarine", "helicopter",
  "subway", "wagon",
  // war
  "war", "peace", "slavery", "depression", "revolution", "democracy",
  "vietnam", "korea", "iraq", "afghanistan",
  "army", "weapon", "cannon", "tank", "grenade", "missile", "nuclear",
  "atomic", "veteran", "refugee", "holocaust", "genocide",
  "napoleon", "lincoln", "washington", "churchill", "stalin",
  // culture
  "christmas", "easter", "halloween", "thanksgiving",
  "radio", "television", "newspaper", "magazine",
  "beatles", "elvis", "madonna",
  "cinema", "hollywood", "concert", "orchestra", "opera",
  "jazz", "blues", "rock", "disco", "punk", "hiphop",
  "guitar", "piano", "violin", "trumpet", "museum", "library",
  // food
  "pizza", "hamburger", "sandwich", "sushi", "pasta", "bread",
  "coffee", "tea", "wine", "beer", "whiskey", "cocktail",
  "chocolate", "sugar", "vanilla", "tomato", "potato",
  "banana", "strawberry", "avocado",
  // nature
  "thunder", "lightning", "hurricane", "earthquake", "volcano",
  "forest", "jungle", "desert", "mountain", "river", "ocean",
  "island", "glacier",
  // animals
  "dinosaur", "dragon", "unicorn", "dolphin", "elephant", "tiger",
  "eagle", "butterfly", "spider", "octopus",
  // abstract
  "love", "hate", "fear", "hope",
  "sorrow", "anger", "pride", "shame", "pleasure", "death", "life",
  "marriage", "divorce", "dream", "memory", "truth", "wisdom", "beauty",
  // religion
  "god", "religion", "science", "philosophy",
  "jesus", "christ", "buddha", "allah", "angel", "devil", "heaven",
  "hell", "soul", "spirit", "sin", "prayer", "temple", "church",
  "mosque", "bible", "quran", "atheism", "karma", "meditation",
  // identity
  "feminism", "racism", "capitalism", "communism",
  "socialism", "fascism", "gender", "sexuality", "gay", "lesbian",
  "queer", "transgender", "diversity", "equality", "patriarchy",
  // health
  "cocaine", "marijuana", "alcohol", "tobacco",
  "hospital", "surgery", "vaccine", "cancer", "diabetes", "obesity",
  "anxiety", "therapy", "psychiatry", "abortion", "pandemic", "epidemic",
  "plague", "hiv", "aids",
  // money
  "money", "gold", "silver", "dollar",
  "stock", "investment", "profit", "debt", "banking", "inflation",
  "recession", "poverty", "wealth", "billionaire", "taxation",
  "globalization", "industrialization",
  // people/places
  "america", "europe", "asia", "africa", "china", "japan", "india",
  "russia", "germany", "france", "england", "britain", "italy",
  "spain", "mexico", "canada", "brazil", "australia",
  "paris", "london", "rome", "tokyo", "chicago", "jerusalem",
  // archaic / slang
  "thou", "whilst", "ye", "hath", "shall",
  "cool", "awesome", "rad", "groovy", "dude", "vibe", "lit",
  // royalty / politics
  "king", "queen", "president", "dictator", "emperor", "pharaoh",
  // professions
  "doctor", "lawyer", "farmer", "soldier",
  "teacher", "engineer", "programmer", "astronaut", "scientist",
  // values
  "freedom", "liberty", "justice",
  "child", "woman", "man", "family",
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
