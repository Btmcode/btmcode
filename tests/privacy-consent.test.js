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


test("Simplified Chinese locale is used by shared footer and consent UI", () => {
  const consent = read("assets/consent.js");
  const commerce = read("assets/commerce.js");
  assert.match(consent, /\(en\|de\|fr\|ru\|zh\)/);
  assert.match(consent, /zh:\{eyebrow:"BTMCODE · 隐私",title:"隐私偏好设置"/);
  assert.match(commerce, /\(en\|de\|fr\|ru\|zh\)/);
  assert.match(commerce, /zh:\{whatsapp:/);
  assert.match(commerce, /常驻土耳其的独立软件开发者/);
  assert.match(commerce, /locale==="ru"\?"Конфиденциальность":locale==="zh"\?"隐私":"Privacy"/);
});

test("Chinese runtime contact messages never resolve to undefined", () => {
  const i18n = read("assets/i18n.js");
  assert.match(i18n, /zh:"您的消息将通过 Resend 邮件服务安全发送。"/);
  assert.match(i18n, /zh:"BTMCode 不会将表单数据存储在数据库中。"/);
});

test("cookie privacy eyebrow and dynamic service labels are localized", () => {
  const consent = read("assets/consent.js");
  const commerce = read("assets/commerce.js");
  assert.match(consent, /zh:\{eyebrow:"BTMCODE · 隐私"/);
  assert.match(consent, /btm-consent__eyebrow/);
  assert.match(commerce, /retainerKicker:"月度合作",monthly:"每月"/);
  assert.match(commerce, /zh:"您好，我想与 BTMCode 讨论一个软件项目。"/);
});
