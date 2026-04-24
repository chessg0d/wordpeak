const CHART_W = 400;
const CHART_H = 200;
const PAD_L = 24;
const PAD_R = 10;
const PAD_T = 12;
const PAD_B = 8;

const state = {
  data: null,
  words: [],
  round: null,
  score: { correct: 0, total: 0, streak: 0 },
};

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

function newRound() {
  const target = sample(state.words, 1)[0];
  const decoys = sample(state.words, 3, new Set([target]));
  const all = shuffle([target, ...decoys]);

  state.round = {
    target,
    options: all,
    targetIndex: all.indexOf(target),
    locked: false,
    pick: null,
  };

  renderRound();
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
}

function onPick(index) {
  if (state.round.locked) return;
  state.round.locked = true;
  state.round.pick = index;

  const correct = index === state.round.targetIndex;
  state.score.total++;
  if (correct) {
    state.score.correct++;
    state.score.streak++;
  } else {
    state.score.streak = 0;
  }

  const cards = document.querySelectorAll(".card");
  cards.forEach((c, i) => {
    c.classList.add("locked", "revealed");
    if (i === state.round.targetIndex) c.classList.add("target");
    if (i === index && correct) c.classList.add("correct");
    if (i === index && !correct) c.classList.add("wrong-pick");
  });

  const result = document.getElementById("result");
  if (correct) {
    result.innerHTML = `<span class="accent-correct">Right.</span> That's the curve for <em>${state.round.target}</em>.`;
  } else {
    const pickedWord = state.round.options[index];
    result.innerHTML = `<span class="accent-wrong">Nope.</span> You picked <em>${pickedWord}</em>. <em>${state.round.target}</em> was ${["A", "B", "C", "D"][state.round.targetIndex]}.`;
  }

  document.getElementById("score-correct").textContent = state.score.correct;
  document.getElementById("score-total").textContent = state.score.total;
  document.getElementById("score-streak").textContent = state.score.streak;

  const nextBtn = document.getElementById("next-btn");
  nextBtn.hidden = false;
  nextBtn.focus();
}

async function main() {
  await loadData();
  document.getElementById("next-btn").addEventListener("click", newRound);
  document.addEventListener("keydown", (e) => {
    if (state.round?.locked && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      newRound();
    } else if (!state.round?.locked) {
      const map = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      const idx = map[e.key.toLowerCase()];
      if (idx !== undefined) onPick(idx);
    }
  });
  newRound();
}

main();
