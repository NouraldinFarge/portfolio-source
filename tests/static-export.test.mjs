import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

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
    const notFoundHtml = await readFile(path.join(output, "404.html"), "utf8");
    const files = await listFiles(output);
    const relativeFiles = files.map((file) => path.relative(output, file).replaceAll("\\", "/"));

    assert.notEqual(notFoundHtml, indexHtml);
    assert.match(notFoundHtml, /<title>Page not found — Nouraldin Farge<\/title>/);
    assert.match(notFoundHtml, /content="noindex, follow"/);
    assert.match(notFoundHtml, />Return home<\/a>/);
    assert.doesNotMatch(notFoundHtml, /rel="canonical"|property="og:|name="twitter:/);

    assert.ok(relativeFiles.includes("robots.txt"));
    assert.ok(relativeFiles.includes("sitemap.xml"));
    assert.ok(!relativeFiles.includes("og.png"));
    assert.ok(!relativeFiles.some((file) => file.endsWith(".js")), "static output must not retain unused JavaScript bundles");
    assert.deepEqual(
      await readFile(path.join(output, "Nouraldin-Farge-Resume.pdf")),
      await readFile(path.join(root, "public", "Nouraldin-Farge-Resume.pdf")),
      "the Pages export must include the current portfolio résumé",
    );

    const references = new Set([
      ...collectLocalReferences(indexHtml),
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
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
