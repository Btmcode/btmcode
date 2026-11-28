const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const PUBLIC = path.join(process.cwd(), "public");
const SOURCE = require("node:fs").readFileSync(path.join(PUBLIC, "assets/i18n.js"), "utf8");
const LOCALES = ["en","de","fr","ru","zh","sv"];
const LOCALE_TAGS = {en:"en_US",de:"de_DE",fr:"fr_FR",ru:"ru_RU",zh:"zh_CN",sv:"sv_SE"};

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
const sharedUiTranslations = extractObject("sharedUiTranslations");
for (const locale of LOCALES) Object.assign(dictionaries[locale], sharedUiTranslations[locale] || {});
const meta = extractObject("meta");
const descriptions = extractObject("descriptions");
const caseTitles = extractObject("caseTitles");
const caseDescriptions = extractObject("caseDescriptions");
const sevgiCaseTranslations = extractObject("sevgiCaseTranslations");
const sevgiCaseTitles = extractObject("sevgiCaseTitles");
const sevgiCaseDescriptions = extractObject("sevgiCaseDescriptions");
for (const locale of LOCALES) {
  Object.assign(dictionaries[locale] || {}, sevgiCaseTranslations[locale] || {});
  Object.assign(meta[locale] || {}, sevgiCaseTitles[locale] || {});
  Object.assign(descriptions[locale] || {}, sevgiCaseDescriptions[locale] || {});
}
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
,
  zh: {
    "open": "打开菜单",
    "light": "切换浅色主题",
    "nav": "主导航"
  },
sv:{open:"Öppna menyn",light:"Byt till ljust tema",nav:"Huvudmeny"}
};
const extra = {
  en:{"Mesajınız Google Gmail üzerinden güvenli e-posta kanalıyla iletilir.":"Your message is delivered securely by email through Google Gmail.","Form verileri BTMCode tarafından bir veritabanında saklanmaz.":"BTMCode does not store form submissions in a database.",
    "Bu sayfa, BTMCode'un veri işleme yaklaşımına ilişkin geçici bilgilendirmedir; nihai KVKK aydınlatma metni değildir. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Google Gmail e-posta altyapısı üzerinden iletilir. Google Analytics bu sürümde bir Measurement ID tanımlanmadıkça yüklenmez; yapılandırıldığında yalnızca analitik tercihi açıkça kabul edilirse etkinleşir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz; e-posta sağlayıcısındaki saklama ve yurt dışı aktarım koşulları ayrıca doğrulanmalıdır.":"This page is an interim notice about BTMCode's data practices and is not the final KVKK information notice. Contact form details are sent through Google Gmail email infrastructure so the enquiry can be answered. Google Analytics is not loaded unless a Measurement ID is configured; once configured, it activates only if analytics is explicitly accepted. BTMCode does not store form submissions in a website database; the email provider's retention and international transfer conditions must be verified separately."},
  de:{"Mesajınız Google Gmail üzerinden güvenli e-posta kanalıyla iletilir.":"Ihre Nachricht wird sicher per E-Mail über Google Gmail zugestellt.","Form verileri BTMCode tarafından bir veritabanında saklanmaz.":"BTMCode speichert Formulareingaben nicht in einer Datenbank.",
    "Bu sayfa, BTMCode'un veri işleme yaklaşımına ilişkin geçici bilgilendirmedir; nihai KVKK aydınlatma metni değildir. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Google Gmail e-posta altyapısı üzerinden iletilir. Google Analytics bu sürümde bir Measurement ID tanımlanmadıkça yüklenmez; yapılandırıldığında yalnızca analitik tercihi açıkça kabul edilirse etkinleşir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz; e-posta sağlayıcısındaki saklama ve yurt dışı aktarım koşulları ayrıca doğrulanmalıdır.":"Diese Seite ist ein vorläufiger Hinweis zu den Datenverarbeitungspraktiken von BTMCode und keine endgültige KVKK-Informationsmitteilung. Angaben aus dem Kontaktformular werden über die E-Mail-Infrastruktur von Google Gmail übermittelt, damit die Anfrage beantwortet werden kann. Google Analytics wird nur geladen, wenn eine Measurement-ID konfiguriert ist, und erst nach ausdrücklicher Zustimmung zur Analyse aktiviert. BTMCode speichert Formulareingaben nicht in einer Website-Datenbank; Aufbewahrungs- und Drittlandtransferbedingungen des E-Mail-Anbieters müssen gesondert geprüft werden."},
  fr:{"Mesajınız Google Gmail üzerinden güvenli e-posta kanalıyla iletilir.":"Votre message est transmis de manière sécurisée par e-mail via Google Gmail.","Form verileri BTMCode tarafından bir veritabanında saklanmaz.":"BTMCode ne stocke pas les formulaires dans une base de données.",
    "Bu sayfa, BTMCode'un veri işleme yaklaşımına ilişkin geçici bilgilendirmedir; nihai KVKK aydınlatma metni değildir. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Google Gmail e-posta altyapısı üzerinden iletilir. Google Analytics bu sürümde bir Measurement ID tanımlanmadıkça yüklenmez; yapılandırıldığında yalnızca analitik tercihi açıkça kabul edilirse etkinleşir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz; e-posta sağlayıcısındaki saklama ve yurt dışı aktarım koşulları ayrıca doğrulanmalıdır.":"Cette page est une information provisoire sur les pratiques de traitement des données de BTMCode et ne constitue pas la notice d'information KVKK définitive. Les données du formulaire de contact sont transmises via l'infrastructure e-mail Google Gmail afin de répondre à la demande. Google Analytics n'est chargé que si un identifiant Measurement est configuré et ne s'active qu'après acceptation explicite des statistiques. BTMCode ne stocke pas les formulaires dans une base de données du site ; les conditions de conservation et de transfert international du fournisseur de messagerie doivent être vérifiées séparément."},
  ru:{"Mesajınız Google Gmail üzerinden güvenli e-posta kanalıyla iletilir.":"Ваше сообщение безопасно отправляется по электронной почте через Google Gmail.","Form verileri BTMCode tarafından bir veritabanında saklanmaz.":"BTMCode не сохраняет данные формы в базе данных.",
    "Bu sayfa, BTMCode'un veri işleme yaklaşımına ilişkin geçici bilgilendirmedir; nihai KVKK aydınlatma metni değildir. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Google Gmail e-posta altyapısı üzerinden iletilir. Google Analytics bu sürümde bir Measurement ID tanımlanmadıkça yüklenmez; yapılandırıldığında yalnızca analitik tercihi açıkça kabul edilirse etkinleşir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz; e-posta sağlayıcısındaki saklama ve yurt dışı aktarım koşulları ayrıca doğrulanmalıdır.":"Эта страница является предварительным уведомлением о практиках обработки данных BTMCode и не заменяет окончательное уведомление KVKK. Данные контактной формы передаются через почтовую инфраструктуру Google Gmail для ответа на запрос. Google Analytics не загружается без настроенного Measurement ID и активируется только после явного согласия на аналитику. BTMCode не хранит отправленные формы в базе данных сайта; сроки хранения и условия международной передачи данных почтовым провайдером должны быть проверены отдельно."}
,
  zh: {
    "Mesajınız Google Gmail üzerinden güvenli e-posta kanalıyla iletilir.": "您的消息将通过 Google Gmail 邮件服务安全发送。",
    "Form verileri BTMCode tarafından bir veritabanında saklanmaz.": "BTMCode 不会将表单数据存储在数据库中。",
    "Bu sayfa, BTMCode'un veri işleme yaklaşımına ilişkin geçici bilgilendirmedir; nihai KVKK aydınlatma metni değildir. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Google Gmail e-posta altyapısı üzerinden iletilir. Google Analytics bu sürümde bir Measurement ID tanımlanmadıkça yüklenmez; yapılandırıldığında yalnızca analitik tercihi açıkça kabul edilirse etkinleşir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz; e-posta sağlayıcısındaki saklama ve yurt dışı aktarım koşulları ayrıca doğrulanmalıdır.": "本页面是 BTMCode 数据处理方式的临时说明，并非最终 KVKK 隐私告知文本。联系表单信息通过 Google Gmail 邮件服务传递，以便回复您的咨询。除非配置 Measurement ID，网站不会加载 Google Analytics；配置后也仅在用户明确同意统计分析时启用。BTMCode 不会在网站数据库中保存表单数据；邮件服务商的数据保留和跨境传输条件仍需另行核实。"
  }};

for (const locale of LOCALES) Object.assign(dictionaries[locale], extra[locale], {"Ana menü":ui[locale].nav});
const projectCoverNames = ["ImageHub / imghost","Zirve Elektrik","AQUATERRA Atelier","Demos Pizza","Aya Elektrik","Bayraktar","SEVGİ MAKEUP ARTIST","LumiKids","Paşa Motor"];
const projectCoverAltSuffix = {en:"desktop website screenshot",de:"Desktop-Screenshot der Website",fr:"capture d’écran du site web",ru:"скриншот веб-сайта",zh:"网站桌面截图",sv:"skärmbild av webbplatsen"};
for (const locale of LOCALES) {
  const suffix = projectCoverAltSuffix[locale] || projectCoverAltSuffix.en;
  for (const name of projectCoverNames) dictionaries[locale][name + " web sitesinin masaüstü ekran görüntüsü"] = name + " — " + suffix;
}
const paSaMotorTranslations = {
  en:{
    "İstanbul Fatih'te TVS, Falcon, Işıldar ve Moto Lux markalarında yetkili satış ve servis; orijinal yedek parça ve bakım hizmetleri sunan motosiklet bayisi.":"An authorized motorcycle sales and service dealer in Fatih, Istanbul, offering TVS, Falcon, Işıldar and Moto Lux motorcycles, original spare parts and maintenance.",
    "Yetkili satış":"Authorized sales","Motor servisi":"Motorcycle service","Orijinal yedek parça":"Original spare parts","Canlı siteyi ziyaret et ↗":"Visit live website ↗","Canlı referans":"Live website"
  },
  de:{
    "İstanbul Fatih'te TVS, Falcon, Işıldar ve Moto Lux markalarında yetkili satış ve servis; orijinal yedek parça ve bakım hizmetleri sunan motosiklet bayisi.":"Autorisierter Motorrad-Verkaufs- und Servicehändler in Fatih, Istanbul, für TVS, Falcon, Işıldar und Moto Lux mit Originalersatzteilen und Wartung.",
    "Yetkili satış":"Autorisierter Verkauf","Motor servisi":"Motorradservice","Orijinal yedek parça":"Originalersatzteile","Canlı siteyi ziyaret et ↗":"Live-Website besuchen ↗","Canlı referans":"Live-Website"
  },
  fr:{
    "İstanbul Fatih'te TVS, Falcon, Işıldar ve Moto Lux markalarında yetkili satış ve servis; orijinal yedek parça ve bakım hizmetleri sunan motosiklet bayisi.":"Concessionnaire agréé de vente et d’entretien de motos à Fatih, Istanbul, pour TVS, Falcon, Işıldar et Moto Lux, avec pièces d’origine et maintenance.",
    "Yetkili satış":"Vente agréée","Motor servisi":"Service moto","Orijinal yedek parça":"Pièces d’origine","Canlı siteyi ziyaret et ↗":"Visiter le site ↗","Canlı referans":"Site en ligne"
  },
  ru:{
    "İstanbul Fatih'te TVS, Falcon, Işıldar ve Moto Lux markalarında yetkili satış ve servis; orijinal yedek parça ve bakım hizmetleri sunan motosiklet bayisi.":"Официальный дилер по продаже и обслуживанию мотоциклов в районе Фатих, Стамбул: TVS, Falcon, Işıldar и Moto Lux, оригинальные запчасти и техобслуживание.",
    "Yetkili satış":"Официальные продажи","Motor servisi":"Мотосервис","Orijinal yedek parça":"Оригинальные запчасти","Canlı siteyi ziyaret et ↗":"Открыть сайт ↗","Canlı referans":"Рабочий сайт"
  },
  zh:{
    "İstanbul Fatih'te TVS, Falcon, Işıldar ve Moto Lux markalarında yetkili satış ve servis; orijinal yedek parça ve bakım hizmetleri sunan motosiklet bayisi.":"位于伊斯坦布尔法提赫的授权摩托车销售与维修经销商，提供 TVS、Falcon、Işıldar 和 Moto Lux 品牌、原厂配件及保养服务。",
    "Yetkili satış":"授权销售","Motor servisi":"摩托车维修","Orijinal yedek parça":"原厂配件","Canlı siteyi ziyaret et ↗":"访问网站 ↗","Canlı referans":"线上网站"
  },
  sv:{
    "İstanbul Fatih'te TVS, Falcon, Işıldar ve Moto Lux markalarında yetkili satış ve servis; orijinal yedek parça ve bakım hizmetleri sunan motosiklet bayisi.":"Auktoriserad motorcykelförsäljning och service i Fatih, Istanbul, med TVS, Falcon, Işıldar och Moto Lux samt originalreservdelar och underhåll.",
    "Yetkili satış":"Auktoriserad försäljning","Motor servisi":"Motorcykelservice","Orijinal yedek parça":"Originalreservdelar","Canlı siteyi ziyaret et ↗":"Besök webbplatsen ↗","Canlı referans":"Aktiv webbplats"
  }
};
for (const locale of LOCALES) Object.assign(dictionaries[locale], paSaMotorTranslations[locale] || {});


