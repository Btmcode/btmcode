const test = require("node:test");
const assert = require("node:assert/strict");
const handler = require("../api/contact");

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(value) { this.body = value || ""; },
    json() { return JSON.parse(this.body); }
  };
}

function makeRequest(overrides = {}) {
  return {
    method: "POST",
    headers: {
      host: "btmcode.vercel.app",
      origin: "https://btmcode.vercel.app",
      "content-type": "application/json",
      "x-forwarded-for": "198.51.100.10"
    },
    body: {
      name: "Test Visitor",
      email: "visitor@example.com",
      company: "Example Ltd",
      service: "Web application",
      message: "I need a new product website with a project enquiry workflow.",
      website: ""
    },
    ...overrides
  };
}

async function invoke(req) {
  const res = makeResponse();
  await handler(req, res);
  return res;
}

test("rejects non-POST methods", async () => {
  const res = await invoke(makeRequest({method:"GET"}));
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, "POST");
  assert.equal(res.json().error, "method_not_allowed");
});

test("rejects cross-origin submissions", async () => {
  const res = await invoke(makeRequest({
    headers: {
      host:"btmcode.vercel.app",
      origin:"https://attacker.example",
      "content-type":"application/json"
    }
  }));
  assert.equal(res.statusCode, 403);
  assert.equal(res.json().error, "origin_not_allowed");
});

test("requires JSON content type", async () => {
  const res = await invoke(makeRequest({
    headers: {
      host:"btmcode.vercel.app",
      origin:"https://btmcode.vercel.app",
      "content-type":"text/plain"
    }
  }));
  assert.equal(res.statusCode, 415);
  assert.equal(res.json().error, "json_required");
});

test("validates required contact fields", async () => {
  const res = await invoke(makeRequest({body:{name:"A",email:"bad",message:"short"}}));
  assert.equal(res.statusCode, 422);
  assert.equal(res.json().error, "validation_failed");
});

test("drops honeypot submissions without calling Resend", async () => {
  const oldFetch = global.fetch;
  let called = false;
  global.fetch = async () => { called = true; throw new Error("must not send"); };
  try {
    const res = await invoke(makeRequest({body:{...makeRequest().body,website:"filled by bot"}}));
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().ok, true);
    assert.equal(called, false);
  } finally {
    global.fetch = oldFetch;
  }
});

test("returns a clear unavailable response when the API key is missing", async () => {
  const oldKey = process.env.RESEND_API_KEY;
  const oldFetch = global.fetch;
  delete process.env.RESEND_API_KEY;
  global.fetch = async () => { throw new Error("must not call provider"); };
  try {
    const res = await invoke(makeRequest({headers:{...makeRequest().headers,"x-forwarded-for":"198.51.100.20"}}));
    assert.equal(res.statusCode, 503);
    assert.equal(res.json().error, "email_not_configured");
  } finally {
    if (oldKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = oldKey;
    global.fetch = oldFetch;
  }
});

test("sends only to the configured inbox and sets visitor as reply-to", async () => {
  const oldKey = process.env.RESEND_API_KEY;
  const oldInbox = process.env.CONTACT_TO_EMAIL;
  const oldFetch = global.fetch;
  process.env.RESEND_API_KEY = "test_key_never_real";
  process.env.CONTACT_TO_EMAIL = "devcloudpy@gmail.com";
  let request;
  global.fetch = async (url, options) => {
    request = {url,options,body:JSON.parse(options.body)};
    return {ok:true,status:200,json:async()=>({id:"email_test_123"})};
  };
  try {
    const res = await invoke(makeRequest({headers:{...makeRequest().headers,"x-forwarded-for":"198.51.100.30"}}));
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().ok, true);
    assert.equal(res.json().id, "email_test_123");
    assert.equal(request.url, "https://api.resend.com/emails");
    assert.deepEqual(request.body.to, ["devcloudpy@gmail.com"]);
    assert.equal(request.body.from, "BTMCode <onboarding@resend.dev>");
    assert.equal(request.body.reply_to, "visitor@example.com");
    assert.match(request.body.html, /Example Ltd/);
    assert.equal(request.options.headers.Authorization, "Bearer test_key_never_real");
  } finally {
    if (oldKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = oldKey;
    if (oldInbox === undefined) delete process.env.CONTACT_TO_EMAIL;
    else process.env.CONTACT_TO_EMAIL = oldInbox;
    global.fetch = oldFetch;
  }
});

test("does not forward unapproved service values", async () => {
  const res = await invoke(makeRequest({body:{...makeRequest().body,service:"Admin login"}}));
  assert.equal(res.statusCode, 422);
  assert.equal(res.json().error, "validation_failed");
});
