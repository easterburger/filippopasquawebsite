import { ArrowUpRight, CalendarBlank, LockSimple, User } from "@phosphor-icons/react";

import type { BookDef } from "./types";

/* ------------------------------------------------------------------ */
/* Dawn: dusk gradient with the sun character as a plate.              */
/* ------------------------------------------------------------------ */

const dawn: BookDef = {
  id: "dawn",
  title: "Dawn",
  size: { h: 328, d: 46 },
  spine: {
    bg: "linear-gradient(180deg, #241b3a 0%, #63324c 55%, #c47a41 100%)",
    color: "#ffe9d2",
    label: "DAWN",
    sub: "AI PERSONAL EMPLOYEE",
  },
  coverBg: "#241b3a",
  paper: "#f0e4d2",
  lean: 0,
  cover: (
    <span className="bookcover bookcover-dawn">
      <span className="bookcover-dawn-sun">
        <img src="/stickers/dawn.png" alt="" />
      </span>
      <span className="bookcover-dawn-title">Dawn</span>
      <span className="bookcover-dawn-sub">an AI personal employee</span>
      <span className="bookcover-dawn-foot">iMessage · WhatsApp · Telegram</span>
    </span>
  ),
  spread: {
    left: (
      <div className="bookpage bookpage-colophon">
        <span className="bookpage-mark is-round">
          <img src="/stickers/dawn.png" alt="" />
        </span>
        <h2 className="bookpage-title">Dawn</h2>
        <p className="bookpage-role">Founder &amp; Solo Developer</p>
        <ul className="bookpage-meta">
          <li>
            <CalendarBlank weight="bold" size={14} />
            Jun 2026 - Present
          </li>
          <li>
            <User weight="bold" size={14} />
            Team of one
          </li>
        </ul>
        <div className="bookpage-tags">
          <span>Vercel AI SDK</span>
          <span>MCP</span>
          <span>Vector search</span>
          <span>Multi-agent</span>
        </div>
      </div>
    ),
    right: (
      <div className="bookpage bookpage-story">
        <p className="bookpage-lede">
          An AI personal employee reachable over iMessage, WhatsApp, Telegram
          and its own email address.
        </p>
        <ul className="bookpage-points">
          <li>
            Custom agentic harness on the Vercel AI SDK with declarative agent
            specs, cost-tiered model routing and per-account budget
            enforcement.
          </li>
          <li>
            Inspectable memory layer retrieved through hybrid full-text and
            vector search with scheduled decay.
          </li>
          <li>
            54 connectors and MCP servers across Gmail, Calendar, Drive,
            Slack, Notion, GitHub and Linear behind one 69-tool surface with
            human approval gates.
          </li>
          <li>
            Ships its own MCP server exposing 20 tools, plus a sub-agent
            architecture that cut main-context input tokens by 33%.
          </li>
        </ul>
        <figure className="bookpage-plate">
          <img
            src="/projects/dawn.webp"
            alt="Dawn landing page over a dusk gradient"
            loading="lazy"
          />
          <figcaption>dawn-assistant.vercel.app</figcaption>
        </figure>
        <a
          className="bookpage-cta"
          href="https://dawn-assistant.vercel.app/"
          target="_blank"
          rel="noreferrer"
        >
          Visit Dawn
          <ArrowUpRight weight="bold" size={15} />
        </a>
      </div>
    ),
  },
};

/* ------------------------------------------------------------------ */
/* Zayno: white student workbook with a highlighter stroke.            */
/* ------------------------------------------------------------------ */