const moreTranslations = {
  en: {
    "Ben Ahmet. Yazılım geliştirme, yapay zekâ ve iş geliştirme kesişiminde dijital ürünler ve iş süreçleri tasarlıyorum.":"I’m Ahmet. I design digital products and business workflows at the intersection of software engineering, AI and business development.",
    "Vaka analizini gör ↗":"View case study ↗",
    "Tüm seçilmiş projeler ↗":"All selected projects ↗",
    "Özel Web Uygulamaları":"Custom Web Applications",
    "Kurumsal web deneyimleri, müşteri portalları, yönetim panelleri ve operasyon araçları.":"Corporate web experiences, customer portals, admin dashboards and operational tools.",
    "Abonelik tabanlı ürünler, çok rollü paneller, veri odaklı araçlar ve API-first sistemler.":"Subscription products, multi-role dashboards, data-driven tools and API-first systems.",
    "Yapay zekâ ajanları, içerik üretim sistemleri ve tekrarlayan operasyonların otomasyonu.":"AI agents, content generation systems and automation of repetitive operations.",
    "Performans ve Güvenli Geliştirme":"Performance & Secure Engineering",
    "Keşif":"Discovery",
    "İhtiyacı, kullanıcıyı, iş hedefini ve mevcut teknik durumu anlamak.":"Understand the need, users, business goals and current technical landscape.",
    "Mimari & Tasarım":"Architecture & Design",
    "Kapsamı, kullanıcı akışlarını, veri modelini ve teknik yaklaşımı belirlemek.":"Define scope, user journeys, data models and the technical approach.",
    "Geliştirme":"Development",
    "Modüler kod, kontrollü entegrasyonlar ve gerçek testlerle ilerlemek.":"Build with modular code, controlled integrations and meaningful tests.",
    "Yayın & İyileştirme":"Launch & Improvement",
    "Dağıtım, gözlemleme, geri bildirim ve sürdürülebilir geliştirme.":"Deployment, monitoring, feedback and sustainable iteration.",
    "BTMCode · Tüm hakları saklıdır":"BTMCode · All rights reserved",
    "İletişim":"Contact",
    "Doğru teknoloji.":"The right technology.",
    "Doğru problem.":"The right problem.",
    "Çalışmalar.":"Selected work.",
    "Kanıtlanabilir şekilde.":"With verifiable evidence.",
    "Farklı sektörlerde geliştirdiğim seçilmiş web platformları, SaaS ürünleri ve etkileşimli dijital deneyimler. Her proje; gerçek kapsamı, teknoloji seçimi ve doğrulanabilen işlevleriyle sunulur.":"A selection of web platforms, SaaS products and interactive digital experiences built across industries. Each case study describes its actual scope, technology choices and verifiable capabilities.",
    "Web platformları":"Web platforms",
    "Etkileşimli deneyim":"Interactive experiences",
    "Not: Projelerde doğrulanmamış gelir, trafik, kullanıcı veya dönüşüm metrikleri kullanılmamıştır. Demo ve kaynak kodu bağlantıları, erişim durumlarına göre ayrı gösterilir.":"Note: Project pages do not use unverified revenue, traffic, user or conversion metrics. Demo and source-code links are shown separately according to their availability.",
    "Keşif → kapsam → teklif":"Discovery → scope → proposal",
    "öğrendiklerim.":"and lessons learned.",
    "Yayınlanacak içerikler gerçek geliştirme deneyimlerine ve doğrulanabilir teknik kaynaklara dayanacak. Kopya veya yalnızca arama hacmi için üretilmiş içerik yayınlanmayacak.":"Published articles will be based on real engineering experience and verifiable technical sources. Copied content or articles created only to capture search volume will not be published.",
    "yaklaşımı.":"approach.",
    "Bu ilk sürümde reklam ve davranışsal takip servisleri kullanılmıyor. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Google Gmail e-posta altyapısı üzerinden BTMCode e-posta adresine iletilir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz.":"This version does not use advertising or behavioural tracking. Contact form submissions are delivered to the BTMCode inbox through Google Gmail so the enquiry can be answered. BTMCode does not store form submissions in a website database.",
    "Biyotop ve biyofilik metrik yardımcıları için test dosyaları":"Test files for biotope and biophilic metric utilities",
    "Kaynak depo özel. Repoda biyotop hesaplama ve biyofilik metrikler için test dosyaları bulunuyor; bu incelemede testlerin çalıştırıldığı iddia edilmiyor. Demo adresi kullanıcı tarafından sağlandı.":"The source repository is private. It contains tests for biotope calculations and biophilic metrics; this case study does not claim those tests were run during this review. The demo URL was provided by the project owner.",
    "Özel depo":"Private repository",
    "İsteğe bağlı Google Authenticator uyumlu 2FA yaklaşımı":"Optional Google Authenticator-compatible 2FA approach",
    "Çağrı ve servis operasyonlarına yönelik analiz ekranları":"Analytics dashboards for calls and service operations",
    "A/B test altyapısı için yönetim modülleri":"Admin modules for A/B testing infrastructure",
    "Canlı alan adı HTTP 200 döndürdü. İncelenen ilk HTML sürümünde ana içerik React istemci kökünden yükleniyor; daha güçlü indekslenebilirlik için SSR/SSG iyileştirmesi teknik fırsat olarak duruyor. README içindeki ilk kurulum kimlik bilgileri yayınlanmamalı ve güvenli biçimde döndürülmeli.":"The live domain returned HTTP 200. In the first HTML response reviewed, the main content was loaded through a React client root; SSR/SSG remains an opportunity to improve indexability. Initial credentials in the README must not be published and should be rotated securely.",
    "GitHub üzerinden erişilebilir":"Available on GitHub",
    "API tarafında Zod doğrulama, origin kontrolü, rate limit ve sunucu tarafında fiyat hesaplama":"API-side Zod validation, origin checks, rate limiting and server-side price calculation",
    "Demo sitesinde görünen sipariş ve işletme metrikleri başarı kanıtı olarak kullanılmıyor; proje etkileşimli ürün demosu olarak sunuluyor. Kaynak kodu herkese açık.":"Order and business metrics shown in the demo are not presented as proof of business results; the project is an interactive product demonstration. Its source code is public.",
    "Kaynak depo özel olduğu için GitHub bağlantısı yayımlanmıyor. Demo adresi kullanıcı tarafından sağlandı; bu oturumda bağımsız canlı HTTP doğrulaması yapılamadı.":"The source repository is private, so no GitHub link is published. The demo URL was supplied by the project owner; its live HTTP status was not independently verified during this review.",
    "Prisma tabanlı veri modeli ve admin içerik yönetimi":"Prisma-based data model and admin content management",
    "JWT ve HttpOnly cookie tabanlı yönetici oturumu":"JWT and HttpOnly cookie-based admin sessions",
    "6 Kasım 2026 tarihinde canlı ana sayfa HTTP 200 döndürdü; sunucu HTML'inde ana içerik, canonical ve yapılandırılmış veri doğrulandı.":"On November 6, 2026, the live homepage returned HTTP 200; the main content, canonical URL and structured data were verified in the server-rendered HTML."
  },
  de: {
    "Ben Ahmet. Yazılım geliştirme, yapay zekâ ve iş geliştirme kesişiminde dijital ürünler ve iş süreçleri tasarlıyorum.":"Ich bin Ahmet. Ich entwickle digitale Produkte und Geschäftsprozesse an der Schnittstelle von Softwareentwicklung, KI und Business Development.",
    "Vaka analizini gör ↗":"Fallstudie ansehen ↗",
    "Tüm seçilmiş projeler ↗":"Alle ausgewählten Projekte ↗",
    "Özel Web Uygulamaları":"Individuelle Webanwendungen",
    "Kurumsal web deneyimleri, müşteri portalları, yönetim panelleri ve operasyon araçları.":"Unternehmenswebsites, Kundenportale, Admin-Dashboards und operative Werkzeuge.",
    "Abonelik tabanlı ürünler, çok rollü paneller, veri odaklı araçlar ve API-first sistemler.":"Abonnementprodukte, Dashboards mit mehreren Rollen, datengestützte Tools und API-first-Systeme.",
    "Yapay zekâ ajanları, içerik üretim sistemleri ve tekrarlayan operasyonların otomasyonu.":"KI-Agenten, Content-Generierungssysteme und Automatisierung wiederkehrender Abläufe.",
    "Performans ve Güvenli Geliştirme":"Performance & sichere Entwicklung",
    "Keşif":"Analyse",
    "İhtiyacı, kullanıcıyı, iş hedefini ve mevcut teknik durumu anlamak.":"Bedarf, Nutzer, Geschäftsziele und den aktuellen technischen Stand verstehen.",
    "Mimari & Tasarım":"Architektur & Design",
    "Kapsamı, kullanıcı akışlarını, veri modelini ve teknik yaklaşımı belirlemek.":"Projektumfang, Nutzerabläufe, Datenmodell und technischen Ansatz festlegen.",
    "Geliştirme":"Entwicklung",
    "Modüler kod, kontrollü entegrasyonlar ve gerçek testlerle ilerlemek.":"Mit modularem Code, kontrollierten Integrationen und aussagekräftigen Tests arbeiten.",
    "Yayın & İyileştirme":"Launch & Optimierung",
    "Dağıtım, gözlemleme, geri bildirim ve sürdürülebilir geliştirme.":"Deployment, Monitoring, Feedback und nachhaltige Weiterentwicklung.",
    "BTMCode · Tüm hakları saklıdır":"BTMCode · Alle Rechte vorbehalten",
    "İletişim":"Kontakt",
    "Doğru teknoloji.":"Die richtige Technologie.",
    "Doğru problem.":"Das richtige Problem.",
    "Çalışmalar.":"Ausgewählte Arbeiten.",
    "Kanıtlanabilir şekilde.":"Nachvollziehbar belegt.",
    "Farklı sektörlerde geliştirdiğim seçilmiş web platformları, SaaS ürünleri ve etkileşimli dijital deneyimler. Her proje; gerçek kapsamı, teknoloji seçimi ve doğrulanabilen işlevleriyle sunulur.":"Ausgewählte Webplattformen, SaaS-Produkte und interaktive digitale Erlebnisse aus verschiedenen Branchen. Jede Fallstudie beschreibt den tatsächlichen Umfang, die Technologiewahl und belegbare Funktionen.",
    "Web platformları":"Webplattformen",
    "Etkileşimli deneyim":"Interaktive Erlebnisse",
    "Not: Projelerde doğrulanmamış gelir, trafik, kullanıcı veya dönüşüm metrikleri kullanılmamıştır. Demo ve kaynak kodu bağlantıları, erişim durumlarına göre ayrı gösterilir.":"Hinweis: Es werden keine ungeprüften Kennzahlen zu Umsatz, Traffic, Nutzern oder Conversions verwendet. Demo- und Quellcode-Links werden je nach Verfügbarkeit getrennt angezeigt.",
    "Keşif → kapsam → teklif":"Analyse → Umfang → Angebot",
    "öğrendiklerim.":"und Erkenntnisse.",
    "Yayınlanacak içerikler gerçek geliştirme deneyimlerine ve doğrulanabilir teknik kaynaklara dayanacak. Kopya veya yalnızca arama hacmi için üretilmiş içerik yayınlanmayacak.":"Veröffentlichte Beiträge basieren auf realer Entwicklungserfahrung und überprüfbaren technischen Quellen. Kopierte oder nur für Suchvolumen erstellte Inhalte werden nicht veröffentlicht.",
    "yaklaşımı.":"Ansatz.",
    "Bu ilk sürümde reklam ve davranışsal takip servisleri kullanılmıyor. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Google Gmail e-posta altyapısı üzerinden BTMCode e-posta adresine iletilir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz.":"Diese Version verwendet weder Werbung noch verhaltensbezogenes Tracking. Kontaktanfragen werden über Google Gmail an das BTMCode-Postfach weitergeleitet. BTMCode speichert Formulareingaben nicht in einer Website-Datenbank.",
    "Biyotop ve biyofilik metrik yardımcıları için test dosyaları":"Tests für Biotop- und biophile Metrikfunktionen",
    "Kaynak depo özel. Repoda biyotop hesaplama ve biyofilik metrikler için test dosyaları bulunuyor; bu incelemede testlerin çalıştırıldığı iddia edilmiyor. Demo adresi kullanıcı tarafından sağlandı.":"Das Quell-Repository ist privat. Es enthält Tests für Biotopberechnungen und biophile Metriken; diese Fallstudie behauptet nicht, dass die Tests im Rahmen dieser Prüfung ausgeführt wurden. Die Demo-URL wurde vom Projektinhaber bereitgestellt.",
    "Özel depo":"Privates Repository",
    "İsteğe bağlı Google Authenticator uyumlu 2FA yaklaşımı":"Optionaler, mit Google Authenticator kompatibler 2FA-Ansatz",
    "Çağrı ve servis operasyonlarına yönelik analiz ekranları":"Analyse-Dashboards für Anruf- und Serviceabläufe",
    "A/B test altyapısı için yönetim modülleri":"Admin-Module für die A/B-Testinfrastruktur",
    "Canlı alan adı HTTP 200 döndürdü. İncelenen ilk HTML sürümünde ana içerik React istemci kökünden yükleniyor; daha güçlü indekslenebilirlik için SSR/SSG iyileştirmesi teknik fırsat olarak duruyor. README içindeki ilk kurulum kimlik bilgileri yayınlanmamalı ve güvenli biçimde döndürülmeli.":"Die Live-Domain lieferte HTTP 200. In der geprüften ersten HTML-Antwort wurde der Hauptinhalt über einen React-Client-Root geladen; SSR/SSG bleibt eine Möglichkeit zur Verbesserung der Indexierbarkeit. Erstzugangsdaten in der README dürfen nicht veröffentlicht werden und müssen sicher rotiert werden.",
    "GitHub üzerinden erişilebilir":"Auf GitHub verfügbar",
    "API tarafında Zod doğrulama, origin kontrolü, rate limit ve sunucu tarafında fiyat hesaplama":"Zod-Validierung, Origin-Prüfung, Rate-Limiting und serverseitige Preisberechnung auf API-Ebene",
    "Demo sitesinde görünen sipariş ve işletme metrikleri başarı kanıtı olarak kullanılmıyor; proje etkileşimli ürün demosu olarak sunuluyor. Kaynak kodu herkese açık.":"Die im Demo gezeigten Bestell- und Geschäftskennzahlen werden nicht als Erfolgsnachweis dargestellt; das Projekt ist eine interaktive Produktdemo. Der Quellcode ist öffentlich.",
    "Kaynak depo özel olduğu için GitHub bağlantısı yayımlanmıyor. Demo adresi kullanıcı tarafından sağlandı; bu oturumda bağımsız canlı HTTP doğrulaması yapılamadı.":"Das Quell-Repository ist privat, daher wird kein GitHub-Link veröffentlicht. Die Demo-URL wurde vom Projektinhaber bereitgestellt; ihr Live-HTTP-Status wurde in dieser Sitzung nicht unabhängig geprüft.",
    "Prisma tabanlı veri modeli ve admin içerik yönetimi":"Prisma-basiertes Datenmodell und Admin-Content-Management",
    "JWT ve HttpOnly cookie tabanlı yönetici oturumu":"JWT- und HttpOnly-Cookie-basierte Admin-Sitzung",
    "6 Kasım 2026 tarihinde canlı ana sayfa HTTP 200 döndürdü; sunucu HTML'inde ana içerik, canonical ve yapılandırılmış veri doğrulandı.":"Am 6. November 2026 lieferte die Live-Startseite HTTP 200; Hauptinhalt, Canonical-URL und strukturierte Daten wurden im serverseitigen HTML geprüft."
  },
  fr: {
    "Ben Ahmet. Yazılım geliştirme, yapay zekâ ve iş geliştirme kesişiminde dijital ürünler ve iş süreçleri tasarlıyorum.":"Je suis Ahmet. Je conçois des produits numériques et des processus métier à la croisée du développement logiciel, de l’IA et du développement commercial.",
    "Vaka analizini gör ↗":"Voir l’étude de cas ↗",
    "Tüm seçilmiş projeler ↗":"Tous les projets sélectionnés ↗",
    "Özel Web Uygulamaları":"Applications web sur mesure",
    "Kurumsal web deneyimleri, müşteri portalları, yönetim panelleri ve operasyon araçları.":"Expériences web professionnelles, portails clients, tableaux de bord et outils opérationnels.",
    "Abonelik tabanlı ürünler, çok rollü paneller, veri odaklı araçlar ve API-first sistemler.":"Produits par abonnement, tableaux de bord multi-rôles, outils pilotés par les données et systèmes API-first.",
    "Yapay zekâ ajanları, içerik üretim sistemleri ve tekrarlayan operasyonların otomasyonu.":"Agents IA, systèmes de génération de contenu et automatisation des opérations répétitives.",
    "Performans ve Güvenli Geliştirme":"Performance et développement sécurisé",
    "Keşif":"Découverte",
    "İhtiyacı, kullanıcıyı, iş hedefini ve mevcut teknik durumu anlamak.":"Comprendre le besoin, les utilisateurs, les objectifs métier et l’état technique actuel.",
    "Mimari & Tasarım":"Architecture et design",
    "Kapsamı, kullanıcı akışlarını, veri modelini ve teknik yaklaşımı belirlemek.":"Définir le périmètre, les parcours utilisateurs, le modèle de données et l’approche technique.",
    "Geliştirme":"Développement",
    "Modüler kod, kontrollü entegrasyonlar ve gerçek testlerle ilerlemek.":"Avancer avec du code modulaire, des intégrations maîtrisées et des tests pertinents.",
    "Yayın & İyileştirme":"Mise en ligne et amélioration",
    "Dağıtım, gözlemleme, geri bildirim ve sürdürülebilir geliştirme.":"Déploiement, supervision, retours et amélioration continue.",
    "BTMCode · Tüm hakları saklıdır":"BTMCode · Tous droits réservés",
    "İletişim":"Contact",
    "Doğru teknoloji.":"La bonne technologie.",
    "Doğru problem.":"Le bon problème.",
    "Çalışmalar.":"Réalisations sélectionnées.",
    "Kanıtlanabilir şekilde.":"Avec des preuves vérifiables.",
    "Farklı sektörlerde geliştirdiğim seçilmiş web platformları, SaaS ürünleri ve etkileşimli dijital deneyimler. Her proje; gerçek kapsamı, teknoloji seçimi ve doğrulanabilen işlevleriyle sunulur.":"Une sélection de plateformes web, produits SaaS et expériences numériques interactives développés dans différents secteurs. Chaque étude présente le périmètre réel, les choix technologiques et les fonctionnalités vérifiables.",
    "Web platformları":"Plateformes web",
    "Etkileşimli deneyim":"Expériences interactives",
    "Not: Projelerde doğrulanmamış gelir, trafik, kullanıcı veya dönüşüm metrikleri kullanılmamıştır. Demo ve kaynak kodu bağlantıları, erişim durumlarına göre ayrı gösterilir.":"Note : aucun chiffre non vérifié de revenus, trafic, utilisateurs ou conversions n’est utilisé. Les liens de démo et de code source sont indiqués séparément selon leur disponibilité.",
    "Keşif → kapsam → teklif":"Découverte → périmètre → proposition",
    "öğrendiklerim.":"et apprentissages.",
    "Yayınlanacak içerikler gerçek geliştirme deneyimlerine ve doğrulanabilir teknik kaynaklara dayanacak. Kopya veya yalnızca arama hacmi için üretilmiş içerik yayınlanmayacak.":"Les articles publiés s’appuieront sur une expérience réelle de développement et des sources techniques vérifiables. Aucun contenu copié ou créé uniquement pour le volume de recherche ne sera publié.",
    "yaklaşımı.":"approche.",
    "Bu ilk sürümde reklam ve davranışsal takip servisleri kullanılmıyor. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Google Gmail e-posta altyapısı üzerinden BTMCode e-posta adresine iletilir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz.":"Cette version n’utilise ni publicité ni suivi comportemental. Les demandes du formulaire sont transmises à la boîte BTMCode via Google Gmail. BTMCode ne stocke pas les formulaires dans une base de données du site.",
    "Biyotop ve biyofilik metrik yardımcıları için test dosyaları":"Fichiers de test pour les outils de métriques biotopiques et biophiliques",
    "Kaynak depo özel. Repoda biyotop hesaplama ve biyofilik metrikler için test dosyaları bulunuyor; bu incelemede testlerin çalıştırıldığı iddia edilmiyor. Demo adresi kullanıcı tarafından sağlandı.":"Le dépôt source est privé. Il contient des tests pour les calculs de biotope et les métriques biophiliques ; cette étude ne prétend pas que ces tests ont été exécutés lors de cette revue. L’URL de démo a été fournie par le propriétaire du projet.",
    "Özel depo":"Dépôt privé",
    "İsteğe bağlı Google Authenticator uyumlu 2FA yaklaşımı":"Approche 2FA facultative compatible avec Google Authenticator",
    "Çağrı ve servis operasyonlarına yönelik analiz ekranları":"Tableaux d’analyse pour les appels et les opérations de service",
    "A/B test altyapısı için yönetim modülleri":"Modules d’administration pour l’infrastructure de tests A/B",
    "Canlı alan adı HTTP 200 döndürdü. İncelenen ilk HTML sürümünde ana içerik React istemci kökünden yükleniyor; daha güçlü indekslenebilirlik için SSR/SSG iyileştirmesi teknik fırsat olarak duruyor. README içindeki ilk kurulum kimlik bilgileri yayınlanmamalı ve güvenli biçimde döndürülmeli.":"Le domaine actif a renvoyé HTTP 200. Dans la première réponse HTML examinée, le contenu principal est chargé depuis une racine cliente React ; le SSR/SSG reste une piste d’amélioration de l’indexation. Les identifiants initiaux du README ne doivent pas être publiés et doivent être renouvelés en sécurité.",
    "GitHub üzerinden erişilebilir":"Disponible sur GitHub",
    "API tarafında Zod doğrulama, origin kontrolü, rate limit ve sunucu tarafında fiyat hesaplama":"Validation Zod côté API, contrôle d’origine, limitation de débit et calcul des prix côté serveur",
    "Demo sitesinde görünen sipariş ve işletme metrikleri başarı kanıtı olarak kullanılmıyor; proje etkileşimli ürün demosu olarak sunuluyor. Kaynak kodu herkese açık.":"Les indicateurs de commandes et d’activité visibles dans la démo ne sont pas présentés comme des preuves de réussite commerciale ; le projet est une démonstration interactive. Son code source est public.",
    "Kaynak depo özel olduğu için GitHub bağlantısı yayımlanmıyor. Demo adresi kullanıcı tarafından sağlandı; bu oturumda bağımsız canlı HTTP doğrulaması yapılamadı.":"Le dépôt source est privé, aucun lien GitHub n’est donc publié. L’URL de démo a été fournie par le propriétaire du projet ; son état HTTP n’a pas été vérifié indépendamment pendant cette session.",
    "Prisma tabanlı veri modeli ve admin içerik yönetimi":"Modèle de données basé sur Prisma et gestion de contenu admin",
    "JWT ve HttpOnly cookie tabanlı yönetici oturumu":"Session administrateur basée sur JWT et cookie HttpOnly",
    "6 Kasım 2026 tarihinde canlı ana sayfa HTTP 200 döndürdü; sunucu HTML'inde ana içerik, canonical ve yapılandırılmış veri doğrulandı.":"Le 6 novembre 2026, la page d’accueil en production a renvoyé HTTP 200 ; le contenu principal, l’URL canonique et les données structurées ont été vérifiés dans le HTML serveur."
  },
  ru: {
    "Ben Ahmet. Yazılım geliştirme, yapay zekâ ve iş geliştirme kesişiminde dijital ürünler ve iş süreçleri tasarlıyorum.":"Я Ахмет. Проектирую цифровые продукты и бизнес-процессы на стыке разработки ПО, искусственного интеллекта и развития бизнеса.",
    "Vaka analizini gör ↗":"Посмотреть кейс ↗",
    "Tüm seçilmiş projeler ↗":"Все избранные проекты ↗",
    "Özel Web Uygulamaları":"Индивидуальные веб-приложения",
    "Kurumsal web deneyimleri, müşteri portalları, yönetim panelleri ve operasyon araçları.":"Корпоративные веб-интерфейсы, клиентские порталы, панели администратора и операционные инструменты.",
    "Abonelik tabanlı ürünler, çok rollü paneller, veri odaklı araçlar ve API-first sistemler.":"Продукты по подписке, многоролевые панели, инструменты на основе данных и API-first системы.",
    "Yapay zekâ ajanları, içerik üretim sistemleri ve tekrarlayan operasyonların otomasyonu.":"ИИ-агенты, системы генерации контента и автоматизация повторяющихся операций.",
    "Performans ve Güvenli Geliştirme":"Производительность и безопасная разработка",
    "Keşif":"Исследование",
    "İhtiyacı, kullanıcıyı, iş hedefini ve mevcut teknik durumu anlamak.":"Понять потребность, пользователей, бизнес-цели и текущее техническое состояние.",
    "Mimari & Tasarım":"Архитектура и дизайн",
    "Kapsamı, kullanıcı akışlarını, veri modelini ve teknik yaklaşımı belirlemek.":"Определить объём, пользовательские сценарии, модель данных и технический подход.",
    "Geliştirme":"Разработка",
    "Modüler kod, kontrollü entegrasyonlar ve gerçek testlerle ilerlemek.":"Использовать модульный код, контролируемые интеграции и содержательные тесты.",
    "Yayın & İyileştirme":"Запуск и улучшение",
    "Dağıtım, gözlemleme, geri bildirim ve sürdürülebilir geliştirme.":"Развёртывание, мониторинг, обратная связь и устойчивое развитие.",
    "BTMCode · Tüm hakları saklıdır":"BTMCode · Все права защищены",
    "İletişim":"Контакты",
    "Doğru teknoloji.":"Правильная технология.",
    "Doğru problem.":"Правильная задача.",
    "Çalışmalar.":"Избранные работы.",
    "Kanıtlanabilir şekilde.":"С проверяемыми фактами.",
    "Farklı sektörlerde geliştirdiğim seçilmiş web platformları, SaaS ürünleri ve etkileşimli dijital deneyimler. Her proje; gerçek kapsamı, teknoloji seçimi ve doğrulanabilen işlevleriyle sunulur.":"Избранные веб-платформы, SaaS-продукты и интерактивные цифровые решения для разных отраслей. Каждый кейс описывает фактический объём, выбор технологий и проверяемые функции.",
    "Web platformları":"Веб-платформы",
    "Etkileşimli deneyim":"Интерактивные решения",
    "Not: Projelerde doğrulanmamış gelir, trafik, kullanıcı veya dönüşüm metrikleri kullanılmamıştır. Demo ve kaynak kodu bağlantıları, erişim durumlarına göre ayrı gösterilir.":"Примечание: в описаниях проектов не используются неподтверждённые показатели выручки, трафика, пользователей или конверсии. Ссылки на демо и исходный код указаны отдельно с учётом доступности.",
    "Keşif → kapsam → teklif":"Исследование → объём → предложение",
    "öğrendiklerim.":"и выводы.",
    "Yayınlanacak içerikler gerçek geliştirme deneyimlerine ve doğrulanabilir teknik kaynaklara dayanacak. Kopya veya yalnızca arama hacmi için üretilmiş içerik yayınlanmayacak.":"Публикации будут основаны на реальном опыте разработки и проверяемых технических источниках. Копии и материалы, созданные только ради поискового трафика, публиковаться не будут.",
    "yaklaşımı.":"подход.",
    "Bu ilk sürümde reklam ve davranışsal takip servisleri kullanılmıyor. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Google Gmail e-posta altyapısı üzerinden BTMCode e-posta adresine iletilir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz.":"В этой версии не используются реклама и поведенческое отслеживание. Обращения из формы передаются в почтовый ящик BTMCode через Google Gmail. BTMCode не хранит отправленные формы в базе данных сайта.",
    "Biyotop ve biyofilik metrik yardımcıları için test dosyaları":"Тесты для инструментов биотопных и биофильных метрик",
    "Kaynak depo özel. Repoda biyotop hesaplama ve biyofilik metrikler için test dosyaları bulunuyor; bu incelemede testlerin çalıştırıldığı iddia edilmiyor. Demo adresi kullanıcı tarafından sağlandı.":"Исходный репозиторий закрыт. В нём есть тесты расчёта биотопа и биофильных метрик; в этом обзоре не утверждается, что тесты запускались. URL демо предоставлен владельцем проекта.",
    "Özel depo":"Закрытый репозиторий",
    "İsteğe bağlı Google Authenticator uyumlu 2FA yaklaşımı":"Необязательная двухфакторная аутентификация, совместимая с Google Authenticator",
    "Çağrı ve servis operasyonlarına yönelik analiz ekranları":"Аналитические панели для звонков и сервисных операций",
    "A/B test altyapısı için yönetim modülleri":"Модули администратора для инфраструктуры A/B-тестирования",
    "Canlı alan adı HTTP 200 döndürdü. İncelenen ilk HTML sürümünde ana içerik React istemci kökünden yükleniyor; daha güçlü indekslenebilirlik için SSR/SSG iyileştirmesi teknik fırsat olarak duruyor. README içindeki ilk kurulum kimlik bilgileri yayınlanmamalı ve güvenli biçimde döndürülmeli.":"Рабочий домен вернул HTTP 200. В первой проверенной HTML-версии основной контент загружается через клиентский корень React; SSR/SSG остаётся технической возможностью для улучшения индексации. Начальные учётные данные в README нельзя публиковать; их необходимо безопасно заменить.",
    "GitHub üzerinden erişilebilir":"Доступно на GitHub",
    "API tarafında Zod doğrulama, origin kontrolü, rate limit ve sunucu tarafında fiyat hesaplama":"Проверка данных через Zod, контроль источника, ограничение частоты запросов и расчёт цены на сервере",
    "Demo sitesinde görünen sipariş ve işletme metrikleri başarı kanıtı olarak kullanılmıyor; proje etkileşimli ürün demosu olarak sunuluyor. Kaynak kodu herkese açık.":"Показатели заказов и бизнеса в демо не выдаются за доказательство коммерческого успеха; проект представлен как интерактивная демонстрация. Исходный код открыт.",
    "Kaynak depo özel olduğu için GitHub bağlantısı yayımlanmıyor. Demo adresi kullanıcı tarafından sağlandı; bu oturumda bağımsız canlı HTTP doğrulaması yapılamadı.":"Исходный репозиторий закрыт, поэтому ссылка на GitHub не публикуется. URL демо предоставлен владельцем проекта; независимая проверка HTTP в этой сессии не проводилась.",
    "Prisma tabanlı veri modeli ve admin içerik yönetimi":"Модель данных на Prisma и управление контентом через админ-панель",
    "JWT ve HttpOnly cookie tabanlı yönetici oturumu":"Административная сессия на основе JWT и HttpOnly cookie",
    "6 Kasım 2026 tarihinde canlı ana sayfa HTTP 200 döndürdü; sunucu HTML'inde ana içerik, canonical ve yapılandırılmış veri doğrulandı.":"6 ноября 2026 года главная страница вернула HTTP 200; основной контент, canonical URL и структурированные данные проверены в серверном HTML."
  }
,
  zh: {
    "Ben Ahmet. Yazılım geliştirme, yapay zekâ ve iş geliştirme kesişiminde dijital ürünler ve iş süreçleri tasarlıyorum.": "我是 Ahmet，专注于软件开发、人工智能与业务创新交汇处的数字产品和业务流程设计。",
    "Vaka analizini gör ↗": "查看项目案例 ↗",
    "Tüm seçilmiş projeler ↗": "查看全部精选项目 ↗",
    "Özel Web Uygulamaları": "定制 Web 应用",
    "Kurumsal web deneyimleri, müşteri portalları, yönetim panelleri ve operasyon araçları.": "企业网站体验、客户门户、管理后台和运营工具。",
    "Abonelik tabanlı ürünler, çok rollü paneller, veri odaklı araçlar ve API-first sistemler.": "订阅制产品、多角色后台、数据工具和 API 优先系统。",
    "Yapay zekâ ajanları, içerik üretim sistemleri ve tekrarlayan operasyonların otomasyonu.": "AI 智能代理、内容生成系统和重复业务流程自动化。",
    "Performans ve Güvenli Geliştirme": "性能与安全开发",
    "Keşif": "需求梳理",
    "Mimari & Tasarım": "架构与设计",
    "Geliştirme": "开发",
    "Yayın & İyileştirme": "发布与优化",
    "İletişim": "联系",
    "Tüm hakları saklıdır": "版权所有",
    "Bir fikrin mi var?": "有项目想法？",
    "Konuşalım.": "聊一聊。",
    "Ad Soyad *": "姓名 *",
    "E-posta *": "电子邮箱 *",
    "Şirket / Marka": "公司 / 品牌",
    "İlgilendiğin konu": "感兴趣的服务",
    "Seçiniz": "请选择",
    "Web uygulaması": "Web 应用",
    "SaaS / platform": "SaaS / 平台",
    "AI / otomasyon": "AI / 自动化",
    "Teknik iyileştirme": "技术优化",
    "Diğer": "其他",
    "Proje özeti *": "项目简介 *",
    "Hangi problemi çözmek istiyorsun?": "您希望解决什么问题？",
    "Proje talebini gönder ↗": "提交项目需求 ↗",
    "Notlar, kararlar ve öğrendiklerim.": "技术笔记、决策与经验。",
    "İlk teknik yazılar hazırlanıyor.": "首批技术文章正在准备中。",
    "Veri işleme": "数据处理",
    "Çerezler": "Cookie",
    "Projenin amacı": "项目目标",
    "Öne çıkan işlevler": "主要功能",
    "Kullanılan teknoloji": "使用的技术",
    "Şeffaflık notu": "透明度说明",
    "Tüm projeler": "全部项目",
    "Canlı demoyu aç ↗": "打开在线演示 ↗",
    "GitHub kaynağı ↗": "查看 GitHub 源码 ↗",
    "BTMCode · Tüm hakları saklıdır": "BTMCode · 版权所有"
  }};
