# Nouraldin Farge — React & TypeScript Product Portfolio

A focused software-engineering portfolio led by React and TypeScript product work, with local-first Windows systems as a differentiator. It presents three shipped public products and one source-free case study, links directly to inspectable evidence, and includes a downloadable one-page résumé.

Research Studio also has a dedicated synthetic-safe project page at `/research-studio/`. The portfolio identifies v0.1.0-alpha.24 as a private build and links to the public, source-free case-study snapshot verified August 15, 2026; no private application artifact is copied into the portfolio.

## Portfolio principles

- Evidence over hype: each claim connects to a repository, release, or case study.
- Product outcomes first: each project explains the user workflow, engineering decision, and evidence a recruiter can inspect.
- Local-first where it matters: projects emphasize recoverable data, explicit trust boundaries, and deterministic behavior.
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
