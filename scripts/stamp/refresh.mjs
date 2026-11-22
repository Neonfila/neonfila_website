// Stamp (neonfila.com/stamp/): rebuilds public/stamp/data/registers.json
// from the regulators' own public registers. The deploy workflow runs this daily
// before building; if it fails or the tests fail, the committed data is kept.
//
//   node scripts/stamp/refresh.mjs              CBN banks from scripts/stamp/cbn-snapshot.json
//   node scripts/stamp/refresh.mjs --cbn-live   CBN banks from the feed the CBN pages load
//
// Every entry keeps the register it came from and that register's URL, so the
// page can always say where an answer came from. Nothing here is user-reported.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const UA = "Mozilla/5.0 (is-it-licensed register refresh)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SOURCES = {
  fccpc: "https://fccpc.gov.ng/registration-of-digital-money-lenders/approvals-of-dmls/",
  finport: "https://sec.gov.ng/fintech-and-innovation-hub-finport/registered-fintech-operators/",
  sec: "https://sec.gov.ng/for-investors/find-a-registered-operator/",
  cbnPsp: "https://www.cbn.gov.ng/PaymentsSystem/PSPs.html",
  cbnApi: { dmb: "https://www.cbn.gov.ng/api/GetDMBs", mfb: "https://www.cbn.gov.ng/api/GetMFBs", psb: "https://www.cbn.gov.ng/api/GetPSBs" },
};

async function get(url, as = "text") {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return as === "json" ? await res.json() : await res.text();
    } catch (error) {
      if (attempt >= 3) throw new Error(`${url}: ${error.message}`);
      await sleep(1500 * attempt);
    }
  }
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#039": "'", "#8217": "’", "#8211": "–" };
const text = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#?\w+);/g, (m, e) => ENTITIES[e] ?? (e[0] === "#" ? String.fromCharCode(Number(e.slice(1))) : m))
    .replace(/\s+/g, " ")
    .trim();