for (const locale of LOCALES) Object.assign(dictionaries[locale], moreTranslations[locale]);

const caseTranslations = {
  de: {
    "Klasik kurumsal site yerine; sinematik scroll hikâyesi, su-kara geçiş etkileşimi, biyotop hesaplayıcısı, proje keşfi ve önceden doldurulabilen teklif akışından oluşan etkileşimli stüdyo deneyimi.":"Ein interaktives Studioerlebnis statt einer klassischen Unternehmenswebsite – mit filmischer Scroll-Story, Wasser-Land-Übergang, Biotop-Rechner, Projekterkundung und vorausgefüllter Angebotsanfrage.",
    "Su ve peyzaj arasında geçiş yapan interaktif slider":"Interaktiver Slider zwischen Wasser- und Landschaftsszenen",
    "Hacim, filtrasyon, aydınlatma ve bitki önerileri sunan biyotop hesaplayıcısı":"Biotop-Rechner mit Empfehlungen zu Volumen, Filterung, Beleuchtung und Pflanzen",
    "Türkçe/İngilizce dil değişimi ve tema tercihi":"Sprachumschaltung Türkisch/Englisch und Designauswahl",
    "Hesaplama özetiyle önceden doldurulan proje talep akışı":"Projektanfrage mit vorausgefüllter Berechnungszusammenfassung",
    "Elektrik servis işletmesi için geliştirilen yerel arama ve müşteri operasyon platformu. Bölgesel hizmet sayfaları, AI destekli içerik üretimi ve CRM ekranları aynı uygulamada buluşuyor.":"Eine Plattform für lokale Suche und Kundenprozesse eines Elektroservicebetriebs. Regionale Serviceseiten, KI-gestützte Inhaltserstellung und CRM-Oberflächen sind in einer Anwendung vereint.",
    "İlçe ve hizmet niyetine göre ayrıştırılmış içerik sayfaları":"Inhaltsseiten nach Bezirk und Service-Suchintention",
    "Gemini ve Imagen entegrasyonlu AI içerik/görsel taslak akışları":"KI-gestützte Entwürfe für Texte und Bilder mit Gemini- und Imagen-Integration",
    "Talep ve müşteri yönetimi için admin ekranları":"Admin-Oberflächen für Anfrage- und Kundenverwaltung",
    "Restoranın dijital vitrinini sipariş akışı ve operasyon yönetimiyle birleştiren full-stack demo. Menü, kampanya, sepet, sipariş ve takip ekranları; yönetim API'leriyle destekleniyor.":"Eine Full-Stack-Demo, die den digitalen Auftritt eines Restaurants mit Bestellabläufen und Betriebsverwaltung verbindet. Menü, Aktionen, Warenkorb, Bestellungen und Tracking werden durch Admin-APIs unterstützt.",
    "Kategori bazlı menü ve kampanya alanları":"Kategorieorientiertes Menü und Aktionsbereiche",
    "Sepet, teslimat adresi ve sipariş oluşturma akışı":"Warenkorb, Lieferadresse und Bestellprozess",
    "Sipariş durumu ve takip sayfaları":"Bestellstatus und Tracking-Seiten",
    "Admin tarafında menü, kampanya, mesaj ve sipariş yönetimi":"Admin-Verwaltung von Menüs, Aktionen, Nachrichten und Bestellungen",
    "AI destekli arama ve öneri bileşenleri":"KI-gestützte Suche und Empfehlungskomponenten",
    "API-first image hosting ürünü; çoklu boyut varyantları, otomatik WebP dönüşümü, kullanıcı API anahtarları, görsel yönetimi, API dokümantasyonu ve ödeme/billing ekranlarını bir araya getiriyor.":"Ein API-first-Produkt für Bildhosting mit mehreren Größenvarianten, automatischer WebP-Konvertierung, Benutzer-API-Schlüsseln, Bildverwaltung, API-Dokumentation sowie Zahlungs- und Abrechnungsoberflächen.",
    "WebP dönüşümü ve görsel sıkıştırma iş akışı":"WebP-Konvertierung und Bildkomprimierungs-Workflow",
    "Thumbnail, medium ve large boyut varyantları":"Bildvarianten in Thumbnail-, Medium- und Large-Größe",
    "Korumalı kullanıcı paneli, upload ve görsel kütüphanesi":"Geschütztes Benutzer-Dashboard, Upload und Bildbibliothek",
    "Billing, ödeme, kullanıcı ve güvenlik yönetimi için admin modülleri":"Admin-Module für Abrechnung, Zahlungen, Benutzer und Sicherheitsverwaltung",
    "Sunucu tarafında render edilen kurumsal hizmet sitesi. Hizmet, ilçe, blog ve SSS sayfaları; LocalBusiness yapılandırılmış veri; talep formları ve yönetim paneli aynı ürün mimarisinde birleştiriliyor.":"Eine serverseitig gerenderte Unternehmenswebsite für Dienstleistungen. Service-, Bezirks-, Blog- und FAQ-Seiten, LocalBusiness-Strukturdaten, Anfrageformulare und Admin-Panel sind in einer Produktarchitektur vereint.",
    "Next.js App Router ile sunucu tarafı sayfa üretimi":"Serverseitige Seitenerstellung mit dem Next.js App Router",
    "Hizmet, bölge, blog ve SSS için ayrı indekslenebilir sayfalar":"Separate indexierbare Seiten für Services, Regionen, Blog und FAQs",
    "Electrician, WebSite ve FAQPage JSON-LD yapılandırılmış verileri":"JSON-LD-Strukturdaten für Electrician, WebSite und FAQPage"
  },
  fr: {
    "Klasik kurumsal site yerine; sinematik scroll hikâyesi, su-kara geçiş etkileşimi, biyotop hesaplayıcısı, proje keşfi ve önceden doldurulabilen teklif akışından oluşan etkileşimli stüdyo deneyimi.":"Une expérience de studio interactive plutôt qu’un site institutionnel classique : récit cinématique au défilement, transition eau-paysage, calculateur de biotope, exploration des projets et demande de devis préremplie.",
    "Su ve peyzaj arasında geçiş yapan interaktif slider":"Curseur interactif entre scènes aquatiques et paysagères",
    "Hacim, filtrasyon, aydınlatma ve bitki önerileri sunan biyotop hesaplayıcısı":"Calculateur de biotope avec recommandations de volume, filtration, éclairage et plantes",
    "Türkçe/İngilizce dil değişimi ve tema tercihi":"Changement de langue turc/anglais et préférence de thème",
    "Hesaplama özetiyle önceden doldurulan proje talep akışı":"Parcours de demande de projet prérempli avec le résumé du calcul",
    "Elektrik servis işletmesi için geliştirilen yerel arama ve müşteri operasyon platformu. Bölgesel hizmet sayfaları, AI destekli içerik üretimi ve CRM ekranları aynı uygulamada buluşuyor.":"Une plateforme de référencement local et d’opérations client pour une entreprise de services électriques, réunissant pages régionales, création de contenu assistée par l’IA et écrans CRM.",
    "İlçe ve hizmet niyetine göre ayrıştırılmış içerik sayfaları":"Pages de contenu organisées par quartier et intention de recherche de service",
    "Gemini ve Imagen entegrasyonlu AI içerik/görsel taslak akışları":"Flux de brouillons de contenu et d’images IA intégrant Gemini et Imagen",
    "Talep ve müşteri yönetimi için admin ekranları":"Écrans d’administration pour la gestion des demandes et des clients",
    "Restoranın dijital vitrinini sipariş akışı ve operasyon yönetimiyle birleştiren full-stack demo. Menü, kampanya, sepet, sipariş ve takip ekranları; yönetim API'leriyle destekleniyor.":"Une démo full-stack qui associe la vitrine numérique d’un restaurant aux commandes et à la gestion opérationnelle. Menu, promotions, panier, commandes et suivi sont pris en charge par des API d’administration.",
    "Kategori bazlı menü ve kampanya alanları":"Menu par catégorie et espaces promotionnels",
    "Sepet, teslimat adresi ve sipariş oluşturma akışı":"Parcours de panier, adresse de livraison et création de commande",
    "Sipariş durumu ve takip sayfaları":"Pages d’état et de suivi des commandes",
    "Admin tarafında menü, kampanya, mesaj ve sipariş yönetimi":"Gestion des menus, promotions, messages et commandes dans l’administration",
    "AI destekli arama ve öneri bileşenleri":"Composants de recherche et de recommandation assistés par l’IA",
    "API-first image hosting ürünü; çoklu boyut varyantları, otomatik WebP dönüşümü, kullanıcı API anahtarları, görsel yönetimi, API dokümantasyonu ve ödeme/billing ekranlarını bir araya getiriyor.":"Un produit API-first d’hébergement d’images réunissant plusieurs tailles, conversion WebP automatique, clés API utilisateur, gestion des images, documentation API et interfaces de paiement et de facturation.",
    "WebP dönüşümü ve görsel sıkıştırma iş akışı":"Flux de conversion WebP et de compression d’images",
    "Thumbnail, medium ve large boyut varyantları":"Variantes d’image miniature, moyenne et grande",
    "Korumalı kullanıcı paneli, upload ve görsel kütüphanesi":"Espace utilisateur protégé, téléversement et bibliothèque d’images",
    "Billing, ödeme, kullanıcı ve güvenlik yönetimi için admin modülleri":"Modules d’administration pour la facturation, les paiements, les utilisateurs et la sécurité",
    "Sunucu tarafında render edilen kurumsal hizmet sitesi. Hizmet, ilçe, blog ve SSS sayfaları; LocalBusiness yapılandırılmış veri; talep formları ve yönetim paneli aynı ürün mimarisinde birleştiriliyor.":"Un site de services professionnel rendu côté serveur. Pages de services, quartiers, blog et FAQ, données structurées LocalBusiness, formulaires de demande et panneau d’administration sont réunis dans une même architecture produit.",
    "Next.js App Router ile sunucu tarafı sayfa üretimi":"Génération des pages côté serveur avec Next.js App Router",
    "Hizmet, bölge, blog ve SSS için ayrı indekslenebilir sayfalar":"Pages indexables distinctes pour les services, régions, articles et FAQ",
    "Electrician, WebSite ve FAQPage JSON-LD yapılandırılmış verileri":"Données structurées JSON-LD Electrician, WebSite et FAQPage"
  },
  ru: {
    "Klasik kurumsal site yerine; sinematik scroll hikâyesi, su-kara geçiş etkileşimi, biyotop hesaplayıcısı, proje keşfi ve önceden doldurulabilen teklif akışından oluşan etkileşimli stüdyo deneyimi.":"Интерактивный студийный опыт вместо обычного корпоративного сайта: кинематографичная история при прокрутке, переход между водой и ландшафтом, калькулятор биотопа, обзор проектов и предварительно заполненная заявка на расчёт.",
    "Su ve peyzaj arasında geçiş yapan interaktif slider":"Интерактивный слайдер перехода между водной средой и ландшафтом",
    "Hacim, filtrasyon, aydınlatma ve bitki önerileri sunan biyotop hesaplayıcısı":"Калькулятор биотопа с рекомендациями по объёму, фильтрации, освещению и растениям",
    "Türkçe/İngilizce dil değişimi ve tema tercihi":"Переключение турецкого/английского языка и выбор темы оформления",
    "Hesaplama özetiyle önceden doldurulan proje talep akışı":"Форма проектной заявки с предварительно заполненным результатом расчёта",
    "Elektrik servis işletmesi için geliştirilen yerel arama ve müşteri operasyon platformu. Bölgesel hizmet sayfaları, AI destekli içerik üretimi ve CRM ekranları aynı uygulamada buluşuyor.":"Платформа локального поиска и клиентских операций для электротехнической компании. Региональные страницы услуг, создание контента с помощью ИИ и CRM-интерфейсы объединены в одном приложении.",
    "İlçe ve hizmet niyetine göre ayrıştırılmış içerik sayfaları":"Страницы контента, разделённые по районам и поисковому намерению услуги",
    "Gemini ve Imagen entegrasyonlu AI içerik/görsel taslak akışları":"Рабочие процессы подготовки текста и изображений с ИИ-интеграцией Gemini и Imagen",
    "Talep ve müşteri yönetimi için admin ekranları":"Административные экраны для управления заявками и клиентами",
    "Restoranın dijital vitrinini sipariş akışı ve operasyon yönetimiyle birleştiren full-stack demo. Menü, kampanya, sepet, sipariş ve takip ekranları; yönetim API'leriyle destekleniyor.":"Full-stack демо, объединяющее цифровую витрину ресторана с оформлением заказов и управлением операциями. Меню, акции, корзина, заказы и отслеживание поддерживаются административными API.",
    "Kategori bazlı menü ve kampanya alanları":"Меню по категориям и разделы акций",
    "Sepet, teslimat adresi ve sipariş oluşturma akışı":"Корзина, адрес доставки и оформление заказа",
    "Sipariş durumu ve takip sayfaları":"Статус заказа и страницы отслеживания",
    "Admin tarafında menü, kampanya, mesaj ve sipariş yönetimi":"Управление меню, акциями, сообщениями и заказами в админ-панели",
    "AI destekli arama ve öneri bileşenleri":"Компоненты поиска и рекомендаций на базе ИИ",
    "API-first image hosting ürünü; çoklu boyut varyantları, otomatik WebP dönüşümü, kullanıcı API anahtarları, görsel yönetimi, API dokümantasyonu ve ödeme/billing ekranlarını bir araya getiriyor.":"API-first продукт для хостинга изображений объединяет несколько вариантов размеров, автоматическое преобразование WebP, пользовательские API-ключи, управление изображениями, документацию API и интерфейсы оплаты и биллинга.",
    "WebP dönüşümü ve görsel sıkıştırma iş akışı":"Процесс преобразования WebP и сжатия изображений",
    "Thumbnail, medium ve large boyut varyantları":"Варианты размеров thumbnail, medium и large",
    "Korumalı kullanıcı paneli, upload ve görsel kütüphanesi":"Защищённый кабинет пользователя, загрузка и библиотека изображений",
    "Billing, ödeme, kullanıcı ve güvenlik yönetimi için admin modülleri":"Административные модули для биллинга, платежей, пользователей и управления безопасностью",
    "Sunucu tarafında render edilen kurumsal hizmet sitesi. Hizmet, ilçe, blog ve SSS sayfaları; LocalBusiness yapılandırılmış veri; talep formları ve yönetim paneli aynı ürün mimarisinde birleştiriliyor.":"Корпоративный сайт услуг с серверным рендерингом. Страницы услуг, районов, блога и FAQ, структурированные данные LocalBusiness, формы заявок и панель управления объединены в единую архитектуру продукта.",
    "Next.js App Router ile sunucu tarafı sayfa üretimi":"Серверная генерация страниц с помощью Next.js App Router",
    "Hizmet, bölge, blog ve SSS için ayrı indekslenebilir sayfalar":"Отдельные индексируемые страницы услуг, регионов, блога и FAQ",
    "Electrician, WebSite ve FAQPage JSON-LD yapılandırılmış verileri":"Структурированные данные JSON-LD Electrician, WebSite и FAQPage"
  }
,
  zh: {
    "Klasik kurumsal site yerine; sinematik scroll hikâyesi, su-kara geçiş etkileşimi, biyotop hesaplayıcısı, proje keşfi ve önceden doldurulabilen teklif akışından oluşan etkileşimli stüdyo deneyimi.": "这是一种互动式工作室体验，而非传统企业网站，包含电影感滚动叙事、水景与陆景切换、生态缸计算器、项目探索和预填项目咨询流程。",
    "Su ve peyzaj arasında geçiş yapan interaktif slider": "水景与景观之间的互动切换滑块",
    "Hacim, filtrasyon, aydınlatma ve bitki önerileri sunan biyotop hesaplayıcısı": "提供容量、过滤、照明和植物建议的生态缸计算器",
    "Türkçe/İngilizce dil değişimi ve tema tercihi": "土耳其语/英语切换与主题偏好",
    "Hesaplama özetiyle önceden doldurulan proje talep akışı": "自动填入计算摘要的项目咨询流程",
    "Elektrik servis işletmesi için geliştirilen yerel arama ve müşteri operasyon platformu. Bölgesel hizmet sayfaları, AI destekli içerik üretimi ve CRM ekranları aynı uygulamada buluşuyor.": "为电气服务企业打造的本地搜索与客户运营平台，将区域服务页面、AI 内容生成和 CRM 管理整合在同一应用中。",
    "İlçe ve hizmet niyetine göre ayrıştırılmış içerik sayfaları": "按地区和服务搜索意图组织的内容页面",
    "Gemini ve Imagen entegrasyonlu AI içerik/görsel taslak akışları": "集成 Gemini 和 Imagen 的 AI 文案与图片草稿流程",
    "Talep ve müşteri yönetimi için admin ekranları": "用于咨询和客户管理的后台界面",
    "Restoranın dijital vitrinini sipariş akışı ve operasyon yönetimiyle birleştiren full-stack demo. Menü, kampanya, sepet, sipariş ve takip ekranları; yönetim API'leriyle destekleniyor.": "将餐厅数字门店、点餐流程和运营管理结合的全栈演示，包含菜单、促销、购物车、订单和追踪页面，并由管理 API 提供支持。",
    "Kategori bazlı menü ve kampanya alanları": "分类菜单和促销区域",
    "Sepet, teslimat adresi ve sipariş oluşturma akışı": "购物车、配送地址和下单流程",
    "Sipariş durumu ve takip sayfaları": "订单状态与追踪页面",
    "Admin tarafında menü, kampanya, mesaj ve sipariş yönetimi": "后台菜单、促销、消息和订单管理",
    "AI destekli arama ve öneri bileşenleri": "AI 搜索与推荐组件",
    "API-first image hosting ürünü; çoklu boyut varyantları, otomatik WebP dönüşümü, kullanıcı API anahtarları, görsel yönetimi, API dokümantasyonu ve ödeme/billing ekranlarını bir araya getiriyor.": "API 优先的图片托管产品概念，整合多尺寸图片、自动 WebP 转换、用户 API 密钥、图片管理、API 文档和账单界面。",
    "WebP dönüşümü ve görsel sıkıştırma iş akışı": "WebP 转换与图片压缩流程",
    "Thumbnail, medium ve large boyut varyantları": "缩略图、中尺寸和大尺寸图片版本",
    "Korumalı kullanıcı paneli, upload ve görsel kütüphanesi": "受保护的用户后台、上传和图片库",
    "Billing, ödeme, kullanıcı ve güvenlik yönetimi için admin modülleri": "账单、支付、用户和安全管理后台模块",
    "Sunucu tarafında render edilen kurumsal hizmet sitesi. Hizmet, ilçe, blog ve SSS sayfaları; LocalBusiness yapılandırılmış veri; talep formları ve yönetim paneli aynı ürün mimarisinde birleştiriliyor.": "采用服务端渲染的企业服务网站，将服务、地区、博客和常见问题页面、LocalBusiness 结构化数据、咨询表单与管理后台整合在统一架构中。",
    "Next.js App Router ile sunucu tarafı sayfa üretimi": "使用 Next.js App Router 进行服务端页面生成",
    "Hizmet, bölge, blog ve SSS için ayrı indekslenebilir sayfalar": "服务、地区、博客和 FAQ 的独立可索引页面",
    "Electrician, WebSite ve FAQPage JSON-LD yapılandırılmış verileri": "Electrician、WebSite 和 FAQPage JSON-LD 结构化数据"
  }};

