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
  assert.match(html, /Skip to main content/);
  assert.match(html, /<main id="main-content" tabindex="-1">/);
  assert.ok(html.indexOf("<header") < html.indexOf("<main"), "header must precede the main landmark");
  assert.ok(html.indexOf("</main>") < html.indexOf("<footer"), "footer must follow the main landmark");
  assert.match(html, />Projects<\/a>/);
  assert.match(html, /Projects with proof attached\./);
  assert.doesNotMatch(html, />Work<\/a>|Products with proof attached|Chinese\/English/);
  assert.match(html, /rel="canonical" href="https:\/\/nouraldinfarge\.github\.io"/);
  assert.match(html, /rel="icon" href="https:\/\/nouraldinfarge\.github\.io\/favicon\.svg"/);
  assert.match(html, /name="theme-color" content="#f2f3e9"/);
  assert.match(html, /aria-label="View source for DrawScope"/);
  assert.match(html, /og-v2\.png/);
  assert.match(html, /v0\.6\.5/);
  assert.match(html, /v0\.3\.5/);
  assert.match(html, /v0\.32\.6/);
  assert.match(html, /v0\.1\.0-alpha\.21/);
  assert.match(html, /bilingual Chinese-and-English/);
  assert.match(html, /31,521 series and 2,242,170 episodes/);
  assert.doesNotMatch(html, /<strong>alpha\.21<\/strong>|Chinese and English catalog/);
  assert.match(html, /Download v0\.6\.5/);
  assert.match(html, /Download v0\.3\.5/);
  assert.match(html, /Download v0\.32\.6/);
  assert.equal((html.match(/download="Nouraldin-Farge-Resume\.pdf"/g) ?? []).length, 3);
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, 4);
  assert.doesNotMatch(html, /rel="preload" href="\/projects\//);
  assert.match(html, /local JSON/);
  assert.doesNotMatch(html, /cloud accounts required/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});