const zayno: BookDef = {
  id: "zayno",
  title: "Zayno",
  size: { h: 318, d: 44 },
  spine: {
    bg: "#f4f5f8",
    color: "#16161a",
    label: "ZAYNO",
    sub: "AI WORKSPACE",
  },
  coverBg: "#f4f5f8",
  paper: "#f2f0e8",
  lean: 0,
  cover: (
    <span className="bookcover bookcover-zayno">
      <span className="bookcover-zayno-word">
        <img src="/stickers/zayno.png" alt="" />
      </span>
      <span className="bookcover-zayno-sub">
        the all-in-one AI workspace for students
      </span>
      <span className="bookcover-zayno-band">STUDENT EDITION</span>
    </span>
  ),
  spread: {
    left: (
      <div className="bookpage bookpage-colophon">
        <span className="bookpage-mark is-wide">
          <img src="/stickers/zayno.png" alt="" />
        </span>
        <h2 className="bookpage-title">Zayno</h2>
        <p className="bookpage-role">Founder &amp; Solo Developer</p>
        <ul className="bookpage-meta">
          <li>
            <CalendarBlank weight="bold" size={14} />
            Nov 2025 - Jun 2026
          </li>
          <li>
            <User weight="bold" size={14} />
            Team of one
          </li>
        </ul>
        <div className="bookpage-tags">
          <span>Next.js</span>
          <span>Supabase</span>
          <span>pgvector</span>
          <span>OAuth</span>
        </div>
      </div>
    ),
    right: (
      <div className="bookpage bookpage-story">
        <p className="bookpage-lede">
          A full-stack AI academic operating system for coursework, scheduling
          and study workflows.
        </p>
        <ul className="bookpage-points">
          <li>
            Next.js + Supabase platform with a cost-optimized multi-LLM router
            and task-specific fallback tiers.
          </li>
          <li>
            OAuth Google Workspace agent that reads syllabi, checks calendar
            conflicts and auto time-blocks study sessions.
          </li>
          <li>
            RAG-enabled file management, automated study-tool generation and
            GPA tracking on pgvector.
          </li>
        </ul>
        <figure className="bookpage-plate">
          <img
            src="/projects/zayno.webp"
            alt="Zayno landing page: the all-in-one AI workspace for students"
            loading="lazy"
          />
          <figcaption>zaynoai.vercel.app</figcaption>
        </figure>
        <a
          className="bookpage-cta"
          href="https://zaynoai.vercel.app/"
          target="_blank"
          rel="noreferrer"
        >
          Visit Zayno
          <ArrowUpRight weight="bold" size={15} />
        </a>
      </div>
    ),
  },
};

/* ------------------------------------------------------------------ */
/* Lumostudio: graphite with a lamp glow, fully typographic.           */
/* Bigger, thicker binding — multi-spread desktop study companion.     */
/* ------------------------------------------------------------------ */

