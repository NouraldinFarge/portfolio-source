# Nouraldin Farge — portfolio source

[![Quality](https://github.com/NouraldinFarge/portfolio-source/actions/workflows/quality.yml/badge.svg)](https://github.com/NouraldinFarge/portfolio-source/actions/workflows/quality.yml)
[![CodeQL](https://github.com/NouraldinFarge/portfolio-source/actions/workflows/codeql.yml/badge.svg)](https://github.com/NouraldinFarge/portfolio-source/actions/workflows/codeql.yml)
[![Live portfolio](https://img.shields.io/badge/live-nouraldinfarge.github.io-0b715d)](https://nouraldinfarge.github.io)

The maintainable React and TypeScript source for [nouraldinfarge.github.io](https://nouraldinfarge.github.io). The portfolio leads with shipped, evidence-backed work and keeps active public-source prereleases in a clearly separate section so work in progress is never mistaken for a supported release.

![Nouraldin Farge — React and TypeScript software engineering portfolio](public/github-social-preview-software-engineer-v2.png)

## What this repository contains

- A recruiter-focused portfolio built with React, TypeScript, and Vinext.
- A dedicated, synthetic-safe Research Studio case-study route.
- A deterministic exporter that produces a script-free GitHub Pages artifact.
- Desktop and mobile Chrome/Axe checks for WCAG A/AA regressions, landmarks, broken images, and horizontal overflow.
- Rendered-content and self-contained-export tests that reject development-only or local filesystem references.

The generated deployment is intentionally kept in the separate [`NouraldinFarge.github.io`](https://github.com/NouraldinFarge/NouraldinFarge.github.io) repository. Edit this source repository; treat the Pages repository as generated output.

## Portfolio structure

| Area | Purpose |
| --- | --- |
| `/` | Shipped projects, active public-source prereleases, engineering ownership, and contact path |
| `/research-studio/` | Public, source-free case study using redistribution-safe synthetic evidence |
| `public/` | Static assets and the current résumé PDF, with ownership and licensing recorded in the content and project-media notices |
| `scripts/export-github-pages.mjs` | Script-free, self-contained GitHub Pages export |
| `tests/` | Rendered HTML, export integrity, and Chrome/Axe regression coverage |

## Local development

Requires Node.js 22.13 or newer and Google Chrome for the local accessibility suite.

```bash
npm ci
npm run dev
```

Run the same quality gate used in pull requests:

```bash
npm run check
```

The test suite builds the production artifact, checks rendered content, verifies the static export, and audits both portfolio routes at desktop and mobile viewports. CI installs a locked Playwright Chromium build; local Windows runs use the installed stable Chrome channel.

## GitHub Pages export

Build and export a script-free copy:

```bash
npm run export:pages
```

To write the artifact into a separate Pages checkout:

```bash
npm run export:pages:release -- ../NouraldinFarge.github.io
```

The release exporter refuses tracked or untracked non-ignored source changes, records the exact source revision in `portfolio-build.json`, copies only referenced styles, fonts, public assets, the résumé, and search metadata, and generates a dedicated `noindex` 404 page. Rendered HTML is parsed into a document tree before publication: streamed metadata is promoted structurally, only valid JSON-LD is retained, and runtime scripts, inline styles, templates, module preloads, active attributes, unsafe URLs, and embedded browsing contexts are removed or rejected. Adversarial transform tests cover malformed and repeated tags as well as ambiguous streamed fragments. The exporter also rejects executable bundles, unsafe paths, local-only references, and missing content.

## Deployment and media provenance

The Reader and Media Scout images used in the active-source section are unmodified, synthetic-safe project captures. [Project media notices](PROJECT-MEDIA-NOTICES.md) records their exact source revisions, hashes, provenance boundaries, and MIT license notice.

[GitHub Pages](https://nouraldinfarge.github.io) is the canonical portfolio deployment and is published from the generated [`NouraldinFarge.github.io`](https://github.com/NouraldinFarge/NouraldinFarge.github.io) repository. `.openai/hosting.json` preserves a credential-free legacy Sites identifier for provenance only; it is not an active deployment target and is not part of the GitHub Pages release workflow.

## Engineering and disclosure

- Public claims must point to inspectable source, immutable releases, methodology, or bounded case-study evidence.
- Active source is labeled as prerelease work until its repository-specific release gates close.
- Portfolio media must be owned, licensed, or synthetic-safe and must not expose private datasets or local paths.
- AI agents assist with research, implementation, testing, and iteration. Nouraldin owns product direction, architecture, technical review, validation criteria, safety and licensing boundaries, data-source decisions, and release approval. Agent output is treated as untrusted until repository checks and human review pass.

## Security

Please do not publish suspected vulnerabilities or sensitive information in a public issue. Follow [SECURITY.md](SECURITY.md) to report them privately.

## Contributing

Focused accessibility, compatibility, documentation, and correctness improvements are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Source code is available under the [MIT License](LICENSE). Personal portfolio copy, résumé content, branding, and most media assets are excluded from that grant; the two reused project screenshots retain their source MIT license. See [CONTENT-LICENSE.md](CONTENT-LICENSE.md) and [PROJECT-MEDIA-NOTICES.md](PROJECT-MEDIA-NOTICES.md).
