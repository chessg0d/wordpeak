const CHART_W = 400;
const CHART_H = 200;
const PAD_L = 24;
const PAD_R = 10;
const PAD_T = 12;
const PAD_B = 8;

const API_URL = "https://wordpeak-api.towsonerik.workers.dev/";

const state = {
  data: null,
  words: [],
  round: null,
  score: { correct: 0, total: 0, streak: 0 },
  answer: { abort: null },
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
  document.getElementById("ask-gemini").hidden = true;
  closeAnswer();
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

async function askGemini() {
  if (!state.round) return;
  closeAnswer();
  const word = state.round.target;
  const brief = buildCurveBrief(state.data.series[word]);
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
        messages: [
          {
            role: "user",
            content:
              `why was "${word}" so big in the ${Math.floor(brief.peak / 10) * 10}s?`,
          },
        ],
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
    textEl.textContent = `Couldn't reach Gemini: ${e.message}`;
  } finally {
    textEl.classList.remove("streaming");
    state.answer.abort = null;
    askBtn.disabled = false;
  }
}

async function main() {
  await loadData();
  document.getElementById("next-btn").addEventListener("click", newRound);
  document.getElementById("ask-gemini").addEventListener("click", askGemini);

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