const tables = (html) => [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map((m) => ({ html: m[0], at: m.index }));
const rows = (table) =>
  [...table.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((r) => [...r[0].matchAll(/<t[dh][\s\S]*?<\/t[dh]>/g)].map((c) => text(c[0])));
const splitApps = (s) =>
  (s || "")
    .split(/,|\bAND\b|&|\//i)
    .map((a) => a.trim())
    .filter((a) => a && !/^N\/?A$/i.test(a));
const isHeader = (cells) => /^S\/?N$/i.test(cells[0] || "");

// FCCPC: five sections, each table printed twice on the page (keep the first of each pair).
async function fccpc() {
  const html = await get(SOURCES.fccpc);
  const sections = [
    { id: "table_1", status: "approved", label: "Approved digital lender", tone: "ok" },
    { id: "table_3", status: "conditional", label: "Conditional approval only", tone: "caution" },
    { id: "table_5", status: "watchlist", label: "On the FCCPC watchlist", tone: "danger", appsOnly: true },
    { id: "table_7", status: "delisted", label: "Delisted by the FCCPC", tone: "danger", appsOnly: true },
    { id: "table_9", status: "waiver", label: "Lending covered by its CBN licence", tone: "ok" },
  ];
  const out = [];
  for (const s of sections) {
    const t = tables(html).find((t) => t.html.includes(`id="${s.id}"`));
    if (!t) throw new Error(`FCCPC section ${s.id} (${s.status}) not found; the page layout changed`);
    for (const cells of rows(t.html)) {
      if (isHeader(cells) || cells.length < 2) continue;
      const [name, apps] = s.appsOnly ? [cells[1], cells[1]] : [cells[1].replace(/,\s*$/, ""), cells[2]];
      out.push({
        regulator: "FCCPC", register: "Digital money lenders", name,
        apps: s.appsOnly ? [] : splitApps(apps), status: s.status, label: s.label, tone: s.tone,
        detail: cells[s.appsOnly ? 2 : 3] || "", source: SOURCES.fccpc,
      });
    }
  }
  return out;
}

// SEC FinPort: category matrix, the RI sandbox table and the ARIP table.
async function finport() {
  const html = await get(SOURCES.finport);
  const [matrix, ri, arip] = tables(html).map((t) => rows(t.html));
  if (!matrix || !ri || !arip) throw new Error("SEC FinPort tables not found; the page layout changed");
  const out = [];
  const [heads, ...body] = matrix;
  for (const cells of body)
    cells.forEach((name, i) => {
      if (name) out.push({ regulator: "SEC", register: "Registered fintech operators", name, apps: [], status: "fintech", label: `Registered fintech: ${heads[i]}`, tone: "ok", detail: "", source: SOURCES.finport });
    });
  const split = (cell) => {
    const m = cell.match(/^(.*?)\s*Trading Name:\s*(.*)$/i);
    return m ? [m[1].trim(), [m[2].trim()]] : [cell, []];
  };
  for (const cells of ri.filter((c) => !isHeader(c) && c.length > 4)) {
    const [name, apps] = split(cells[1]);
    out.push({ regulator: "SEC", register: "Regulatory Incubation sandbox", name, apps, status: "sandbox", label: `Sandbox test only: ${cells[2]}`, tone: "caution", detail: `Test period ${cells[3]}. ${cells[6] || ""}`.trim(), source: SOURCES.finport });
  }
  const seen = new Set();
  for (const cells of arip.filter((c) => !isHeader(c) && c.length > 2)) {
    if (seen.has(cells[1])) continue;
    seen.add(cells[1]);
    const [name, apps] = split(cells[1]);
    out.push({ regulator: "SEC", register: "Accelerated Regulatory Incubation (ARIP)", name, apps, status: "arip", label: `Fast-tracked by the SEC (ARIP): ${cells[2]}`, tone: "caution", detail: "Admitted to the SEC's fast-track programme; not yet a full registration.", source: SOURCES.finport });
  }
  return out;
}

// SEC capital market operators: about 65 server-rendered pages. The SEC serves
// them in a different order on every request, so one pass misses firms. Repeat
// passes, keyed by the SEC's own file number, until the count reaches the size
// the paging implies (full pages x per-page + last page), at most 12 passes.
const SEC_MAX_PASSES = 12;
let secPages = 0;
let secPerPage = 0;
let secLastPage = 0;

async function secOperators() {
  const byId = new Map();
  for (let pass = 1; pass <= SEC_MAX_PASSES; pass++) {
    await secPass(byId, pass);
    if (byId.size >= secExpected()) break;
  }
  const expected = secExpected();
  if (byId.size < expected) console.warn(`  SEC: found ${byId.size} of about ${expected} firms after ${SEC_MAX_PASSES} passes`);
  return [...byId.values()];
}
const secExpected = () => (secPages - 1) * secPerPage + secLastPage;

async function secPass(byId, pass) {
  for (let page = 1; page <= Math.max(secPages, 1); page++) {
    const html = await get(`${SOURCES.sec}?page=${page}`);
    const total = Number(html.match(/Page \d+ of (\d+)/)?.[1] || 0);
    if (total > secPages) secPages = total;
    if (!secPages) throw new Error("SEC register: could not read the page count; the page layout changed");
    const blocks = html.split(/onclick="toggleAccordion\('operator-/).slice(1);
    const ids = new Set(blocks.map((b) => b.match(/^(\d+)/)?.[1]).filter(Boolean));
    if (page === 1) secPerPage = Math.max(secPerPage, ids.size);
    if (page === secPages) secLastPage = Math.max(secLastPage, ids.size);
    for (const block of blocks) {
      const id = block.match(/^(\d+)/)?.[1];
      if (!id || byId.has(id)) continue;
      const name = text(block.match(/font-medium">([\s\S]*?)<\/p>/)?.[1] || "");
      if (!name) continue;
      const field = (label) => text(block.match(new RegExp(`${label}[\\s\\S]*?<p[^>]*>([\\s\\S]*?)</p>`))?.[1] || "");
      const functions = [...block.matchAll(/Function \d+[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1]));
      const status = text(block.match(/Account Status<\/h4>\s*<span[^>]*>([\s\S]*?)<\/span>/)?.[1] || "") || "Unknown";
      byId.set(id, {
        regulator: "SEC", register: "Capital market operators", name, apps: [],
        status: /approved/i.test(status) ? "registered" : "sec_other",
        label: `SEC registered: ${functions.join(", ") || text(block.match(/text-sm text-gray-600">([\s\S]*?)<\/span>/)?.[1] || "")}`,
        tone: /approved/i.test(status) ? "ok" : "caution",
        detail: `Account status: ${status}. Registered ${field("Date of Registration")}. CAC ${text(block.match(/CAC:\s*([^<]*)/)?.[1] || "")}`.trim(),
        source: SOURCES.sec,
      });
    }
    process.stdout.write(`\r  SEC pass ${pass}, page ${page}/${secPages}, ${byId.size} firms   `);
    await sleep(300);
  }
  process.stdout.write(`(expect about ${secExpected()})\n`);
}

// CBN payment licences: one static page, sections A to F.
async function cbnPayments() {
  const html = await get(SOURCES.cbnPsp);
  const out = [];
  let prev = 0;
  for (const t of tables(html)) {
    const before = text(html.slice(prev, t.at));
    prev = t.at + t.html.length;
    const kinds = {
      "CARD/PAYMENT SCHEMES": "card or payment scheme",
      "MOBILE MONEY OPERATOR": "mobile money operator",
      "SWITCHING & PROCESSING": "switching and processing",
      "PAYMENT SOLUTION SERVICE PROVIDER": "payment solution service provider",
      "PAYMENT TERMINAL SERVICES PROVIDER": "payment terminal services provider",
      "SUPER-AGENT": "super-agent",
      "PAYMENTS SERVICE HOLDING": "payments service holding company",
      "PAYMENTS TERMINAL SERVICE AGGREGATOR": "payments terminal service aggregator",
    };
    const upper = before.toUpperCase();
    const key = Object.keys(kinds).filter((k) => upper.includes(k)).sort((a, b) => upper.lastIndexOf(b) - upper.lastIndexOf(a))[0];
    const label = key ? kinds[key] : "payments licence";
    const seen = new Set();
    for (const cells of rows(t.html)) {
      if (/^S\/?N$/i.test(cells[0]) || !cells[1] || seen.has(cells[1])) continue;
      seen.add(cells[1]);
      const formerly = cells[1].match(/\(Formerly ([^)]*)\)?/i)?.[1];
      out.push({
        regulator: "CBN", register: "Payment service providers", name: cells[1].replace(/\s*\(Formerly[^)]*\)?/i, "").trim(),
        apps: formerly ? [formerly.trim()] : [], status: "payments",
        label: `CBN payments licence: ${label}`, tone: "ok",
        detail: "A payments licence. It does not by itself permit lending or investment products.", source: SOURCES.cbnPsp,
      });
    }
  }
  if (!out.length) throw new Error("CBN payments tables not found; the page layout changed");
  return out;
}

// CBN banks: the CBN pages load these lists from a JSON feed in the browser.
async function cbnBanks(live) {
  const kinds = {
    dmb: "CBN licensed commercial bank",
    mfb: "CBN licensed microfinance bank",
    psb: "CBN licensed payment service bank",
  };
  const snapshot = JSON.parse(await readFile(join(HERE, "cbn-snapshot.json"), "utf8"));
  const out = [];
  for (const [kind, label] of Object.entries(kinds)) {
    let names = snapshot.lists[kind].names;
    if (live) names = (await get(SOURCES.cbnApi[kind], "json")).map((r) => String(r.name || "").replace(/\s+/g, " ").trim()).filter(Boolean);
    for (const name of new Set(names))
      out.push({ regulator: "CBN", register: label.replace("CBN licensed ", "Licensed ") + "s", name, apps: [], status: "bank", label, tone: "ok", detail: "", source: snapshot.lists[kind].url });
  }
  return { entries: out, readAt: live ? new Date().toISOString().slice(0, 10) : snapshot.readAt };
}

const live = process.argv.includes("--cbn-live");
const today = new Date().toISOString().slice(0, 10);
const registers = [];
const entries = [];
const steps = [
  ["FCCPC digital money lenders", SOURCES.fccpc, fccpc],
  ["SEC registered fintech operators", SOURCES.finport, finport],
  ["SEC capital market operators", SOURCES.sec, secOperators],
  ["CBN payment service providers", SOURCES.cbnPsp, cbnPayments],
];
for (const [title, url, fn] of steps) {
  console.log(`Reading ${title}`);
  const list = await fn();
  registers.push({ title, url, count: list.length, readAt: today });
  entries.push(...list);
}
console.log(`Reading CBN banks (${live ? "live feed" : "snapshot"})`);
const banks = await cbnBanks(live);
for (const kind of ["commercial bank", "microfinance bank", "payment service bank"]) {
  const list = banks.entries.filter((e) => e.label.endsWith(kind));
  registers.push({ title: `CBN licensed ${kind}s`, url: list[0].source, count: list.length, readAt: banks.readAt });
}
entries.push(...banks.entries);

// Revoked licences are warnings, and a warning always beats a licence on the page.
const revoked = JSON.parse(await readFile(join(HERE, "cbn-revocations.json"), "utf8"));
for (const raw of revoked.names) {
  const formerly = raw.match(/\(formerly ([^)]*)\)/i)?.[1];
  entries.push({
    regulator: "CBN", register: "Revoked licences", name: raw.replace(/\s*\(formerly[^)]*\)/i, "").trim(),
    apps: formerly ? [formerly.trim()] : [], status: "revoked", label: "The CBN revoked this bank's licence", tone: "danger",
    detail: `Revocation published ${revoked.date}, reproduced in full by Premium Times.`, source: revoked.source,
  });
}
registers.push({ title: "CBN revoked microfinance licences (July 2026)", url: revoked.source, count: revoked.names.length, readAt: revoked.date });

// Refuse to publish a register that suddenly shrank: that is a broken page, not news.
const OUT = join(HERE, "../../public/stamp/data/registers.json");
const previous = await readFile(OUT, "utf8").then(JSON.parse).catch(() => null);
for (const r of registers) {
  const old = previous?.registers.find((p) => p.title === r.title);
  if (old && r.count < old.count * 0.7) throw new Error(`${r.title}: ${r.count} names, was ${old.count}. Keeping the old data.`);
}
await writeFile(OUT, JSON.stringify({ builtAt: today, registers, entries }) + "\n");
for (const r of registers) console.log(`  ${String(r.count).padStart(4)}  ${r.title} (read ${r.readAt})`);
console.log(`Wrote public/stamp/data/registers.json with ${entries.length} entries`);
