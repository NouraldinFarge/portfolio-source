import {
  defaultTreeAdapter as treeAdapter,
  parse,
  parseFragment,
  serialize,
} from "parse5";

const htmlNamespace = "http://www.w3.org/1999/xhtml";
const removableAttributeNames = new Set([
  "data-precedence",
  "data-rsc-css-href",
  "data-vinext-streamed-icon",
  "ping",
]);
const blockedElementNames = new Set([
  "base",
  "embed",
  "frame",
  "frameset",
  "iframe",
  "object",
]);
const removableElementNames = new Set(["noscript", "style", "template"]);
const urlAttributeNames = new Set([
  "action",
  "cite",
  "formaction",
  "href",
  "poster",
  "src",
  "xlink:href",
]);
const allowedUrlProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);
const unsupportedUrlListAttributeNames = new Set(["imagesrcset", "srcset"]);

function isElement(node, tagName) {
  return node?.namespaceURI === htmlNamespace && node.tagName === tagName;
}

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value;
}

function hasAttribute(node, name) {
  return node.attrs?.some((attribute) => attribute.name === name) ?? false;
}

function hasRelToken(node, token) {
  return (getAttribute(node, "rel") ?? "")
    .toLowerCase()
    .split(/\s+/u)
    .includes(token);
}

function detachNode(node) {
  const parent = node.parentNode;
  if (!parent?.childNodes) return;
  const index = parent.childNodes.indexOf(node);
  if (index >= 0) parent.childNodes.splice(index, 1);
  node.parentNode = null;
}

function appendNode(parent, node) {
  detachNode(node);
  parent.childNodes.push(node);
  node.parentNode = parent;
}

function replaceChildren(parent, children) {
  for (const child of parent.childNodes ?? []) child.parentNode = null;
  parent.childNodes = children;
  for (const child of children) child.parentNode = parent;
}

function walkElements(root, visitor) {
  for (const child of [...(root.childNodes ?? [])]) {
    if (child.tagName) visitor(child);
    if (child.childNodes) walkElements(child, visitor);
  }
}

function findElements(root, predicate) {
  const elements = [];
  walkElements(root, (element) => {
    if (predicate(element)) elements.push(element);
  });
  return elements;
}

function findDocumentParts(document) {
  const html = document.childNodes.find((node) => isElement(node, "html"));
  const head = html?.childNodes.find((node) => isElement(node, "head"));
  const body = html?.childNodes.find((node) => isElement(node, "body"));
  if (!html || !head || !body) {
    throw new Error("Rendered output must contain one HTML document with head and body elements.");
  }
  return { html, head, body };
}

function structuredDataText(script) {
  if (!isElement(script, "script")) return null;
  if ((getAttribute(script, "type") ?? "").trim().toLowerCase() !== "application/ld+json") {
    return null;
  }
  if ((script.childNodes ?? []).some((node) => node.nodeName !== "#text")) {
    throw new Error("Structured data must contain text only.");
  }
  return (script.childNodes ?? []).map((node) => node.value).join("");
}

function parseStructuredData(script) {
  const content = structuredDataText(script);
  if (content === null) return false;
  try {
    const parsed = JSON.parse(content);
    if (parsed === null || typeof parsed !== "object") {
      throw new Error("JSON-LD must be an object or array.");
    }
  } catch (error) {
    throw new Error(`Invalid JSON-LD in rendered output: ${error.message}`);
  }
  return true;
}

function validateStructuredData(script) {
  if (!parseStructuredData(script)) return false;
  script.attrs = [{ name: "type", value: "application/ld+json" }];
  return true;
}

function rewriteGeneratedValue(value, canonicalUrl) {
  return value
    .replaceAll("http://localhost", canonicalUrl)
    .replace(
      /url\((?:file:\/\/\/)?[^)]*?\.vinext\/fonts\/([^)]+)\)/giu,
      "url(/assets/_vinext_fonts/$1)",
    );
}

function cleanAttributes(element, canonicalUrl) {
  const cleaned = [];
  for (const attribute of element.attrs ?? []) {
    const name = attribute.name.toLowerCase();
    if (
      removableAttributeNames.has(name)
      || name === "style"
      || name === "srcdoc"
      || name.startsWith("on")
    ) {
      continue;
    }
    if (unsupportedUrlListAttributeNames.has(name)) {
      throw new Error(`Rendered output contains unsupported ${name} content.`);
    }

    const value = rewriteGeneratedValue(attribute.value, canonicalUrl);
    if (urlAttributeNames.has(name)) {
      let protocol;
      try {
        protocol = new URL(value, canonicalUrl).protocol;
      } catch {
        throw new Error(`Rendered output contains an invalid ${name} URL.`);
      }
      if (!allowedUrlProtocols.has(protocol)) {
        throw new Error(`Rendered output contains an unsafe ${name} URL protocol.`);
      }
    }
    cleaned.push({ ...attribute, value });
  }
  element.attrs = cleaned;
}

