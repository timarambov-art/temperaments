/* ============================================================
   Логика: тест, диаграммы, аккордеон, навигация
   ============================================================ */

(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const GEN = {
    sanguine: "сангвиников",
    choleric: "холериков",
    phlegmatic: "флегматиков",
    melancholic: "меланхоликов",
  };
  const NOM = { sanguine: "сангвиник", choleric: "холерик", phlegmatic: "флегматик", melancholic: "меланхолик" };
  const PLURAL = {
    sanguine: "сангвиники",
    choleric: "холерики",
    phlegmatic: "флегматики",
    melancholic: "меланхолики",
  };
  const hobbyById = Object.fromEntries(HOBBIES.map((h) => [h.id, h]));

  /* ---------------- аккордеон типов ---------------- */

  function renderTypes() {
    const host = $("#typesList");
    if (!host) return;
    host.innerHTML = TYPE_ORDER.map((id) => {
      const t = TYPES[id];
      return `
      <details class="type-card" style="--accent:${t.color};--tint:${hexA(t.color, 0.13)}">
        <summary>
          <b>${esc(t.name)}</b>
          <small>${esc(t.short)}</small>
          <span class="arrow" aria-hidden="true"><svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        </summary>
        <div class="type-body">
          <p>${esc(t.desc)}</p>
          <div class="ns">
            <div><span>Сила</span>${esc(t.ns.force)}</div>
            <div><span>Баланс</span>${esc(t.ns.balance)}</div>
            <div><span>Подвижность</span>${esc(t.ns.mobility)}</div>
          </div>
          <h4>Сильные стороны</h4>
          <ul>${t.strengths.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          <h4>Что даётся труднее</h4>
          <ul>${t.hard.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          <h4>Типичные увлечения</h4>
          <ul>${t.hobbies.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          <p class="type-motto">${esc(t.rhythm)}</p>
        </div>
      </details>`;
    }).join("");
  }

  function renderRecs() {
    const host = $("#recsList");
    if (!host) return;
    host.innerHTML = TYPE_ORDER.map((id) => {
      const t = TYPES[id];
      return `
      <article class="rec-card" style="--accent:${t.color}">
        <h3>${esc(t.name)}</h3>
        <p class="tagline">${esc(t.tagline)}</p>
        <ul>${t.recs.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
        <p class="rhythm">${esc(t.rhythm)}</p>
      </article>`;
    }).join("");
  }

  function renderCases() {
    const rulesHost = $("#rulesList");
    if (rulesHost && window.RULES) {
      rulesHost.innerHTML = RULES.map(
        (r, i) => `
      <article class="rule">
        <span class="rule-n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <h3>${esc(r.t)}</h3>
          <p>${esc(r.d)}</p>
        </div>
      </article>`
      ).join("");
    }

    const host = $("#casesList");
    if (!host || !window.CASES) return;
    host.innerHTML = CASES.map(
      (c, i) => `
      <details class="case">
        <summary>
          <span class="case-n" aria-hidden="true">${i + 1}</span>
          <span class="case-head"><b>${esc(c.title)}</b><small>${esc(c.lead)}</small></span>
          <span class="arrow" aria-hidden="true">›</span>
        </summary>
        <div class="case-body">
          <p class="case-ml">Что происходит</p>
          <p class="case-mech">${esc(c.mech)}</p>
          <div class="case-cols">
            <div class="case-col">
              <h4>Если ты подросток</h4>
              <ul>${c.teen.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            </div>
            <div class="case-col">
              <h4>Если ты взрослый</h4>
              <ul>${c.adult.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            </div>
          </div>
          <p class="case-red"><b>Красная линия.</b> ${esc(c.red)}</p>
        </div>
      </details>`
    ).join("");

    /* открыт только один кейс — на телефоне так спокойнее */
    host.addEventListener(
      "toggle",
      (e) => {
        if (!e.target.open) return;
        [...host.querySelectorAll("details")].forEach((d) => {
          if (d !== e.target) d.open = false;
        });
      },
      true
    );
  }

  /* ---------------- исследование ---------------- */

  const SEG_ORDER = ["sanguine", "choleric", "phlegmatic", "melancholic"];

  function renderTypesChart() {
    const R = RESEARCH;
    const total = R.n;
    const donut = $("#donut");
    const legend = $("#legend");
    if (!donut || !legend) return;

    const r = 38;
    const C = 2 * Math.PI * r;
    let offset = 0;
    let arcs = "";
    SEG_ORDER.forEach((id) => {
      const v = R.byType[id];
      const len = (v / total) * C;
      arcs += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${TYPES[id].color}" stroke-width="11"
        stroke-dasharray="${len - 1.4} ${C - len + 1.4}" stroke-dashoffset="${-offset}"
        transform="rotate(-90 50 50)"></circle>`;
      offset += len;
    });
    donut.innerHTML = `<svg class="donut" viewBox="0 0 100 100" role="img" aria-label="Распределение по типам темперамента">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="#f3efe8" stroke-width="11"></circle>${arcs}</svg>`;

    legend.innerHTML = SEG_ORDER.map((id) => {
      const v = R.byType[id];
      return `<li><i style="background:${TYPES[id].color}"></i>
        <span>${esc(TYPES[id].name)}</span>
        <b>${v} <small>· ${Math.round((v / total) * 100)}%</small></b></li>`;
    }).join("");
  }

  function renderHobbyBars() {
    const host = $("#hobbyBars");
    if (!host) return;
    const max = Math.max(...RESEARCH.byHobby);
    host.innerHTML = HOBBIES.map((h, i) => {
      const v = RESEARCH.byHobby[i];
      const pct = Math.round((v / RESEARCH.n) * 100);
      return `<div class="bar-row">
        <span>${esc(h.label)} <small>${esc(h.note)}</small></span>
        <b>${pct}%</b>
        <span class="track"><i data-w="${((v / max) * 100).toFixed(1)}" style="width:0"></i></span>
      </div>`;
    }).join("");
  }

  function renderHeat() {
    const host = $("#heat");
    const R = RESEARCH;
    if (!host) return;
    let html = `<div class="h"></div>`;
    HOBBIES.forEach((h) => (html += `<div class="h">${esc(h.label)}</div>`));
    SEG_ORDER.forEach((id) => {
      const row = R.matrix[id];
      const tot = R.byType[id];
      html += `<div class="label"><i style="background:${TYPES[id].color}"></i>${esc(TYPES[id].name)}</div>`;
      row.forEach((v, i) => {
        const share = Math.round((v / tot) * 100);
        const a = 0.08 + (share / 45) * 0.42;
        html += `<div class="cell" style="background:${hexA(TYPES[id].color, a)};color:#14161a">
          ${v}<small>${share}%</small></div>`;
      });
    });
    host.innerHTML = html;
  }

  function renderMinis() {
    const host = $("#minis");
    const R = RESEARCH;
    if (!host) return;
    host.innerHTML = HOBBIES.map((h, i) => {
      const total = R.byHobby[i];
      const pct = Math.round((total / R.n) * 100);
      const rows = SEG_ORDER.map((id) => {
        const tot = R.byType[id];
        const v = R.matrix[id][i];
        const share = Math.round((v / tot) * 100);
        return `<div class="mini-row">
          <span class="name"><span class="dot" style="background:${TYPES[id].color}"></span>${esc(TYPES[id].name)}</span>
          <b>${share}%</b>
          <span class="track"><i style="width:${share}%;background:${TYPES[id].color}"></i></span>
        </div>`;
      }).join("");
      return `<div class="mini">
        <h4>${esc(h.label)}</h4>
        <p class="mini-total">${total} из ${R.n} · ${pct}% выборки</p>
        <div class="mini-rows">${rows}</div>
      </div>`;
    }).join("");
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  /* ---------------- табы ---------------- */

  function initTabs() {
    const tabs = $$(".tab");
    if (!tabs.length) return;
    const panels = { types: $("#panel-types"), hobbies: $("#panel-hobbies"), link: $("#panel-link") };

    function select(key, focus) {
      tabs.forEach((t) => {
        const on = t.dataset.tab === key;
        t.setAttribute("aria-selected", String(on));
        if (on && focus) t.focus();
      });
      Object.entries(panels).forEach(([k, p]) => (p.hidden = k !== key));
      if (key === "hobbies") paintBars();
    }
    tabs.forEach((t) => t.addEventListener("click", () => select(t.dataset.tab)));
    tabs.forEach((t) =>
      t.addEventListener("keydown", (e) => {
        const i = tabs.indexOf(t);
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
          select(next.dataset.tab, true);
        }
      })
    );
  }

  /* полосы растут при первом показе панели */
  function paintBars() {
    $$("#panel-hobbies .track i").forEach((i) => {
      const w = i.dataset.w;
      if (w) i.style.width = w + "%";
    });
  }

  /* ============================================================
     ТЕСТ
     ============================================================ */

  const card = $("#testCard");
  const state = { answers: [], hobby: null, genre: null, step: 0 };

  const countPerType = (answers) => {
    const c = { sanguine: 0, choleric: 0, phlegmatic: 0, melancholic: 0 };
    answers.forEach((a) => a && (c[a] += 1));
    return c;
  };

  function progressPct() {
    const total = 7;
    const done = state.step;
    return Math.round((done / total) * 100);
  }

  function shell(inner, stepLabel) {
    return `
      <div class="test-top">
        <span class="test-step">${esc(stepLabel)}</span>
        <span class="test-step">${Math.min(state.step + 1, 7)} / 7</span>
      </div>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPct()}">
        <i style="width:${progressPct()}%"></i>
      </div>
      ${inner}`;
  }

  function renderQuestion() {
    const q = QUESTIONS[state.step];
    const inner = `
      <h3 class="q-title" tabindex="-1">${esc(q.q)}</h3>
      <div class="options" role="group" aria-label="Варианты ответа">
        ${q.options
          .map(
            (o, i) => `<button class="option" type="button" data-i="${i}">
              <span class="dot" aria-hidden="true"></span><span>${esc(o.text)}</span></button>`
          )
          .join("")}
      </div>
      <div class="test-foot">
        ${state.step > 0 ? '<button class="linkish" type="button" data-back>← Назад</button>' : "<span></span>"}
        <span class="test-step">${state.step + 1} из 6</span>
      </div>`;
    card.innerHTML = shell(inner, "Вопрос");
    const title = $(".q-title", card);
    title && title.focus({ preventScroll: true });

    $$(".option", card).forEach((btn) =>
      btn.addEventListener("click", () => {
        $$(".option", card).forEach((b) => b.classList.remove("is-picked"));
        btn.classList.add("is-picked");
        const type = QUESTIONS[state.step].options[+btn.dataset.i].type;
        state.answers[state.step] = type;
        const go = () => {
          state.step += 1;
          state.step < 6 ? renderQuestion() : renderHobby();
        };
        window.setTimeout(go, 170);
      })
    );
    const back = $("[data-back]", card);
    back && back.addEventListener("click", () => {
      state.step -= 1;
      renderQuestion();
    });
  }

  function renderHobby() {
    const inner = `
      <h3 class="q-title" tabindex="-1">Какое занятие сейчас для вас главное?</h3>
      <div class="options" role="group" aria-label="Ведущее увлечение">
        ${HOBBIES.map(
          (h, i) => `<button class="option" type="button" data-i="${i}">
            <span class="dot" aria-hidden="true"></span>
            <span>${esc(h.label)}<br><small style="color:#6e7480;font-size:.8em">${esc(h.note)}</small></span>
          </button>`
        ).join("")}
      </div>
      <div class="test-foot">
        <button class="linkish" type="button" data-back>← Назад</button>
        <span class="test-step">7 из 7</span>
      </div>`;
    card.innerHTML = shell(inner, "Увлечение");
    const title = $(".q-title", card);
    title && title.focus({ preventScroll: true });

    $$(".option", card).forEach((btn) =>
      btn.addEventListener("click", () => {
        $$(".option", card).forEach((b) => b.classList.remove("is-picked"));
        btn.classList.add("is-picked");
        state.hobby = HOBBIES[+btn.dataset.i].id;
        window.setTimeout(() => {
          if (state.hobby === "games") renderGenre();
          else renderResult();
        }, 170);
      })
    );
    $("[data-back]", card).addEventListener("click", () => {
      state.step = 5;
      renderQuestion();
    });
  }

  function renderGenre() {
    const inner = `
      <h3 class="q-title" tabindex="-1">Какой жанр вам ближе?</h3>
      <div class="options" role="group" aria-label="Жанр видеоигр">
        ${GENRES.map(
          (g, i) => `<button class="option" type="button" data-i="${i}">
            <span class="dot" aria-hidden="true"></span><span>${esc(g.label)}</span></button>`
        ).join("")}
      </div>
      <p class="test-note">Это уточнение важно: в исследовании связь с темпераментом проявилась именно внутри видеоигр — между жанрами.</p>
      <div class="test-foot"><span></span><span class="test-step">уточнение</span></div>`;
    card.innerHTML = shell(inner, "Уточнение");
    const title = $(".q-title", card);
    title && title.focus({ preventScroll: true });
    $$(".option", card).forEach((btn) =>
      btn.addEventListener("click", () => {
        $$(".option", card).forEach((b) => b.classList.remove("is-picked"));
        btn.classList.add("is-picked");
        state.genre = GENRES[+btn.dataset.i].id;
        window.setTimeout(renderResult, 170);
      })
    );
  }

  function leaderOf(counts) {
    let best = TYPE_ORDER[0];
    let tie = null;
    TYPE_ORDER.forEach((id) => {
      if (counts[id] > counts[best]) best = id;
      else if (counts[id] === counts[best] && counts[id] > 0) tie = id;
    });
    const max = counts[best];
    const tied = TYPE_ORDER.filter((id) => counts[id] === max);
    return { best, tied: tied.length > 1 ? tied : null };
  }

  function researchLine(typeId, hobbyId) {
    if (!hobbyId) return "";
    const R = RESEARCH;
    const total = R.byType[typeId];
    const idx = HOBBIES.findIndex((h) => h.id === hobbyId);
    const v = R.matrix[typeId][idx];
    const pct = Math.round((v / total) * 100);
    const overall = Math.round((R.byHobby[idx] / R.n) * 100);
    const topIdx = R.matrix[typeId].indexOf(Math.max(...R.matrix[typeId]));
    const topPct = Math.round((R.matrix[typeId][topIdx] / total) * 100);

    let verdict;
    if (pct >= overall + 7) verdict = `<b>${pct}%</b> — это частый выбор для такого типа: так ответили ${v} из ${total} ${GEN[typeId]} (в среднем по выборке — ${overall}%).`;
    else if (pct <= overall - 7) verdict = `<b>${pct}%</b> — у этого типа такое увлечение встречается реже среднего: ${v} из ${total} ${GEN[typeId]}, в среднем по выборке — ${overall}%.`;
    else verdict = `<b>${pct}%</b> — близко к среднему: ${v} из ${total} ${GEN[typeId]}, в среднем по выборке — ${overall}%.`;

    let extra = "";
    if (topIdx !== idx) {
      extra = ` Чаще всего ${PLURAL[typeId]} выбирали «${HOBBIES[topIdx].label.toLowerCase()}» — ${topPct}%.`;
    }
    return verdict + extra;
  }

  function genreLine() {
    if (state.hobby !== "games" || !state.genre) return "";
    if (state.genre === "story")
      return ` Кстати, 7 из 11 увлечённых видеоиграми в исследовании выбрали именно стратегии и ролевые игры — и шестеро из них оказались флегматиками или меланхоликами.`;
    if (state.genre === "dynamic")
      return ` Динамичные жанры в исследовании чаще выбирали респонденты с высокой эргичностью и темпом — то есть ближе к холерикам.`;
    return "";
  }

  function renderResult(preset) {
    const counts = preset ? preset.counts : countPerType(state.answers);
    const hobby = preset ? preset.hobby : state.hobby;
    const { best, tied } = leaderOf(counts);
    const t = TYPES[best];
    const totalAns = preset ? preset.answers.length : state.answers.length;
    const pctOf = (id) => Math.round((counts[id] / Math.max(totalAns, 1)) * 100);
    const hobbyLabel = hobby ? hobbyById[hobby].label.toLowerCase() : "";
    const isMixed = !!tied;

    card.style.setProperty("--accent", t.color);

    const profileBars = SEG_ORDER.map((id) => {
      const pct = pctOf(id);
      return `<div class="profile-row">
        <span>${esc(TYPES[id].name)}</span>
        <span class="pct">${pct}%</span>
        <span class="track"><i style="width:${pct}%;background:${TYPES[id].color}"></i></span>
      </div>`;
    }).join("");

    const inner = `
      <div class="result">
        <div class="result-head" style="--accent:${t.color};--tint:${hexA(t.color, 0.14)}">
          <span class="result-chip" aria-hidden="true"></span>
          <div>
            <b>${esc(t.name)}</b>
            <span>${esc(t.tagline)}</span>
          </div>
        </div>

        <h3>Твой профиль</h3>
        <div class="profile">${profileBars}</div>
        ${isMixed ? `<p class="test-note">Профиль смешанный: ${tied.map((id) => TYPES[id].name).join(" и ")} идут вровень. Это нормально — чистых типов почти не бывает.</p>` : ""}

        <p class="result-desc">${esc(t.desc)}</p>
        <div class="chips">${t.strengths.map((s) => `<span class="chip plus">${esc(s)}</span>`).join("")}</div>

        <h3>Что попробовать</h3>
        <ul class="rec-list">${t.recs.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>

        ${
          hobby
            ? `<div class="research-note">
                <strong>Как это выглядит в исследовании</strong><br>
                ${researchLine(best, hobby)}${genreLine()}
              </div>`
            : ""
        }

        <div class="result-actions">
          <button class="btn btn-primary" type="button" data-share>Поделиться результатом</button>
          <button class="btn btn-ghost" type="button" data-again>Пройти заново</button>
        </div>
        <p class="share-msg" role="status" aria-live="polite" id="shareMsg"></p>

        <p class="test-note">Это ориентир, а не диагностика. Анкета описывает типичное поведение, но не заменяет консультацию психолога. Ни один тип не лучше другого.</p>
      </div>`;

    card.innerHTML = shell(inner, "Результат");
    $(".progress i", card).style.width = "100%";

    /* запоминаем */
    const p = SEG_ORDER.map((id) => counts[id]).join("");
    try {
      localStorage.setItem("tt-result", JSON.stringify({ p, h: hobby }));
    } catch (e) {}

    const shareBtn = $("[data-share]", card);
    shareBtn &&
      shareBtn.addEventListener("click", async () => {
        const url = new URL(location.href);
        url.searchParams.set("p", p);
        if (hobby) url.searchParams.set("h", hobby);
        url.hash = "test";
        const text = `Мой тип темперамента — ${t.name.toLowerCase()}.`;
        const msg = $("#shareMsg");
        try {
          if (navigator.share) {
            await navigator.share({ title: "Тайны темперамента", text, url: url.toString() });
          } else {
            await navigator.clipboard.writeText(url.toString());
            msg.textContent = "Ссылка скопирована";
          }
        } catch (e) {
          msg.textContent = "Ссылка: " + url.toString();
        }
      });

    const again = $("[data-again]", card);
    again &&
      again.addEventListener("click", () => {
        state.answers = [];
        state.hobby = null;
        state.genre = null;
        state.step = 0;
        try {
          localStorage.removeItem("tt-result");
        } catch (e) {}
        renderQuestion();
        card.scrollIntoView({ block: "center", behavior: "smooth" });
      });
  }

  function startFromUrl() {
    const url = new URL(location.href);
    const p = url.searchParams.get("p");
    const h = url.searchParams.get("h");
    if (p && /^[0-6]{4}$/.test(p)) {
      const counts = {};
      SEG_ORDER.forEach((id, i) => (counts[id] = +p[i]));
      state.step = 6;
      renderResult({ counts, hobby: hobbyById[h] ? h : null, answers: Array(6).fill(null) });
      return true;
    }
    return false;
  }

  /* ============================================================
     Интерфейс страницы
     ============================================================ */

  function initChrome() {
    const header = $("#header");
    const sticky = $("#stickyCta");
    const testSection = $("#test");

    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 8);
      if (!sticky) return;
      sticky.classList.toggle("is-on", y > 420 && !testSection.dataset.inview);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if ("IntersectionObserver" in window && testSection && sticky) {
      new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            testSection.dataset.inview = e.isIntersecting ? "1" : "";
            onScroll();
          });
        },
        { threshold: 0.12 }
      ).observe(testSection);
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: "-8% 0px -8% 0px" }
      );
      $$(".section-head, .story-card, .thesis, .type-card, .mini, .key, .rec-card, .rule, .case, .limit, .about-card").forEach(
        (el) => {
          el.classList.add("reveal");
          io.observe(el);
        }
      );
    }
  }

  function init() {
    renderTypes();
    renderRecs();
    renderCases();
    renderTypesChart();
    renderHobbyBars();
    renderHeat();
    renderMinis();
    initTabs();
    initChrome();

    if (!startFromUrl()) {
      try {
        const saved = JSON.parse(localStorage.getItem("tt-result") || "null");
        if (saved && /^[0-6]{4}$/.test(saved.p)) {
          const counts = {};
          SEG_ORDER.forEach((id, i) => (counts[id] = +saved.p[i]));
          state.step = 6;
          renderResult({ counts, hobby: hobbyById[saved.h] ? saved.h : null, answers: Array(6).fill(null) });
          return;
        }
      } catch (e) {}
      renderQuestion();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
