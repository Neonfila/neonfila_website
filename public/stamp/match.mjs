// Name matching shared by the page and the tests. No network, no AI:
// the whole register ships with the page and is searched on the phone.

const NOISE = [
  "limited", "ltd", "plc", "llp", "nigeria", "nig", "microfinance bank", "microfinace bank", "mirofinance bank",
  "microfinance", "mfb", "app", "apps", "mobile app", "the company", "trading name", "technologies", "technology",
  "tech", "financial services", "services", "company", "international", "global", "solutions", "inc",
];
const NOISE_RE = new RegExp(`\\b(${NOISE.sort((a, b) => b.length - a.length).map((w) => w.replace(/\s+/g, "\\s+")).join("|")})\\b`, "g");

// "FAIR MONEY MICROFINANCE BANK" -> "fair money"; keeps word boundaries.
export function words(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\(formerly[^)]*\)?/g, " ")
    .replace(/[^a-z0-9& ]+/g, " ")
    .replace(NOISE_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export const compact = (value) => words(value).replace(/[ &]/g, "");

function keysOf(entry) {
  return [entry.name, ...(entry.apps || [])].map((k) => ({ raw: k, words: words(k), compact: compact(k) })).filter((k) => k.compact);
}

// Builds a search function over the register entries.
export function createIndex(entries, aliases = {}) {
  const indexed = entries.map((entry) => ({ entry, keys: keysOf(entry) }));
  const byName = new Map(entries.map((e) => [e.name.toLowerCase(), e]));

  return function search(query) {
    const q = words(query);
    const qc = q.replace(/[ &]/g, "");
    if (qc.length < 3) return { query, results: [], tooShort: true };

    const hits = new Map(); // entry -> { score, via }
    const add = (entry, score, via) => {
      const prev = hits.get(entry);
      // A direct name match beats an alias note at the same strength.
      if (!prev || prev.score < score || (prev.score === score && via === null)) hits.set(entry, { score, via });
    };

    const alias = aliases[q] || aliases[qc];
    if (alias) for (const n of alias.names) { const e = byName.get(n.toLowerCase()); if (e) add(e, 3, alias.why); }

    for (const { entry, keys } of indexed) {
      for (const k of keys) {
        if (k.compact === qc) add(entry, 3, k.raw === entry.name ? null : `Listed as the app "${k.raw}"`);
        // The typed words must appear as whole words in the name: "renmoney" hits
        // "RENMONEY INSTANT CASH LOAN"; "trove" does not hit "TRO-VEST", "rise" not "ALGORISE".
        else if ((" " + k.words + " ").includes(" " + q + " "))
          add(entry, 2, k.raw === entry.name ? null : `Listed as the app "${k.raw}"`);
      }
    }

    const results = [...hits.entries()]
      .map(([entry, h]) => ({ ...entry, score: h.score, via: h.via }))
      .sort((a, b) => b.score - a.score || toneRank(a.tone) - toneRank(b.tone) || a.name.localeCompare(b.name));
    // Exact matches win; only show weaker ones when there is nothing exact.
    const best = results.length ? results[0].score : 0;
    const shown = results.filter((r) => r.score === best).slice(0, 12);
    return { query, results: shown, more: Math.max(0, results.filter((r) => r.score === best).length - shown.length), verdict: verdictOf(shown) };
  };
}

// Type-ahead: names with a word that starts with what has been typed so far.
// Only for suggestions the person then picks; verdicts still need a whole-word match.
export function createSuggest(entries, aliases = {}) {
  const names = new Map(); // compact -> display name
  for (const e of entries)
    for (const raw of [e.name, ...(e.apps || [])]) {
      const c = compact(raw);
      if (c.length >= 3 && !names.has(c)) names.set(c, { label: tidy(raw), words: words(raw) });
    }
  // Aliases are the brand names people know, so they rank first and show title-cased.
  for (const alias of Object.keys(aliases))
    names.set(compact(alias), { label: alias.replace(/\b[a-z]/g, (c) => c.toUpperCase()), words: words(alias), brand: true });
  const list = [...names.values()];
  return function suggest(query, limit = 6) {
    const q = words(query);
    if (q.length < 2) return [];
    const scored = [];
    for (const n of list) {
      const whole = (" " + n.words + " ").includes(" " + q + " ");
      const start = n.words.startsWith(q);
      if (!start && !(" " + n.words).includes(" " + q)) continue;
      // brand alias > whole-word hit > starts the name > word inside; then shorter names first
      scored.push({ n, rank: (n.brand ? 0 : 4) + (whole ? 0 : 1) + (start ? 0 : 2) });
    }
    return scored
      .sort((a, b) => a.rank - b.rank || a.n.words.length - b.n.words.length)
      .slice(0, limit)
      .map((s) => s.n.label);
  };
}

// "RENMONEY MICROFINANCE BANK" -> "Renmoney Microfinance Bank"; keeps short codes (MFB, PLC, UBA) upper.
const KEEP_UPPER = new Set(["MFB", "PLC", "PSB", "LLP", "UBA", "GTB", "FCMB", "CBN", "SEC", "VFD", "LAPO", "NPF", "SME", "II", "III", "IBTC", "CFG", "ATBU", "AMAC", "OTC", "NASD"]);
export function tidy(name) {
  const s = String(name || "").replace(/\s+/g, " ").trim();
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/[a-z0-9]+/g, (w) => (KEEP_UPPER.has(w.toUpperCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)));
}

const toneRank =(tone) => ({ danger: 0, caution: 1, ok: 2 })[tone] ?? 3;

// One line the person can act on. A warning always wins over a licence.
export function verdictOf(results) {
  if (!results.length) return "none";
  if (results.some((r) => r.tone === "danger")) return "warning";
  if (results.some((r) => r.tone === "ok")) return "licensed";
  return "partial";
}
