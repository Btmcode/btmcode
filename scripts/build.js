const fs = require("node:fs/promises");
const path = require("node:path");

const root = process.cwd();
const output = path.join(root, "public");
const publicEntries = [
  "index.html",
  "about",
  "admin",
  "assets",
  "contact",
  "favicon.svg",
  "journal",
  "llms.txt",
  "manifest.webmanifest",
  "privacy",
  "projects",
  "robots.txt",
  "services",
  "sitemap.xml"
];


  // Inject shared privacy and trust UI into every public HTML page.
  async function injectSharedUi(dir) {
    for (const entry of await fs.readdir(dir, {withFileTypes:true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["admin","api"].includes(entry.name)) continue;
        await injectSharedUi(full);
      } else if (entry.isFile() && entry.name === "index.html") {
        let html = await fs.readFile(full, "utf8");
        if (!html.includes("/assets/consent.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/assets/consent.css"></head>');
        if (!html.includes("/assets/consent.js")) html = html.replace("</head>", '<script defer src="/assets/consent.js"></script></head>');
        if (!html.includes("/assets/commerce.js")) html = html.replace("</head>", '<script defer src="/assets/commerce.js"></script></head>');
        if (!html.includes("/assets/locale-redirect.js")) html = html.replace("</head>", '<script src="/assets/locale-redirect.js"></script></head>');
        const languageSelect = html.match(/(<select\b[^>]*data-language-select[^>]*>)([\s\S]*?)(<\/select>)/i);
        if (languageSelect && !/value=["']zh["']/.test(languageSelect[2])) {
          html = html.replace(languageSelect[0], languageSelect[1] + languageSelect[2] + '<option value="zh">中文</option>' + languageSelect[3]);
        }
        if (html.includes('<div class="footer-bottom">') && !html.includes('data-footer-trust')) {
          html = html.replace('<div class="footer-bottom">', '<div class="footer-trust" data-footer-trust></div><div class="footer-bottom">');
        }
        await fs.writeFile(full, html, "utf8");
      }
    }
  }

async function main() {
  await fs.rm(output, {recursive:true, force:true});
  await fs.mkdir(output, {recursive:true});

  for (const entry of publicEntries) {
    const source = path.join(root, entry);
    try {
      await fs.access(source);
    } catch {
      throw new Error("Required public entry is missing: " + entry);
    }
    await fs.cp(source, path.join(output, entry), {
      recursive:true,
      force:true,
      errorOnExist:false,
      preserveTimestamps:true
    });
  }

  const required = [
    "index.html",
    "assets/site.css",
    "assets/site.js",
    "assets/i18n.js",
    "contact/index.html",
    "admin/index.html",
    "robots.txt",
    "sitemap.xml"
  ];
  for (const relative of required) {
    await fs.access(path.join(output, relative));
  }

  await injectSharedUi(output);
  console.log("Static site built into public/ (" + publicEntries.length + " source entries).");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
