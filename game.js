import { IMPOSTER_PACKS, JOURNEY_DECADES, STARTING_LIVES } from "./imposter-packs.js";

const CHART_W = 400;
const CHART_H = 200;
const PAD_L = 24;
const PAD_R = 10;
const PAD_T = 12;
const PAD_B = 8;

const API_URL = "https://wordpeak-api.towsonerik.workers.dev/";
const SAVE_KEY = "wordpeak.v2";

function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
  } catch {
    return {};
  }
}

function persistSave() {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        best: state.score.best,
        bestRunScore: state.run.bestRunScore,
        bestRunDecade: state.run.bestRunDecade,
      })
    );
  } catch {
    // localStorage unavailable — silently skip
  }
}

const saved = loadSave();

const state = {
  data: null,
  words: [],
  mode: "single", // "single" | "duel" | "imposter"
  round: null,
  score: { points: 0, streak: 0, best: saved.best ?? 0 },
  run: {
    active: false,
    decade: JOURNEY_DECADES[0],
    lives: STARTING_LIVES,
    score: 0,
    streak: 0,
    won: null,
    bestRunScore: saved.bestRunScore ?? 0,
    bestRunDecade: saved.bestRunDecade ?? 0,
  },
  answer: { abort: null },
};

function startNewRun() {
  state.run.active = true;
  state.run.decade = JOURNEY_DECADES[0];
  state.run.lives = STARTING_LIVES;
  state.run.score = 0;
  state.run.streak = 0;
  state.run.won = null;
}

function pointsForCorrect() {
  return 100 + Math.min(state.score.streak, 10) * 25;
}

function pointsForRunCorrect() {
  return 100 + Math.min(state.run.streak, 10) * 25;
}

function awardCorrect(anchorEl) {
  const gained = pointsForCorrect();
  state.score.streak += 1;
  state.score.points += gained;
  if (state.score.points > state.score.best) {
    state.score.best = state.score.points;
    persistSave();
  }
  updateScoreUI();
  if (anchorEl) popPoints(anchorEl, `+${gained}`, "plus");
}

function awardWrong(anchorEl) {
  const lostStreak = state.score.streak;
  state.score.streak = 0;
  updateScoreUI();
  if (anchorEl && lostStreak >= 3) {
    popPoints(anchorEl, `streak −${lostStreak}`, "minus");
  }
}

function awardRunCorrect(anchorEl) {
  const gained = pointsForRunCorrect();
  state.run.streak += 1;
  state.run.score += gained;
  if (anchorEl) popPoints(anchorEl, `+${gained}`, "plus");
}

function awardRunWrong(anchorEl) {
  state.run.streak = 0;
  state.run.lives -= 1;
  if (anchorEl) popPoints(anchorEl, "−1 life", "minus");
}

function updateScoreUI() {
  if (state.mode === "imposter") {
    document.getElementById("score-points").textContent = state.run.score;
    document.getElementById("score-points-lbl").textContent = "score";

    const streakEl = document.getElementById("score-streak");
    streakEl.innerHTML = renderHearts(state.run.lives, STARTING_LIVES);
    document.getElementById("score-streak-lbl").textContent = "lives";
    document.getElementById("streak-fire").hidden = true;

    document.getElementById("score-best").textContent = state.run.bestRunScore;
    document.getElementById("score-best-lbl").textContent = "best run";
  } else {
    document.getElementById("score-points").textContent = state.score.points;
    document.getElementById("score-points-lbl").textContent = "score";

    document.getElementById("score-streak").textContent = state.score.streak;
    document.getElementById("score-streak-lbl").textContent = "streak";
    document.getElementById("streak-fire").hidden = state.score.streak < 3;

    document.getElementById("score-best").textContent = state.score.best;
    document.getElementById("score-best-lbl").textContent = "best";
  }
}

function renderHearts(lives, total) {
  let html = "";
  for (let i = 0; i < total; i++) {
    if (i < lives) {
      html += '<span class="heart">♥</span>';
    } else {
      html += '<span class="heart heart-empty">♡</span>';
    }
  }
  return html;
}

function popPoints(anchorEl, text, sign) {
  const pop = document.createElement("span");
  pop.className = `points-pop${sign === "minus" ? " minus" : ""}`;
  pop.textContent = text;
  // anchorEl needs to be position:relative; we ensure that with style fallback.
  const cs = getComputedStyle(anchorEl);
  if (cs.position === "static") anchorEl.style.position = "relative";
  pop.style.left = "50%";
  pop.style.top = "30%";
  pop.style.transform = "translate(-50%, 0)";
  anchorEl.appendChild(pop);
  setTimeout(() => pop.remove(), 1200);
}

