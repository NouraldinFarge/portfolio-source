import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Research Studio Case Study — Nouraldin Farge",
  description:
    "A guarded AI-assisted desktop workflow with read-only SQLite inspection, staged drafts, explicit human approval, approved-only exports, and recoverable portable releases.",
  alternates: { canonical: "https://nouraldinfarge.github.io/research-studio/" },
  openGraph: {
    title: "Research Studio — Guarded AI Catalog Enrichment",
    description:
      "Read-only source data, evidence-first prompts, human approval, and recoverable Windows releases.",
    url: "https://nouraldinfarge.github.io/research-studio/",
    type: "article",
    images: [
      {
        url: "https://nouraldinfarge.github.io/projects/research-studio.webp",
        width: 1775,
        height: 888,
        alt: "Research Studio guarded catalog-enrichment workflow",
      },
    ],
  },
};

const metrics = [
  ["31,521", "series verified"],
  ["2.24M", "episodes inspected"],
  ["20", "focused verification programs"],
  ["0", "moderate-or-higher npm vulnerabilities"],
];

const boundaries = [
  ["Source", "Checked snapshot + query-only SQLite", "No schema or enrichment write"],
  ["Assistant", "Correlated complete JSON + domain gates", "No file, database, approval, or export authority"],
  ["Reviewer", "Explicit approval revalidates a staged draft", "Only this transition creates a result version"],
  ["Release", "Target-runtime SQLite query + transactional activation", "Prior build remains recoverable until verification passes"],
];

const gallery = [
  {
    src: "/projects/research-studio/product-library-overview.jpg",
    alt: "Synthetic Research Studio library overview with separate pending, correction, approval, tag, and run counts",
    title: "Visible workflow state",
    copy: "Pending, correction, ready-for-approval, and approved are different product states—not one success counter.",
  },
  {
    src: "/projects/research-studio/product-prompt-provenance.jpg",
    alt: "Synthetic Research Studio prompt editor showing a locked used prompt and create-revision action",
    title: "Versioned prompt provenance",
    copy: "Active or used prompts are immutable. Revisions preserve the exact contract attached to historical jobs.",
  },
  {
    src: "/projects/research-studio/product-approved-review.jpg",
    alt: "Synthetic Research Studio review workspace showing failed, correction, and approved records",
    title: "Human approval as storage authority",
    copy: "A valid capture is only a staged job draft. Approval revalidates it and creates the immutable result version.",
  },
  {
    src: "/projects/research-studio/product-approved-exports.jpg",
    alt: "Synthetic Research Studio export screen with approved-only JSON, CSV, JSONL, and SQLite output",
    title: "Approved-only exports",
    copy: "Every format shares one eligibility rule, so staged or correction records cannot escape through another route.",
  },
];

