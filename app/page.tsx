const projects = [
  {
    name: "DrawScope",
    version: "v0.6.5",
    availability: "Public Windows release",
    description:
      "A local-first historical lottery research workbench that makes data lineage, methodology, and product limits visible instead of presenting patterns as predictions.",
    evidence: [
      "41,598 deduplicated draws across six games",
      "250 walk-forward trials with a 60/40 discovery–confirmation split",
      "Reproducible SQLite archive, SHA-256 checksum, SPDX SBOM, and provenance",
    ],
    ownership: "Product architecture · data policy · research method · verification · release approval",
    stack: "React · Rust/Tauri · Python · SQLite",
    image: "/projects/drawscope.png",
    alt: "DrawScope verified project snapshot showing archive, research, and evaluation evidence",
    links: [
      ["View source", "https://github.com/NouraldinFarge/drawscope"],
      ["Download v0.6.5", "https://github.com/NouraldinFarge/drawscope/releases/tag/v0.6.5"],
      ["Read methodology", "https://github.com/NouraldinFarge/drawscope/blob/main/docs/METHODOLOGY.md"],
    ],
  },
  {
    name: "GameVault",
    version: "v0.3.5",
    availability: "Public Windows release",
    description:
      "A portable game library and launcher with a review-gated archive intake pipeline for user-owned files and an intentionally narrow filesystem boundary.",
    evidence: [
      "Blocks traversal, unsafe Windows paths, links, reparse entries, and archive bombs",
      "35 Rust tests plus focused React/Vitest coverage",
      "Rollback journal, portable-path probes, checksum, SBOM, and provenance",
    ],
    ownership: "Architecture · ZIP safety model · recovery design · technical review · release approval",
    stack: "React · Rust/Tauri · SQLite",
    image: "/projects/gamevault.jpg",
    alt: "GameVault portable library home screen using synthetic games and artwork",
    links: [
      ["View source", "https://github.com/NouraldinFarge/gamevault"],
      ["Download v0.3.5", "https://github.com/NouraldinFarge/gamevault/releases/tag/v0.3.5"],
      ["Review safety model", "https://github.com/NouraldinFarge/gamevault#safety-model"],
    ],
  },
  {
    name: "Day-Trading Teacher",
    version: "v0.32.6",
    availability: "Public Windows release",
    description:
      "A local-first learning environment that connects lessons, decision plans, historical replay, paper practice, journaling, and spaced review without live recommendations.",
    evidence: [
      "Deterministic decimal risk and expectancy calculations in Rust",
      "Schema-validated lesson imports and provenance-aware Fidelity history review",
      "Educational only: no brokerage login, live signals, investment advice, or orders",
    ],
    ownership: "Product direction · learning architecture · financial-safety boundary · verification · release approval",
    stack: "React · Rust/Tauri · local JSON · Zod",
    image: "/projects/day-trading-teacher.png",
    alt: "Day-Trading Teacher overview showing the lesson, replay, and journal learning loop",
    links: [
      ["View source", "https://github.com/NouraldinFarge/day-trading-teacher"],
      ["Download v0.32.6", "https://github.com/NouraldinFarge/day-trading-teacher/releases/tag/v0.32.6"],
      ["Take the project tour", "https://github.com/NouraldinFarge/day-trading-teacher#five-minute-project-tour"],
    ],
  },
  {
    name: "Research Studio",
    version: "v0.1.0-alpha.24",
    availability: "Source-free case study",
    description:
      "A guarded AI-assisted workflow that keeps source data read-only, stages untrusted model output, requires human approval, and exports only versioned approved metadata.",
    evidence: [
      "31,521 series and 2,242,170 episodes verified without changing the source database hash",
      "Evidence-first prompt v3, canonical bilingual tags, staged drafts, and explicit approval",
      "One-title pilot, two-title campaign batches, private named pipe, native ABI gate, and rollback",
    ],
    ownership: "Product direction · extraction architecture · trust boundaries · prompt/eval strategy · release approval",
    stack: "Electron · React · TypeScript · Express · SQLite",
    image: "/projects/research-studio.webp",
    alt: "Research Studio workflow from a read-only bilingual Chinese-and-English catalog to a reviewed recoverable export",
    links: [
      ["Explore project", "/research-studio/"],
      ["Read case study", "https://github.com/NouraldinFarge/research-studio-case-study"],
      ["Inspect evidence", "https://github.com/NouraldinFarge/research-studio-case-study/blob/main/docs/verification-evidence.md"],
    ],
  },
];

const proofPoints = [
  ["3", "verified public Windows releases"],
  ["4", "evidence-backed showcase projects"],
  ["3", "release pipelines with checksums, SBOMs, and provenance"],
  ["1", "source-free case study with dated verification"],
];

