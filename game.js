import { IMPOSTER_PACKS } from "./imposter-packs.js";

const SAVE_KEY = "wordpeak.v3";
const CARDS_PER_ROUND = 4; // 3 natives + 1 imposter

function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
  } catch {
    return {};
  }
}

function persistSave() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      best: state.score.best,
      bestStreak: state.score.bestStreak,
    }));
  } catch {
    // localStorage unavailable — silently skip
  }
}

const saved = loadSave();

const state = {
  round: null,
  score: {
    points: 0,
    streak: 0,
    best: saved.best ?? 0,
    bestStreak: saved.bestStreak ?? 0,
  },
};

function pointsForCorrect() {
  return 100 + Math.min(state.score.streak, 10) * 25;
}

function awardCorrect(anchorEl) {
  const gained = pointsForCorrect();
  state.score.streak += 1;
  state.score.points += gained;
  if (state.score.points > state.score.best) {
    state.score.best = state.score.points;
  }
  if (state.score.streak > state.score.bestStreak) {
    state.score.bestStreak = state.score.streak;
  }
  persistSave();
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

function updateScoreUI() {
  document.getElementById("score-points").textContent = state.score.points;
  document.getElementById("score-streak").textContent = state.score.streak;
  document.getElementById("score-best").textContent = state.score.best;
  document.getElementById("streak-fire").hidden = state.score.streak < 3;
}

function popPoints(anchorEl, text, sign) {
  const pop = document.createElement("span");
  pop.className = `points-pop${sign === "minus" ? " minus" : ""}`;
  pop.textContent = text;
  const cs = getComputedStyle(anchorEl);
  if (cs.position === "static") anchorEl.style.position = "relative";
  pop.style.left = "50%";
  pop.style.top = "30%";
  pop.style.transform = "translate(-50%, 0)";
  anchorEl.appendChild(pop);
  setTimeout(() => pop.remove(), 1200);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN(arr, n) {
  const pool = arr.slice();
  const out = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

function newRound() {
  // Pick a pack different from the previous one when possible.
  let pool = IMPOSTER_PACKS;
  if (state.round?.pack && IMPOSTER_PACKS.length > 1) {
    pool = IMPOSTER_PACKS.filter((p) => p.id !== state.round.pack.id);
  }
  const pack = pool[Math.floor(Math.random() * pool.length)];

  const natives = pickN(pack.natives, CARDS_PER_ROUND - 1).map((n) => ({ ...n, isImposter: false }));
  const imposter = pickN(pack.imposters, 1)[0];
  const cards = shuffle([...natives, { ...imposter, isImposter: true }]);
  const imposterIndex = cards.findIndex((c) => c.isImposter);

  state.round = { pack, cards, imposterIndex, locked: false, pick: null };
  renderRound();
}

function renderRound() {
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
    el.addEventListener("click", () => onPick(i));
    grid.appendChild(el);
  });

  document.getElementById("result").innerHTML = "";
  document.getElementById("next-btn").hidden = true;
  updateScoreUI();
}

function onPick(index) {
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
  if (correct) awardCorrect(pickedEl);
  else awardWrong(pickedEl);

  const imposterCard = r.cards[r.imposterIndex];
  const result = document.getElementById("result");
  if (correct) {
    result.innerHTML = `<span class="accent-correct">Caught it.</span> <em>${imposterCard.name}</em> — ${imposterCard.note}.`;
  } else {
    const pickedCard = r.cards[index];
    result.innerHTML = `<span class="accent-wrong">Fooled.</span> <em>${pickedCard.name}</em> belonged. The imposter was <em>${imposterCard.name}</em> — ${imposterCard.note}.`;
  }

  const nextBtn = document.getElementById("next-btn");
  nextBtn.hidden = false;
  nextBtn.focus();
}

function main() {
  updateScoreUI();
  document.getElementById("next-btn").addEventListener("click", newRound);

  document.addEventListener("keydown", (e) => {
    if (state.round?.locked && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      newRound();
      return;
    }
    if (!state.round?.locked) {
      const map = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      const idx = map[e.key.toLowerCase()];
      if (idx !== undefined && idx < CARDS_PER_ROUND) onPick(idx);
    }
  });

  newRound();
}

main();
