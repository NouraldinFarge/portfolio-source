import { execFile } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import {
  createNotFoundDocument,
  sanitizeRenderedDocument,
} from "./static-html.mjs";

const root = process.cwd();
const execFileAsync = promisify(execFile);
const argumentsList = process.argv.slice(2);
const requireClean = argumentsList.includes("--require-clean");
const outputArgument = argumentsList.find((argument) => argument !== "--require-clean");
const output = path.resolve(outputArgument ?? "github-pages-export");
const canonicalUrl = "https://nouraldinfarge.github.io";
const sourceRepository = "https://github.com/NouraldinFarge/portfolio-source";

async function resolveBuildMetadata() {
  const [{ stdout: revisionOutput }, { stdout: statusOutput }] = await Promise.all([
    execFileAsync("git", ["rev-parse", "HEAD"], { cwd: root }),
    execFileAsync("git", ["status", "--porcelain=v1", "--untracked-files=all"], { cwd: root }),
  ]);
  const sourceRevision = revisionOutput.trim();
  const sourceTreeState = statusOutput.trim() ? "dirty" : "clean";

  if (!/^[0-9a-f]{40}$/.test(sourceRevision)) {
    throw new Error(`Could not resolve a full source revision: ${sourceRevision}`);
  }
  if (requireClean && sourceTreeState !== "clean") {
    throw new Error("Release export requires a clean source tree with no non-ignored changes.");
  }

  return {
    schemaVersion: 1,
    sourceRepository,
    sourceRevision,
    sourceTreeState,
  };
}

const buildMetadata = await resolveBuildMetadata();

await mkdir(output, { recursive: true });

for (const relativePath of [
  "assets",
  "_next",
  "projects",
  "research-studio",
  "index.html",
  "404.html",
  "Nouraldin-Farge-Resume.pdf",
  "favicon.svg",
  "github-social-preview-product-v1.png",
  "github-social-preview-software-engineer-v2.png",
  "og.png",
  "portfolio-build.json",
  "CONTENT-LICENSE.md",
  "PROJECT-MEDIA-NOTICES.md",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  ".assetsignore",
  ".vite",
  ".nojekyll",
]) {
  await rm(path.join(output, relativePath), { recursive: true, force: true });
}

for (const relativePath of [
  "CONTENT-LICENSE.md",
  "PROJECT-MEDIA-NOTICES.md",
  "robots.txt",
  "sitemap.xml",
]) {
  await cp(
    relativePath.endsWith(".md")
      ? path.join(root, relativePath)
      : path.join(root, "dist", "client", relativePath),
    path.join(output, relativePath),
    { recursive: true },
  );
}

const workerUrl = `${pathToFileURL(path.join(root, "dist", "server", "index.js")).href}?static-export=${Date.now()}`;
const worker = (await import(workerUrl)).default;

async function renderStaticPage(pathname) {
  const response = await worker.fetch(
    new Request(`${canonicalUrl}${pathname}`),
    {},
    { waitUntil() {}, passThroughOnException() {} },
  );

  if (!response.ok) {
    throw new Error(`Static render for ${pathname} failed with HTTP ${response.status}`);
  }

  // Newer Vinext releases stream Next metadata into a hidden response fragment and
  // move it into <head> with client JavaScript. The deployed portfolio is deliberately
  // script-free, so parse the document, promote only semantic head nodes, and
  // remove active runtime content structurally before serialization.
  return sanitizeRenderedDocument(await response.text(), { canonicalUrl });
}

const html = await renderStaticPage("/");
const researchStudioHtml = await renderStaticPage("/research-studio");

