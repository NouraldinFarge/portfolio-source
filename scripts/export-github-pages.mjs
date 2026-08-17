import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const output = path.resolve(process.argv[2] ?? "github-pages-export");
const canonicalUrl = "https://nouraldinfarge.github.io";

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
  "og.png",
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
  "robots.txt",
  "sitemap.xml",
]) {
  await cp(
    path.join(root, "dist", "client", relativePath),
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

  let rendered = await response.text();
  const structuredDataScripts = [];
  const streamedHeadFragments = [];

  rendered = rendered.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    (script) => {
      const marker = `__STRUCTURED_DATA_${structuredDataScripts.length}__`;
      structuredDataScripts.push(script);
      return marker;
    },
  );

  // Newer Vinext releases stream Next metadata into a hidden response fragment and
  // move it into <head> with client JavaScript. The deployed portfolio is deliberately
  // script-free, so promote those semantic tags during export instead.
  rendered = rendered.replace(
    /<div\b(?=[^>]*\bhidden\b)(?=[^>]*\bid=["']S:\d+["'])[^>]*>\s*<div\b[^>]*\bhidden\b[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi,
    (block, content) => {
      if (!/<(?:title|meta|link)\b/i.test(content)) {
        return block;
      }

      streamedHeadFragments.push(
        content
          .replace(/<script\b[\s\S]*?<\/script>/gi, "")
          .replace(/\sdata-vinext-streamed-icon=["'][^"']*["']/gi, ""),
      );
      return "";
    },
  );

  rendered = rendered
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*\/?\s*>/gi, "")
    .replace(
      /<div\b[^>]*\bhidden\b[^>]*>\s*<!--\$\?-->\s*<template\b[^>]*><\/template>\s*<!--\/\$-->\s*<\/div>/gi,
      "",
    )
    .replace(/<!--\$\??-->|<!--\/\$-->/g, "")
    .replace(/\sdata-rsc-css-href=["'][^"']*["']/gi, "")
    .replace(/\sdata-precedence=["'][^"']*["']/gi, "")
    .replace(/\sdata-vinext-streamed-icon=["'][^"']*["']/gi, "")
    .replace(/url\((?:file:\/\/\/)?[^)]*?\.vinext\/fonts\/([^)]+)\)/gi, "url(/assets/_vinext_fonts/$1)")
    .replaceAll("http://localhost", canonicalUrl);

  if (streamedHeadFragments.length > 0) {
    rendered = rendered.replace(
      /<\/head>/i,
      `${streamedHeadFragments.join("")}\n</head>`,
    );
  }

  structuredDataScripts.forEach((script, index) => {
    rendered = rendered.replace(
      `__STRUCTURED_DATA_${index}__`,
      script,
    );
  });

  return rendered;
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

const bodyOpeningTag = html.match(/<body\b[^>]*>/i)?.[0] ?? "<body>";
const notFoundHtml = html
  .replace(/<title>[\s\S]*?<\/title>/i, "<title>Page not found — Nouraldin Farge</title>")
  .replace(/<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="The requested page could not be found. Return to Nouraldin Farge\'s software engineering portfolio."/>')
  .replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex, follow"/>')
  .replace(/<link\s+rel=["']canonical["'][^>]*>/i, "")
  .replace(/<meta\s+property=["']og:[^>]+>/gi, "")
  .replace(/<meta\s+name=["']twitter:[^>]+>/gi, "")
  .replace(
    /<body\b[^>]*>[\s\S]*<\/body>/i,
    `${bodyOpeningTag}<main id="main-content" class="not-found-page" tabindex="-1"><p class="kicker"><span></span>404 · page not found</p><h1>That page doesn’t exist.</h1><p>The address may have changed, or the link may be incomplete. The engineering portfolio is still available from the home page.</p><a class="button primary" href="/">Return home</a></main><footer><span>© 2026 Nouraldin Farge</span><span>React · TypeScript · Local-first · Evidence-backed</span></footer></body>`,
  );

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

const exportedHtml = await readFile(path.join(output, "index.html"), "utf8");
console.log(
  `Exported ${exportedHtml.length} home-page bytes plus the Research Studio project page to ${output}`,
);