for (const locale of ["de","fr","ru","zh"]) Object.assign(dictionaries[locale], caseTranslations[locale]);
const agencyPartnerTranslations = {
en:{
"Uluslararası ekipler için":"For international teams","uzaktan yazılım partneri.":"your remote engineering partner.",
"BTMCode, dijital ajanslar ve büyüyen işletmeler için web uygulamaları, API/CRM entegrasyonları ve AI destekli iş akışları geliştirir. Kapsamı baştan netleştirir, geliştirmeyi doğrudan yürütür ve teslimatı dokümante eder.":"BTMCode builds web applications, API/CRM integrations and AI-enabled workflows for digital agencies and growing businesses. Scope is agreed upfront, engineering is handled directly and handover is documented.",
"Proje talebini başlat ↗":"Start a project enquiry ↗","Ajans ortaklığını keşfet ↗":"Explore agency partnerships ↗",
"Ajansınızın teknik teslim kapasitesini büyütün.":"Extend your agency’s engineering delivery capacity.",
"Tasarım, strateji ve müşteri ilişkisi sizde kalsın. BTMCode, yoğun dönemlerde veya uzmanlık gerektiğinde web ve yazılım teslimatına proje bazlı destek verir. White-label çalışma modeli, NDA, iletişim ve kod sahipliği her proje başlamadan önce yazılı olarak netleştirilir.":"Keep design, strategy and client relationships in your hands. BTMCode provides project-based engineering support when your team is at capacity or a brief needs specialist skills. White-label delivery, NDA, communication and code ownership are agreed in writing before each engagement.",
"Ek geliştirme kapasitesi":"Overflow development capacity","Ekibiniz yoğunken React/Next.js arayüzleri, web uygulamaları ve mevcut projelerin geliştirme işlerini belirli bir kapsamla üstlenirim.":"When your team is busy, I can take on scoped React/Next.js interfaces, web applications and feature work on existing projects.",
"Entegrasyon ve otomasyon":"Integrations and automation","Mevcut araçları API üzerinden bağlar; CRM, veri akışı ve tekrarlayan iş süreçleri için ihtiyaca göre AI destekli entegrasyonlar geliştiririm.":"I connect existing tools through APIs and build fit-for-purpose AI-enabled integrations for CRM, data flows and repetitive workflows.",
"Mevcut projeyi devralma":"Existing codebase handover","Yayına çıkmayan, bakım bekleyen veya başka geliştiriciden devralınması gereken kod tabanını inceler; riskleri ve uygulanabilir sonraki adımları raporlarım.":"I review projects that are stalled, need maintenance or must be taken over from another developer, then report risks and practical next steps.",
"İlk görüşmede hedef, mevcut teknoloji ve teslim sorumlulukları netleştirilir. Ücret, takvim ve iş bölümü yazılı kapsam üzerinden kararlaştırılır.":"The first discussion clarifies the goal, current stack and delivery responsibilities. Fees, timeline and ownership are agreed against a written scope.",
"Ajans ortaklığını konuşalım ↗":"Discuss an agency partnership ↗","İlgili proje örneklerini inceleyin ↗":"View relevant project examples ↗",
"Ajans / white-label iş ortaklığı":"Agency / white-label partnership","İş ortaklığı modelini inceleyin ↗":"Explore the partner model ↗"
},
de:{
"Uluslararası ekipler için":"Für internationale Teams","uzaktan yazılım partneri.":"Ihr Remote-Entwicklungspartner.",
"BTMCode, dijital ajanslar ve büyüyen işletmeler için web uygulamaları, API/CRM entegrasyonları ve AI destekli iş akışları geliştirir. Kapsamı baştan netleştirir, geliştirmeyi doğrudan yürütür ve teslimatı dokümante eder.":"BTMCode entwickelt Webanwendungen, API-/CRM-Integrationen und KI-gestützte Workflows für Digitalagenturen und wachsende Unternehmen. Der Umfang wird vorab festgelegt, die Entwicklung direkt umgesetzt und die Übergabe dokumentiert.",
"Proje talebini başlat ↗":"Projektanfrage starten ↗","Ajans ortaklığını keşfet ↗":"Agenturpartnerschaft entdecken ↗",
"Ajansınızın teknik teslim kapasitesini büyütün.":"Erweitern Sie die technische Lieferkapazität Ihrer Agentur.",
"Tasarım, strateji ve müşteri ilişkisi sizde kalsın. BTMCode, yoğun dönemlerde veya uzmanlık gerektiğinde web ve yazılım teslimatına proje bazlı destek verir. White-label çalışma modeli, NDA, iletişim ve kod sahipliği her proje başlamadan önce yazılı olarak netleştirilir.":"Design, Strategie und Kundenbeziehung bleiben bei Ihnen. BTMCode unterstützt Ihre Web- und Softwareprojekte bei Kapazitätsengpässen oder speziellem Fachbedarf. White-Label-Modell, NDA, Kommunikation und Code-Eigentum werden vor jedem Projekt schriftlich vereinbart.",
"Ek geliştirme kapasitesi":"Zusätzliche Entwicklungskapazität","Ekibiniz yoğunken React/Next.js arayüzleri, web uygulamaları ve mevcut projelerin geliştirme işlerini belirli bir kapsamla üstlenirim.":"Bei hoher Auslastung übernehme ich klar abgegrenzte React-/Next.js-Oberflächen, Webanwendungen und Feature-Arbeiten an bestehenden Projekten.",
"Entegrasyon ve otomasyon":"Integrationen und Automatisierung","Mevcut araçları API üzerinden bağlar; CRM, veri akışı ve tekrarlayan iş süreçleri için ihtiyaca göre AI destekli entegrasyonlar geliştiririm.":"Ich verbinde bestehende Tools über APIs und entwickle passende KI-Integrationen für CRM, Datenflüsse und wiederkehrende Abläufe.",
"Mevcut projeyi devralma":"Übernahme bestehender Codebases","Yayına çıkmayan, bakım bekleyen veya başka geliştiriciden devralınması gereken kod tabanını inceler; riskleri ve uygulanabilir sonraki adımları raporlarım.":"Ich prüfe blockierte, wartungsbedürftige oder von anderen Entwicklern zu übernehmende Codebases und dokumentiere Risiken sowie nächste Schritte.",
"İlk görüşmede hedef, mevcut teknoloji ve teslim sorumlulukları netleştirilir. Ücret, takvim ve iş bölümü yazılı kapsam üzerinden kararlaştırılır.":"Im Erstgespräch werden Ziel, Technologie-Stack und Lieferverantwortung geklärt. Honorar, Zeitplan und Aufgabenteilung werden anhand eines schriftlichen Umfangs vereinbart.",
"Ajans ortaklığını konuşalım ↗":"Agenturpartnerschaft besprechen ↗","İlgili proje örneklerini inceleyin ↗":"Passende Projektbeispiele ansehen ↗","Ajans / white-label iş ortaklığı":"Agentur- / White-Label-Partnerschaft","İş ortaklığı modelini inceleyin ↗":"Partnerschaftsmodell ansehen ↗"
},
fr:{
"Uluslararası ekipler için":"Pour les équipes internationales","uzaktan yazılım partneri.":"votre partenaire technique à distance.",
"BTMCode, dijital ajanslar ve büyüyen işletmeler için web uygulamaları, API/CRM entegrasyonları ve AI destekli iş akışları geliştirir. Kapsamı baştan netleştirir, geliştirmeyi doğrudan yürütür ve teslimatı dokümante eder.":"BTMCode développe des applications web, des intégrations API/CRM et des flux de travail assistés par l’IA pour les agences digitales et les entreprises en croissance. Le périmètre est défini en amont, le développement est réalisé directement et la livraison est documentée.",
"Proje talebini başlat ↗":"Démarrer une demande de projet ↗","Ajans ortaklığını keşfet ↗":"Découvrir le partenariat agence ↗",
"Ajansınızın teknik teslim kapasitesini büyütün.":"Renforcez la capacité de livraison technique de votre agence.",
"Tasarım, strateji ve müşteri ilişkisi sizde kalsın. BTMCode, yoğun dönemlerde veya uzmanlık gerektiğinde web ve yazılım teslimatına proje bazlı destek verir. White-label çalışma modeli, NDA, iletişim ve kod sahipliği her proje başlamadan önce yazılı olarak netleştirilir.":"Gardez la conception, la stratégie et la relation client. BTMCode apporte un soutien au développement web et logiciel lorsque votre équipe est saturée ou qu’une expertise spécifique est nécessaire. Le modèle en marque blanche, la NDA, la communication et la propriété du code sont définis par écrit avant chaque mission.",
"Ek geliştirme kapasitesi":"Capacité de développement supplémentaire","Ekibiniz yoğunken React/Next.js arayüzleri, web uygulamaları ve mevcut projelerin geliştirme işlerini belirli bir kapsamla üstlenirim.":"Lorsque votre équipe est très sollicitée, je prends en charge des interfaces React/Next.js, des applications web et des évolutions de projets existants dans un périmètre défini.",
"Entegrasyon ve otomasyon":"Intégrations et automatisation","Mevcut araçları API üzerinden bağlar; CRM, veri akışı ve tekrarlayan iş süreçleri için ihtiyaca göre AI destekli entegrasyonlar geliştiririm.":"Je relie les outils existants via API et développe des intégrations adaptées à vos CRM, flux de données et tâches répétitives avec l’aide de l’IA.",
"Mevcut projeyi devralma":"Reprise de code existant","Yayına çıkmayan, bakım bekleyen veya başka geliştiriciden devralınması gereken kod tabanını inceler; riskleri ve uygulanabilir sonraki adımları raporlarım.":"J’examine les projets bloqués, à maintenir ou à reprendre d’un autre développeur, puis documente les risques et les prochaines étapes réalistes.",
"İlk görüşmede hedef, mevcut teknoloji ve teslim sorumlulukları netleştirilir. Ücret, takvim ve iş bölümü yazılı kapsam üzerinden kararlaştırılır.":"Le premier échange clarifie l’objectif, la stack et les responsabilités. Le tarif, le calendrier et la répartition du travail sont convenus sur la base d’un périmètre écrit.",
"Ajans ortaklığını konuşalım ↗":"Discuter d’un partenariat agence ↗","İlgili proje örneklerini inceleyin ↗":"Voir des exemples de projets ↗","Ajans / white-label iş ortaklığı":"Partenariat agence / marque blanche","İş ortaklığı modelini inceleyin ↗":"Découvrir le modèle de partenariat ↗"
},
ru:{
"Uluslararası ekipler için":"Для международных команд","uzaktan yazılım partneri.":"ваш удалённый технический партнёр.",
"BTMCode, dijital ajanslar ve büyüyen işletmeler için web uygulamaları, API/CRM entegrasyonları ve AI destekli iş akışları geliştirir. Kapsamı baştan netleştirir, geliştirmeyi doğrudan yürütür ve teslimatı dokümante eder.":"BTMCode разрабатывает веб-приложения, интеграции API/CRM и рабочие процессы с поддержкой ИИ для digital-агентств и растущих компаний. Объём работ согласуется заранее, разработка ведётся напрямую, передача документируется.",
"Proje talebini başlat ↗":"Отправить запрос на проект ↗","Ajans ortaklığını keşfet ↗":"Узнать о партнёрстве с агентствами ↗",
"Ajansınızın teknik teslim kapasitesini büyütün.":"Увеличьте технические возможности вашего агентства.",
"Tasarım, strateji ve müşteri ilişkisi sizde kalsın. BTMCode, yoğun dönemlerde veya uzmanlık gerektiğinde web ve yazılım teslimatına proje bazlı destek verir. White-label çalışma modeli, NDA, iletişim ve kod sahipliği her proje başlamadan önce yazılı olarak netleştirilir.":"Дизайн, стратегия и отношения с клиентом остаются у вас. BTMCode помогает с веб- и программной разработкой при высокой загрузке или необходимости специальной экспертизы. White-label-модель, NDA, коммуникация и права на код письменно согласуются до начала каждого проекта.",
"Ek geliştirme kapasitesi":"Дополнительные ресурсы разработки","Ekibiniz yoğunken React/Next.js arayüzleri, web uygulamaları ve mevcut projelerin geliştirme işlerini belirli bir kapsamla üstlenirim.":"При высокой загрузке команды я беру на себя согласованные задачи по React/Next.js, веб-приложениям и развитию существующих проектов.",
"Entegrasyon ve otomasyon":"Интеграции и автоматизация","Mevcut araçları API üzerinden bağlar; CRM, veri akışı ve tekrarlayan iş süreçleri için ihtiyaca göre AI destekli entegrasyonlar geliştiririm.":"Я связываю существующие инструменты через API и создаю интеграции с ИИ для CRM, потоков данных и повторяющихся процессов.",
"Mevcut projeyi devralma":"Передача существующей кодовой базы","Yayına çıkmayan, bakım bekleyen veya başka geliştiriciden devralınması gereken kod tabanını inceler; riskleri ve uygulanabilir sonraki adımları raporlarım.":"Я проверяю проекты, которые не вышли в релиз, требуют поддержки или передаются от другого разработчика, и описываю риски и дальнейшие шаги.",
"İlk görüşmede hedef, mevcut teknoloji ve teslim sorumlulukları netleştirilir. Ücret, takvim ve iş bölümü yazılı kapsam üzerinden kararlaştırılır.":"На первой встрече уточняются цель, стек и ответственность за поставку. Стоимость, сроки и распределение задач согласуются письменно.",
"Ajans ortaklığını konuşalım ↗":"Обсудить партнёрство ↗","İlgili proje örneklerini inceleyin ↗":"Посмотреть примеры проектов ↗","Ajans / white-label iş ortaklığı":"Партнёрство с агентством / white-label","İş ortaklığı modelini inceleyin ↗":"Изучить модель партнёрства ↗"
},
zh:{
"Uluslararası ekipler için":"面向国际团队","uzaktan yazılım partneri.":"您的远程软件工程合作伙伴。",
"BTMCode, dijital ajanslar ve büyüyen işletmeler için web uygulamaları, API/CRM entegrasyonları ve AI destekli iş akışları geliştirir. Kapsamı baştan netleştirir, geliştirmeyi doğrudan yürütür ve teslimatı dokümante eder.":"BTMCode 为数字代理机构和成长型企业开发 Web 应用、API/CRM 集成以及 AI 工作流。项目范围提前明确，由工程师直接开发，并提供文档化交付。",
"Proje talebini başlat ↗":"提交项目需求 ↗","Ajans ortaklığını keşfet ↗":"了解代理机构合作 ↗",
"Ajansınızın teknik teslim kapasitesini büyütün.":"扩展您的代理机构技术交付能力。",
"Tasarım, strateji ve müşteri ilişkisi sizde kalsın. BTMCode, yoğun dönemlerde veya uzmanlık gerektiğinde web ve yazılım teslimatına proje bazlı destek verir. White-label çalışma modeli, NDA, iletişim ve kod sahipliği her proje başlamadan önce yazılı olarak netleştirilir.":"设计、策略和客户关系由您掌控。团队工作繁忙或需要专业技术时，BTMCode 可按项目提供网站和软件开发支持。白标合作、保密协议、沟通方式及代码所有权均在项目开始前以书面形式约定。",
"Ek geliştirme kapasitesi":"额外开发产能","Ekibiniz yoğunken React/Next.js arayüzleri, web uygulamaları ve mevcut projelerin geliştirme işlerini belirli bir kapsamla üstlenirim.":"当您的团队任务繁重时，我可以按明确范围承接 React/Next.js 界面、Web 应用和现有项目功能开发。",
"Entegrasyon ve otomasyon":"集成与自动化","Mevcut araçları API üzerinden bağlar; CRM, veri akışı ve tekrarlayan iş süreçleri için ihtiyaca göre AI destekli entegrasyonlar geliştiririm.":"通过 API 连接现有工具，并为 CRM、数据流和重复流程开发合适的 AI 集成。",
"Mevcut projeyi devralma":"接手现有代码库","Yayına çıkmayan, bakım bekleyen veya başka geliştiriciden devralınması gereken kod tabanını inceler; riskleri ve uygulanabilir sonraki adımları raporlarım.":"检查未发布、需要维护或需要从其他开发者手中接管的代码库，并记录风险与可行的后续步骤。",
"İlk görüşmede hedef, mevcut teknoloji ve teslim sorumlulukları netleştirilir. Ücret, takvim ve iş bölümü yazılı kapsam üzerinden kararlaştırılır.":"首次沟通将明确目标、技术栈和交付职责。费用、时间表与分工根据书面范围确认。",
"Ajans ortaklığını konuşalım ↗":"洽谈代理合作 ↗","İlgili proje örneklerini inceleyin ↗":"查看相关项目案例 ↗","Ajans / white-label iş ortaklığı":"代理机构 / 白标合作","İş ortaklığı modelini inceleyin ↗":"查看合作模式 ↗"
},
sv:{
"Uluslararası ekipler için":"För internationella team","uzaktan yazılım partneri.":"er externa utvecklingspartner.",
"BTMCode, dijital ajanslar ve büyüyen işletmeler için web uygulamaları, API/CRM entegrasyonları ve AI destekli iş akışları geliştirir. Kapsamı baştan netleştirir, geliştirmeyi doğrudan yürütür ve teslimatı dokümante eder.":"BTMCode bygger webbapplikationer, API- och CRM-integrationer samt AI-stödda arbetsflöden för digitalbyråer och växande företag. Omfattningen klargörs i förväg, utvecklingen hanteras direkt och överlämningen dokumenteras.",
"Proje talebini başlat ↗":"Starta en projektförfrågan ↗","Ajans ortaklığını keşfet ↗":"Utforska byråsamarbete ↗",
"Ajansınızın teknik teslim kapasitesini büyütün.":"Utöka byråns tekniska leveranskapacitet.",
"Tasarım, strateji ve müşteri ilişkisi sizde kalsın. BTMCode, yoğun dönemlerde veya uzmanlık gerektiğinde web ve yazılım teslimatına proje bazlı destek verir. White-label çalışma modeli, NDA, iletişim ve kod sahipliği her proje başlamadan önce yazılı olarak netleştirilir.":"Behåll design, strategi och kundrelationen. BTMCode stöttar med webb- och mjukvaruutveckling vid hög belastning eller när specialistkompetens behövs. White-label-upplägg, NDA, kommunikation och kodägande fastställs skriftligt före varje uppdrag.",
"Ek geliştirme kapasitesi":"Extra utvecklingskapacitet","Ekibiniz yoğunken React/Next.js arayüzleri, web uygulamaları ve mevcut projelerin geliştirme işlerini belirli bir kapsamla üstlenirim.":"När teamet har mycket att göra kan jag ta avgränsade uppdrag inom React/Next.js, webbappar och vidareutveckling av befintliga projekt.",
"Entegrasyon ve otomasyon":"Integrationer och automatisering","Mevcut araçları API üzerinden bağlar; CRM, veri akışı ve tekrarlayan iş süreçleri için ihtiyaca göre AI destekli entegrasyonlar geliştiririm.":"Jag kopplar ihop befintliga verktyg via API och bygger lämpliga AI-integrationer för CRM, dataflöden och återkommande processer.",
"Mevcut projeyi devralma":"Övertagande av befintlig kodbas","Yayına çıkmayan, bakım bekleyen veya başka geliştiriciden devralınması gereken kod tabanını inceler; riskleri ve uygulanabilir sonraki adımları raporlarım.":"Jag granskar projekt som fastnat, behöver underhåll eller ska tas över från en annan utvecklare och dokumenterar risker och nästa steg.",
"İlk görüşmede hedef, mevcut teknoloji ve teslim sorumlulukları netleştirilir. Ücret, takvim ve iş bölümü yazılı kapsam üzerinden kararlaştırılır.":"Det första samtalet klargör mål, teknikstack och leveransansvar. Pris, tidsplan och ansvarsfördelning avtalas utifrån en skriftlig omfattning.",
"Ajans ortaklığını konuşalım ↗":"Diskutera ett byråsamarbete ↗","İlgili proje örneklerini inceleyin ↗":"Se relevanta projekt ↗","Ajans / white-label iş ortaklığı":"Byrå- / white-label-samarbete","İş ortaklığı modelini inceleyin ↗":"Utforska partnerskapsmodellen ↗"
}
};
for (const locale of LOCALES) Object.assign(dictionaries[locale] || {}, agencyPartnerTranslations[locale] || {});
const agencyMeta={
en:["Agency Software Development Partner | BTMCode","Remote web development, API/CRM integrations and AI workflow support for digital agencies and growing businesses."],
de:["Technischer Entwicklungspartner für Agenturen | BTMCode","Remote-Webentwicklung, API-/CRM-Integrationen und KI-Workflows für Digitalagenturen und wachsende Unternehmen."],
fr:["Partenaire technique pour agences digitales | BTMCode","Développement web à distance, intégrations API/CRM et automatisations IA pour agences et entreprises en croissance."],
ru:["Технический партнёр для digital-агентств | BTMCode","Удалённая веб-разработка, интеграции API/CRM и автоматизация с ИИ для агентств и растущих компаний."],
zh:["数字代理机构技术开发伙伴 | BTMCode","为数字代理机构和成长型企业提供远程 Web 开发、API/CRM 集成及 AI 工作流支持。"],
sv:["Teknisk utvecklingspartner för byråer | BTMCode","Fjärrutveckling av webb, API- och CRM-integrationer samt AI-arbetsflöden för digitalbyråer och växande företag."]
};
for (const locale of LOCALES) { if (agencyMeta[locale]) { meta[locale]["/services/"] = agencyMeta[locale][0]; descriptions[locale]["/services/"] = agencyMeta[locale][1]; } }




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
function translateAttributes(html, dict) {
  return html.replace(/\b(placeholder|aria-label|title|alt)=(["'])(.*?)\2/gi, (all, name, quote, value) => {
    if (!Object.prototype.hasOwnProperty.call(dict, value)) return all;
    return name + "=\"" + escapeHtml(dict[value]) + "\"";
  });
}

function translateJsonLd(html, dict) {
  return html.replace(/(<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>)([\s\S]*?)(<\/script>)/gi, (all, open, source, close) => {
    try {
      const data = JSON.parse(source);
      const translate = value => {
        if (typeof value === "string") return Object.prototype.hasOwnProperty.call(dict, value) ? dict[value] : value;
        if (Array.isArray(value)) return value.map(translate);
        if (value && typeof value === "object") {
          for (const key of Object.keys(value)) value[key] = translate(value[key]);
        }
        return value;
      };
      return open + JSON.stringify(translate(data)) + close;
    } catch (error) {
      return all;
    }
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
    if (href.startsWith("//") || /^\/(assets|api|admin)(\/|$)/.test(href) || ["/favicon.svg","/manifest.webmanifest","/robots.txt","/sitemap.xml"].includes(href)) return all;
    if (/^\/(en|de|fr|ru|zh|sv)(\/|$)/.test(href)) return all;
    return "href=" + q + localizedPath(locale,href) + q;
  });
}
function addAlternates(html, route) {
  const codes = ["tr","en","de","fr","ru","zh","sv"];
  const links = codes.map(code => {
    const url = "https://btmcode.vercel.app" + (code === "tr" ? route : localizedPath(code,route));
    const hreflang = code === "zh" ? "zh-CN" : code;
    return '<link rel="alternate" hreflang="' + hreflang + '" href="' + url + '">';
  });
  links.push('<link rel="alternate" hreflang="x-default" href="https://btmcode.vercel.app' + route + '">');
  html = html.replace(/<link\b[^>]*rel=["']alternate["'][^>]*>/gi,"");
  return html.replace("</head>",links.join("")+"</head>");
}
function localizeHtml(source,locale,route) {
  const dict = locale === "sv" ? Object.assign({}, dictionaries.en || {}, dictionaries.sv || {}) : (dictionaries[locale] || {});
  let html = translateText(source,dict);
  html = translateAttributes(html,dict);
  html = translateJsonLd(html,dict);
  const title = (meta[locale] && meta[locale][route]) || ("BTMCode | " + locale.toUpperCase());
  const description = descriptions[locale] && descriptions[locale][route];
  html = html.replace(/<html\b([^>]*)\blang=["'][^"']*["']/i,'<html$1lang="' + (locale === "zh" ? "zh-CN" : locale) + '"');
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
      if (["admin","api","en","de","fr","ru","zh","sv"].includes(entry.name)) continue;
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

  const sitemapPath = path.join(PUBLIC, "sitemap.xml");
  let sitemap = await fs.readFile(sitemapPath, "utf8");
  const buildDate = new Date().toISOString().slice(0, 10);
  sitemap = sitemap.replace(/<lastmod>[^<]+<\/lastmod>/g, "<lastmod>" + buildDate + "</lastmod>");
  const baseUrl = "https://btmcode.vercel.app/";
  const toSwedishUrl = loc => {
    let route = loc.startsWith(baseUrl) ? loc.slice(baseUrl.length) : "";
    route = route.replace(/^(en|de|fr|ru|zh|sv)(?=\/|$)/, "");
    return baseUrl + "sv/" + route;
  };
  const urlBlocks = [...sitemap.matchAll(/<url>[\s\S]*?<\/url>/g)].map(match => match[0]);
  const svBlocks = [];
  for (const originalBlock of urlBlocks) {
    const loc = (originalBlock.match(/<loc>([^<]+)<\/loc>/) || [])[1] || "";
    const route = loc.startsWith(baseUrl) ? loc.slice(baseUrl.length) : "";
    if (!/^(en|de|fr|ru|zh|sv)(?=\/|$)/.test(route)) {
      const svLoc = toSwedishUrl(loc);
      let clone = originalBlock.replace(loc, svLoc);
      clone = clone.replace(/hreflang="sv" href="[^"]+"/, 'hreflang="sv" href="' + svLoc + '"');
      svBlocks.push(clone);
    }
  }
  sitemap = sitemap.replace(/<url>[\s\S]*?<\/url>/g, originalBlock => {
    const loc = (originalBlock.match(/<loc>([^<]+)<\/loc>/) || [])[1] || "";
    const svLoc = toSwedishUrl(loc);
    const alternate = '<xhtml:link rel="alternate" hreflang="sv" href="' + svLoc + '" />';
    if (/hreflang="sv"/.test(originalBlock)) {
      return originalBlock.replace(/<xhtml:link rel="alternate" hreflang="sv" href="[^"]+" \/>/, alternate);
    }
    return originalBlock.replace(/<xhtml:link rel="alternate" hreflang="x-default"/, alternate + '\n    <xhtml:link rel="alternate" hreflang="x-default"');
  });
  if (svBlocks.length) sitemap = sitemap.replace("</urlset>", svBlocks.join("\n") + "\n</urlset>");
  await fs.writeFile(sitemapPath, sitemap, "utf8");
  console.log("Generated " + count + " localized HTML pages for " + LOCALES.length + " locales.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
