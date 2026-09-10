const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const agentic = require("../api/agentic");
const mcp = require("../api/mcp");

function response() {
  return { headers: {}, setHeader(key, value) { this.headers[key.toLowerCase()] = value; }, end(body = "") { this.body = body; } };
}

test("markdown negotiation returns markdown and varies by Accept", () => {
  const res = response();
  agentic({ query: { path: "/research" }, headers: { accept: "text/markdown, text/html;q=0.8" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["content-type"], "text/markdown; charset=utf-8");
  assert.equal(res.headers.vary, "Accept, Accept-Encoding");
  assert.match(res.body, /# Dev Jani Research/);
});

test("unknown paths have a real 404 and agent recovery links", () => {
  const res = response();
  agentic({ query: { path: "/not-a-real-page" }, headers: { accept: "text/markdown" } }, res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.headers["content-type"], "text/markdown; charset=utf-8");
  assert.match(res.body, /llms\.txt/);
  assert.match(res.body, /sitemap\.xml/);
});

test("browser requests preserve the existing static visual pages", () => {
  const res = response();
  agentic({ query: { path: "/projects" }, headers: { accept: "text/html" } }, res);
  assert.equal(res.statusCode, 307);
  assert.equal(res.headers.location, "/projects.html");
});

test("MCP endpoint completes initialization and lists its read-only tool", () => {
  const initialized = response();
  mcp({ method: "POST", body: { jsonrpc: "2.0", id: 1, method: "initialize" } }, initialized);
  assert.equal(JSON.parse(initialized.body).result.serverInfo.name, "dev-jani-portfolio");
  const listed = response();
  mcp({ method: "POST", body: { jsonrpc: "2.0", id: 2, method: "tools/list" } }, listed);
  assert.equal(JSON.parse(listed.body).result.tools[0].name, "get_portfolio");
});

test("machine-readable discovery files are valid and list the public trust pages", () => {
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(__dirname, "..", ".well-known", "mcp.json"), "utf8")));
  const sitemap = fs.readFileSync(path.join(__dirname, "..", "sitemap.xml"), "utf8");
  for (const page of ["/about", "/contact", "/privacy"]) assert.match(sitemap, new RegExp(page));
  const homepage = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(homepage, /application\/ld\+json/);
  assert.match(homepage, /rel="canonical"/);
  assert.match(homepage, /property="og:image"/);
});
