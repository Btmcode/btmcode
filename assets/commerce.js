(() => {
  "use strict";
  const locale=((location.pathname.match(/^\/(en|de|fr|ru|zh)(?:\/|$)/)||[])[1])||"tr";
  const path=location.pathname.replace(/^\/(en|de|fr|ru|zh)(?=\/|$)/,"")||"/";
  const prefix=locale==="tr"?"":"/"+locale;
  const labels={
    tr:{whatsapp:"WhatsApp üzerinden yaz",direct:"Doğrudan geliştirici",scope:"Önce kapsam, sonra teklif",https:"HTTPS bağlantısı",privacy:"Gizlilik tercihleri",whatsappIntro:"WhatsApp ile doğrudan iletişim",europe:"Türkiye merkezli bağımsız yazılım geliştiricisi olarak Avrupa'daki ekiplerle uzaktan çalışıyorum.",retainerTitle:"Yayından sonra da yanınızdayım.",retainerIntro:"Yazılımın yayına alınması işin sonu değil. İhtiyaca göre aylık bakım, iyileştirme ve otomasyon desteği sunuyorum.",careTitle:"Product Care",careText:"Planlı bakım, bağımlılık kontrolleri, teknik iyileştirmeler ve kararlaştırılmış destek kapsamı.",growthTitle:"Growth & Analytics",growthText:"İzinli analitik veriler, teknik SEO kontrolleri ve dönüşüm odaklı iyileştirme backlog'u.",automationTitle:"Automation Care",automationText:"AI ve iş akışı otomasyonlarının gözden geçirilmesi, hata iyileştirmeleri ve yeni entegrasyonlar.",retainerCta:"Aylık çalışma modelini konuşalım ↗"},
    en:{whatsapp:"Message on WhatsApp",direct:"Direct developer access",scope:"Scope before proposal",https:"HTTPS connection",privacy:"Privacy choices",whatsappIntro:"Direct WhatsApp contact",europe:"Independent software developer based in Türkiye, working remotely with teams across Europe.",retainerTitle:"Support beyond launch.",retainerIntro:"Launch is not the end of the work. I offer monthly maintenance, product improvements and automation support shaped around your needs.",careTitle:"Product Care",careText:"Planned maintenance, dependency reviews, technical improvements and an agreed support allowance.",growthTitle:"Growth & Analytics",growthText:"Consent-based analytics, technical SEO reviews and a conversion-focused improvement backlog.",automationTitle:"Automation Care",automationText:"Reviews of AI and workflow automations, issue improvements and new integrations.",retainerCta:"Discuss a monthly engagement ↗"},
    de:{whatsapp:"Per WhatsApp schreiben",direct:"Direkter Entwicklerkontakt",scope:"Erst Umfang, dann Angebot",https:"HTTPS-Verbindung",privacy:"Datenschutzeinstellungen",whatsappIntro:"Direkter WhatsApp-Kontakt",europe:"Unabhängiger Softwareentwickler mit Sitz in Türkiye, der remote mit Teams in Europa arbeitet.",retainerTitle:"Auch nach dem Launch an Ihrer Seite.",retainerIntro:"Mit dem Launch endet die Arbeit nicht. Ich biete monatliche Wartung, Produktverbesserungen und Automatisierungsunterstützung nach Bedarf.",careTitle:"Product Care",careText:"Geplante Wartung, Prüfung von Abhängigkeiten, technische Verbesserungen und vereinbarter Supportumfang.",growthTitle:"Growth & Analytics",growthText:"Einwilligungsbasierte Analysen, technische SEO-Prüfungen und eine auf Conversion ausgerichtete Aufgabenliste.",automationTitle:"Automation Care",automationText:"Überprüfung von KI- und Workflow-Automatisierungen, Fehlerbehebungen und neue Integrationen.",retainerCta:"Monatliche Zusammenarbeit besprechen ↗"},
    fr:{whatsapp:"Écrire sur WhatsApp",direct:"Contact direct avec le développeur",scope:"Périmètre avant devis",https:"Connexion HTTPS",privacy:"Choix de confidentialité",whatsappIntro:"Contact direct sur WhatsApp",europe:"Développeur logiciel indépendant basé en Türkiye, travaillant à distance avec des équipes européennes.",retainerTitle:"À vos côtés après le lancement.",retainerIntro:"Le lancement ne marque pas la fin du travail. Je propose maintenance mensuelle, améliorations produit et accompagnement en automatisation.",careTitle:"Product Care",careText:"Maintenance planifiée, vérification des dépendances, améliorations techniques et périmètre de support convenu.",growthTitle:"Growth & Analytics",growthText:"Analyses avec consentement, contrôles SEO techniques et backlog d'améliorations axé sur la conversion.",automationTitle:"Automation Care",automationText:"Revue des automatisations IA et métier, corrections et nouvelles intégrations.",retainerCta:"Parler d'un accompagnement mensuel ↗"},
    ru:{whatsapp:"Написать в WhatsApp",direct:"Прямой контакт с разработчиком",scope:"Сначала объём, затем оценка",https:"HTTPS-соединение",privacy:"Настройки конфиденциальности",whatsappIntro:"Прямая связь через WhatsApp",europe:"Независимый разработчик ПО из Türkiye, работающий удалённо с командами по всей Европе.",retainerTitle:"Поддержка и после запуска.",retainerIntro:"Запуск — не конец работы. Предлагаю ежемесячное обслуживание, улучшение продукта и поддержку автоматизации.",careTitle:"Product Care",careText:"Плановое обслуживание, проверка зависимостей, технические улучшения и согласованный объём поддержки.",growthTitle:"Growth & Analytics",growthText:"Аналитика с согласия пользователя, технический SEO-аудит и список улучшений для конверсии.",automationTitle:"Automation Care",automationText:"Проверка ИИ- и бизнес-автоматизаций, исправление ошибок и новые интеграции.",retainerCta:"Обсудить ежемесячное сотрудничество ↗"},
    zh:{whatsapp:"通过 WhatsApp 联系",direct:"直接联系开发者",scope:"先明确范围，再提供方案",https:"HTTPS 安全连接",privacy:"隐私偏好设置",whatsappIntro:"通过 WhatsApp 直接联系",europe:"我是一名常驻土耳其的独立软件开发者，远程与欧洲各地的团队合作。",retainerTitle:"产品上线后，持续为您提供支持。",retainerIntro:"产品上线并不意味着工作结束。我可根据您的需求提供月度维护、产品优化和自动化支持。",careTitle:"产品维护",careText:"定期维护、依赖项检查、技术优化，以及双方约定的支持范围。",growthTitle:"增长与分析",growthText:"在获得同意后进行数据分析、技术 SEO 检查，并制定以转化效果为导向的优化计划。",automationTitle:"自动化维护",automationText:"检查 AI 与业务流程自动化、修复问题并添加新的系统集成。",retainerCta:"洽谈月度合作 ↗"}
  };
  const t=labels[locale]||labels.en;
  const phone="905386949469";
  const message=encodeURIComponent(locale==="tr"?"Merhaba, BTMCode üzerinden bir yazılım projesi hakkında görüşmek istiyorum.":"Hello, I would like to discuss a software project with BTMCode.");
  const whatsapp="https://wa.me/"+phone+"?text="+message;
  document.addEventListener("DOMContentLoaded",()=>{
    const footer=document.querySelector(".footer");
    if(footer&&!footer.querySelector(".btm-trust")){
      const trust=document.createElement("div");
      trust.className="btm-trust";
      trust.innerHTML='<div class="btm-trust__badges"><span><i aria-hidden="true">✓</i>'+t.https+'</span><span><i aria-hidden="true">◆</i>'+t.direct+'</span><span><i aria-hidden="true">↗</i>'+t.scope+'</span></div><div class="btm-trust__links"><a href="'+whatsapp+'" target="_blank" rel="noopener noreferrer">'+t.whatsapp+'</a><button type="button" data-consent-open>'+t.privacy+'</button><a href="'+prefix+'/privacy/">'+(locale==="tr"?"Gizlilik":locale==="de"?"Datenschutz":locale==="fr"?"Confidentialité":locale==="ru"?"Конфиденциальность":locale==="zh"?"隐私":"Privacy")+'</a></div>';
      const bottom=footer.querySelector(".footer-bottom");
      if(bottom) bottom.before(trust);
      const settings=trust.querySelector("[data-consent-open]");
      if(settings) settings.addEventListener("click",()=>{if(window.BTMConsent)window.BTMConsent.open(true);});
    }
    const details=document.querySelector(".contact-details");
    if(details&&!details.querySelector("[data-whatsapp-contact]")){
      const item=document.createElement("div");
      item.className="contact-detail";
      item.setAttribute("data-whatsapp-contact","");
      item.innerHTML='<span>'+t.whatsappIntro+'</span><strong><a class="project-link" href="'+whatsapp+'" target="_blank" rel="noopener noreferrer">'+t.whatsapp+' ↗</a></strong>';
      details.appendChild(item);
    }
    const hero=document.querySelector(".hero .hero-copy");
    if(hero&&!document.querySelector("[data-europe-positioning]")){
      const note=document.createElement("p");
      note.className="europe-positioning";
      note.setAttribute("data-europe-positioning","");
      note.textContent=t.europe;
      hero.after(note);
    }
    if(path==="/services/"){
      const grid=document.querySelector(".service-grid");
      if(grid&&!document.querySelector(".retainer-section")){
        const section=document.createElement("section");
        section.className="section retainer-section";
        section.innerHTML='<div class="container"><div class="section-head"><div><div class="section-kicker">MONTHLY PARTNERSHIP</div><h2>'+t.retainerTitle+'</h2></div><p class="section-intro">'+t.retainerIntro+'</p></div><div class="retainer-grid"><article><span>01 / MONTHLY</span><h3>'+t.careTitle+'</h3><p>'+t.careText+'</p></article><article><span>02 / MONTHLY</span><h3>'+t.growthTitle+'</h3><p>'+t.growthText+'</p></article><article><span>03 / MONTHLY</span><h3>'+t.automationTitle+'</h3><p>'+t.automationText+'</p></article></div><a class="button" href="'+prefix+'/contact/">'+t.retainerCta+'</a></div>';
        grid.closest(".section")?.after(section);
      }
    }
  });
})();