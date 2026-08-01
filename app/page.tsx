const projects = [
  {
    name: "DrawScope",
    eyebrow: "Historical research workbench",
    description:
      "A portable Windows desktop system for reproducible lottery-history research, provenance-aware imports, and leakage-resistant walk-forward evaluation.",
    proof: "41,598 verified rows · 6 games · 30 descriptive signals",
    stack: "React · Rust/Tauri · Python · SQLite",
    image: "/projects/drawscope.jpg",
    alt: "DrawScope desktop research workbench",
    code: "https://github.com/NouraldinFarge/drawscope",
    release: "https://github.com/NouraldinFarge/drawscope/releases/latest",
  },
  {
    name: "GameVault",
    eyebrow: "Portable game library",
    description:
      "A local-first game catalog and launcher with a managed portable root, SQLite persistence, backups, and a review-gated archive intake pipeline.",
    proof: "Immutable Windows release · SBOM · provenance attestation",
    stack: "React · Rust/Tauri · SQLite",
    image: "/projects/gamevault.jpg",
    alt: "GameVault portable game library",
    code: "https://github.com/NouraldinFarge/gamevault",
    release: "https://github.com/NouraldinFarge/gamevault/releases/latest",
  },
  {
    name: "Day-Trading Teacher",
    eyebrow: "Evidence-based learning environment",
    description:
      "A local-first desktop classroom for planning, historical replay, paper trading, journaling, deterministic risk calculations, and evidence-based review.",
    proof: "Educational only · no live signals · no order execution",
    stack: "React · Rust/Tauri · SQLite",
    image: "/projects/day-trading-teacher.jpg",
    alt: "Day-Trading Teacher planning workspace",
    code: "https://github.com/NouraldinFarge/day-trading-teacher",
    release: "https://github.com/NouraldinFarge/day-trading-teacher/releases/latest",
  },
  {
    name: "Research Studio",
    eyebrow: "Source-free engineering case study",
    description:
      "A guarded AI-assisted catalog-enrichment workflow built around read-only source access, bounded batches, evidence validation, human approval, and recoverable exports.",
    proof: "Private implementation · public architecture and safety evidence",
    stack: "Electron · React · TypeScript · Express · SQLite",
    image: "/projects/research-studio.png",
    alt: "Research Studio engineering case study",
    code: "https://github.com/NouraldinFarge/research-studio-case-study",
    release: null,
  },
];

const proofPoints = [
  ["3", "portable Windows products"],
  ["4", "showcase projects"],
  ["0", "cloud accounts required"],
  ["1", "owner for every release decision"],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Nouraldin Farge home">
          NF<span>.</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#approach">Approach</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-resume" href="/Nouraldin-Farge-Resume.pdf">
          Résumé <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> Chicago, Illinois · Available for software engineering roles</p>
          <h1>
            I build desktop software that keeps <em>people in control.</em>
          </h1>
          <p className="hero-summary">
            I’m Nouraldin Farge, a software engineer focused on local-first Windows
            products, explicit safety boundaries, reproducible data workflows, and
            releases that can be independently verified.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#work">Explore selected work</a>
            <a className="button secondary" href="https://github.com/NouraldinFarge">
              GitHub profile <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <aside className="hero-system" aria-label="Engineering focus">
          <p className="terminal-label">CURRENT_FOCUS</p>
          <div className="focus-row"><span>01</span><strong>Desktop systems</strong></div>
          <div className="focus-row"><span>02</span><strong>Local-first data</strong></div>
          <div className="focus-row"><span>03</span><strong>Safety boundaries</strong></div>
          <div className="focus-row"><span>04</span><strong>Verified releases</strong></div>
          <div className="signal-line"><i /> systems online</div>
        </aside>
      </section>

      <section className="proof-strip" aria-label="Portfolio summary">
        {proofPoints.map(([number, label]) => (
          <div key={label}><strong>{number}</strong><span>{label}</span></div>
        ))}
      </section>

      <section className="work-section" id="work">
        <div className="section-heading">
          <div>
            <p className="kicker"><span /> Selected work</p>
            <h2>Products with proof attached.</h2>
          </div>
          <p>Every public claim links to source, a release, a case study, or reproducible verification evidence.</p>
        </div>

        <div className="project-list">
          {projects.map((project, index) => (
            <article className="project-card" key={project.name}>
              <div className="project-image-wrap">
                <span className="project-index">0{index + 1}</span>
                <img src={project.image} alt={project.alt} />
              </div>
              <div className="project-copy">
                <p className="project-eyebrow">{project.eyebrow}</p>
                <h3>{project.name}</h3>
                <p className="project-description">{project.description}</p>
                <p className="project-proof">{project.proof}</p>
                <p className="project-stack">{project.stack}</p>
                <div className="project-links">
                  <a href={project.code}>{project.release ? "View source" : "Read case study"} <span>↗</span></a>
                  {project.release ? <a href={project.release}>Get release <span>↓</span></a> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="approach-section" id="approach">
        <div className="section-heading compact">
          <div>
            <p className="kicker"><span /> Engineering approach</p>
            <h2>Trust is a product feature.</h2>
          </div>
        </div>
        <div className="principles">
          <article>
            <span>BOUNDARIES</span>
            <h3>Fail closed</h3>
            <p>Destructive, ambiguous, or unsupported paths stop safely and require explicit review.</p>
          </article>
          <article>
            <span>DATA</span>
            <h3>Local by default</h3>
            <p>User data stays understandable, portable, recoverable, and outside unnecessary cloud services.</p>
          </article>
          <article>
            <span>RELEASES</span>
            <h3>Evidence over claims</h3>
            <p>Automated tests, checksums, SBOMs, provenance, and documented manual gates support each release.</p>
          </article>
        </div>
        <div className="ai-note">
          <span>AI-ASSISTED DEVELOPMENT</span>
          <p>
            AI agents assist with implementation and review. I own product direction,
            architecture, validation, safety and licensing decisions, and final release
            approval. Agent output is a draft—not proof—until I verify it.
          </p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <p className="kicker"><span /> Let’s build carefully</p>
        <h2>Looking for an engineer who can turn complex requirements into dependable software?</h2>
        <div className="contact-actions">
          <a className="button primary" href="mailto:nouraldinfarge@gmail.com">Email Nouraldin</a>
          <a className="button secondary" href="https://linkedin.com/in/nouraldin-farge">LinkedIn <span>↗</span></a>
          <a className="button secondary" href="/Nouraldin-Farge-Resume.pdf">Download résumé <span>↓</span></a>
        </div>
      </section>

      <footer>
        <span>© 2026 Nouraldin Farge</span>
        <span>Desktop · Local-first · Human-reviewed</span>
      </footer>
    </main>
  );
}
