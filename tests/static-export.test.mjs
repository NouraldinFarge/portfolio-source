import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { assertStaticDocumentPolicy } from "../scripts/static-html.mjs";

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(entryPath));
    } else {
      files.push(entryPath);
    }
  }
  return files;
}

function collectLocalReferences(content) {
  const references = new Set();
  for (const match of content.matchAll(/(?:href|src)="\/([^"?#]+)(?:[?#][^"]*)?"/g)) {
    references.add(match[1]);
  }
  for (const match of content.matchAll(/url\(\s*["']?\/([^"')?#]+)(?:[?#][^"')]*)?["']?\s*\)/g)) {
    references.add(match[1]);
  }
  for (const match of content.matchAll(/https:\/\/nouraldinfarge\.github\.io\/([^"'()\s<>?#]+)(?:[?#][^"'()\s<>]*)?/g)) {
    references.add(match[1]);
  }
  return references;
}

test("exports a self-contained GitHub Pages site", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "nouraldin-portfolio-export-"));
  const output = path.join(temporaryRoot, "site");

  try {
    await execFileAsync(process.execPath, [path.join(root, "scripts", "export-github-pages.mjs"), output], { cwd: root });

    const indexHtml = await readFile(path.join(output, "index.html"), "utf8");
    const researchStudioHtml = await readFile(
      path.join(output, "research-studio", "index.html"),
      "utf8",
    );
    const notFoundHtml = await readFile(path.join(output, "404.html"), "utf8");
    const files = await listFiles(output);
    const relativeFiles = files.map((file) => path.relative(output, file).replaceAll("\\", "/"));

    assert.notEqual(notFoundHtml, indexHtml);
    assert.match(
      indexHtml,
      /<head>[\s\S]*<title>Nouraldin Farge — React &amp; TypeScript Software Engineer<\/title>[\s\S]*<\/head>/,
    );
    for (const exportedPage of [indexHtml, researchStudioHtml]) {
      const inspection = assertStaticDocumentPolicy(exportedPage);
      assert.equal(inspection.scriptCount, 1, "only structured JSON-LD may remain");
      assert.equal(inspection.structuredDataCount, 1);
    }
    assertStaticDocumentPolicy(notFoundHtml, { requireStructuredData: false });
    assert.match(notFoundHtml, /<title>Page not found — Nouraldin Farge<\/title>/);
    assert.match(notFoundHtml, /content="noindex, follow"/);
    assert.match(notFoundHtml, />Return home<\/a>/);
    assert.doesNotMatch(notFoundHtml, /rel="canonical"|property="og:|name="twitter:/);

    assert.ok(relativeFiles.includes("robots.txt"));
    assert.ok(relativeFiles.includes("sitemap.xml"));
    assert.ok(relativeFiles.includes("research-studio/index.html"));
    assert.ok(relativeFiles.includes("projects/research-studio/product-approved-review.jpg"));
    assert.ok(relativeFiles.includes("projects/media-scout-inspector.png"));
    assert.ok(relativeFiles.includes("projects/reader-library-overview.jpg"));
    assert.ok(!relativeFiles.includes("og.png"));
    assert.ok(relativeFiles.includes("github-social-preview-software-engineer-v2.png"));
    assert.ok(!relativeFiles.includes("github-social-preview-product-v1.png"));
    assert.ok(relativeFiles.includes("portfolio-build.json"));
    assert.deepEqual(
      await readFile(path.join(output, "PROJECT-MEDIA-NOTICES.md")),
      await readFile(path.join(root, "PROJECT-MEDIA-NOTICES.md")),
      "the Pages export must preserve project-media provenance and license notices",
    );
    assert.deepEqual(
      await readFile(path.join(output, "CONTENT-LICENSE.md")),
      await readFile(path.join(root, "CONTENT-LICENSE.md")),
      "the Pages export must preserve the portfolio content-license boundary",
    );
    assert.ok(!relativeFiles.some((file) => file.endsWith(".js")), "static output must not retain unused JavaScript bundles");
    assert.deepEqual(
      await readFile(path.join(output, "Nouraldin-Farge-Resume.pdf")),
      await readFile(path.join(root, "public", "Nouraldin-Farge-Resume.pdf")),
      "the Pages export must include the current portfolio résumé",
    );
    const buildMetadata = JSON.parse(
      await readFile(path.join(output, "portfolio-build.json"), "utf8"),
    );
    assert.equal(buildMetadata.schemaVersion, 1);
    assert.equal(
      buildMetadata.sourceRepository,
      "https://github.com/NouraldinFarge/portfolio-source",
    );
    assert.match(buildMetadata.sourceRevision, /^[0-9a-f]{40}$/);
    assert.ok(["clean", "dirty"].includes(buildMetadata.sourceTreeState));

    const references = new Set([
      ...collectLocalReferences(indexHtml),
      ...collectLocalReferences(researchStudioHtml),
      ...collectLocalReferences(notFoundHtml),
    ]);
    for (const cssPath of [...references].filter((reference) => reference.endsWith(".css"))) {
      const css = await readFile(path.join(output, cssPath), "utf8");
      for (const reference of collectLocalReferences(css)) {
        references.add(reference);
      }
    }

    for (const reference of references) {
      assert.ok(!reference.includes(".."), `unsafe exported reference: ${reference}`);
      await access(path.join(output, reference));
    }

    const robots = await readFile(path.join(output, "robots.txt"), "utf8");
    const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8");
    assert.match(robots, /Sitemap: https:\/\/nouraldinfarge\.github\.io\/sitemap\.xml/);
    assert.match(sitemap, /<loc>https:\/\/nouraldinfarge\.github\.io\/<\/loc>/);
    assert.match(
      sitemap,
      /<loc>https:\/\/nouraldinfarge\.github\.io\/research-studio\/<\/loc>/,
    );
    assert.match(researchStudioHtml, /Research Studio turns AI output/);
    assert.match(researchStudioHtml, /rel="canonical" href="https:\/\/nouraldinfarge\.github\.io\/research-studio\/"/);
    assert.doesNotMatch(researchStudioHtml, /localhost|_rsc|Extensions_Programs|C:\\Users/i);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("release export rejects an untracked public asset", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "nouraldin-portfolio-untracked-"));
  const output = path.join(temporaryRoot, "site");
  const sentinel = path.join(
    root,
    "public",
    `.release-export-untracked-${process.pid}-${Date.now()}.txt`,
  );

  try {
    await writeFile(sentinel, "untracked release input\n", "utf8");
    const { stdout: sourceStatus } = await execFileAsync(
      "git",
      ["status", "--porcelain=v1", "--untracked-files=all", "--", sentinel],
      { cwd: root },
    );
    assert.match(sourceStatus, /^\?\? /, "the regression sentinel must be visible to Git");

    await assert.rejects(
      execFileAsync(
        process.execPath,
        [path.join(root, "scripts", "export-github-pages.mjs"), "--require-clean", output],
        { cwd: root },
      ),
      /Release export requires a clean source tree with no non-ignored changes/,
    );
  } finally {
    await rm(sentinel, { force: true });
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
