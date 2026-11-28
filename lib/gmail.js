"use strict";
const crypto = require("node:crypto");
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_ENDPOINT = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
class GmailDeliveryError extends Error {
  constructor(code,statusCode){super(code);this.name="GmailDeliveryError";this.code=code;this.statusCode=statusCode||502;}
}
function isEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||""));}
function isGmailConfigured(env=process.env){return Boolean(env.GMAIL_CLIENT_ID&&env.GMAIL_CLIENT_SECRET&&env.GMAIL_REFRESH_TOKEN&&isEmail(env.GMAIL_SENDER_EMAIL)&&isEmail(env.CONTACT_TO_EMAIL));}
function wrapBase64(value){return Buffer.from(String(value),"utf8").toString("base64").match(/.{1,76}/g)?.join("\r\n")||"";}
function encodeSubject(value){return "=?UTF-8?B?"+Buffer.from(value,"utf8").toString("base64")+"?=";}
function buildRawMessage({from,to,replyTo,subject,text,html}){
 const boundary="btmcode_"+crypto.randomBytes(16).toString("hex");
 const safeSubject=String(subject||"").replace(/[\r\n]+/g," ").slice(0,180);
 const safeFrom=String(from||"").replace(/[\r\n<>]/g,"");
 const safeTo=String(to||"").replace(/[\r\n<>]/g,"");
 const safeReplyTo=String(replyTo||"").replace(/[\r\n<>]/g,"");
 const plain=String(text||"").replace(/\r\n?/g,"\n");
 const markup=String(html||"").replace(/\r\n?/g,"\n");
 const parts=[
  "From: BTMCode <"+safeFrom+">","To: "+safeTo,"Reply-To: "+safeReplyTo,
  "Subject: "+encodeSubject(safeSubject),"MIME-Version: 1.0",
  'Content-Type: multipart/alternative; boundary="'+boundary+'"',"",
  "--"+boundary,'Content-Type: text/plain; charset="UTF-8"',"Content-Transfer-Encoding: base64","",wrapBase64(plain),
  "--"+boundary,'Content-Type: text/html; charset="UTF-8"',"Content-Transfer-Encoding: base64","",wrapBase64(markup),
  "--"+boundary+"--",""
 ];
 return Buffer.from(parts.join("\r\n"),"utf8").toString("base64url");
}
async function readJson(response){return response.json().catch(()=>({}));}
async function getAccessToken(env=process.env,fetchImpl=global.fetch){
 if(!env.GMAIL_CLIENT_ID||!env.GMAIL_CLIENT_SECRET||!env.GMAIL_REFRESH_TOKEN)throw new GmailDeliveryError("email_not_configured",503);
 let response;
 try{
  response=await fetchImpl(TOKEN_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({
   client_id:env.GMAIL_CLIENT_ID,client_secret:env.GMAIL_CLIENT_SECRET,refresh_token:env.GMAIL_REFRESH_TOKEN,grant_type:"refresh_token"
  }).toString()});
 }catch{throw new GmailDeliveryError("gmail_auth_unavailable",502);}
 const payload=await readJson(response);
 if(!response.ok||!payload.access_token){
  if(payload.error==="invalid_grant"||payload.error==="unauthorized_client")throw new GmailDeliveryError("gmail_reauth_required",503);
  throw new GmailDeliveryError("gmail_auth_failed",502);
 }
 return payload.access_token;
}
async function sendGmailMessage({env=process.env,fetchImpl=global.fetch,recipient,sender,replyTo,subject,text,html}){
 if(!isGmailConfigured(env))throw new GmailDeliveryError("email_not_configured",503);
 if(!isEmail(recipient||env.CONTACT_TO_EMAIL)||!isEmail(sender||env.GMAIL_SENDER_EMAIL)||!isEmail(replyTo))throw new GmailDeliveryError("email_validation_failed",422);
 const accessToken=await getAccessToken(env,fetchImpl);
 const raw=buildRawMessage({from:sender||env.GMAIL_SENDER_EMAIL,to:recipient||env.CONTACT_TO_EMAIL,replyTo,subject,text,html});
 let response;
 try{
  response=await fetchImpl(GMAIL_SEND_ENDPOINT,{method:"POST",headers:{"Authorization":"Bearer "+accessToken,"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({raw})});
 }catch{throw new GmailDeliveryError("gmail_delivery_unavailable",502);}
 const payload=await readJson(response);
 if(!response.ok||!payload.id){
  if(response.status===401||(payload.error&&payload.error.status==="UNAUTHENTICATED"))throw new GmailDeliveryError("gmail_reauth_required",503);
  if(response.status===429)throw new GmailDeliveryError("gmail_rate_limited",429);
  throw new GmailDeliveryError("gmail_delivery_failed",502);
 }
 return{id:payload.id,threadId:payload.threadId||null};
}
module.exports={GmailDeliveryError,TOKEN_ENDPOINT,GMAIL_SEND_ENDPOINT,buildRawMessage,getAccessToken,isGmailConfigured,sendGmailMessage};
