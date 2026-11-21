// Coverage test with the names real people type (the studio's "Berger" rule).
// Runs against the real data/registers.json, so a refresh that breaks a known
// answer fails here before it reaches anyone.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createIndex, words, compact } from "../../public/stamp/match.mjs";

const data = JSON.parse(readFileSync(new URL("../../public/stamp/data/registers.json", import.meta.url)));
const { aliases } = JSON.parse(readFileSync(new URL("../../public/stamp/data/aliases.json", import.meta.url)));
const search = createIndex(data.entries, aliases);

const regs = (q) => new Set(search(q).results.map((r) => r.regulator));

test("normalising drops suffixes and spacing", () => {
  assert.equal(words("FAIR MONEY MICROFINANCE BANK"), "fair money");
  assert.equal(compact("FairMoney MFB Ltd."), "fairmoney");
  assert.equal(compact("OPAY MFB LIMITEd"), "opay");
});

test("loan apps people know are found with the right register", () => {
  for (const q of ["FairMoney", "Carbon", "Branch", "Renmoney", "Aella", "QuickCheck", "Lcredit"]) {
    const r = search(q);
    assert.equal(r.verdict, "licensed", q);
    assert.ok(regs(q).has("FCCPC"), `${q} should be on the FCCPC list`);
  }
  assert.ok(search("EasyBuy").results.some((r) => r.status === "waiver"));
  assert.ok(search("Okash").results.some((r) => r.name.startsWith("OPAY")));
});

test("banks missing from the FCCPC list are found on the CBN lists", () => {
  for (const q of ["Kuda", "Moniepoint", "OPay", "PalmPay", "GTBank", "Access Bank"]) {
    assert.equal(search(q).verdict, "licensed", q);
    assert.ok(regs(q).has("CBN"), `${q} should be on a CBN list`);
  }
});

test("investment and crypto platforms come from the SEC lists", () => {
  for (const q of ["Cowrywise", "Chaka", "Afrinvest", "Stanbic"]) assert.ok(regs(q).has("SEC"), q);
  for (const q of ["Quidax", "Busha"]) assert.equal(search(q).verdict, "partial", `${q} is fast-tracked, not fully registered`);
});

test("warnings beat licences", () => {
  assert.equal(search("Cashlawn").verdict, "warning");
  assert.equal(search("9ja Cash").verdict, "warning");
  // Revoked in July 2026 but still on the CBN's own list in November.
  assert.equal(search("Living Spring").verdict, "warning");
  assert.equal(search("Ourpass").verdict, "warning");
});

test("no false matches on parts of words", () => {
  for (const q of ["Binance", "Bybit", "CBEX", "Risevest", "Rise", "Trove", "Yellow Card"])
    assert.equal(search(q).verdict, "none", `${q} must not match anything`);
  assert.ok(search("ab").tooShort);
});

test("every alias points at a name that is really on a register", () => {
  const names = new Set(data.entries.map((e) => e.name.toLowerCase()));
  for (const [alias, { names: targets }] of Object.entries(aliases))
    assert.ok(targets.some((t) => names.has(t.toLowerCase())), `alias "${alias}" points at nothing`);
});