function collectStaticReferences(content, sourcePath = "index.html") {
  const references = new Set();

  if (!sourcePath.endsWith(".css")) {
    for (const match of content.matchAll(/(?:^|["'(])\/([^"'()\s<>?#]+)(?:[?#][^"'()\s<>]*)?/g)) {
      if (!match[1].includes("..") && !match[1].endsWith("/")) {
        references.add(match[1]);
      }
    }
    for (const match of content.matchAll(/https:\/\/nouraldinfarge\.github\.io\/([^"'()\s<>?#]+)(?:[?#][^"'()\s<>]*)?/g)) {
      if (!match[1].includes("..") && !match[1].endsWith("/")) {
        references.add(match[1]);
      }
    }
  }

  if (sourcePath.endsWith(".css")) {
    for (const match of content.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) {
      const assetUrl = match[1];
      if (assetUrl.startsWith("data:") || assetUrl.startsWith("http:") || assetUrl.startsWith("https:") || assetUrl.startsWith("#")) {
        continue;
      }

      const resolved = assetUrl.startsWith("/")
        ? assetUrl.slice(1)
        : path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), assetUrl));
      if (!resolved.includes("..")) {
        references.add(resolved);
      }
    }
  }

  return references;
}

const pendingAssets = [
  ...new Set([
    ...collectStaticReferences(html),
    ...collectStaticReferences(researchStudioHtml, "research-studio/index.html"),
  ]),
];
const copiedAssets = new Set();

while (pendingAssets.length > 0) {
  const relativePath = pendingAssets.shift();
  if (!relativePath || copiedAssets.has(relativePath)) {
    continue;
  }
  if (relativePath.includes("..") || path.isAbsolute(relativePath)) {
    throw new Error(`Refusing to copy unsafe generated asset path: ${relativePath}`);
  }
  if (relativePath.endsWith(".js")) {
    throw new Error(`The static HTML unexpectedly references an executable bundle: ${relativePath}`);
  }

  const sourcePath = path.join(root, "dist", "client", relativePath);
  const destinationPath = path.join(output, relativePath);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await cp(sourcePath, destinationPath);
  copiedAssets.add(relativePath);

  if (relativePath.endsWith(".css")) {
    const css = await readFile(sourcePath, "utf8");
    for (const reference of collectStaticReferences(css, relativePath)) {
      if (!copiedAssets.has(reference)) {
        pendingAssets.push(reference);
      }
    }
  }
}

if (!html.includes("I build React &amp; TypeScript products")) {
  throw new Error("The static export is missing the portfolio hero content.");
}
if (!researchStudioHtml.includes("Research Studio turns AI output")) {
  throw new Error("The static export is missing the Research Studio project page.");
}
const combinedHtml = `${html}\n${researchStudioHtml}`;
if (combinedHtml.includes("localhost") || combinedHtml.includes("_rsc") || combinedHtml.includes(".vinext/fonts") || /(?:^|[\s"'(])[A-Za-z]:\//.test(combinedHtml)) {
  const unsafeReferences = combinedHtml.match(/[^\s"']*(?:localhost|_rsc|\.vinext\/fonts|(?:^|[\s"'(])[A-Za-z]:\/)[^\s"']*/g) ?? [];
  throw new Error(`The static export still contains development or server-only references: ${unsafeReferences.slice(0, 5).join(", ")}`);
}

const notFoundHtml = createNotFoundDocument(html);

if (notFoundHtml === html || !notFoundHtml.includes('content="noindex, follow"') || !notFoundHtml.includes("Return home")) {
  throw new Error("The static export did not generate a valid noindex 404 page.");
}

await writeFile(path.join(output, "index.html"), html, "utf8");
await mkdir(path.join(output, "research-studio"), { recursive: true });
await writeFile(
  path.join(output, "research-studio", "index.html"),
  researchStudioHtml,
  "utf8",
);
await writeFile(path.join(output, "404.html"), notFoundHtml, "utf8");
await writeFile(path.join(output, ".nojekyll"), "", "utf8");
await writeFile(
  path.join(output, "portfolio-build.json"),
  `${JSON.stringify(buildMetadata, null, 2)}\n`,
  "utf8",
);

const exportedHtml = await readFile(path.join(output, "index.html"), "utf8");
console.log(
  `Exported ${exportedHtml.length} home-page bytes plus the Research Studio project page to ${output}`,
);
