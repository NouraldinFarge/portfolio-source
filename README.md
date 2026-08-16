# Nouraldin Farge — Engineering Portfolio

A focused portfolio for desktop and local-first software engineering. It presents four evidence-backed projects, links directly to public code and releases, and includes a downloadable one-page résumé.

Research Studio also has a dedicated synthetic-safe project page at `/research-studio/`. Its source-free case study and current alpha.24 evidence remain in the linked documentation repository; no private application artifact is copied into the portfolio.

## Portfolio principles

- Evidence over hype: each claim connects to a repository, release, or case study.
- Local-first by default: projects emphasize recoverable data, explicit trust boundaries, and deterministic behavior.
- Honest AI disclosure: AI agents supported implementation; architecture, validation, safety, licensing, and release decisions remain human-reviewed.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
npm test
```

`npm test` builds the production artifact and verifies the rendered portfolio content.

## GitHub Pages export

Build and export a script-free static copy with:

```bash
npm run export:pages
```

Pass a destination after `--` when publishing into a separate Pages repository:

```bash
npm run export:pages -- ../path-to-pages-repository
```

The exporter keeps only referenced styles and fonts, copies the public portfolio assets, and generates a dedicated noindex 404 page.
