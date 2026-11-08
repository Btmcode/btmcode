(() => {
  "use strict";

  const supported = new Set(["tr", "en", "de", "fr", "ru", "zh"]);

  // An explicit language URL always wins over automatic detection.
  if (/^\/(en|de|fr|ru|zh)(?:\/|$)/i.test(window.location.pathname)) return;

  // A language selected manually is remembered and takes priority on later visits.
  let preferred = null;
  try {
    const saved = window.localStorage.getItem("btm-locale-preference");
    if (saved && supported.has(saved)) preferred = saved;
  } catch (error) {}

  // Otherwise, use the first supported language in the browser's preference list.
  if (!preferred) {
    const languages = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en"];

    for (const language of languages) {
      const base = String(language || "").toLowerCase().split("-")[0];
      if (base === "zh") {
        preferred = "zh";
        break;
      }
      if (supported.has(base)) {
        preferred = base;
        break;
      }
    }
  }

  // English is the international fallback for browser languages not yet supported.
  if (!preferred) preferred = "en";
  if (preferred === "tr") return;

  const path = window.location.pathname || "/";
  const target = "/" + preferred + (path === "/" ? "/" : path);
  window.location.replace(target + window.location.search + window.location.hash);
})();