function promoteStreamedMetadata(head, body) {
  const allowedHeadElements = new Set(["link", "meta", "title"]);
  for (const outer of [...body.childNodes]) {
    if (!isElement(outer, "div") || !hasAttribute(outer, "hidden")) continue;
    const inner = outer.childNodes.find(
      (node) => isElement(node, "div") && hasAttribute(node, "hidden"),
    );
    if (!inner) continue;

    const metadata = inner.childNodes.filter(
      (node) => node.tagName && allowedHeadElements.has(node.tagName),
    );
    if (metadata.length === 0) continue;

    for (const node of inner.childNodes) {
      if (node.nodeName === "#text" && node.value.trim() === "") continue;
      if (node.nodeName === "#comment") continue;
      if (isElement(node, "script")) continue;
      if (node.tagName && allowedHeadElements.has(node.tagName)) continue;
      throw new Error(`Unexpected <${node.tagName ?? node.nodeName}> in streamed metadata.`);
    }

    for (const node of metadata) {
      if (isElement(node, "link") && hasRelToken(node, "modulepreload")) continue;
      appendNode(head, node);
    }
    detachNode(outer);
  }
}

function cleanDocumentTree(parent, canonicalUrl) {
  for (const node of [...(parent.childNodes ?? [])]) {
    if (node.nodeName === "#comment") {
      detachNode(node);
      continue;
    }
    if (node.nodeName === "#text") {
      node.value = rewriteGeneratedValue(node.value, canonicalUrl);
      continue;
    }
    if (!node.tagName) continue;

    if (node.namespaceURI !== htmlNamespace) {
      throw new Error(`Rendered output contains foreign <${node.tagName}> content.`);
    }
    if (blockedElementNames.has(node.tagName)) {
      throw new Error(`Rendered output contains blocked <${node.tagName}> content.`);
    }
    if (isElement(node, "meta") && hasAttribute(node, "http-equiv")) {
      throw new Error("Rendered output contains an active meta pragma.");
    }
    if (isElement(node, "script")) {
      if (validateStructuredData(node)) continue;
      detachNode(node);
      continue;
    }
    if (removableElementNames.has(node.tagName)) {
      detachNode(node);
      continue;
    }
    if (isElement(node, "link") && hasRelToken(node, "modulepreload")) {
      detachNode(node);
      continue;
    }

    cleanAttributes(node, canonicalUrl);
    cleanDocumentTree(node, canonicalUrl);
    if (
      isElement(node, "div")
      && hasAttribute(node, "hidden")
      && (node.childNodes ?? []).every(
        (child) => child.nodeName === "#text" && child.value.trim() === "",
      )
    ) {
      detachNode(node);
    }
  }
}

export function inspectStaticDocument(html) {
  const document = parse(html);
  const { head, body } = findDocumentParts(document);
  const scripts = findElements(document, (node) => isElement(node, "script"));
  const structuredDataScripts = scripts.filter((script) => parseStructuredData(script));
  const titles = findElements(document, (node) => isElement(node, "title"));
  const headTitles = findElements(head, (node) => isElement(node, "title"));
  const styles = findElements(document, (node) => isElement(node, "style"));
  const templates = findElements(document, (node) => isElement(node, "template"));
  const modulePreloads = findElements(
    document,
    (node) => isElement(node, "link") && hasRelToken(node, "modulepreload"),
  );
  const blockedElements = findElements(document, (node) => blockedElementNames.has(node.tagName));
  const foreignElements = findElements(document, (node) => node.namespaceURI !== htmlNamespace);
  const activeMetaPragmas = findElements(
    document,
    (node) => isElement(node, "meta") && hasAttribute(node, "http-equiv"),
  );
  const forbiddenAttributes = [];
  walkElements(document, (element) => {
    for (const attribute of element.attrs ?? []) {
      const name = attribute.name.toLowerCase();
      if (
        removableAttributeNames.has(name)
        || name === "style"
        || name === "srcdoc"
        || name.startsWith("on")
      ) {
        forbiddenAttributes.push({ element: element.tagName, attribute: name });
      }
    }
  });
  const streamedMetadataContainers = body.childNodes.filter((outer) => {
    if (!isElement(outer, "div") || !hasAttribute(outer, "hidden")) return false;
    return outer.childNodes.some(
      (node) => isElement(node, "div") && hasAttribute(node, "hidden"),
    );
  });

  return {
    scriptCount: scripts.length,
    structuredDataCount: structuredDataScripts.length,
    executableScriptCount: scripts.length - structuredDataScripts.length,
    styleCount: styles.length,
    templateCount: templates.length,
    modulePreloadCount: modulePreloads.length,
    blockedElementCount: blockedElements.length,
    foreignElementCount: foreignElements.length,
    activeMetaPragmaCount: activeMetaPragmas.length,
    forbiddenAttributes,
    titleCount: titles.length,
    headTitleCount: headTitles.length,
    streamedMetadataContainerCount: streamedMetadataContainers.length,
  };
}

