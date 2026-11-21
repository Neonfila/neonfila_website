import { createIndex, createSuggest, compact, tidy } from "./match.mjs";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const day = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const list = (items) => items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

const VERDICT = {
  warning: { word: "Flagged", line: () => "A regulator has warned about this name. Don’t borrow from it or pay it." },
  licensed: { word: "Licensed", line: (regs) => `Listed by the ${list(regs)}. Check that the company name on the app’s store page matches one below. Scammers copy real names.` },
  partial: { word: "Not fully licensed", line: () => "Only conditional, test or fast-track approval so far. Read the details before you trust it with money." },
  none: { word: "Not found", line: () => "It isn’t on any FCCPC, CBN or SEC list. That isn’t proof it’s illegal, but ask who licenses them before you send money." },
};

let search, suggest, active = -1;

// The regulator is already on the chip, so drop it from the label.
const shortLabel = (label) => {
  const s = label.replace(/^SEC registered: /, "Registered: ").replace(/^CBN payments licence: /, "Payments licence: ")
    .replace(/^(CBN|SEC|FCCPC) /, "").replace(/ by the (CBN|SEC|FCCPC)$/, "").replace(/^The (CBN|SEC|FCCPC) revoked/, "Revoked");
  return s[0].toUpperCase() + s.slice(1);
};

// One card per company, with each regulator's entry as a row.
function groups(results) {
  const map = new Map();
  for (const r of results) {
    const key = compact(r.name);
    if (!map.has(key)) map.set(key, { name: tidy(r.name), apps: new Set(), rows: [], tone: r.tone });
    const g = map.get(key);
    (r.apps || []).forEach((a) => g.apps.add(tidy(a)));
    g.rows.push(r);
    if (r.tone === "danger" || (r.tone === "caution" && g.tone === "ok")) g.tone = r.tone;
  }
  const rank = { danger: 0, caution: 1, ok: 2 };
  return [...map.values()].sort((a, b) => rank[a.tone] - rank[b.tone]);
}

function render(result) {
  const box = $("answer");
  $("try").hidden = !!result;
  if (!result) { box.innerHTML = ""; return; }
  if (result.tooShort) { box.innerHTML = `<p class="hint">Type at least three letters.</p>`; return; }
  const v = VERDICT[result.verdict];
  const regs = [...new Set(result.results.filter((r) => r.tone === "ok").map((r) => r.regulator))];
  const cards = groups(result.results).map((g) => `
    <li class="card" data-tone="${g.tone}">
      <h3>${esc(g.name)}</h3>
      ${g.apps.size ? `<p class="apps">${esc([...g.apps].join(" · "))}</p>` : ""}
      <ul class="rows">${g.rows.map((r) => `
        <li data-tone="${esc(r.tone)}">
          <span class="reg">${esc(r.regulator)}</span>
          <div>
            <p class="label">${esc(shortLabel(r.label))}</p>
            ${r.via && !r.via.startsWith("Listed as the app") ? `<p class="meta">${esc(r.via)}</p>` : ""}
            ${r.detail ? `<p class="meta">${esc(r.detail)}</p>` : ""}
            <a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">Open the ${esc(r.regulator)} list</a>
          </div>
        </li>`).join("")}
      </ul>
    </li>`).join("");
  box.innerHTML = `
    <div class="verdict" data-verdict="${result.verdict}">
      <p class="word"><span class="dot" aria-hidden="true"></span>${v.word}</p>
      <p class="line">${esc(v.line(regs))}</p>
    </div>
    ${cards ? `<ol class="cards">${cards}</ol>` : ""}
    ${result.more ? `<p class="hint">${result.more} more matches. Type the full name to narrow it down.</p>` : ""}`;
}

function closeSuggest() {
  $("suggest").hidden = true;
  $("q").setAttribute("aria-expanded", "false");
  $("q").removeAttribute("aria-activedescendant");
  active = -1;
}

function showSuggest(value) {
  const names = suggest(value);
  const ul = $("suggest");
  if (!names.length) return closeSuggest();
  ul.innerHTML = names.map((n, i) => `<li role="option" id="opt-${i}" data-value="${esc(n)}">${esc(n)}</li>`).join("");
  ul.hidden = false;
  $("q").setAttribute("aria-expanded", "true");
  active = -1;
}

function highlight(i) {
  const items = [...$("suggest").children];
  if (!items.length) return;
  active = (i + items.length) % items.length;
  items.forEach((li, j) => li.setAttribute("aria-selected", String(j === active)));
  $("q").setAttribute("aria-activedescendant", items[active].id);
}

function run(query) {
  closeSuggest();
  $("q").value = query;
  $("q").blur();
  render(search(query));
  const url = new URL(location.href);
  url.searchParams.set("q", query);
  history.replaceState(null, "", url);
}

async function start() {
  try {
    const [data, aliasFile] = await Promise.all([
      fetch("data/registers.json").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("data/aliases.json").then((r) => r.json()),
    ]);
    search = createIndex(data.entries, aliasFile.aliases);
    suggest = createSuggest(data.entries, aliasFile.aliases);
    $("registers").innerHTML = data.registers
      .map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a><span>${r.count.toLocaleString()} names · ${day(r.readAt)}</span></li>`)
      .join("");
    $("status").hidden = true;
    for (const el of [$("q"), document.querySelector(".search button")]) el.disabled = false;
    const q = new URLSearchParams(location.search).get("q");
    if (q) run(q); else { $("try").hidden = false; $("q").focus(); }
  } catch {
    $("status").textContent = "Couldn’t load the registers. Check your connection and reload.";
  }
}

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!search) return;
  const items = [...$("suggest").children];
  run(active >= 0 && items[active] ? items[active].dataset.value : $("q").value);
});
$("q").addEventListener("input", (e) => {
  if (!search) return;
  if (!e.target.value.trim()) { closeSuggest(); render(null); return; }
  showSuggest(e.target.value);
});
$("q").addEventListener("keydown", (e) => {
  if ($("suggest").hidden) return;
  if (e.key === "ArrowDown") { e.preventDefault(); highlight(active + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); highlight(active - 1); }
  else if (e.key === "Escape") closeSuggest();
});
$("suggest").addEventListener("pointerdown", (e) => {
  const li = e.target.closest("li");
  if (li) { e.preventDefault(); run(li.dataset.value); }
});
$("q").addEventListener("blur", () => setTimeout(closeSuggest, 100));
$("try").addEventListener("click", (e) => { if (e.target.tagName === "BUTTON" && search) run(e.target.textContent); });
start();
