import { writeFileSync, readFileSync, existsSync } from "node:fs";

// Mysterious / evocative words like "destroyed" — drama, doom, religion, fate,
// old war, sin, supernatural. No pronouns, no modern brands, no pop tech.
// Categories are for readability; flattened + deterministically shuffled below.
const CATEGORIES = [
  // dramatic past-tense verbs
  ["destroyed", "vanished", "perished", "conquered", "abandoned", "forsaken",
   "slain", "banished", "exiled", "betrayed", "plundered", "ravaged", "ruined",
   "drowned", "burned", "beheaded", "vanquished", "devoured", "condemned",
   "tormented", "crucified", "scorned", "withered", "summoned", "beheld",
   "awakened", "departed", "foretold"],

  // calamity, doom
  ["plague", "pestilence", "famine", "calamity", "vengeance", "treason",
   "tyranny", "conquest", "siege", "slaughter", "massacre", "scourge",
   "desolation", "havoc", "ruin"],

  // death, mourning, eternity
  ["fate", "destiny", "mortality", "grave", "tomb", "sepulchre", "ashes",
   "requiem", "mourning", "lament", "elegy", "shroud", "oblivion", "eternity",
   "doom"],

  // sacred / divine
  ["heaven", "hell", "paradise", "purgatory", "salvation", "damnation",
   "redemption", "providence", "divine", "holy", "sacred", "profane",
   "immortal", "eternal", "blessed", "cursed"],

  // sin & virtue
  ["sin", "virtue", "vice", "lust", "gluttony", "sloth", "envy", "avarice",
   "chastity", "piety", "devotion", "humility", "repentance", "absolution",
   "confession"],

  // religion specific
  ["blasphemy", "heresy", "sacrifice", "martyr", "prophet", "scripture",
   "apocalypse", "prophecy", "miracle", "sacrament", "gospel", "pilgrim",
   "crusade", "covenant", "testament", "incantation", "exorcism"],

  // royalty & rule
  ["king", "queen", "emperor", "empress", "knight", "noble", "peasant", "serf",
   "vassal", "lord", "lady", "courtier", "sovereign", "throne", "crown",
   "scepter", "dynasty", "empire", "reign", "dominion"],

  // clergy / scribes
  ["monk", "nun", "friar", "abbot", "bishop", "cardinal", "priest", "hermit",
   "sage", "scribe", "herald", "jester"],

  // war, weapons, fortifications
  ["musket", "cavalry", "infantry", "dragoon", "regiment", "garrison",
   "blockade", "mutiny", "insurrection", "valor", "glory", "banner", "sword",
   "spear", "lance", "arrow", "dagger", "sabre", "fortress", "castle",
   "dungeon", "citadel"],

  // heavy emotions
  ["anguish", "despair", "melancholy", "lamentation", "woe", "grief", "rage",
   "fury", "wrath", "pity", "mercy", "longing", "yearning", "ardor", "fervor",
   "contempt", "disdain", "regret", "remorse", "dishonor", "disgrace",
   "sorrow", "terror", "dread", "awe"],

  // atmospheric
  ["twilight", "dusk", "midnight", "tempest", "wilderness", "abyss", "chasm",
   "void", "savage", "primeval", "mystical", "forbidden", "secret", "lost",
   "forgotten"],

  // old afflictions
  ["consumption", "smallpox", "cholera", "leprosy", "fever", "palsy", "asylum",
   "lunacy", "swoon", "ague", "dropsy", "madness"],

  // supernatural
  ["phantom", "specter", "apparition", "oracle", "talisman", "curse", "hex",
   "enchantress", "wizard", "sorcerer", "ghost", "sorcery", "witch", "omen",
   "demon"],

  // punishment / captivity
  ["gallows", "scaffold", "executioner", "hangman", "prisoner", "captive",
   "bondage", "manacle", "pillory", "chain"],

  // sea & voyage
  ["mariner", "voyager", "galleon", "frigate", "shipwreck", "lighthouse",
   "beacon", "harbor", "anchor", "mast"],

  // sacred places
  ["cathedral", "abbey", "cloister", "monastery", "hermitage", "shrine",
   "altar", "pulpit", "sanctuary", "temple"],

  // holy war / heresy
  ["inquisition", "heretic", "infidel", "crucifix"],

  // honor & treachery
  ["honor", "duty", "courage", "treachery", "perfidy", "loyalty", "betrayal",
   "infamy", "bravery", "cowardice"],

  // sky & portents
  ["comet", "eclipse", "lightning", "thunder", "storm", "hurricane",
   "blizzard"],

  // body evocative
  ["heart", "soul", "blood", "breath", "sigh", "tear", "embrace", "kiss",
   "breast", "throat"],

  // relics & objects
  ["relic", "treasure", "jewel", "gem", "mirror", "locket", "amulet", "scroll",
   "parchment", "quill"],
];

function deterministicShuffle(arr, seed) {
  const a = arr.slice();
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WORDS = deterministicShuffle(CATEGORIES.flat(), 1337);

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

const wantSet = new Set(WORDS);
let pruned = 0;
for (const key of Object.keys(data)) {
  if (!wantSet.has(key)) {
    delete data[key];
    pruned++;
  }
}
if (pruned) console.log(`pruned ${pruned} words no longer in WORDS`);
console.log(`target: ${WORDS.length} words; have: ${Object.keys(data).length}; need: ${WORDS.length - Object.keys(data).length}\n`);

function save() {
  writeFileSync(OUT, JSON.stringify({ yearStart: YEAR_START, yearEnd: YEAR_END, series: data }));
}

save();

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
