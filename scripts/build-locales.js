const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const PUBLIC = path.join(process.cwd(), "public");
const SOURCE = await fs.readFile(path.join(PUBLIC, "assets/i18n.js"), "utf8");
const LOCALES = ["en","de","fr","ru"];
const LOCALE_TAGS = {en:"en_US",de:"de_DE",fr:"fr_FR",ru:"ru_RU"};

function extractObject(name) {
  const start = SOURCE.indexOf("const " + name + " =");
  if (start < 0) throw new Error("Missing object declaration: " + name);
  const open = SOURCE.indexOf("{", start);
  let depth = 0, quote = "", escaped = false, lineComment = false, blockComment = false;
  for (let i = open; i < SOURCE.length; i++) {
    const ch = SOURCE[i], next = SOURCE[i+1];
    if (lineComment) { if (ch === "\n") lineComment = false; continue; }
    if (blockComment) { if (ch === "*" && next === "/") { blockComment = false; i++; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === "/" && next === "/") { lineComment = true; i++; continue; }
    if (ch === "/" && next === "*") { blockComment = true; i++; continue; }
    if (ch === "'" || ch === '"') { quote = ch; continue; }
    if (ch === "{") depth++;
    if (ch === "}" && --depth === 0) {
      return vm.runInNewContext("(" + SOURCE.slice(open, i+1) + ")", Object.create(null), {timeout:1000});
    }
  }
  throw new Error("Unclosed object literal: " + name);
}
const dictionaries = extractObject("dictionaries");
const meta = extractObject("meta");
const descriptions = extractObject("descriptions");
const caseTitles = extractObject("caseTitles");
const caseDescriptions = extractObject("caseDescriptions");
const privacyTranslations = extractObject("privacyTranslations");
for (const locale of LOCALES) {
  Object.assign(meta[locale] || {}, caseTitles[locale] || {});
  Object.assign(descriptions[locale] || {}, caseDescriptions[locale] || {});
  Object.assign(dictionaries[locale] || {}, privacyTranslations[locale] || {});
}
const ui = {
  en:{open:"Open menu",light:"Switch to light theme",nav:"Main navigation"},
  de:{open:"Menü öffnen",light:"Helles Design aktivieren",nav:"Hauptnavigation"},
  fr:{open:"Ouvrir le menu",light:"Activer le thème clair",nav:"Navigation principale"},
  ru:{open:"Открыть меню",light:"Включить светлую тему",nav:"Основная навигация"}
};
const extra = {
  en:{"Mesajınız Resend üzerinden güvenli e-posta kanalıyla iletilir.":"Your message is delivered securely by email through Resend.","Form verileri BTMCode tarafından bir veritabanında saklanmaz.":"BTMCode does not store form submissions in a database."},
  de:{"Mesajınız Resend üzerinden güvenli e-posta kanalıyla iletilir.":"Ihre Nachricht wird sicher per E-Mail über Resend zugestellt.","Form verileri BTMCode tarafından bir veritabanında saklanmaz.":"BTMCode speichert Formulareingaben nicht in einer Datenbank."},
  fr:{"Mesajınız Resend üzerinden güvenli e-posta kanalıyla iletilir.":"Votre message est transmis de manière sécurisée par e-mail via Resend.","Form verileri BTMCode tarafından bir veritabanında saklanmaz.":"BTMCode ne stocke pas les formulaires dans une base de données."},
  ru:{"Mesajınız Resend üzerinden güvenli e-posta kanalıyla iletilir.":"Ваше сообщение безопасно отправляется по электронной почте через Resend.","Form verileri BTMCode tarafından bir veritabanında saklanmaz.":"BTMCode не сохраняет данные формы в базе данных."}
};
for (const locale of LOCALES) Object.assign(dictionaries[locale], extra[locale], {"Ana menü":ui[locale].nav});

function escapeHtml(value) {
  return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function translateText(html, dict) {
  return html.replace(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)|>([^<>]+)</gi, (all, protectedPart, text) => {
    if (protectedPart || text === undefined) return all;
    const key = text.trim();
    if (!key || !Object.prototype.hasOwnProperty.call(dict,key)) return all;
    const offset = text.indexOf(key);
    return ">" + text.slice(0,offset) + dict[key] + text.slice(offset+key.length) + "<";
  });
}
function setMeta(html, selector, value) {
  return html.replace(selector, tag => {
    if (/\bcontent=(["']).*?\1/i.test(tag)) return tag.replace(/\bcontent=(["']).*?\1/i, "content=\"" + escapeHtml(value) + "\"");
    return tag.replace(/>$/, " content=\"" + escapeHtml(value) + "\">");
  });
}
function routeOf(file) {
  const dir = path.dirname(file);
  return dir === "." ? "/" : "/" + dir.replace(/\\/g,"/") + "/";
}
function localizedPath(locale, route) {
  return "/" + locale + (route === "/" ? "/" : route);
}
function localizeLinks(html, locale) {
  return html.replace(/\bhref=(["'])(\/[^"']*)\1/gi, (all,q,href) => {
    if (href.startsWith("//") || /^\/(assets|api|favicon|manifest|robots|sitemap|admin)(\/|$)/.test(href)) return all;
    if (/^\/(en|de|fr|ru)(\/|$)/.test(href)) return all;
    return "href=" + q + localizedPath(locale,href) + q;
  });
}
function addAlternates(html, route) {
  const codes = ["tr","en","de","fr","ru"];
  const links = codes.map(code => {
    const url = "https://btmcode.vercel.app" + (code === "tr" ? route : localizedPath(code,route));
    return '<link rel="alternate" hreflang="' + code + '" href="' + url + '">';
  });
  links.push('<link rel="alternate" hreflang="x-default" href="https://btmcode.vercel.app' + route + '">');
  html = html.replace(/<link\b[^>]*rel=["']alternate["'][^>]*>/gi,"");
  return html.replace("</head>",links.join("")+"</head>");
}
function localizeHtml(source,locale,route) {
  let html = translateText(source,dictionaries[locale] || {});
  const title = (meta[locale] && meta[locale][route]) || ("BTMCode | " + locale.toUpperCase());
  const description = descriptions[locale] && descriptions[locale][route];
  html = html.replace(/<html\b([^>]*)\blang=["'][^"']*["']/i,'<html$1lang="' + locale + '"');
  html = html.replace(/<title>[\s\S]*?<\/title>/i,"<title>" + escapeHtml(title) + "</title>");
  if (description) {
    html = setMeta(html,/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i,description);
    html = setMeta(html,/<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/i,description);
  }
  html = setMeta(html,/<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/i,title);
  html = setMeta(html,/<meta\b(?=[^>]*\bproperty=["']og:locale["'])[^>]*>/i,LOCALE_TAGS[locale]);
  const canonical = "https://btmcode.vercel.app" + localizedPath(locale,route);
  html = html.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i,'<link rel="canonical" href="' + canonical + '">');
  html = setMeta(html,/<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/i,canonical);
  html = html.replace(/aria-label=["']Açık temaya geç["']/g,'aria-label="' + ui[locale].light + '"');
  html = html.replace(/aria-label=["']Menüyü aç["']/g,'aria-label="' + ui[locale].open + '"');
  html = html.replace(/<nav\b([^>]*)aria-label=["']Ana menü["']/i,'<nav$1aria-label="' + ui[locale].nav + '"');
  return addAlternates(localizeLinks(html,locale),route);
}
async function htmlFiles(dir,relative="") {
  const result = [];
  for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
    const rel = path.posix.join(relative,entry.name);
    if (entry.isDirectory()) {
      if (["admin","api","en","de","fr","ru"].includes(entry.name)) continue;
      result.push(...await htmlFiles(path.join(dir,entry.name),rel));
    } else if (entry.isFile() && entry.name === "index.html") result.push(rel);
  }
  return result;
}
async function main() {
  const pages = await htmlFiles(PUBLIC);
  if (!pages.includes("index.html") || !pages.includes("contact/index.html")) throw new Error("Required source pages missing.");
  let count = 0;
  for (const locale of LOCALES) {
    for (const file of pages) {
      const route = routeOf(file);
      const source = await fs.readFile(path.join(PUBLIC,file),"utf8");
      const destination = path.join(PUBLIC,locale,file);
      await fs.mkdir(path.dirname(destination),{recursive:true});
      await fs.writeFile(destination,localizeHtml(source,locale,route),"utf8");
      count++;
    }
  }
  for (const locale of LOCALES) {
    await fs.access(path.join(PUBLIC,locale,"index.html"));
    await fs.access(path.join(PUBLIC,locale,"contact","index.html"));
    await fs.access(path.join(PUBLIC,locale,"projects","index.html"));
  }
  console.log("Generated " + count + " localized HTML pages for " + LOCALES.length + " locales.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
