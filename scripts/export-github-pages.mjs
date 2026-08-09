import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const output = path.resolve(process.argv[2] ?? "github-pages-export");
const canonicalUrl = "https://nouraldinfarge.github.io";

await mkdir(output, { recursive: true });

for (const relativePath of [
  "assets",
  "projects",
  "index.html",
  "404.html",
  "Nouraldin-Farge-Resume.pdf",
  "favicon.svg",
  "og.png",
  "og-v2.png",
  "_headers",
  ".assetsignore",
  ".vite",
  ".nojekyll",
]) {
  await rm(path.join(output, relativePath), { recursive: true, force: true });
}

for (const relativePath of [
  "assets",
  "projects",
  "Nouraldin-Farge-Resume.pdf",
  "favicon.svg",
  "og.png",
  "og-v2.png",
]) {
  await cp(
    path.join(root, "dist", "client", relativePath),
    path.join(output, relativePath),
    { recursive: true },
  );
}

const workerUrl = `${pathToFileURL(path.join(root, "dist", "server", "index.js")).href}?static-export=${Date.now()}`;
const worker = (await import(workerUrl)).default;
const response = await worker.fetch(
  new Request(`${canonicalUrl}/`),
  {},
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) {
  throw new Error(`Static render failed with HTTP ${response.status}`);
}

let html = await response.text();
const structuredDataScripts = [];

html = html.replace(
  /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
  (script) => {
    const marker = `__STRUCTURED_DATA_${structuredDataScripts.length}__`;
    structuredDataScripts.push(script);
    return marker;
  },
);

html = html
  .replace(/<script\b[\s\S]*?<\/script>/gi, "")
  .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*\/?\s*>/gi, "")
  .replace(/\sdata-rsc-css-href=["'][^"']*["']/gi, "")
  .replace(/\sdata-precedence=["'][^"']*["']/gi, "")
  .replace(/url\((?:file:\/\/\/)?[^)]*?\.vinext\/fonts\/([^)]+)\)/gi, "url(/assets/_vinext_fonts/$1)")
  .replaceAll("http://localhost", canonicalUrl)
  .replaceAll("https://nouraldin-farge-portfolio.awdsqecxzr.chatgpt.site", canonicalUrl);

structuredDataScripts.forEach((script, index) => {
  html = html.replace(`__STRUCTURED_DATA_${index}__`, script.replaceAll("https://nouraldin-farge-portfolio.awdsqecxzr.chatgpt.site", canonicalUrl));
});

if (!html.includes("I build Windows software")) {
  throw new Error("The static export is missing the portfolio hero content.");
}
if (html.includes("localhost") || html.includes("_rsc") || html.includes(".vinext/fonts") || /(?:^|[\s"'(])[A-Za-z]:\//.test(html)) {
  const unsafeReferences = html.match(/[^\s"']*(?:localhost|_rsc|\.vinext\/fonts|(?:^|[\s"'(])[A-Za-z]:\/)[^\s"']*/g) ?? [];
  throw new Error(`The static export still contains development or server-only references: ${unsafeReferences.slice(0, 5).join(", ")}`);
}

await writeFile(path.join(output, "index.html"), html, "utf8");
await writeFile(path.join(output, "404.html"), html, "utf8");
await writeFile(path.join(output, ".nojekyll"), "", "utf8");

const exportedHtml = await readFile(path.join(output, "index.html"), "utf8");
console.log(`Exported ${exportedHtml.length} bytes to ${output}`);
