# Contributing

Thank you for helping improve this portfolio. Small, focused changes to accessibility, compatibility, documentation, testing, or correctness are welcome.

## Before opening a pull request

1. Create a branch from the current `main` branch.
2. Install exactly the locked dependency graph with `npm ci`.
3. Keep project and release claims tied to public, inspectable evidence.
4. Do not add private data, local paths, access tokens, third-party media without a clear license, or screenshots containing real user information.
5. Run `npm run check` and include the result in the pull-request description.

Please keep pull requests narrowly scoped. Changes to biography, résumé content, project ownership claims, contact details, or release status require the portfolio owner’s explicit review.

## Accessibility expectations

- Preserve semantic landmarks, the skip link, keyboard-visible focus, one page-level heading, readable text contrast, descriptive alternative text, and reflow without horizontal scrolling.
- Validate both `/` and `/research-studio/` at desktop and mobile widths.
- Treat automated Axe results as a baseline, not a replacement for keyboard and visual review.

## AI-assisted contributions

Disclose material AI assistance in the pull-request description. The contributor remains responsible for validating behavior, provenance, licensing, and security before submitting the change.
