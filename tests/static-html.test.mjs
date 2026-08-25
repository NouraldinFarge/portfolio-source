import assert from "node:assert/strict";
import test from "node:test";
import {
  assertStaticDocumentPolicy,
  createNotFoundDocument,
  inspectStaticDocument,
  sanitizeRenderedDocument,
} from "../scripts/static-html.mjs";

const canonicalUrl = "https://nouraldinfarge.github.io";

function documentShell(head = "", body = "") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">${head}</head><body>${body}</body></html>`;
}

test("structurally removes active runtime markup and promotes only safe metadata", () => {
  const rendered = documentShell(
    '<link rel="modulepreload stylesheet" href="/runtime.js"><style>body{display:none}</style>',
    [
      '<main onmouseover="alert(1)" style="display:none"><a href="http://localhost/work" data-precedence="x">Portfolio</a></main>',
      '<script>first()</script><script\n data-x="1">second()</script><SCRIPT>third()</SCRIPT>',
      '<div hidden id="S:0"><div hidden>',
      '<title>Nouraldin Farge — Software Engineer</title>',
      '<meta name="description" content="Evidence-backed software">',
      '<link rel="canonical" href="http://localhost" data-vinext-streamed-icon="icon:0">',
      '<script>metadataRuntime()</script>',
      '</div></div>',
      '<div hidden><template><script>templateRuntime()</script></template></div>',
      '<script type="application/ld+json">{"@context":"https://schema.org","safe":"<\\/script>"}</script>',
    ].join(""),
  );

  const output = sanitizeRenderedDocument(rendered, { canonicalUrl });
  const inspection = assertStaticDocumentPolicy(output);
  assert.deepEqual(inspection, {
    scriptCount: 1,
    structuredDataCount: 1,
    executableScriptCount: 0,
    styleCount: 0,
    templateCount: 0,
    modulePreloadCount: 0,
    blockedElementCount: 0,
    foreignElementCount: 0,
    activeMetaPragmaCount: 0,
    forbiddenAttributes: [],
    titleCount: 1,
    headTitleCount: 1,
    streamedMetadataContainerCount: 0,
  });
  assert.ok(output.includes("Nouraldin Farge — Software Engineer"));
  assert.ok(output.includes('href="https://nouraldinfarge.github.io/work"'));
  assert.ok(output.includes('rel="canonical" href="https://nouraldinfarge.github.io"'));
  for (const forbiddenText of [
    "first()",
    "second()",
    "third()",
    "metadataRuntime()",
    "templateRuntime()",
    "data-vinext-streamed-icon",
    "data-precedence",
    "onmouseover",
    "display:none",
  ]) {
    assert.ok(!output.includes(forbiddenText), `removed content leaked: ${forbiddenText}`);
  }
});

test("rejects malformed structured data, active URLs, embeds, foreign content, and ambiguous metadata", () => {
  assert.throws(
    () => sanitizeRenderedDocument(
      documentShell(
        "<title>Test</title>",
        '<script type="application/ld+json">not-json</script>',
      ),
      { canonicalUrl },
    ),
    /Invalid JSON-LD/,
  );
  assert.throws(
    () => sanitizeRenderedDocument(
      documentShell(
        "<title>Test</title>",
        '<a href="java\nscript:alert(1)">Unsafe</a><script type="application/ld+json">{}</script>',
      ),
      { canonicalUrl },
    ),
    /unsafe href URL protocol/,
  );
  assert.throws(
    () => sanitizeRenderedDocument(
      documentShell(
        "<title>Test</title>",
        '<iframe src="https://example.com"></iframe><script type="application/ld+json">{}</script>',
      ),
      { canonicalUrl },
    ),
    /blocked <iframe>/,
  );
  assert.throws(
    () => sanitizeRenderedDocument(
      documentShell(
        '<title>Test</title><meta http-equiv="refresh" content="0;url=https://example.com">',
        '<script type="application/ld+json">{}</script>',
      ),
      { canonicalUrl },
    ),
    /active meta pragma/,
  );
  assert.throws(
    () => sanitizeRenderedDocument(
      documentShell(
        "<title>Test</title>",
        '<svg><script>alert(1)</script></svg><script type="application/ld+json">{}</script>',
      ),
      { canonicalUrl },
    ),
    /foreign <svg>/,
  );
  assert.throws(
    () => sanitizeRenderedDocument(
      documentShell(
        "",
        '<div hidden><div hidden><title>Test</title><section>unexpected</section></div></div><script type="application/ld+json">{}</script>',
      ),
      { canonicalUrl },
    ),
    /Unexpected <section>/,
  );
});

test("builds a noindex 404 document without carrying active or social metadata", () => {
  const staticHtml = sanitizeRenderedDocument(
    documentShell(
      '<title>Portfolio</title><meta name="description" content="Original"><meta name="robots" content="index, follow"><meta property="og:title" content="Portfolio"><meta name="twitter:card" content="summary"><link rel="canonical" href="https://nouraldinfarge.github.io">',
      '<main>Portfolio</main><script type="application/ld+json">{"@context":"https://schema.org"}</script>',
    ),
    { canonicalUrl },
  );
  const notFound = createNotFoundDocument(staticHtml);
  const inspection = inspectStaticDocument(notFound);
  assert.equal(inspection.scriptCount, 0);
  assert.equal(inspection.titleCount, 1);
  assert.equal(inspection.headTitleCount, 1);
  assertStaticDocumentPolicy(notFound, { requireStructuredData: false });
  assert.ok(notFound.includes("Page not found — Nouraldin Farge"));
  assert.ok(notFound.includes('content="noindex, follow"'));
  assert.ok(notFound.includes("Return home"));
  assert.ok(!notFound.includes('rel="canonical"'));
  assert.ok(!notFound.includes('property="og:'));
  assert.ok(!notFound.includes('name="twitter:'));
});
