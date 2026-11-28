const rateLimits=new Map();
const allowedHosts=new Set(["btmcode.vercel.app","btmcode-portfolio.vercel.app","btmcode-ahmets-projects-5558123d.vercel.app"]);
const {isGmailConfigured,sendGmailMessage}=require("../lib/gmail");
function respond(res,status,payload){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(payload));}
function clean(value,max){return String(value==null?"":value).trim().slice(0,max);}
function isEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||""));}
function escapeHtml(value){return value.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
module.exports=async function handler(req,res){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return respond(res,405,{ok:false,error:"method_not_allowed"});}
 const host=String(req.headers.host||"").split(":")[0].toLowerCase();
 const isProjectPreview=host.endsWith(".vercel.app")&&host.startsWith("btmcode-");
 if(!allowedHosts.has(host)&&!isProjectPreview)return respond(res,403,{ok:false,error:"host_not_allowed"});
 const origin=req.headers.origin;
 if(origin){try{if(new URL(origin).host.toLowerCase()!==host)return respond(res,403,{ok:false,error:"origin_not_allowed"});}catch{return respond(res,403,{ok:false,error:"origin_not_allowed"});}}
 if(!String(req.headers["content-type"]||"").toLowerCase().includes("application/json"))return respond(res,415,{ok:false,error:"json_required"});
 let body=req.body;
 if(typeof body==="string"){try{body=JSON.parse(body);}catch{return respond(res,400,{ok:false,error:"invalid_json"});}}
 if(!body||typeof body!=="object"||Array.isArray(body))return respond(res,400,{ok:false,error:"invalid_payload"});
 if(clean(body.website,200))return respond(res,200,{ok:true});
 const name=clean(body.name,120),email=clean(body.email,180),company=clean(body.company,160),service=clean(body.service,100),message=clean(body.message,4000).replace(/\r/g,"");
 if(name.length<2||!isEmail(email)||message.length<20)return respond(res,422,{ok:false,error:"validation_failed"});
 const allowedServices=new Set(["","web-application","saas-platform","ai-automation","technical-improvement","agency-development-partner","other","Web uygulaması","SaaS / platform","AI / otomasyon","Teknik iyileştirme","Diğer","Web application","SaaS / platform","AI / automation","Technical improvement","Other","Webanwendung","SaaS / Plattform","KI / Automatisierung","Technische Verbesserung","Sonstiges","Application web","SaaS / plateforme","IA / automatisation","Amélioration technique","Autre","Веб-приложение","SaaS / платформа","ИИ / автоматизация","Техническое улучшение","Другое"]);
 if(!allowedServices.has(service))return respond(res,422,{ok:false,error:"validation_failed"});
 const ip=String(req.headers["x-forwarded-for"]||"unknown").split(",")[0].trim(),now=Date.now(),current=rateLimits.get(ip);
 if(current&&current.resetAt>now&&current.count>=5){res.setHeader("Retry-After",String(Math.ceil((current.resetAt-now)/1000)));return respond(res,429,{ok:false,error:"rate_limited"});}
 if(!current||current.resetAt<=now)rateLimits.set(ip,{count:1,resetAt:now+600000});else rateLimits.set(ip,{count:current.count+1,resetAt:current.resetAt});
 const recipient=clean(process.env.CONTACT_TO_EMAIL,254),sender=clean(process.env.GMAIL_SENDER_EMAIL,254);
 if(!isGmailConfigured(process.env)||!isEmail(recipient)||!isEmail(sender))return respond(res,503,{ok:false,error:"email_not_configured"});
 const safeName=escapeHtml(name),safeEmail=escapeHtml(email),safeCompany=escapeHtml(company||"—"),safeService=escapeHtml(service||"Not specified"),safeMessage=escapeHtml(message).replace(/\n/g,"<br>");
 const subjectName=name.replace(/[\r\n]/g," ").slice(0,80);
 const text=["New BTMCode project enquiry","","Name: "+name,"Email: "+email,"Company: "+(company||"—"),"Area: "+(service||"Not specified"),"","Project summary:",message].join("\n");
 try{
  const result=await sendGmailMessage({recipient,sender,replyTo:email,subject:"New BTMCode project enquiry — "+subjectName,text,
   html:"<div style=\"font-family:Arial,sans-serif;line-height:1.6;color:#172018\"><h2>New BTMCode project enquiry</h2><p><b>Name:</b> "+safeName+"</p><p><b>Email:</b> "+safeEmail+"</p><p><b>Company:</b> "+safeCompany+"</p><p><b>Area:</b> "+safeService+"</p><hr><p><b>Project summary</b></p><p>"+safeMessage+"</p></div>"});
  return respond(res,200,{ok:true,id:result.id});
 }catch(error){const code=error&&error.code?error.code:"gmail_delivery_failed";console.error("Gmail API contact delivery failed",code);return respond(res,error&&error.statusCode?error.statusCode:502,{ok:false,error:code});}
};
