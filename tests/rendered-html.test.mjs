import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the finished portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Nouraldin Farge/);
  assert.match(html, /I build React &amp; TypeScript products/);
  assert.match(html, /DrawScope/);
  assert.match(html, /GameVault/);
  assert.match(html, /Day-Trading Teacher/);
  assert.match(html, /Research Studio/);
  assert.match(html, /AI-ASSISTED DEVELOPMENT/);
  assert.match(html, /Active source, backed by evidence\./);
  assert.match(html, /Media Scout Downloader/);
  assert.match(html, /Targeted critical modules—not the entire extension—achieved 91\.74% statement\/line coverage/);
  assert.match(html, /Real unpacked-extension Playwright smoke test/);
  assert.match(html, /Public-source Windows alpha/);
  assert.match(html, /EPUB, PDF, text, and authorized audio/);
  assert.match(html, /No tag, GitHub Release, supported binary, or Chrome Web Store listing/);
  assert.match(html, /40 of 40 unit, policy, persistence, and shell tests passed/);
  assert.match(html, /Windows CI candidate is unsigned/);
  assert.match(html, /SiteWipe/);
  assert.match(html, /installed-browser, accessibility, media, privacy-hosting, and release-approval gates remain open/);
  assert.match(html, /\/projects\/media-scout-inspector\.png/);
  assert.match(html, /\/projects\/reader-library-overview\.jpg/);
  assert.match(html, /href="https:\/\/github\.com\/NouraldinFarge\/Reader"/);
  assert.match(html, /href="https:\/\/github\.com\/NouraldinFarge\/media-scout-downloader"/);
  assert.match(html, /href="https:\/\/github\.com\/NouraldinFarge\/SiteWipe"/);
  assert.match(html, /None is presented as a shipped product, supported download, or extension-store release/);
  assert.match(html, /href="https:\/\/github\.com\/NouraldinFarge\/portfolio-source"/);
  assert.match(html, /Skip to main content/);
  assert.match(html, /<main id="main-content" tabindex="-1">/);
  assert.ok(html.indexOf("<header") < html.indexOf("<main"), "header must precede the main landmark");
  assert.ok(html.indexOf("</main>") < html.indexOf("<footer"), "footer must follow the main landmark");
  assert.match(html, />Projects<\/a>/);
  assert.match(html, /Shipped products with proof attached\./);
  assert.doesNotMatch(html, />Work<\/a>|Products with proof attached|Chinese\/English/);
  assert.match(html, /rel="canonical" href="https:\/\/nouraldinfarge\.github\.io"/);
  assert.match(html, /rel="icon" href="(?:https:\/\/nouraldinfarge\.github\.io)?\/favicon\.svg"/);
  assert.match(html, /name="theme-color" content="#f2f3e9"/);
  assert.match(html, /aria-label="View source for DrawScope"/);
  assert.match(html, /React &amp; TypeScript Software Engineer/);
  assert.match(html, /github-social-preview-software-engineer-v2\.png/);
  assert.match(html, /v0\.6\.5/);
  assert.match(html, /v0\.3\.5/);
  assert.match(html, /v0\.36\.0/);
  assert.match(html, /v0\.1\.0-alpha\.24/);
  assert.match(html, /href="\/research-studio\/"/);
  assert.match(html, /stages untrusted model output/);
  assert.match(html, /bilingual Chinese-and-English/);
  assert.match(html, /31,521 series and 2,242,170 episodes/);
  assert.doesNotMatch(html, /<strong>alpha\.21<\/strong>|v0\.1\.0-alpha\.21|Chinese and English catalog/);
  assert.match(html, /Download v0\.6\.5/);
  assert.match(html, /Download v0\.3\.5/);
  assert.match(html, /Download v0\.36\.0/);
  assert.match(html, /13-lesson/);
  assert.match(html, /August 15, 2026/);
  assert.equal((html.match(/download="Nouraldin-Farge-Resume\.pdf"/g) ?? []).length, 3);
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, 6);
  assert.doesNotMatch(html, /rel="preload" href="\/projects\//);
  assert.match(html, /local JSON/);
  assert.doesNotMatch(html, /cloud accounts required/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("server-renders the Research Studio project page", async () => {
  const response = await render("/research-studio");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Research Studio turns AI output/);
  assert.match(html, /private alpha\.24/i);
  assert.match(html, /deterministic synthetic catalog/i);
  assert.match(html, /Human approval as storage authority/);
  assert.match(html, /1-title pilot/);
  assert.match(html, /application-private named pipe/i);
  assert.match(html, /rel="canonical" href="https:\/\/nouraldinfarge\.github\.io\/research-studio\/"/);
  assert.match(html, /product-approved-exports\.jpg/);
  assert.doesNotMatch(html, /v0\.1\.0-alpha\.21|Extensions_Programs|C:\\Users|chatgpt\.com\/c\//i);
});
