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

  console.log("Static site built into public/ (" + publicEntries.length + " source entries).");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
