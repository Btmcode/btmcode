"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "assets/locale-redirect.js"), "utf8");

function redirects({ pathname = "/", languages = ["en-US"], saved = null } = {}) {
  const navigations = [];
  const window = {
    location: {
      pathname,
      search: "?campaign=test",
      hash: "#contact",
      replace: value => navigations.push(value)
    },
    localStorage: {
      getItem: key => key === "btm-locale-preference" ? saved : null
    }
  };
  const navigator = { languages, language: languages[0] || "en" };
  vm.runInNewContext(source, { window, navigator });
  return navigations;
}

test("browser language detection selects the first supported preference", () => {
  assert.deepEqual(redirects({ languages: ["fr-FR", "en-US"] }), ["/fr/?campaign=test#contact"]);
  assert.deepEqual(redirects({ languages: ["zh-Hant-TW", "en-US"] }), ["/zh/?campaign=test#contact"]);
  assert.deepEqual(redirects({ languages: ["tr-TR", "en-US"] }), []);
});

test("saved manual language preference takes priority over browser language", () => {
  assert.deepEqual(redirects({ languages: ["de-DE"], saved: "zh" }), ["/zh/?campaign=test#contact"]);
});

test("explicit localized URL is never redirected", () => {
  assert.deepEqual(redirects({ pathname: "/zh/projects/", languages: ["en-US"] }), []);
});

test("unsupported browser languages fall back to English", () => {
  assert.deepEqual(redirects({ languages: ["es-ES", "it-IT"] }), ["/en/?campaign=test#contact"]);
});

test("all source pages expose the Simplified Chinese language option", () => {
  const pages = [
    "index.html", "about/index.html", "services/index.html", "projects/index.html",
    "journal/index.html", "contact/index.html", "privacy/index.html",
    "projects/aquaterra/index.html", "projects/aya/index.html",
    "projects/demos-pizza/index.html", "projects/imagehub/index.html", "projects/zirve/index.html"
  ];
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.match(html, /<option value="zh">ZH<\/option>/, page + " must offer Chinese");
  }
});

test("localized builds translate accessible attributes and JSON-LD string values", () => {
  const build = fs.readFileSync(path.join(root, "scripts/build-locales.js"), "utf8");
  assert.match(build, /function translateAttributes\(html, dict\)/);
  assert.match(build, /function translateJsonLd\(html, dict\)/);
  assert.match(build, /html = translateAttributes\(html,dict\)/);
  assert.match(build, /html = translateJsonLd\(html,dict\)/);
});