const principles = [
  ["BOUNDARIES", "Fail closed", "Destructive, ambiguous, or unsupported paths stop safely and require explicit review."],
  ["DATA", "Keep authority local", "User data stays understandable, portable, recoverable, and outside unnecessary services."],
  ["RELEASES", "Attach the evidence", "Tests, checksums, SBOMs, provenance, and manual gates travel with the release claim."],
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Nouraldin Farge home">NF<span>.</span></a>
        <nav aria-label="Primary navigation">
          <a href="#work">Projects</a>
          <a href="#ownership">Ownership</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-resume" href="/Nouraldin-Farge-Resume.pdf" download="Nouraldin-Farge-Resume.pdf">Résumé <span aria-hidden="true">↓</span></a>
      </header>

      <main id="main-content" tabIndex={-1}>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> Chicago, Illinois · Open to software engineering roles</p>
          <h1>I build Windows software with <em>proof at every boundary.</em></h1>
          <p className="hero-summary">
            I’m Nouraldin Farge. My portfolio pairs three public, portable Windows releases
            with one source-free engineering case study—each grounded in explicit safety
            limits, recoverable local data, and verification you can inspect.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#work">Review shipped work</a>
            <a className="button secondary" href="/Nouraldin-Farge-Resume.pdf" download="Nouraldin-Farge-Resume.pdf">Download résumé <span aria-hidden="true">↓</span></a>
            <a className="button text-button" href="https://github.com/NouraldinFarge">GitHub <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <aside className="hero-system" aria-label="Portfolio review path">
          <p className="terminal-label">RECRUITER_SCAN</p>
          <div className="focus-row"><span>01</span><strong>See the product</strong><small>Current, synthetic-safe visuals</small></div>
          <div className="focus-row"><span>02</span><strong>Inspect the boundary</strong><small>What the system will and will not do</small></div>
          <div className="focus-row"><span>03</span><strong>Follow the evidence</strong><small>Code, releases, checks, and case-study proof</small></div>
          <div className="focus-row"><span>04</span><strong>Know who decided</strong><small>Human ownership is explicit</small></div>
        </aside>
      </section>

      <section className="proof-strip" aria-label="Portfolio summary">
        {proofPoints.map(([number, label]) => (
          <div key={label}><strong>{number}</strong><span>{label}</span></div>
        ))}
      </section>

      <section className="work-section" id="work">
        <div className="section-heading">
          <div><p className="kicker"><span /> Projects · verified August 2026</p><h2>Projects with proof attached.</h2></div>
          <p>Start with the outcome, then follow exact links to the implementation, immutable release, methodology, or bounded public evidence.</p>
        </div>

        <div className="project-list">
          {projects.map((project, index) => (
            <article className="project-card" key={project.name}>
              <div className="project-image-wrap">
                <span className="project-index">0{index + 1}</span>
                <a
                  className="project-image-link"
                  href={project.links[0][1]}
                  aria-label={`${project.links[0][0]} for ${project.name}`}
                >
                  {/* vinext serves these static portfolio assets directly; native img avoids its unsupported image optimizer. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.image} alt={project.alt} loading="lazy" decoding="async" />
                </a>
              </div>
              <div className="project-copy">
                <div className="project-meta"><span>{project.availability}</span><strong>{project.version}</strong></div>
                <h3>{project.name}</h3>
                <p className="project-description">{project.description}</p>
                <ul className="evidence-list">
                  {project.evidence.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <p className="project-ownership"><b>What I owned:</b> {project.ownership}</p>
                <p className="project-stack">{project.stack}</p>
                <div className="project-links">
                  {project.links.map(([label, href]) => <a key={href} href={href}>{label} <span aria-hidden="true">↗</span></a>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="approach-section" id="ownership">
        <div className="section-heading compact">
          <div><p className="kicker"><span /> Engineering ownership</p><h2>Trust is part of the product.</h2></div>
        </div>
        <div className="principles">
          {principles.map(([label, title, copy]) => (
            <article key={label}><span>{label}</span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
        <div className="ai-note">
          <span>AI-ASSISTED DEVELOPMENT</span>
          <p>
            AI agents assist with research, implementation, testing, and iteration. I own
            product direction, architecture, technical review, validation criteria, safety
            and licensing boundaries, data-source decisions, and final release approval.
            Agent output is treated as untrusted until it passes repository checks and human review.
          </p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <p className="kicker"><span /> Available for software engineering roles</p>
        <h2>Need an engineer who can turn complex requirements into dependable software?</h2>
        <p className="contact-copy">I’m especially interested in desktop products, local-first systems, release engineering, and trustworthy AI-assisted workflows.</p>
        <div className="contact-actions">
          <a className="button primary" href="mailto:nouraldinfarge@gmail.com">Email Nouraldin</a>
          <a className="button secondary" href="https://linkedin.com/in/nouraldin-farge">LinkedIn <span aria-hidden="true">↗</span></a>
          <a className="button secondary" href="/Nouraldin-Farge-Resume.pdf" download="Nouraldin-Farge-Resume.pdf">Download résumé <span aria-hidden="true">↓</span></a>
        </div>
      </section>
      </main>
      <footer><span>© 2026 Nouraldin Farge</span><span>Desktop · Local-first · Evidence-backed · Human-reviewed</span></footer>
    </>
  );
}
