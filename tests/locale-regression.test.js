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

test("contact service categories use stable locale-independent values", () => {
  const page = source("contact/index.html");
  const api = source("api/contact.js");
  for (const value of ["web-application", "saas-platform", "ai-automation", "technical-improvement", "other"]) {
    assert.match(page, new RegExp('value="' + value + '"'));
    assert.ok(api.includes('"' + value + '"'), "API must accept " + value);
  }
});

test("Swedish portfolio ItemList schema label is localized", () => {
  const i18n = source("assets/i18n.js");
  assert.match(i18n, /"BTMCode — Seçilmiş Yazılım Projeleri": "BTMCode — Utvalda mjukvaruprojekt"/);
});

test("all portfolio references use real screenshot captures and include Paşa Motor", () => {
  const page = source("projects/index.html");
  const home = source("index.html");
  assert.equal((page.match(/<article class="project-card/g) || []).length, 9);
  assert.equal((page.match(/class="project-cover"/g) || []).length, 9);
  assert.equal((page.match(/src="https:\/\/image\.thum\.io\/get\//g) || []).length, 9);
  assert.match(page, /href="https:\/\/pasamotor\.com\.tr\//);
  assert.match(page, /<h3>Paşa Motor<\/h3>/);
  assert.equal((home.match(/<article class="project-card/g) || []).length, 6);
  assert.equal((home.match(/class="project-cover"/g) || []).length, 6);
  assert.match(page, /alt="[^"]+"/);
});

test("Paşa Motor copy and website-cover alt labels have six locale mappings", () => {
  const build = source("scripts/build-locales.js");
  assert.match(build, /const projectCoverAltSuffix/);
  assert.match(build, /const paSaMotorTranslations/);
  assert.match(build, /Auktoriserad motorcykelförsäljning/);
  for (const locale of ["en","de","fr","ru","zh","sv"]) {
    assert.match(build, new RegExp(locale + ":"));
  }
});

test("live website screenshots preserve the full frame inside responsive 16:9 covers", () => {
  const css = source("assets/site.css");
  const page = source("projects/index.html");
  const home = source("index.html");
  assert.match(css, /\.project-art\.project-art--cover\{[\s\S]*?height:auto;[\s\S]*?aspect-ratio:16 \/ 9/);
  assert.match(css, /object-fit:contain/);
  assert.match(css, /object-position:center center/);
  assert.match(css, /\.project-art\.project-art--cover:before\{display:none\}/);
  for (const html of [page, home]) {
    const covers = [...html.matchAll(/<div class="project-art project-art--cover">([\s\S]*?)<\/div>/g)].map(match => match[1]);
    assert.ok(covers.length > 0);
    assert.ok(covers.every(cover => /<img\b/.test(cover)));
    assert.ok(covers.every(cover => !/class="art-index"|class="art-word"/.test(cover)));
  }
});

test("international agency-partner offer is present on home, services and contact pages", () => {
  const home = source("index.html");
  const services = source("services/index.html");
  const contact = source("contact/index.html");
  const api = source("api/contact.js");
  assert.match(home, /uzaktan yazılım partneri/);
  assert.match(home, /href="\/services\/#agency-partner"/);
  assert.match(services, /id="agency-partner"/);
  assert.match(services, /white-label çalışma modeli/i);
  assert.match(contact, /value="agency-development-partner"/);
  assert.match(api, /"agency-development-partner"/);
});