export default function ResearchStudioPage() {
  return (
    <>
      <a className="skip-link" href="#project-main">
        Skip to project content
      </a>
      <header className="site-header project-header">
        <Link className="wordmark" href="/" aria-label="Nouraldin Farge portfolio home">
          NF<span>.</span>
        </Link>
        <nav aria-label="Project navigation">
          <a href="#tour">Product tour</a>
          <a href="#evidence">Evidence</a>
          <a href="#ownership">Ownership</a>
        </nav>
        <Link className="header-resume" href="/">
          All projects <span aria-hidden="true">←</span>
        </Link>
      </header>

      <main id="project-main" className="case-page" tabIndex={-1}>
        <section className="case-hero">
          <div className="case-hero-copy">
            <p className="kicker">
              <span /> Source-free engineering case study · private alpha.24
            </p>
            <h1>
              Research Studio turns AI output into <em>reviewed evidence</em>, not automatic truth.
            </h1>
            <p>
              A Windows desktop workflow for bilingual short-drama catalog enrichment. It protects
              the source SQLite database, keeps ChatGPT inside one application window, monitors
              live response state, stages validated drafts, and requires explicit approval before
              any result becomes exportable.
            </p>
            <div className="hero-actions">
              <a
                className="button primary"
                href="https://github.com/NouraldinFarge/research-studio-case-study"
              >
                Read full case study <span aria-hidden="true">↗</span>
              </a>
              <a
                className="button secondary"
                href="https://github.com/NouraldinFarge/research-studio-case-study/blob/main/docs/verification-evidence.md"
              >
                Inspect verification <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className="case-hero-visual">
            {/* Static portfolio asset; native img avoids the unsupported vinext optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/projects/research-studio.webp"
              alt="Research Studio workflow from a read-only bilingual catalog through validation and human approval to recoverable export"
            />
            <p>Original conceptual illustration · no private catalog or account data</p>
          </div>
        </section>

        <section className="case-metrics" aria-label="Research Studio verification summary">
          {metrics.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="case-section" id="tour">
          <div className="case-section-heading">
            <p className="kicker">
              <span /> Product tour · deterministic synthetic catalog
            </p>
            <h2>The UI makes trust boundaries visible.</h2>
            <p>
              Every title, description, identifier, result, and count below is fabricated. The
              captures exclude the browser/account pane and machine paths.
            </p>
          </div>
          <div className="case-gallery">
            {gallery.map((item) => (
              <article key={item.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="case-section case-boundary-section">
          <div className="case-section-heading compact">
            <p className="kicker">
              <span /> Authority map
            </p>
            <h2>Each layer has a job—and a deliberate limit.</h2>
          </div>
          <div className="boundary-grid">
            {boundaries.map(([name, control, limit]) => (
              <article key={name}>
                <span>{name}</span>
                <h3>{control}</h3>
                <p>{limit}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="case-section split-case" id="evidence">
          <div>
            <p className="kicker">
              <span /> Evidence-first prompt v3
            </p>
            <h2>Ask for identity, evidence, confidence, uncertainty, and canonical tags.</h2>
            <p>
              The prompt treats catalog text as untrusted, requests title-plus-premise matching,
              falls back conservatively when identity is uncertain, and forbids unsupported cast,
              platform, episode, ending, supernatural, pregnancy, and identity-twist claims.
              ChatGPT returns canonical tag IDs; Research Studio derives the Chinese and English
              labels locally.
            </p>
            <a
              className="inline-evidence-link"
              href="https://github.com/NouraldinFarge/research-studio-case-study/blob/main/docs/prompt-contract.md"
            >
              Review the prompt contract <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="case-proof-card">
            <span>WHOLE-LIBRARY SAFETY</span>
            <strong>1-title pilot → 2-title batches</strong>
            <ul>
              <li>Workload review before launch</li>
              <li>Checkpoint after every batch</li>
              <li>Safe stop and resume</li>
              <li>Validation and zero-save circuit breaker</li>
              <li>Correction records excluded</li>
              <li>No automation path can approve</li>
            </ul>
          </div>
        </section>

        <section className="case-section release-evidence">
          <div className="case-section-heading compact">
            <p className="kicker">
              <span /> Packaging is executable evidence
            </p>
            <h2>A build is not accepted because the UI opens.</h2>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Verify source</strong>
                <p>Types, lint, formatting, tests, prompt evals, build, and dependency audit.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Execute native SQLite</strong>
                <p>Rebuild for Electron ABI 146, query SQLite, then restore Node ABI 137.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Render production</strong>
                <p>
                  Bundled React over an application-private named pipe—not an external dev server.
                </p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <strong>Activate transactionally</strong>
                <p>Preserve durable data only; restore the prior build after injected failure.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="case-section ownership-section" id="ownership">
          <p className="kicker">
            <span /> Ownership and limits
          </p>
          <h2>I owned the decisions; AI-assisted output still had to earn trust.</h2>
          <div className="ownership-grid">
            <p>
              I owned product direction, extraction architecture, database and browser safety,
              prompt/evaluation strategy, human-approval design, QA criteria, licensing boundary,
              technical review, and release approval. AI agents assisted with research,
              implementation, and iteration; their output was reviewed and verified.
            </p>
            <p>
              The application remains private. The case study does not claim public distribution
              rights, code signing, universal model accuracy, provider-policy approval, or
              production readiness. Research Studio was extracted from a module in SilkReel
              Windows 5.8.214; I do not claim authorship of the entire upstream product.
            </p>
          </div>
        </section>

        <section className="case-cta">
          <p className="kicker">
            <span /> Follow the bounded evidence
          </p>
          <h2>See the claims, tests, tradeoffs, and residual risks in one place.</h2>
          <div className="hero-actions">
            <a
              className="button primary"
              href="https://github.com/NouraldinFarge/research-studio-case-study"
            >
              Open the GitHub case study <span aria-hidden="true">↗</span>
            </a>
            <Link className="button secondary" href="/">
              Return to portfolio
            </Link>
          </div>
        </section>
      </main>

      <footer>
        <span>© 2026 Nouraldin Farge</span>
        <span>Research Studio · Synthetic-safe · Human-reviewed</span>
      </footer>
    </>
  );
}
