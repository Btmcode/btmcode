const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const PUBLIC = path.join(process.cwd(), "public");
const SOURCE = require("node:fs").readFileSync(path.join(PUBLIC, "assets/i18n.js"), "utf8");
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
    "Bu ilk sürümde reklam ve davranışsal takip servisleri kullanılmıyor. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Resend e-posta altyapısı üzerinden BTMCode e-posta adresine iletilir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz.":"This version does not use advertising or behavioural tracking. Contact form submissions are delivered to the BTMCode inbox through Resend so the enquiry can be answered. BTMCode does not store form submissions in a website database.",
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
    "Bu ilk sürümde reklam ve davranışsal takip servisleri kullanılmıyor. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Resend e-posta altyapısı üzerinden BTMCode e-posta adresine iletilir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz.":"Diese Version verwendet weder Werbung noch verhaltensbezogenes Tracking. Kontaktanfragen werden über Resend an das BTMCode-Postfach weitergeleitet. BTMCode speichert Formulareingaben nicht in einer Website-Datenbank.",
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
    "Bu ilk sürümde reklam ve davranışsal takip servisleri kullanılmıyor. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Resend e-posta altyapısı üzerinden BTMCode e-posta adresine iletilir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz.":"Cette version n’utilise ni publicité ni suivi comportemental. Les demandes du formulaire sont transmises à la boîte BTMCode via Resend. BTMCode ne stocke pas les formulaires dans une base de données du site.",
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
    "Bu ilk sürümde reklam ve davranışsal takip servisleri kullanılmıyor. İletişim formu aracılığıyla gönderilen bilgiler, talebinizi yanıtlamak amacıyla Resend e-posta altyapısı üzerinden BTMCode e-posta adresine iletilir. Form verileri BTMCode web sitesinde bir veritabanında saklanmaz.":"В этой версии не используются реклама и поведенческое отслеживание. Обращения из формы передаются в почтовый ящик BTMCode через Resend. BTMCode не хранит отправленные формы в базе данных сайта.",
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
};
for (const locale of LOCALES) Object.assign(dictionaries[locale], moreTranslations[locale]);


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
    if (href.startsWith("//") || /^\/(assets|api|admin)(\/|$)/.test(href) || ["/favicon.svg","/manifest.webmanifest","/robots.txt","/sitemap.xml"].includes(href)) return all;
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
