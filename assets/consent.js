(() => {
  "use strict";
  const VERSION = 1;
  const KEY = "btm-consent-v1";
  const locale = ((location.pathname.match(/^\/(en|de|fr|ru|zh)(?:\/|$)/) || [])[1]) || "tr";
  const copy = {
    tr:{title:"Gizlilik tercihlerin",body:"Zorunlu teknolojiler siteyi çalıştırmak için kullanılır. Analitik yalnızca izin verirsen etkinleşir.",necessary:"Zorunlu",necessaryDesc:"Güvenlik ve temel site işlevleri.",analytics:"Analitik",analyticsDesc:"Google Analytics ile site kullanımını ölçme.",marketing:"Pazarlama",marketingDesc:"Reklam ve pazarlama ölçümü. Şu anda etkin değil.",accept:"Tümünü kabul et",reject:"Tümünü reddet",save:"Seçimlerimi kaydet",manage:"Tercihleri yönet",settings:"Çerez tercihleri",close:"Kapat",always:"Her zaman aktif",note:"Tercihini daha sonra sayfanın altından değiştirebilirsin."},
    en:{eyebrow:"BTMCODE · PRIVACY",title:"Your privacy choices",body:"Necessary technologies keep the site working. Analytics is enabled only if you choose it.",necessary:"Necessary",necessaryDesc:"Security and essential site functions.",analytics:"Analytics",analyticsDesc:"Measure site usage with Google Analytics.",marketing:"Marketing",marketingDesc:"Advertising and marketing measurement. Currently inactive.",accept:"Accept all",reject:"Reject optional",save:"Save my choices",manage:"Manage preferences",settings:"Cookie preferences",close:"Close",always:"Always active",note:"You can change your choice later from the footer."},
    de:{eyebrow:"BTMCODE · DATENSCHUTZ",title:"Ihre Datenschutzeinstellungen",body:"Notwendige Technologien gewährleisten den Betrieb. Analyse wird nur nach Ihrer Zustimmung aktiviert.",necessary:"Notwendig",necessaryDesc:"Sicherheit und grundlegende Website-Funktionen.",analytics:"Analyse",analyticsDesc:"Nutzung der Website mit Google Analytics messen.",marketing:"Marketing",marketingDesc:"Werbe- und Marketingmessung. Derzeit inaktiv.",accept:"Alle akzeptieren",reject:"Optionale ablehnen",save:"Auswahl speichern",manage:"Einstellungen verwalten",settings:"Cookie-Einstellungen",close:"Schließen",always:"Immer aktiv",note:"Sie können Ihre Auswahl später im Footer ändern."},
    fr:{eyebrow:"BTMCODE · CONFIDENTIALITÉ",title:"Vos choix de confidentialité",body:"Les technologies nécessaires assurent le fonctionnement du site. Les statistiques ne sont activées qu'avec votre accord.",necessary:"Nécessaires",necessaryDesc:"Sécurité et fonctions essentielles du site.",analytics:"Statistiques",analyticsDesc:"Mesure de l'utilisation du site avec Google Analytics.",marketing:"Marketing",marketingDesc:"Mesure publicitaire et marketing. Actuellement inactive.",accept:"Tout accepter",reject:"Tout refuser",save:"Enregistrer mes choix",manage:"Gérer les préférences",settings:"Préférences cookies",close:"Fermer",always:"Toujours actif",note:"Vous pouvez modifier votre choix depuis le pied de page."},
    ru:{eyebrow:"BTMCODE · КОНФИДЕНЦИАЛЬНОСТЬ",title:"Настройки конфиденциальности",body:"Необходимые технологии обеспечивают работу сайта. Аналитика включается только с вашего согласия.",necessary:"Необходимые",necessaryDesc:"Безопасность и основные функции сайта.",analytics:"Аналитика",analyticsDesc:"Измерение использования сайта с Google Analytics.",marketing:"Маркетинг",marketingDesc:"Рекламные и маркетинговые измерения. Сейчас неактивно.",accept:"Принять всё",reject:"Отклонить необязательные",save:"Сохранить выбор",manage:"Настроить",settings:"Настройки cookies",close:"Закрыть",always:"Всегда активно",note:"Вы можете изменить выбор в нижней части сайта."},
    zh:{eyebrow:"BTMCODE · 隐私",title:"隐私偏好设置",body:"必要技术用于保障网站正常运行。只有在您明确同意后，才会启用分析功能。",necessary:"必要项目",necessaryDesc:"保障安全和网站基本功能。",analytics:"分析",analyticsDesc:"使用 Google Analytics 衡量网站使用情况。",marketing:"营销",marketingDesc:"广告与营销效果衡量。目前未启用。",accept:"全部接受",reject:"拒绝非必要项目",save:"保存我的选择",manage:"管理偏好设置",settings:"Cookie 偏好设置",close:"关闭",always:"始终启用",note:"您可以稍后通过网站页脚更改此选择。"}
  };
  const t = copy[locale] || copy.en;
  const config = window.BTM_CONFIG || {};
  const measurementId = typeof config.gaMeasurementId === "string" && /^G-[A-Z0-9]+$/.test(config.gaMeasurementId) ? config.gaMeasurementId : "";
  let current = null;
  let panel;
  let expanded = false;

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "null");
      if (value && value.version === VERSION && typeof value.analytics === "boolean" && typeof value.marketing === "boolean") return value;
    } catch (_) {}
    return null;
  }
  function save(analytics, marketing) {
    current = {version:VERSION,necessary:true,analytics:!!analytics,marketing:!!marketing,updatedAt:new Date().toISOString()};
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (_) {}
    expanded = false;
    apply();
    render();
  }
  function loadAnalytics() {
    if (!measurementId || !current || !current.analytics || window.__btmGaLoaded) return;
    window.__btmGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    window.gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",functionality_storage:"denied",personalization_storage:"denied",security_storage:"granted"});
    window.gtag("consent","update",{analytics_storage:"granted"});
    window.gtag("js",new Date());
    window.gtag("config",measurementId,{anonymize_ip:true,send_page_view:true});
    const script=document.createElement("script");
    script.async=true;
    script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(measurementId);
    script.referrerPolicy="strict-origin-when-cross-origin";
    document.head.appendChild(script);
  }
  function stopAnalytics() {
    if (window.gtag) window.gtag("consent","update",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
    document.cookie.split(";").forEach(item=>{
      const name=item.split("=")[0].trim();
      if (name==="_ga" || name.startsWith("_ga_")) {
        document.cookie=name+"=; Max-Age=0; path=/; SameSite=Lax";
        const host=location.hostname;
        if(host.includes(".")) document.cookie=name+"=; Max-Age=0; path=/; domain=."+host.split(".").slice(-2).join(".")+"; SameSite=Lax";
      }
    });
  }
  function apply() {
    if (current && current.analytics) loadAnalytics();
    else stopAnalytics();
  }
  function ensurePanel() {
    if (panel) return panel;
    panel=document.createElement("section");
    panel.className="btm-consent";
    panel.setAttribute("role","dialog");
    panel.setAttribute("aria-modal","false");
    panel.setAttribute("aria-labelledby","btm-consent-title");
    panel.hidden=true;
    panel.innerHTML='<div class="btm-consent__card"><div class="btm-consent__eyebrow">BTMCODE · PRIVACY</div><h2 id="btm-consent-title"></h2><p class="btm-consent__body"></p><div class="btm-consent__options"><div class="btm-consent__option"><div><strong data-label="necessary"></strong><small data-desc="necessaryDesc"></small></div><span class="btm-consent__locked" data-label="always"></span></div><label class="btm-consent__option"><span><strong data-label="analytics"></strong><small data-desc="analyticsDesc"></small></span><input type="checkbox" data-consent-analytics></label><label class="btm-consent__option"><span><strong data-label="marketing"></strong><small data-desc="marketingDesc"></small></span><input type="checkbox" data-consent-marketing></label></div><p class="btm-consent__note"></p><div class="btm-consent__actions"><button type="button" data-consent-reject></button><button type="button" data-consent-save></button><button type="button" data-consent-accept></button></div></div>';
    document.body.appendChild(panel);
    panel.querySelector(".btm-consent__eyebrow").textContent=t.eyebrow;\n    panel.querySelector("h2").textContent=t.title;
    panel.querySelector(".btm-consent__body").textContent=t.body;
    panel.querySelector(".btm-consent__note").textContent=t.note;
    panel.querySelectorAll("[data-label]").forEach(el=>el.textContent=t[el.dataset.label]);
    panel.querySelectorAll("[data-desc]").forEach(el=>el.textContent=t[el.dataset.desc]);
    panel.querySelector("[data-consent-reject]").textContent=t.reject;
    panel.querySelector("[data-consent-save]").textContent=t.save;
    panel.querySelector("[data-consent-accept]").textContent=t.accept;
    panel.querySelector("[data-consent-reject]").addEventListener("click",()=>save(false,false));
    panel.querySelector("[data-consent-accept]").addEventListener("click",()=>save(true,true));
    panel.querySelector("[data-consent-save]").addEventListener("click",()=>{
      save(panel.querySelector("[data-consent-analytics]").checked,panel.querySelector("[data-consent-marketing]").checked);
    });
    return panel;
  }
  function render() {
    ensurePanel();
    const analytics=panel.querySelector("[data-consent-analytics]");
    const marketing=panel.querySelector("[data-consent-marketing]");
    analytics.checked=!!(current&&current.analytics);
    marketing.checked=!!(current&&current.marketing);
    panel.hidden=!expanded;
    document.querySelectorAll("[data-consent-open]").forEach(button=>button.textContent=t.settings);
  }
  function open(shouldFocus) { expanded=true; render(); if(shouldFocus) { const first=panel.querySelector("[data-consent-analytics]"); if(first) first.focus(); } }
  document.addEventListener("DOMContentLoaded",()=>{
    current=read();
    ensurePanel();
    document.querySelectorAll("[data-consent-open]").forEach(button=>button.addEventListener("click",open));
    if(!current) open(false); else apply();
    render();
  });
  window.BTMConsent={open,getPreferences:()=>current?{...current}:null};
})();