const lumostudio: BookDef = {
  id: "lumostudio",
  title: "LumoStudio",
  size: { h: 348, d: 60 },
  spine: {
    bg: "#1b1e24",
    color: "#f4cf99",
    label: "LUMOSTUDIO",
    sub: "AI STUDY COMPANION",
    font: "mono",
  },
  coverBg: "#1b1e24",
  paper: "#ece7da",
  lean: 0,
  cover: (
    <span className="bookcover bookcover-lumo">
      <span className="bookcover-lumo-glow" />
      <span className="bookcover-lumo-word">lumostudio_</span>
      <span className="bookcover-lumo-sub">a private desktop AI tutor</span>
      <span className="bookcover-lumo-foot">RUST · TAURI · v1.0.5</span>
    </span>
  ),
  spreads: [
    /* ---- Spread 1: colophon + pitch -------------------------------- */
    {
      left: (
        <div className="bookpage bookpage-colophon">
          <span className="bookpage-mark is-lumo">lumostudio_</span>
          <h2 className="bookpage-title">LumoStudio</h2>
          <p className="bookpage-role">Founder &amp; Solo Developer</p>
          <ul className="bookpage-meta">
            <li>
              <CalendarBlank weight="bold" size={14} />
              Aug 2025 - Nov 2025
            </li>
            <li>
              <User weight="bold" size={14} />
              Team of one · OurMind
            </li>
          </ul>
          <div className="bookpage-tags">
            <span>Tauri</span>
            <span>Rust</span>
            <span>React</span>
            <span>llama.cpp</span>
            <span>Clerk</span>
          </div>
          <p className="bookpage-folio">I</p>
        </div>
      ),
      right: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">Desktop AI study companion</p>
          <p className="bookpage-lede">
            A real installable app for macOS and Windows — not a website —
            where students chat with Lumo and turn notes into summaries,
            guides, flashcards, and quizzes.
          </p>
          <ul className="bookpage-points">
            <li>
              Core promise: study tools + dual AI engines — cloud when you want
              power, local when you want privacy or offline.
            </li>
            <li>
              Built for ordinary laptops, not high-end AI machines. Private by
              default. Local-first. No telemetry.
            </li>
            <li>
              Publisher OurMind · bundle{" "}
              <code>com.ourmind.lumostudio</code> · packaging around v1.0.5.
            </li>
          </ul>
          <p className="bookpage-prose is-quiet">
            &ldquo;Begin learning · Safe. Local. Yours.&rdquo;
          </p>
          <span className="bookpage-private">
            <LockSimple weight="bold" size={14} />
            No public download link yet
          </span>
          <p className="bookpage-folio">II</p>
        </div>
      ),
    },

    /* ---- Spread 2: problem + product shell ------------------------- */
    {
      left: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">The problem</p>
          <p className="bookpage-prose">
            Students don&rsquo;t just need ChatGPT in a window. They need a
            study workflow: drop notes and PDFs in, get structured output,
            practice and review, keep conversations organized locally — and
            optionally work without internet or without sending everything to
            the cloud.
          </p>
          <p className="bookpage-kicker is-follow">Identity</p>
          <ul className="bookpage-points">
            <li>
              Assistant voice: <strong>Lumo</strong> — calm, clear, supportive;
              concise step-by-step replies in the user&rsquo;s language.
            </li>
            <li>
              Feel: warm cream/amber library-desk energy (
              <code>#FBF8F4</code> / <code>#E4AA5B</code>), closer to focused
              study software than flashy AI demos.
            </li>
          </ul>
          <p className="bookpage-kicker is-follow">First run</p>
          <p className="bookpage-prose">
            Animated loading → auth choice (Guest / Create Account / Sign In
            via Clerk) → hero landing with composer and quick chips for Study
            Guide, Flashcards, Quiz. Sending jumps straight into the workspace.
          </p>
          <p className="bookpage-folio">III</p>
        </div>
      ),
      right: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">The workspace</p>
          <p className="bookpage-prose">
            Five tool pills share one shell — Chat, Summariser, StudyGuide,
            Flashcards, Quiz — while drawers handle conversations and settings.
          </p>
          <ul className="bookpage-points">
            <li>
              <strong>Left drawer</strong> — create, rename, delete, search,
              bulk select, export chats; online-mode status.
            </li>
            <li>
              <strong>Right drawer</strong> — Light/Dark/System, AI engine
              (Online / Offline / Auto), auth, usage stats, JSON
              import/export, local model manager, privacy messaging.
            </li>
            <li>
              Global search, toasts, undo/redo, keyboard shortcuts, native
              Tauri drag-and-drop, beta feedback flow.
            </li>
          </ul>
          <p className="bookpage-kicker is-follow">Files</p>
          <p className="bookpage-prose">
            PDF (PDF.js extraction), TXT/Markdown, images for vision online.
            Drop → extract → tool prompt → copy, practice, save, or export.
            Spec also targets local RAG with per-conversation vector stores.
          </p>
          <p className="bookpage-folio">IV</p>
        </div>
      ),
    },

    /* ---- Spread 3: five tools + dual engines ----------------------- */
    {
      left: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">Five study tools</p>
          <ul className="bookpage-cars">
            <li>
              <span className="bookpage-cars-name">Chat</span>
              <span className="bookpage-cars-note">
                Multi-turn tutoring, file attach, markdown / code / KaTeX,
                auto-titling, engine-status awareness
              </span>
            </li>
            <li>
              <span className="bookpage-cars-name">Summariser</span>
              <span className="bookpage-cars-note">
                Paste or drop material → structured digest; copy, regenerate,
                summary-type variants
              </span>
            </li>
            <li>
              <span className="bookpage-cars-name">Study Guide</span>
              <span className="bookpage-cars-note">
                Topic + files → overview / concepts / steps / examples document
              </span>
            </li>
            <li>
              <span className="bookpage-cars-name">Flashcards</span>
              <span className="bookpage-cars-note">
                Front/back + difficulty; review all/hard/due; Space flip,
                arrows navigate, Cmd/Ctrl+S shuffle; save/export
              </span>
            </li>
            <li>
              <span className="bookpage-cars-name">Quiz</span>
              <span className="bookpage-cars-note">
                MCQ, T/F, open, mixed · length &amp; difficulty presets ·
                optional timer · scoring, explanations, save/load — a real quiz
                UX, not just prompt → text
              </span>
            </li>
          </ul>
          <p className="bookpage-folio">V</p>
        </div>
      ),
      right: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">Dual AI engines</p>
          <p className="bookpage-prose">
            The signature feature — power when connected, privacy when local.
          </p>
          <ul className="bookpage-points">
            <li>
              <strong>Online</strong> — cloud via backend proxy (keys stay
              server-side). Stronger reasoning, longer generations, vision.
              Session usage tracking and daily quotas.
            </li>
            <li>
              <strong>Offline</strong> — local{" "}
              <strong>Qwen2.5-3B Instruct (GGUF)</strong> via llama.cpp, with a
              lite fallback path for weak machines. Model manager downloads and
              prepares weights; no network when truly offline.
            </li>
            <li>
              <strong>Auto</strong> — prefer online when available, fall back
              to offline, switch when a local model becomes ready.
            </li>
          </ul>
          <p className="bookpage-prose is-quiet">
            UnifiedLLMClient abstracts Hugging Face / OpenAI-compatible /
            local providers behind one path into every tool.
          </p>
          <p className="bookpage-folio">VI</p>
        </div>
      ),
    },

    /* ---- Spread 4: privacy, stack, maturity ------------------------ */
    {
      left: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">Privacy &amp; data</p>
          <ul className="bookpage-points">
            <li>
              Local-first: conversations and settings on device (Dexie /
              IndexedDB patterns; spec paths under <code>~/.lumo/</code>).
            </li>
            <li>
              <strong>Guest</strong> for full local use without an account;{" "}
              <strong>Clerk</strong> for account / sync / premium path.
            </li>
            <li>
              Offline keeps processing local. No telemetry by default. Online
              necessarily sends prompts to providers — covered in Privacy
              Policy.
            </li>
          </ul>
          <p className="bookpage-kicker is-follow">Architecture</p>
          <ul className="bookpage-points">
            <li>
              Monorepo: Tauri v2 + React/Vite desktop, design tokens package,
              core LLM/settings/persistence, backend proxy for online AI.
            </li>
            <li>
              Zustand, React Router, Tailwind tokens, Fuse.js search, jspdf
              export, Tauri FS/HTTP/updater — ships as .dmg / .msi Education
              builds.
            </li>
          </ul>
          <p className="bookpage-folio">VII</p>
        </div>
      ),
      right: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">By the numbers</p>
          <ul className="bookpage-stats">
            <li>
              <strong>5</strong>
              <span>study tools in one desktop shell</span>
            </li>
            <li>
              <strong>3</strong>
              <span>engine modes · Online / Offline / Auto</span>
            </li>
            <li>
              <strong>2</strong>
              <span>platforms · macOS + Windows installers</span>
            </li>
            <li>
              <strong>v1.0.5</strong>
              <span>product packaging · early-product maturity</span>
            </li>
          </ul>
          <p className="bookpage-prose">
            Honest framing: a real MVP-to-early-product desktop study app with
            a complete tool suite and a dual-engine vision — not a chat
            wrapper. Local llama.cpp polish, deep RAG, and full cloud sync are
            still hardening.
          </p>
          <p className="bookpage-disclaimer">
            LumoStudio is OurMind&rsquo;s desktop AI study companion: chat with
            Lumo, generate study artifacts from your materials, and choose cloud
            power or local privacy — calm, warm UI aimed at everyday student
            laptops.
          </p>
          <span className="bookpage-private">
            <LockSimple weight="bold" size={14} />
            Private build · no public link yet
          </span>
          <p className="bookpage-folio">VIII</p>
        </div>
      ),
    },
  ],
};

export const projectBooks: BookDef[] = [dawn, zayno, lumostudio];
