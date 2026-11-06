const rateLimits = new Map();
const allowedHosts = new Set([
  "btmcode.vercel.app",
  "btmcode-portfolio.vercel.app",
  "btmcode-ahmets-projects-5558123d.vercel.app"
]);

function respond(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}
function clean(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, function (ch) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return respond(res, 405, {ok:false, error:"method_not_allowed"});
  }

  const host = String(req.headers.host || "").split(":")[0].toLowerCase();
  const isProjectPreview = host.endsWith(".vercel.app") && host.startsWith("btmcode-");
  if (!allowedHosts.has(host) && !isProjectPreview) {
    return respond(res, 403, {ok:false, error:"host_not_allowed"});
  }

  const origin = req.headers.origin;
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      if (originHost !== host) return respond(res, 403, {ok:false, error:"origin_not_allowed"});
    } catch (error) {
      return respond(res, 403, {ok:false, error:"origin_not_allowed"});
    }
  }

  if (!String(req.headers["content-type"] || "").toLowerCase().includes("application/json")) {
    return respond(res, 415, {ok:false, error:"json_required"});
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (error) {
      return respond(res, 400, {ok:false, error:"invalid_json"});
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return respond(res, 400, {ok:false, error:"invalid_payload"});
  }

  // A filled honeypot is silently discarded to avoid teaching bots the validation rules.
  if (clean(body.website, 200)) return respond(res, 200, {ok:true});

  const name = clean(body.name, 120);
  const email = clean(body.email, 180);
  const company = clean(body.company, 160);
  const service = clean(body.service, 100);
  const message = clean(body.message, 4000).replace(/\r/g, "");

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 20) {
    return respond(res, 422, {ok:false, error:"validation_failed"});
  }

  const allowedServices = new Set([
    "", "Web uygulaması", "SaaS / platform", "AI / otomasyon", "Teknik iyileştirme", "Diğer",
    "Web application", "SaaS / platform", "AI / automation", "Technical improvement", "Other",
    "Webanwendung", "SaaS / Plattform", "KI / Automatisierung", "Technische Verbesserung", "Sonstiges",
    "Application web", "SaaS / plateforme", "IA / automatisation", "Amélioration technique", "Autre",
    "Веб-приложение", "SaaS / платформа", "ИИ / автоматизация", "Техническое улучшение", "Другое"
  ]);
  if (!allowedServices.has(service)) return respond(res, 422, {ok:false, error:"validation_failed"});

  // Best-effort per-function-instance limit; this is not a globally shared rate limiter.
  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const now = Date.now();
  const current = rateLimits.get(ip);
  if (current && current.resetAt > now && current.count >= 5) {
    res.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
    return respond(res, 429, {ok:false, error:"rate_limited"});
  }
  if (!current || current.resetAt <= now) rateLimits.set(ip, {count:1, resetAt:now + 600000});
  else rateLimits.set(ip, {count:current.count + 1, resetAt:current.resetAt});

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return respond(res, 503, {ok:false, error:"email_not_configured"});
  const recipient = process.env.CONTACT_TO_EMAIL || "devcloudpy@gmail.com";

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeCompany = escapeHtml(company || "—");
  const safeService = escapeHtml(service || "Not specified");
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  const subjectName = name.replace(/[\r\n]/g, " ").slice(0, 80);

  const text = [
    "New BTMCode project enquiry",
    "",
    "Name: " + name,
    "Email: " + email,
    "Company: " + (company || "—"),
    "Area: " + (service || "Not specified"),
    "",
    "Project summary:",
    message
  ].join("\n");

  try {
    const providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "BTMCode <onboarding@resend.dev>",
        to: [recipient],
        reply_to: email,
        subject: "New BTMCode project enquiry — " + subjectName,
        text: text,
        html: "<div style=\"font-family:Arial,sans-serif;line-height:1.6;color:#172018\"><h2>New BTMCode project enquiry</h2><p><b>Name:</b> " + safeName + "</p><p><b>Email:</b> " + safeEmail + "</p><p><b>Company:</b> " + safeCompany + "</p><p><b>Area:</b> " + safeService + "</p><hr><p><b>Project summary</b></p><p>" + safeMessage + "</p></div>"
      })
    });
    const result = await providerResponse.json().catch(function () { return {}; });
    if (!providerResponse.ok) {
      console.error("Resend request failed", providerResponse.status, result && result.name ? result.name : "provider_error");
      return respond(res, 502, {ok:false, error:"email_provider_error"});
    }
    return respond(res, 200, {ok:true, id:result.id || null});
  } catch (error) {
    console.error("Contact mail delivery failed", error && error.name ? error.name : "unknown_error");
    return respond(res, 502, {ok:false, error:"email_provider_error"});
  }
};