// Curated duel pairs — natural antonyms / contrasts / siblings.
// At runtime we filter to pairs where both words exist in the data.
const DUEL_PAIRS = [
  ["heaven", "hell"], ["divine", "profane"], ["holy", "cursed"],
  ["blessed", "damned"], ["sin", "virtue"], ["mercy", "wrath"],
  ["glory", "disgrace"], ["honor", "treachery"], ["bravery", "cowardice"],
  ["loyalty", "betrayal"], ["prophet", "heretic"], ["knight", "peasant"],
  ["king", "serf"], ["emperor", "vassal"], ["crown", "chain"],
  ["musket", "sword"], ["gallows", "sanctuary"], ["consumption", "cholera"],
  ["comet", "eclipse"], ["pestilence", "salvation"], ["paradise", "purgatory"],
  ["redemption", "damnation"], ["sage", "jester"], ["monk", "knight"],
  ["fortress", "hermitage"], ["cathedral", "dungeon"], ["heart", "soul"],
  ["sword", "quill"], ["valor", "infamy"], ["repentance", "blasphemy"],
  ["ardor", "contempt"], ["awe", "dread"], ["mariner", "pilgrim"],
  ["regiment", "garrison"], ["wizard", "witch"], ["phantom", "specter"],
  ["dagger", "lance"], ["plague", "miracle"], ["confession", "heresy"],
  ["throne", "scaffold"], ["dynasty", "ruin"], ["devotion", "lust"],
];

async function loadData() {
  const res = await fetch("./data.json");
  state.data = await res.json();
  state.words = Object.keys(state.data.series);
}

