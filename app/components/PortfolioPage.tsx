import Image from "next/image";
import BubbleMenu, { type BubbleMenuItem } from "./BubbleMenu";
import CircularText from "./CircularText";
import DecryptedText from "./DecryptedText";
import SplitText from "./SplitText";

const menuItems: BubbleMenuItem[] = [
  {
    label: "work",
    href: "#work",
    ariaLabel: "Go to selected work",
    rotation: -5,
  },
  {
    label: "about",
    href: "#about",
    ariaLabel: "Go to about",
    rotation: 5,
  },
  {
    label: "experience",
    href: "#experience",
    ariaLabel: "Go to experience",
    rotation: -4,
  },
  {
    label: "contact",
    href: "#contact",
    ariaLabel: "Go to contact",
    rotation: 4,
  },
];

const workStack = [
  "NEXT.JS",
  "SUPABASE",
  "RUST",
  "TAURI",
  "RAG",
  "PGVECTOR",
  "OAUTH",
  "MCP",
  "VERCEL AI SDK",
];

export default function PortfolioPage() {
  return (
    <main id="top">
      <a className="skip-link" href="#work">
        Skip to work
      </a>

      <BubbleMenu
        logo={<span>FP / 26</span>}
        items={menuItems}
        menuBg="#f3efef"
        menuContentColor="#080808"
        useFixedPosition
        animationDuration={0.55}
        staggerDelay={0.09}
      />

      <section className="hero" aria-labelledby="hero-title">
        <Image
          src="/projects/hero-machine.webp"
          alt="A hand-built black cable and chrome machine in a dark studio"
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-inner">
          <p className="hero-kicker">Filippo Pasqua di Bisceglie</p>
          <h1 id="hero-title" className="hero-title">
            <SplitText
              tag="span"
              text="I BUILD"
              delay={45}
              duration={0.8}
              ease="power4.out"
              splitType="chars"
              from={{ opacity: 0, y: 80, rotateX: -70 }}
              to={{ opacity: 1, y: 0, rotateX: 0 }}
              threshold={0}
              rootMargin="0px"
            />
            <SplitText
              tag="span"
              text="THINGS THAT THINK."
              delay={28}
              duration={0.9}
              ease="power4.out"
              splitType="chars"
              from={{ opacity: 0, y: 80 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="0px"
            />
          </h1>
          <p className="hero-subtitle">
            AI products, internal tools, and games built by a student who ships.
          </p>
          <div className="hero-actions">
            <a href="#work" className="ghost-link">
              View work <span aria-hidden="true">↗</span>
            </a>
            <a
              href="/Filippo-Pasqua-CV.pdf"
              className="ghost-link muted"
              target="_blank"
              rel="noreferrer"
            >
              Download CV <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="hero-orbit">
          <CircularText
            text="BUILT TO WORK * BUILT TO SHIP * "
            onHover="speedUp"
            spinDuration={18}
          />
        </div>
      </section>

      <section id="work" className="work-section section-shell">
        <div className="section-heading">
          <h2>
            <SplitText
              tag="span"
              text="SELECTED"
              splitType="words"
              delay={90}
              duration={0.8}
              threshold={0.2}
              rootMargin="-40px"
            />
            <span className="editorial-word">work</span>
          </h2>
          <p>
            Five products across personal AI, education, interactive design,
            local models, and internal operations.
          </p>
        </div>

        <article className="project project-featured" aria-labelledby="dawn-title">
          <div className="project-copy">
            <p className="project-kind">AI employee</p>
            <h3 id="dawn-title">DAWN</h3>
            <p className="project-lead">
              A personal AI employee reachable over iMessage, WhatsApp,
              Telegram, and email, with human approval before outbound actions.
            </p>

            <div className="project-facts" aria-label="Dawn technical highlights">
              <span>
                <strong>54</strong> connectors and MCP servers
              </span>
              <span>
                <strong>69</strong> tools behind one approval layer
              </span>
              <span>
                <strong>33%</strong> fewer main-context input tokens
              </span>
            </div>

            <p className="project-stack">
              <DecryptedText
                text="VERCEL AI SDK / MCP / HYBRID MEMORY / MULTI-LLM"
                animateOn="inViewHover"
                speed={32}
                maxIterations={8}
                className="revealed"
                encryptedClassName="encrypted"
              />
            </p>
            <a
              href="https://dawn-assistant.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="project-link"
            >
              Open Dawn <span aria-hidden="true">↗</span>
            </a>
          </div>

          <a
            href="https://dawn-assistant.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="project-image-wrap"
            aria-label="Open the Dawn website"
          >
            <Image
              src="/projects/dawn.webp"
              alt="Dawn website showing its personal AI employee interface"
              fill
              sizes="(max-width: 899px) 100vw, 58vw"
              className="project-image"
            />
          </a>
        </article>

        <div className="project-duo">
          <article className="project project-game" aria-labelledby="tutto-title">
            <a
              href="https://tuttobenegame2026.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="duo-image"
              aria-label="Play the Tutto Bene game"
            >
              <Image
                src="/projects/tuttobene.webp"
                alt="Tutto Bene 90s-inspired racing game at Lake Maggiore"
                fill
                sizes="(max-width: 899px) 100vw, 58vw"
                className="project-image"
              />
            </a>
            <div className="duo-copy">
              <p className="project-kind">Interactive experience</p>
              <h3 id="tutto-title">TUTTO BENE</h3>
              <p>
                A 90s-inspired racing game for Borromeo de Silva and Race
                Service, created for their annual event at Lake Maggiore.
              </p>
              <a
                href="https://tuttobenegame2026.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="project-link"
              >
                Play game <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>

          <article className="project project-zayno" aria-labelledby="zayno-title">
            <div className="duo-copy">
              <p className="project-kind">Academic operating system</p>
              <h3 id="zayno-title">ZAYNO</h3>
              <p>
                A full-stack student workspace with task-specific model routing,
                Google Workspace agents, RAG file management, and study tools.
              </p>
              <a
                href="https://zaynoai.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="project-link dark"
              >
                Open Zayno <span aria-hidden="true">↗</span>
              </a>
            </div>
            <a
              href="https://zaynoai.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="duo-image"
              aria-label="Open the Zayno website"
            >
              <Image
                src="/projects/zayno.webp"
                alt="Zayno website showing an AI workspace for students"
                fill
                sizes="(max-width: 899px) 100vw, 42vw"
                className="project-image"
              />
            </a>
          </article>
        </div>

        <div className="private-projects">
          <article
            className="private-project private-project-lumo"
            aria-labelledby="lumo-title"
          >
            <p className="project-kind">Privacy-first desktop AI</p>
            <h3 id="lumo-title">LUMO&shy;STUDIO</h3>
            <p>
              A local-first tutor for macOS and Windows, built in Rust and Tauri
              with Ollama offline, OpenRouter online, and hardware-aware model
              recommendations.
            </p>
            <div className="local-signal" aria-hidden="true">
              <span>LOCAL</span>
              <span>PRIVATE</span>
              <span>OFFLINE</span>
            </div>
          </article>

          <article
            className="private-project private-project-pasqua"
            aria-labelledby="pasqua-title"
          >
            <p className="project-kind">Internal tools at Pasqua Wines</p>
            <h3 id="pasqua-title">
              ROOMS,
              <br />
              THEN RADIO.
            </h3>
            <p>
              A meeting-room booking app and an AI agent that turned each day&apos;s
              wine-industry news into a podcast for employees.
            </p>
            <div className="audio-lines" aria-hidden="true">
              {Array.from({ length: 18 }, (_, index) => (
                <span
                  key={index}
                  style={{ "--line": index } as React.CSSProperties}
                />
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-statement">
          <p className="about-serif">Student by schedule.</p>
          <h2>BUILDER BY DEFAULT.</h2>
        </div>
        <div className="about-copy">
          <p>
            I am completing the International Baccalaureate at the American
            School of Milan, with higher-level study in Physics, Computer
            Science, and Economics.
          </p>
          <p>
            The common thread through my work is autonomy: software that can
            understand context, take useful action, and remain inspectable by
            the person using it.
          </p>
        </div>
      </section>

      <section className="stack-marquee" aria-label="Selected technologies">
        <div className="stack-track">
          {[...workStack, ...workStack].map((item, index) => (
            <span key={`${item}-${index}`}>
              {item}
              <i aria-hidden="true">*</i>
            </span>
          ))}
        </div>
      </section>

      <section id="experience" className="experience-section section-shell">
        <div className="experience-title">
          <h2>
            BUILT IN
            <br />
            THE REAL WORLD.
          </h2>
          <CircularText
            text="CODE * SCHOOL * SPORT * SERVICE * "
            spinDuration={24}
            onHover="slowDown"
            className="experience-orbit"
          />
        </div>

        <div className="experience-columns">
          <div className="experience-column">
            <h3>Work and study</h3>
            <article>
              <span>Summer 2026</span>
              <h4>Borromeo de Silva</h4>
              <p>Software development internship in Milan.</p>
            </article>
            <article>
              <span>Summer 2025</span>
              <h4>Pasqua Wines</h4>
              <p>Software and AI internship in Verona.</p>
            </article>
            <article>
              <span>Summer 2025</span>
              <h4>Oxford Royale</h4>
              <p>Civil, mechanical, and electrical engineering.</p>
            </article>
          </div>

          <div className="experience-column">
            <h3>Outside code</h3>
            <article>
              <span>2025 - Present</span>
              <h4>Physics tutoring</h4>
              <p>Supporting younger students with concepts and problem solving.</p>
            </article>
            <article>
              <span>February 2025</span>
              <h4>Francesco Rava Foundation</h4>
              <p>Community service project in the Dominican Republic.</p>
            </article>
            <article>
              <span>Two varsity seasons</span>
              <h4>Basketball and golf</h4>
              <p>ESC tournament competitor, including a team golf win.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-dot" aria-hidden="true" />
        <p className="contact-serif">Have an ambitious problem?</p>
        <h2>
          LET&apos;S BUILD
          <br />
          SOMETHING REAL.
        </h2>
        <a
          href="mailto:pasquadibisceglief@asmilan.org"
          className="contact-link"
        >
          pasquadibisceglief@asmilan.org <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer>
        <p>Filippo Pasqua di Bisceglie</p>
        <p>Milan, 2026</p>
      </footer>
    </main>
  );
}
