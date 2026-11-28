"use strict";
const SITEVERIFY_ENDPOINT="https://challenges.cloudflare.com/turnstile/v0/siteverify";
class TurnstileError extends Error {
  constructor(code,statusCode){super(code);this.name="TurnstileError";this.code=code;this.statusCode=statusCode||403;}
}
async function verifyTurnstileToken({token,secret,hostname,remoteIp,fetchImpl=global.fetch}) {
  if(!secret)throw new TurnstileError("spam_protection_not_configured",503);
  if(typeof token!=="string"||token.length<10||token.length>2048)throw new TurnstileError("spam_verification_required",403);
  let response;
  try{
    response=await fetchImpl(SITEVERIFY_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({secret,response:token,...(remoteIp?{remoteip:remoteIp}:{})})});
  }catch{throw new TurnstileError("spam_verification_unavailable",503);}
  let result={};try{result=await response.json();}catch{}
  if(!response.ok)throw new TurnstileError("spam_verification_unavailable",503);
  if(result.success!==true||String(result.hostname||"").toLowerCase()!==String(hostname||"").toLowerCase()||result.action!=="contact"){
    throw new TurnstileError("spam_verification_failed",403);
  }
  return{hostname:result.hostname,action:result.action,challengeTs:result.challenge_ts||null};
}
module.exports={SITEVERIFY_ENDPOINT,TurnstileError,verifyTurnstileToken};
