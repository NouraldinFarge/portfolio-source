import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));
const axeSource = await readFile(
  fileURLToPath(import.meta.resolve("axe-core/axe.min.js")),
  "utf8",
);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".xml", "application/xml; charset=utf-8"],
]);

async function startStaticServer(directory) {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const decodedPath = decodeURIComponent(url.pathname);
      const relativePath = decodedPath === "/"
        ? "index.html"
        : decodedPath.endsWith("/")
          ? `${decodedPath.slice(1)}index.html`
          : decodedPath.slice(1);

      if (!relativePath || relativePath.split("/").includes("..") || path.isAbsolute(relativePath)) {
        response.writeHead(400).end("Bad request");
        return;
      }

      const filePath = path.join(directory, relativePath);
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        response.writeHead(404).end("Not found");
        return;
      }

      response.writeHead(200, {
        "content-type": contentTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream",
      });
      response.end(await readFile(filePath));
    } catch {
      response.writeHead(404).end("Not found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

test("exported pages pass automated Chrome accessibility checks", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "nouraldin-portfolio-a11y-"));
  const output = path.join(temporaryRoot, "site");
  let browser;
  let staticServer;

  try {
    await execFileAsync(process.execPath, [path.join(root, "scripts", "export-github-pages.mjs"), output], { cwd: root });
    staticServer = await startStaticServer(output);
    browser = await chromium.launch(process.env.CI ? {} : { channel: "chrome" });

    const cases = [
      ["home desktop", "/", { width: 1440, height: 1000 }],
      ["home mobile", "/", { width: 390, height: 844 }],
      ["Research Studio desktop", "/research-studio/", { width: 1440, height: 1000 }],
      ["Research Studio mobile", "/research-studio/", { width: 390, height: 844 }],
    ];

    for (const [label, pathname, viewport] of cases) {
      const page = await browser.newPage({ viewport });
      const response = await page.goto(`${staticServer.origin}${pathname}`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200, `${label} must load successfully`);
      await page.addScriptTag({ content: axeSource });

      const audit = await page.evaluate(async () => window.axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        },
      }));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      const landmarkCounts = await page.evaluate(() => ({
        h1: document.querySelectorAll("h1").length,
        main: document.querySelectorAll("main").length,
      }));
      const brokenImages = await page.evaluate(() => [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src));

      const violationSummary = audit.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.flatMap((node) => node.target),
      }));
      assert.deepEqual(violationSummary, [], `${label} Axe violations: ${JSON.stringify(violationSummary)}`);
      assert.equal(overflow, false, `${label} must not scroll horizontally`);
      assert.deepEqual(landmarkCounts, { h1: 1, main: 1 }, `${label} must expose one H1 and one main landmark`);
      assert.deepEqual(brokenImages, [], `${label} contains broken images`);
      await page.close();
    }
  } finally {
    await browser?.close();
    await staticServer?.close();
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
