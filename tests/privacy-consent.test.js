"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("GA4 is opt-in and no measurement ID is shipped by default", () => {
  const config = read("assets/config.js");
  const consent = read("assets/consent.js");
  assert.match(config, /gaMeasurementId:\s*""/);
  assert.match(consent, /if \(!measurementId \|\| !current \|\| !current\.analytics/);
  assert.match(consent, /analytics_storage:"denied"/);
  assert.match(consent, /if\(!current\) open\(false\)/);
});

test("consent manager exposes reject, accept and granular choices", () => {
  const consent = read("assets/consent.js");
  assert.match(consent, /data-consent-reject/);
  assert.match(consent, /data-consent-accept/);
  assert.match(consent, /data-consent-analytics/);
  assert.match(consent, /data-consent-marketing/);
});

test("WhatsApp contact number is normalized and uses wa.me", () => {
  const commerce = read("assets/commerce.js");
  assert.match(commerce, /const phone="905386949469"/);
  assert.match(commerce, /https:\/\/wa\.me\//);
  assert.match(commerce, /BTMConsent\.open\(true\)/);
});

test("interim privacy page is excluded from indexing", () => {
  const privacy = read("privacy/index.html");
  assert.match(privacy, /name="robots" content="noindex,follow"/);
});

test("shared UI is injected into built public HTML pages", () => {
  const build = read("scripts/build.js");
  assert.match(build, /assets\/consent\.css/);
  assert.match(build, /assets\/consent\.js/);
  assert.match(build, /assets\/commerce\.js/);
  assert.match(build, /data-footer-trust/);
  assert.doesNotMatch(build, /"docs",/);
});
