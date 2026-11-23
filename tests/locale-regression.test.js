"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

function source(path) {
  return fs.readFileSync(path, "utf8");
}

test("Swedish is recognized by the privacy consent runtime", () => {
  const consent = source("assets/consent.js");
  assert.match(consent, /en\|de\|fr\|ru\|zh\|sv/);
  assert.match(consent, /sv:\s*\{[\s\S]*?title:"Dina integritetsinställningar"/);
  assert.match(consent, /settings:"Cookieinställningar"/);
});

test("Swedish is recognized by dynamic commerce and trust components", () => {
  const commerce = source("assets/commerce.js");
  assert.match(commerce, /en\|de\|fr\|ru\|zh\|sv/);
  assert.match(commerce, /sv:\s*\{[\s\S]*?whatsapp:"Skriv på WhatsApp"/);
  assert.match(commerce, /sv:"Hej, jag skulle vilja diskutera ett mjukvaruprojekt med BTMCode\."/);
  assert.match(commerce, /locale==="sv"\?"Integritet"/);
});

test("localized build generates Swedish pages and hreflang references", () => {
  const build = source("scripts/build-locales.js");
  assert.match(build, /const LOCALES = \["en","de","fr","ru","zh","sv"\]/);
  assert.match(build, /sv:"sv_SE"/);
  assert.match(build, /const codes = \["tr","en","de","fr","ru","zh","sv"\]/);
  assert.match(build, /hreflang = code === "zh" \? "zh-CN" : code/);
});

test("sitemap lastmod uses the current build date", () => {
  const build = source("scripts/build-locales.js");
  assert.match(build, /const buildDate = new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/);
  assert.doesNotMatch(build, /<lastmod>2026-11-24<\/lastmod>/);
});

test("portfolio project artwork has no stray closing tags", () => {
  const page = source("projects/index.html");
  assert.doesNotMatch(page, /<\/>/);
  assert.match(page, /<h3>LumiKids<\/h3>/);
});

test("project filters expose and update pressed state accessibly", () => {
  const page = source("projects/index.html");
  const script = source("assets/site.js");
  assert.equal((page.match(/data-filter=/g) || []).length, 5);
  const filters = [...page.matchAll(/<button[^>]*class="filter-btn[^"]*"[^>]*>/g)].map(match => match[0]);
  assert.equal(filters.length, 5);
  assert.ok(filters.every(button => /aria-pressed=/.test(button)));
  assert.match(script, /setAttribute\("aria-pressed", String\(item === button\)\)/);
});

test("project filter controls have a 44px target and visible keyboard focus", () => {
  const css = source("assets/site.css");
  assert.match(css, /\.filter-btn\{min-height:44px/);
  assert.match(css, /\.filter-btn:focus-visible/);
});

test("Swedish portfolio ItemList schema label is localized", () => {
  const i18n = source("assets/i18n.js");
  assert.match(i18n, /"BTMCode — Seçilmiş Yazılım Projeleri": "BTMCode — Utvalda mjukvaruprojekt"/);
});
