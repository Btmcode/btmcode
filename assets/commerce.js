(() => {
  "use strict";
  const locale=((location.pathname.match(/^\/(en|de|fr|ru)(?:\/|$)/)||[])[1])||"tr";
  const labels={
    tr:{whatsapp:"WhatsApp üzerinden yaz",direct:"Doğrudan geliştirici",scope:"Önce kapsam, sonra teklif",https:"HTTPS bağlantısı",privacy:"Gizlilik tercihleri",contact:"Proje görüşmesi",whatsappIntro:"WhatsApp ile doğrudan iletişim"},
    en:{whatsapp:"Message on WhatsApp",direct:"Direct developer access",scope:"Scope before proposal",https:"HTTPS connection",privacy:"Privacy choices",contact:"Discuss a project",whatsappIntro:"Direct WhatsApp contact"},
    de:{whatsapp:"Per WhatsApp schreiben",direct:"Direkter Entwicklerkontakt",scope:"Erst Umfang, dann Angebot",https:"HTTPS-Verbindung",privacy:"Datenschutzeinstellungen",contact:"Projekt besprechen",whatsappIntro:"Direkter WhatsApp-Kontakt"},
    fr:{whatsapp:"Écrire sur WhatsApp",direct:"Contact direct avec le développeur",scope:"Périmètre avant devis",https:"Connexion HTTPS",privacy:"Choix de confidentialité",contact:"Parler du projet",whatsappIntro:"Contact direct sur WhatsApp"},
    ru:{whatsapp:"Написать в WhatsApp",direct:"Прямой контакт с разработчиком",scope:"Сначала объём, затем оценка",https:"HTTPS-соединение",privacy:"Настройки конфиденциальности",contact:"Обсудить проект",whatsappIntro:"Прямая связь через WhatsApp"}
  };
  const t=labels[locale]||labels.en;
  const phone="905386949469";
  const message=encodeURIComponent(locale==="tr"?"Merhaba, BTMCode üzerinden bir yazılım projesi hakkında görüşmek istiyorum.":"Hello, I would like to discuss a software project with BTMCode.");
  const whatsapp="https://wa.me/"+phone+"?text="+message;
  document.addEventListener("DOMContentLoaded",()=>{
    const footer=document.querySelector(".footer");
    if(footer){
      const trust=document.createElement("div");
      trust.className="btm-trust";
      trust.innerHTML='<div class="btm-trust__badges"><span><i aria-hidden="true">✓</i>'+t.https+'</span><span><i aria-hidden="true">◆</i>'+t.direct+'</span><span><i aria-hidden="true">↗</i>'+t.scope+'</span></div><div class="btm-trust__links"><a href="'+whatsapp+'" target="_blank" rel="noopener noreferrer">'+t.whatsapp+'</a><button type="button" data-consent-open>'+t.privacy+'</button><a href="/privacy/">'+(locale==="tr"?"Gizlilik":locale==="de"?"Datenschutz":locale==="fr"?"Confidentialité":locale==="ru"?"Конфиденциальность":"Privacy")+'</a></div>';
      const bottom=footer.querySelector(".footer-bottom");
      if(bottom && !footer.querySelector(".btm-trust")) bottom.before(trust);
    }
    const details=document.querySelector(".contact-details");
    if(details && !details.querySelector("[data-whatsapp-contact]")){
      const item=document.createElement("div");
      item.className="contact-detail";
      item.setAttribute("data-whatsapp-contact","");
      item.innerHTML='<span>'+t.whatsappIntro+'</span><strong><a class="project-link" href="'+whatsapp+'" target="_blank" rel="noopener noreferrer">'+t.whatsapp+' ↗</a></strong>';
      details.appendChild(item);
    }
  });
})();