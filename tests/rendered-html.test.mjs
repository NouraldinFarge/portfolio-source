import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the finished portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Nouraldin Farge/);
  assert.match(html, /I build Windows software/);
  assert.match(html, /DrawScope/);
  assert.match(html, /GameVault/);
  assert.match(html, /Day-Trading Teacher/);
  assert.match(html, /Research Studio/);
  assert.match(html, /AI-ASSISTED DEVELOPMENT/);
  assert.match(html, /v0\.6\.5/);
  assert.match(html, /v0\.3\.5/);
  assert.match(html, /v0\.32\.6/);
  assert.match(html, /local JSON/);
  assert.doesNotMatch(html, /cloud accounts required/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});