function sample(arr, n, exclude = new Set()) {
  const pool = arr.filter((w) => !exclude.has(w));
  const picked = [];
  while (picked.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function peakYear(series) {
  let max = -Infinity;
  let idx = 0;
  for (let i = 0; i < series.length; i++) {
    if (series[i] > max) {
      max = series[i];
      idx = i;
    }
  }
  return state.data.yearStart + idx;
}

function buildCurveBrief(series) {
  const yearStart = state.data.yearStart;
  const yearEnd = state.data.yearEnd;
  let maxVal = -Infinity;
  let peakIdx = 0;
  let minVal = Infinity;
  let troughIdx = 0;
  for (let i = 0; i < series.length; i++) {
    if (series[i] > maxVal) { maxVal = series[i]; peakIdx = i; }
    if (series[i] < minVal) { minVal = series[i]; troughIdx = i; }
  }
  const samples = [];
  for (let i = 0; i < series.length; i += 10) {
    const norm = Math.round((series[i] / maxVal) * 100);
    samples.push(`${yearStart + i}:${norm}`);
  }
  const lastIdx = series.length - 1;
  if ((lastIdx % 10) !== 0) {
    samples.push(`${yearStart + lastIdx}:${Math.round((series[lastIdx] / maxVal) * 100)}`);
  }
  return {
    samples: samples.join(" "),
    peak: yearStart + peakIdx,
    trough: yearStart + troughIdx,
    yearStart,
    yearEnd,
  };
}

function buildChartSVG(series) {
  const n = series.length;
  const max = Math.max(...series);
  const min = 0;
  const range = max - min || 1;

  const innerW = CHART_W - PAD_L - PAD_R;
  const innerH = CHART_H - PAD_T - PAD_B;

  const xAt = (i) => PAD_L + (i / (n - 1)) * innerW;
  const yAt = (v) => PAD_T + innerH - ((v - min) / range) * innerH;

  let d = "";
  let fill = `M ${xAt(0)} ${PAD_T + innerH} `;
  for (let i = 0; i < n; i++) {
    const x = xAt(i).toFixed(2);
    const y = yAt(series[i]).toFixed(2);
    d += (i === 0 ? "M " : "L ") + x + " " + y + " ";
    fill += "L " + x + " " + y + " ";
  }
  fill += `L ${xAt(n - 1)} ${PAD_T + innerH} Z`;

  const gridLines = [0.25, 0.5, 0.75]
    .map((frac) => {
      const y = PAD_T + innerH - frac * innerH;
      return `<line class="grid-line" x1="${PAD_L}" x2="${PAD_L + innerW}" y1="${y}" y2="${y}" />`;
    })
    .join("");

  return `
    <div class="chart-box">
      <svg class="card-chart" viewBox="0 0 ${CHART_W} ${CHART_H}" preserveAspectRatio="none" aria-hidden="true">
        ${gridLines}
        <line class="axis" x1="${PAD_L}" x2="${PAD_L + innerW}" y1="${PAD_T + innerH}" y2="${PAD_T + innerH}" />
        <line class="axis" x1="${PAD_L}" x2="${PAD_L}" y1="${PAD_T}" y2="${PAD_T + innerH}" />
        <path class="curve-fill" d="${fill}" />
        <path class="curve" d="${d}" />
      </svg>
      <div class="chart-axis">
        <span>${state.data.yearStart}</span>
        <span>1850</span>
        <span>1900</span>
        <span>1950</span>
        <span>${state.data.yearEnd}</span>
      </div>
    </div>
  `;
}

function buildDuelChartSVG(seriesA, seriesB, opts = {}) {
  const W = 800, H = 300;
  const pl = 30, pr = opts.revealed ? 130 : 30, pt = 18, pb = 10;
  const innerW = W - pl - pr;
  const innerH = H - pt - pb;
  const n = seriesA.length;

  // Per-curve normalization — each fills [0,1] of its own peak. Magnitude
  // differences would otherwise leak the answer (e.g. "the bigger one is
  // the famous word"). Forces the puzzle to be pure shape matching.
  const maxA = Math.max(...seriesA) || 1;
  const maxB = Math.max(...seriesB) || 1;
  const xAt = (i) => pl + (i / (n - 1)) * innerW;
  const yAtFor = (max) => (v) => pt + innerH - (v / max) * innerH;

  const pathFor = (s, max) => {
    const yAt = yAtFor(max);
    let d = "";
    for (let i = 0; i < n; i++) {
      d += (i === 0 ? "M " : "L ") + xAt(i).toFixed(2) + " " + yAt(s[i]).toFixed(2) + " ";
    }
    return d;
  };

  const grid = [0.25, 0.5, 0.75]
    .map((f) => {
      const y = pt + innerH - f * innerH;
      return `<line class="grid-line" x1="${pl}" x2="${pl + innerW}" y1="${y}" y2="${y}" />`;
    })
    .join("");

  // End-of-line letter labels (or word tags after reveal)
  const aEndIdx = n - 1, bEndIdx = n - 1;
  const aLabelY = yAtFor(maxA)(seriesA[aEndIdx]);
  const bLabelY = yAtFor(maxB)(seriesB[bEndIdx]);
  const minGap = 16;
  let aY = aLabelY, bY = bLabelY;
  if (Math.abs(aY - bY) < minGap) {
    if (aY < bY) { aY -= minGap / 2; bY += minGap / 2; }
    else         { aY += minGap / 2; bY -= minGap / 2; }
  }
  const labelX = pl + innerW + 4;

  const tagA = opts.revealed ? `<text class="duel-tag a" x="${labelX}" y="${aY + 18}" text-anchor="start">${opts.wordA}</text>` : "";
  const tagB = opts.revealed ? `<text class="duel-tag b" x="${labelX}" y="${bY + 18}" text-anchor="start">${opts.wordB}</text>` : "";

  return `
    <svg class="card-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      ${grid}
      <line class="axis" x1="${pl}" x2="${pl + innerW}" y1="${pt + innerH}" y2="${pt + innerH}" />
      <line class="axis" x1="${pl}" x2="${pl}" y1="${pt}" y2="${pt + innerH}" />
      <path class="duel-curve-a" d="${pathFor(seriesA, maxA)}" />
      <path class="duel-curve-b" d="${pathFor(seriesB, maxB)}" />
      <text class="duel-label a" x="${labelX}" y="${aY + 6}" text-anchor="start">A</text>
      <text class="duel-label b" x="${labelX}" y="${bY + 6}" text-anchor="start">B</text>
      ${tagA}${tagB}
    </svg>
    <div class="chart-axis">
      <span>${state.data.yearStart}</span>
      <span>1850</span>
      <span>1900</span>
      <span>1950</span>
      <span>${state.data.yearEnd}</span>
    </div>
  `;
}

function pickDuelPair() {
  // Prefer curated pairs whose words are both in the data; fall back to random.
  const valid = DUEL_PAIRS.filter(([a, b]) => state.data.series[a] && state.data.series[b]);
  if (valid.length && Math.random() < 0.8) {
    return valid[Math.floor(Math.random() * valid.length)];
  }
  return sample(state.words, 2);
}

function newRound() {
  if (state.mode === "duel") return newDuelRound();
  if (state.mode === "imposter") return newImposterRound();

  const target = sample(state.words, 1)[0];
  const decoys = sample(state.words, 3, new Set([target]));
  const all = shuffle([target, ...decoys]);

  state.round = {
    mode: "single",
    target,
    options: all,
    targetIndex: all.indexOf(target),
    locked: false,
    pick: null,
  };

  renderRound();
}

function pickN(arr, n) {
  // Sample n distinct items from arr without mutating arr.
  const pool = arr.slice();
  const out = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

function newImposterRound() {
  // Start a fresh run if none is active.
  if (!state.run.active) {
    startNewRun();
  }

  // Pick a pack matching the player's current decade. Prefer a pack different
  // from the previous round when there are alternatives.
  const candidates = IMPOSTER_PACKS.filter((p) => p.decade === state.run.decade);
  if (candidates.length === 0) {
    console.warn(`No pack for decade ${state.run.decade}; treating as cleared.`);
    return endRun(true);
  }
  let pack = candidates[Math.floor(Math.random() * candidates.length)];
  if (state.round?.pack && candidates.length > 1) {
    let attempts = 0;
    while (pack.id === state.round.pack.id && attempts++ < 10) {
      pack = candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  const natives = pickN(pack.natives, 4).map((n) => ({ ...n, isImposter: false }));
  const imposter = pickN(pack.imposters, 1)[0];
  const cards = shuffle([...natives, { ...imposter, isImposter: true }]);
  const imposterIndex = cards.findIndex((c) => c.isImposter);

  state.round = {
    mode: "imposter",
    pack,
    cards,
    imposterIndex,
    locked: false,
    pick: null,
  };

  renderImposterRound();
}

function renderImposterRound() {
  const r = state.round;
  document.getElementById("imposter-title").textContent = r.pack.title;

  const grid = document.getElementById("imp-grid");
  grid.innerHTML = "";
  r.cards.forEach((card, i) => {
    const el = document.createElement("div");
    el.className = "imp-card";
    el.dataset.index = String(i);
    el.innerHTML = `
      <div class="imp-name">${card.name}</div>
      <div class="imp-stamp"></div>
      <div class="imp-note">${card.note}</div>
    `;
    el.addEventListener("click", () => onImposterPick(i));
    grid.appendChild(el);
  });

  document.getElementById("result").innerHTML = "";
  const nextBtn = document.getElementById("next-btn");
  nextBtn.hidden = true;
  nextBtn.textContent = "next decade →";
  document.getElementById("ask-gemini").hidden = true;
  closeAnswer();
  updateScoreUI();
}

function onImposterPick(index) {
  const r = state.round;
  if (!r || r.locked) return;
  r.locked = true;
  r.pick = index;

  const correct = index === r.imposterIndex;
  const cards = document.querySelectorAll(".imp-card");
  cards.forEach((el, i) => {
    el.classList.add("locked", "revealed");
    const card = r.cards[i];
    const stamp = el.querySelector(".imp-stamp");
    if (card.isImposter) {
      el.classList.add("imposter");
      stamp.textContent = "imposter";
    } else {
      el.classList.add("native");
      stamp.textContent = "fits";
    }
    if (i === index) el.classList.add("picked");
  });

  const pickedEl = cards[index];
  if (correct) awardRunCorrect(pickedEl);
  else awardRunWrong(pickedEl);
  updateScoreUI();

  const imposterCard = r.cards[r.imposterIndex];
  const result = document.getElementById("result");
  if (correct) {
    result.innerHTML = `<span class="accent-correct">Caught it.</span> <em>${imposterCard.name}</em> — ${imposterCard.note}.`;
  } else {
    const pickedCard = r.cards[index];
    result.innerHTML = `<span class="accent-wrong">Fooled.</span> <em>${pickedCard.name}</em> belonged. The imposter was <em>${imposterCard.name}</em> — ${imposterCard.note}.`;
  }

  // Determine if the run continues.
  const idx = JOURNEY_DECADES.indexOf(state.run.decade);
  const isLastDecade = idx + 1 >= JOURNEY_DECADES.length;
  const outOfLives = state.run.lives <= 0;
  const nextBtn = document.getElementById("next-btn");

  if (outOfLives || isLastDecade) {
    endRun(!outOfLives, result);
    nextBtn.textContent = "try again →";
  } else {
    state.run.decade = JOURNEY_DECADES[idx + 1];
    nextBtn.textContent = "next decade →";
  }

  nextBtn.hidden = false;
  nextBtn.focus();
}

function endRun(won, resultEl) {
  state.run.active = false;
  state.run.won = won;
  if (state.run.score > state.run.bestRunScore) {
    state.run.bestRunScore = state.run.score;
  }
  if (state.run.decade > state.run.bestRunDecade) {
    state.run.bestRunDecade = state.run.decade;
  }
  persistSave();
  updateScoreUI();

  if (!resultEl) return;
  const summary = document.createElement("div");
  summary.className = "run-summary";
  if (won) {
    summary.innerHTML = `
      <div class="run-summary-title">You made it to 2020.</div>
      <div class="run-summary-detail">final: <strong>${state.run.score}</strong> points · ${state.run.lives} ♥ left · best run ever: <strong>${state.run.bestRunScore}</strong></div>
    `;
  } else {
    summary.innerHTML = `
      <div class="run-summary-title">Game over — died at the ${state.run.decade}s.</div>
      <div class="run-summary-detail">final: <strong>${state.run.score}</strong> points · best run ever: <strong>${state.run.bestRunScore}</strong></div>
    `;
  }
  resultEl.appendChild(summary);
}

function newDuelRound() {
  const [w1, w2] = pickDuelPair();
  // Randomly assign which word maps to curve A vs curve B.
  const aFirst = Math.random() < 0.5;
  const wordA = aFirst ? w1 : w2;
  const wordB = aFirst ? w2 : w1;
  // Question word is randomly picked from the pair.
  const askWhich = Math.random() < 0.5 ? "A" : "B";
  const questionWord = askWhich === "A" ? wordA : wordB;
  const correctLetter = askWhich; // by construction

  state.round = {
    mode: "duel",
    wordA,
    wordB,
    questionWord,
    correctLetter,
    locked: false,
    pick: null,
  };

  renderDuelRound();
}

function renderDuelRound() {
  const r = state.round;
  document.getElementById("duel-word-a").textContent = r.wordA;
  document.getElementById("duel-word-b").textContent = r.wordB;
  document.getElementById("duel-question-word").textContent = r.questionWord;

  const card = document.getElementById("duel-card");
  card.classList.remove("revealed");
  card.innerHTML = buildDuelChartSVG(
    state.data.series[r.wordA],
    state.data.series[r.wordB],
    { revealed: false }
  );

  const pickA = document.getElementById("duel-pick-a");
  const pickB = document.getElementById("duel-pick-b");
  for (const btn of [pickA, pickB]) {
    btn.disabled = false;
    btn.classList.remove("locked", "correct", "wrong");
  }

  const result = document.getElementById("result");
  result.innerHTML = "";
  document.getElementById("next-btn").hidden = true;
  document.getElementById("ask-gemini").hidden = true;
  closeAnswer();
}

function onDuelPick(letter) {
  const r = state.round;
  if (!r || r.locked) return;
  r.locked = true;
  r.pick = letter;

  const correct = letter === r.correctLetter;

  // Re-render chart with reveal tags
  const card = document.getElementById("duel-card");
  card.classList.add("revealed");
  card.innerHTML = buildDuelChartSVG(
    state.data.series[r.wordA],
    state.data.series[r.wordB],
    { revealed: true, wordA: r.wordA, wordB: r.wordB }
  );

  const pickA = document.getElementById("duel-pick-a");
  const pickB = document.getElementById("duel-pick-b");
  for (const btn of [pickA, pickB]) {
    btn.disabled = true;
    btn.classList.add("locked");
  }
  const picked = letter === "A" ? pickA : pickB;
  picked.classList.add(correct ? "correct" : "wrong");
  if (!correct) {
    const truth = r.correctLetter === "A" ? pickA : pickB;
    truth.classList.add("correct");
  }

  if (correct) awardCorrect(picked);
  else awardWrong(picked);

  const result = document.getElementById("result");
  if (correct) {
    result.innerHTML = `<span class="accent-correct">Right.</span> Curve ${letter} is <em>${r.questionWord}</em>.`;
  } else {
    const otherWord = r.questionWord === r.wordA ? r.wordB : r.wordA;
    result.innerHTML = `<span class="accent-wrong">Nope.</span> Curve ${letter} was <em>${otherWord}</em>; <em>${r.questionWord}</em> was ${r.correctLetter}.`;
  }

  document.getElementById("next-btn").hidden = false;
  document.getElementById("next-btn").focus();
  document.getElementById("ask-gemini").hidden = false;
}

function renderRound() {
  const targetEl = document.getElementById("target");
  targetEl.innerHTML = `<span class="quote">“</span>${state.round.target}<span class="quote">”</span>`;

  const yearRangeEl = document.getElementById("year-range");
  yearRangeEl.textContent = `${state.data.yearStart}–${state.data.yearEnd}`;

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  const letters = ["A", "B", "C", "D"];

  state.round.options.forEach((word, i) => {
    const series = state.data.series[word];
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = String(i);
    card.innerHTML = `
      <div class="card-top">
        <span class="card-letter">${letters[i]}</span>
        <span class="card-peak">peak ${peakYear(series)}</span>
      </div>
      ${buildChartSVG(series)}
      <div class="card-word">${word}</div>
    `;
    card.addEventListener("click", () => onPick(i));
    grid.appendChild(card);
  });

  const result = document.getElementById("result");
  result.innerHTML = "";
  document.getElementById("next-btn").hidden = true;
  document.getElementById("ask-gemini").hidden = true;
  closeAnswer();
}

function onPick(index) {
  if (state.round.locked) return;
  state.round.locked = true;
  state.round.pick = index;

  const correct = index === state.round.targetIndex;
  const cards = document.querySelectorAll(".card");
  cards.forEach((c, i) => {
    c.classList.add("locked", "revealed");
    if (i === state.round.targetIndex) c.classList.add("target");
    if (i === index && correct) c.classList.add("correct");
    if (i === index && !correct) c.classList.add("wrong-pick");
  });

  const pickedCard = cards[index];
  if (correct) awardCorrect(pickedCard);
  else awardWrong(pickedCard);

  const result = document.getElementById("result");
  if (correct) {
    result.innerHTML = `<span class="accent-correct">Right.</span> That's the curve for <em>${state.round.target}</em>.`;
  } else {
    const pickedWord = state.round.options[index];
    result.innerHTML = `<span class="accent-wrong">Nope.</span> You picked <em>${pickedWord}</em>. <em>${state.round.target}</em> was ${["A", "B", "C", "D"][state.round.targetIndex]}.`;
  }

  const nextBtn = document.getElementById("next-btn");
  nextBtn.hidden = false;
  nextBtn.focus();

  document.getElementById("ask-gemini").hidden = false;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMarkdown(text) {
  const escaped = escapeHtml(text);
  const blocks = escaped.split(/\n\s*\n+/);
  const rendered = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^-{3,}$/.test(trimmed)) return "<hr>";
    const headingMatch = trimmed.match(/^(#{2,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      return `<h${level}>${headingMatch[2]}</h${level}>`;
    }
    const lines = trimmed.split("\n");
    if (lines.length > 1 && lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      const items = lines.map((l) => l.replace(/^\s*[-*]\s+/, ""));
      return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
    }
    if (lines.length > 1 && lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
      const items = lines.map((l) => l.replace(/^\s*\d+\.\s+/, ""));
      return `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
    }
    return `<p>${lines.join("<br>")}</p>`;
  }).filter(Boolean);
  return rendered.join("")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<![*\w])\*([^*\n]+)\*(?!\w)/g, "<em>$1</em>");
}

function closeAnswer() {
  if (state.answer.abort) {
    state.answer.abort.abort();
    state.answer.abort = null;
  }
  document.getElementById("answer").hidden = true;
  document.getElementById("answer-text").innerHTML = "";
  document.getElementById("answer-text").classList.remove("streaming", "error");
}

function buildAskPrompt() {
  const r = state.round;
  if (r.mode === "duel") {
    const briefA = buildCurveBrief(state.data.series[r.wordA]);
    const briefB = buildCurveBrief(state.data.series[r.wordB]);
    return `compare the ngram curves of "${r.wordA}" and "${r.wordB}" — why do they look the way they do?
"${r.wordA}" — peak ${Math.floor(briefA.peak / 10) * 10}s · by decade, 0-100 of own peak: ${briefA.samples}
"${r.wordB}" — peak ${Math.floor(briefB.peak / 10) * 10}s · by decade, 0-100 of own peak: ${briefB.samples}
explain the historical relationship between the two — when did one rise as the other fell? did they trade places? what does the contrast reveal? bullet points welcome.`;
  }
  const word = r.target;
  const brief = buildCurveBrief(state.data.series[word]);
  return `why does ngram viewer of "${word}" look like this?\n(peak ${Math.floor(brief.peak / 10) * 10}s · trajectory by decade, 0-100 of own peak: ${brief.samples})\nadd more details, bullet point. what does the evolution of the chart show about the human condition?`;
}

async function askGemini() {
  if (!state.round) return;
  closeAnswer();
  const panel = document.getElementById("answer");
  const textEl = document.getElementById("answer-text");
  panel.hidden = false;
  textEl.classList.add("streaming");
  textEl.dataset.raw = "";
  window.scrollTo({ top: 0, behavior: "smooth" });

  const ctrl = new AbortController();
  state.answer.abort = ctrl;
  const askBtn = document.getElementById("ask-gemini");
  askBtn.disabled = true;

  let full = "";
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: buildAskPrompt() }],
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err.slice(0, 200) || `HTTP ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const j = JSON.parse(line.slice(6));
          if (j.text) {
            full += j.text;
            textEl.dataset.raw = full;
            textEl.innerHTML = renderMarkdown(full);
          }
          if (j.error) throw new Error(j.error);
        } catch (e) {
          if (e.message?.startsWith("stopped:") || e.message?.startsWith("gemini:")) throw e;
        }
      }
    }
  } catch (e) {
    if (e.name === "AbortError") return;
    textEl.classList.add("error");
    textEl.textContent = `Couldn't reach the AI: ${e.message}`;
  } finally {
    textEl.classList.remove("streaming");
    state.answer.abort = null;
    askBtn.disabled = false;
  }
}

function setMode(mode) {
  if (mode !== "single" && mode !== "duel" && mode !== "imposter") return;
  state.mode = mode;

  const buttons = {
    single: document.getElementById("mode-single"),
    duel: document.getElementById("mode-duel"),
    imposter: document.getElementById("mode-imposter"),
  };
  for (const [key, btn] of Object.entries(buttons)) {
    btn.classList.toggle("active", mode === key);
    btn.setAttribute("aria-selected", mode === key);
  }

  document.getElementById("prompt-single").hidden = mode !== "single";
  document.getElementById("prompt-duel").hidden = mode !== "duel";
  document.getElementById("prompt-imposter").hidden = mode !== "imposter";
  document.getElementById("grid").hidden = mode !== "single";
  document.getElementById("duel-stage").hidden = mode !== "duel";
  document.getElementById("imposter-stage").hidden = mode !== "imposter";

  // Gemini "ask why" only makes sense for the curve modes
  document.getElementById("ask-gemini").hidden = true;

  closeAnswer();
  updateScoreUI();
  newRound();
}

async function main() {
  await loadData();
  updateScoreUI();
  document.getElementById("next-btn").addEventListener("click", newRound);
  document.getElementById("ask-gemini").addEventListener("click", askGemini);
  document.getElementById("mode-single").addEventListener("click", () => setMode("single"));
  document.getElementById("mode-duel").addEventListener("click", () => setMode("duel"));
  document.getElementById("mode-imposter").addEventListener("click", () => setMode("imposter"));
  document.getElementById("duel-pick-a").addEventListener("click", () => onDuelPick("A"));
  document.getElementById("duel-pick-b").addEventListener("click", () => onDuelPick("B"));

  document.addEventListener("keydown", (e) => {
    if (state.round?.locked && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      newRound();
      return;
    }
    if (state.mode === "duel" && !state.round?.locked) {
      if (e.key.toLowerCase() === "a") onDuelPick("A");
      if (e.key.toLowerCase() === "b") onDuelPick("B");
      return;
    }
    if (state.mode === "single" && !state.round?.locked) {
      const map = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      const idx = map[e.key.toLowerCase()];
      if (idx !== undefined) onPick(idx);
      return;
    }
    if (state.mode === "imposter" && !state.round?.locked) {
      const map = { "1": 0, "2": 1, "3": 2, "4": 3, "5": 4 };
      const idx = map[e.key];
      if (idx !== undefined && idx < state.round.cards.length) onImposterPick(idx);
    }
  });
  newRound();
}

main();