export function assertStaticDocumentPolicy(html, { requireStructuredData = true } = {}) {
  const inspection = inspectStaticDocument(html);
  const expectedStructuredDataCount = requireStructuredData ? 1 : 0;
  if (inspection.executableScriptCount !== 0) throw new Error("Executable scripts remain in static HTML.");
  if (inspection.structuredDataCount !== expectedStructuredDataCount) {
    throw new Error(`Expected ${expectedStructuredDataCount} structured-data scripts, found ${inspection.structuredDataCount}.`);
  }
  if (inspection.styleCount !== 0) throw new Error("Inline style elements remain in static HTML.");
  if (inspection.templateCount !== 0) throw new Error("Template elements remain in static HTML.");
  if (inspection.modulePreloadCount !== 0) throw new Error("Module preload links remain in static HTML.");
  if (inspection.blockedElementCount !== 0) throw new Error("Blocked active content remains in static HTML.");
  if (inspection.foreignElementCount !== 0) throw new Error("Foreign-namespace content remains in static HTML.");
  if (inspection.activeMetaPragmaCount !== 0) throw new Error("Active meta pragmas remain in static HTML.");
  if (inspection.forbiddenAttributes.length !== 0) throw new Error("Forbidden active attributes remain in static HTML.");
  if (inspection.titleCount !== 1 || inspection.headTitleCount !== 1) {
    throw new Error("Static HTML must contain exactly one title in the document head.");
  }
  if (inspection.streamedMetadataContainerCount !== 0) {
    throw new Error("Streamed metadata containers remain in static HTML.");
  }
  return inspection;
}

export function sanitizeRenderedDocument(rendered, { canonicalUrl }) {
  const document = parse(rendered);
  const { head, body } = findDocumentParts(document);
  promoteStreamedMetadata(head, body);
  cleanDocumentTree(document, canonicalUrl);
  const output = serialize(document);
  assertStaticDocumentPolicy(output);
  return output;
}

function setTextContent(element, value) {
  replaceChildren(element, [treeAdapter.createTextNode(value)]);
}

function createMeta(head, attributes) {
  const meta = treeAdapter.createElement("meta", htmlNamespace, attributes);
  appendNode(head, meta);
  return meta;
}

function setMeta(head, key, keyValue, content) {
  const matches = findElements(
    head,
    (node) => isElement(node, "meta") && (getAttribute(node, key) ?? "").toLowerCase() === keyValue,
  );
  const meta = matches.shift() ?? createMeta(head, []);
  meta.attrs = [
    { name: key, value: keyValue },
    { name: "content", value: content },
  ];
  for (const duplicate of matches) detachNode(duplicate);
}

export function createNotFoundDocument(staticHtml) {
  const document = parse(staticHtml);
  const { head, body } = findDocumentParts(document);
  const titles = findElements(head, (node) => isElement(node, "title"));
  if (titles.length !== 1) throw new Error("Cannot build a 404 page without one head title.");
  setTextContent(titles[0], "Page not found — Nouraldin Farge");
  setMeta(
    head,
    "name",
    "description",
    "The requested page could not be found. Return to Nouraldin Farge's software engineering portfolio.",
  );
  setMeta(head, "name", "robots", "noindex, follow");

  for (const element of findElements(head, (node) => {
    if (isElement(node, "link")) return hasRelToken(node, "canonical");
    if (!isElement(node, "meta")) return false;
    const property = (getAttribute(node, "property") ?? "").toLowerCase();
    const name = (getAttribute(node, "name") ?? "").toLowerCase();
    return property.startsWith("og:") || name.startsWith("twitter:");
  })) {
    detachNode(element);
  }

  const bodyMarkup = '<main id="main-content" class="not-found-page" tabindex="-1"><p class="kicker"><span></span>404 · page not found</p><h1>That page doesn’t exist.</h1><p>The address may have changed, or the link may be incomplete. The engineering portfolio is still available from the home page.</p><a class="button primary" href="/">Return home</a></main><footer><span>© 2026 Nouraldin Farge</span><span>React · TypeScript · Local-first · Evidence-backed</span></footer>';
  const fragment = parseFragment(body, bodyMarkup);
  replaceChildren(body, [...fragment.childNodes]);

  const output = serialize(document);
  assertStaticDocumentPolicy(output, { requireStructuredData: false });
  return output;
}
