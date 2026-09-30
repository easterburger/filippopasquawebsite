import { Basketball, Bicycle, Golf, Planet } from "@phosphor-icons/react";
import type { CSSProperties, ReactNode } from "react";

import type { BookDef, SpineFont } from "../bookshelf/types";
import type { Story } from "../experience/types";

import { stories, type EducationId } from "./stories";

// The Education library: three shelves of books. Five of them open into real
// pages (their text lives in stories.ts); the rest are the subjects and
// course books that fill out the shelves, and they stay put.

type Source = {
  id: EducationId;
  title: string;
  /** Small caps line over the title page. */
  kicker: string;
  /** What the book is about, under the title. */
  subtitle: string;
  meta: string[];
  /** Highlighter colour for the key phrase in each paragraph. */
  accent: string;
  shot?: { src: string; alt: string };
};

/* ------------------------------------------------------------------------ */
/* Pages                                                                     */
/* ------------------------------------------------------------------------ */

function Folio({ n }: { n: number }) {
  return <p className="edu-page-folio">{n}</p>;
}

/** Chapter labels are written lowercase; pages set them in sentence case. */
const sentence = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);

function withHighlight(text: string, highlight: string | undefined) {
  if (!highlight) return text;
  const at = text.indexOf(highlight);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className="edu-page-mark">{highlight}</mark>
      {text.slice(at + highlight.length)}
    </>
  );
}

function bookPages(source: Source, story: Story): ReactNode[] {
  const pages: ReactNode[] = [];
  const style = { "--edu-accent": source.accent } as CSSProperties;
  const add = (className: string, body: ReactNode) => {
    const n = pages.length + 1;
    pages.push(
      <div className={`bookpage edu-page ${className}`} style={style}>
        {body}
        <Folio n={n} />
      </div>,
    );
  };

  add(
    "edu-page-title",
    <>
      <p className="edu-page-kicker">{source.kicker}</p>
      <h2 className="edu-page-heading">{source.title}</h2>
      <p className="edu-page-subtitle">{source.subtitle}</p>
      <span className="edu-page-rule" aria-hidden="true" />
      <ul className="edu-page-meta">
        {source.meta.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </>,
  );

  add(
    "edu-page-contents",
    <>
      <p className="edu-page-dek">{story.dek}</p>
      <p className="edu-page-kicker">Contents</p>
      <ol className="edu-page-toc">
        {story.sections.map((section) => (
          <li key={section.label}>{sentence(section.label)}</li>
        ))}
      </ol>
    </>,
  );

  story.sections.forEach((section, index) => {
    add(
      "edu-page-chapter",
      <>
        <p className="edu-page-kicker">Chapter {index + 1}</p>
        <h3 className="edu-page-chapter-title">{sentence(section.label)}</h3>
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph.text} className="edu-page-prose">
            {withHighlight(paragraph.text, paragraph.highlight)}
          </p>
        ))}
      </>,
    );

    if (index === 0) {
      add(
        "edu-page-quote",
        <blockquote className="edu-page-blockquote">
          <p>{story.quote}</p>
        </blockquote>,
      );
    }

    if (index === 2 && source.shot) {
      add(
        "edu-page-plate",
        <figure className="edu-page-figure">
          <img src={source.shot.src} alt={source.shot.alt} loading="lazy" />
          <figcaption>{source.shot.alt}</figcaption>
        </figure>,
      );
    }
  });

  add(
    "edu-page-colophon",
    <>
      <p className="edu-page-kicker">Colophon</p>
      <dl className="edu-page-specs">
        {story.specs.map((spec) => (
          <div key={spec.label}>
            <dt>{spec.label}</dt>
            <dd>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </>,
  );

  // Books end on a right-hand page.
  if (pages.length % 2) {
    add(
      "edu-page-exlibris",
      <p className="edu-page-stamp">
        <span>Ex libris</span>
        Filippo Pasqua
      </p>,
    );
  }

  return pages;
}

/* ------------------------------------------------------------------------ */
/* The five books that open                                                  */
/* ------------------------------------------------------------------------ */

const SUBJECT_COLOURS = ["#e84249", "#2db4ca", "#e9b936", "#f28c38", "#8ec84c", "#9a77d3"];

const ib: BookDef = {
  id: "ib",
  title: "IB Diploma",
  size: { h: 344, d: 54, wr: 0.7 },
  spine: {
    bg: "linear-gradient(180deg, #e84249 0 3%, #2db4ca 3% 6%, #e9b936 6% 9%, #f2ede1 9% 91%, #f28c38 91% 94%, #8ec84c 94% 97%, #9a77d3 97%)",
    color: "#16181c",
    label: "IB DIPLOMA",
    sub: "AMERICAN SCHOOL OF MILAN",
    font: "serif",
  },
  coverBg: "#f2ede1",
  paper: "#f3ecdc",
  cover: (
    <span className="bookcover edu-cover-ib">
      <span className="edu-cover-ib-bands" aria-hidden="true">
        {SUBJECT_COLOURS.map((colour) => (
          <span key={colour} style={{ background: colour }} />
        ))}
      </span>
      <span className="edu-cover-ib-word">IB</span>
      <span className="edu-cover-ib-title">Diploma Programme</span>
      <span className="edu-cover-ib-foot">American School of Milan</span>
    </span>
  ),
  pages: bookPages(
    {
      id: "ib",
      title: "IB Diploma",
      kicker: "School · 2024 – now",
      subtitle: "The International Baccalaureate Diploma Programme",
      meta: ["American School of Milan", "Higher level: Physics, Computer Science, Economics"],
      accent: "#2db4ca",
    },
    stories.ib,
  ),
};

const varsity: BookDef = {
  id: "varsity",
  title: "Varsity basketball & golf",
  size: { h: 330, d: 46, wr: 0.7 },
  spine: {
    bg: "linear-gradient(180deg, #f07f2e 0 5%, #fdf6e8 5% 6.5%, #1d2a5c 6.5% 93.5%, #fdf6e8 93.5% 95%, #f07f2e 95%)",
    color: "#fdf6e8",
    label: "VARSITY",
    sub: "BASKETBALL · GOLF",
  },
  coverBg: "#1d2a5c",
  paper: "#f1ebdd",
  cover: (
    <span className="bookcover edu-cover-varsity">
      <span className="edu-cover-varsity-letter">V</span>
      <span className="edu-cover-varsity-balls" aria-hidden="true">
        <Basketball weight="fill" />
        <Golf weight="fill" />
      </span>
      <span className="edu-cover-varsity-foot">Basketball · Golf</span>
    </span>
  ),
  pages: bookPages(
    {
      id: "varsity",
      title: "Varsity",
      kicker: "School · two years",
      subtitle: "Varsity basketball and varsity golf",
      meta: ["American School of Milan", "ESC tournaments"],
      accent: "#f07f2e",
    },
    stories.varsity,
  ),
};

const clubs: BookDef = {
  id: "clubs",
  title: "After class: clubs & tutoring",
  size: { h: 312, d: 42, wr: 0.7 },
  spine: {
    bg: "radial-gradient(circle at 30% 12%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 70% 30%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 40% 74%, #dfe6ff 0 1px, transparent 1.5px), linear-gradient(180deg, #151a4a, #2b3290)",
    color: "#dfe6ff",
    label: "AFTER CLASS",
    sub: "ASTRONOMY · AI · TUTORING",
  },
  coverBg: "#151a4a",
  paper: "#f0ece2",
  cover: (
    <span className="bookcover edu-cover-clubs">
      <Planet className="edu-cover-clubs-planet" weight="duotone" aria-hidden="true" />
      <span className="edu-cover-clubs-title">After class</span>
      <span className="edu-cover-clubs-foot">Astronomy · AI · Physics tutoring</span>
    </span>
  ),
  pages: bookPages(
    {
      id: "clubs",
      title: "After class",
      kicker: "School · 2024 – now",
      subtitle: "Astronomy Club, AI Club and physics tutoring",
      meta: ["American School of Milan"],
      accent: "#6f82f0",
    },
    stories.clubs,
  ),
};

const oxford: BookDef = {
  id: "oxford",
  title: "Oxford Royale",
  size: { h: 340, d: 50, wr: 0.7 },
  spine: {
    bg: "linear-gradient(180deg, #0f2750 0 6%, #d9b46a 6% 6.8%, #0f2750 6.8% 8%, #d9b46a 8% 8.8%, #0f2750 8.8% 91.2%, #d9b46a 91.2% 92%, #0f2750 92% 93.2%, #d9b46a 93.2% 94%, #0f2750 94%)",
    color: "#e2c07a",
    label: "OXFORD ROYALE",
    sub: "SUMMER 2025",
    font: "serif",
  },
  coverBg: "#0f2750",
  paper: "#f2ead8",
  cover: (
    <span className="bookcover edu-cover-oxford">
      <span className="edu-cover-oxford-frame" aria-hidden="true" />
      <span className="edu-cover-oxford-title">Oxford</span>
      <span className="edu-cover-oxford-sub">Royale · Summer 2025</span>
      <span className="edu-cover-oxford-foot">Engineering</span>
      <svg
        className="edu-cover-oxford-skyline"
        viewBox="0 0 100 34"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 34V22h6v-4l3-9 3 9v4h5V16h4v-3l2-4 2 4v3h4v18h3V20c0-5 4-9 9-9s9 4 9 9v1h2v-4h3l2-11 2 11h3v6h5V14l3-8 3 8v13h4v-5h4l3-7 3 7v12h6V21h5v13z" />
      </svg>
    </span>
  ),
  pages: bookPages(
    {
      id: "oxford",
      title: "Oxford Royale",
      kicker: "Summer school · Summer 2025",
      subtitle: "Two weeks of engineering: civil, mechanical and electrical",
      meta: ["Oxford, England", "Final project: team of three"],
      accent: "#c9a44c",
      shot: {
        src: "/education/oxford-study-buddy.webp",
        alt: "AI Study Buddy's pipeline, from our project report",
      },
    },
    stories.oxford,
  ),
};

const nph: BookDef = {
  id: "nph",
  title: "Dominicana: NPH Dominican Republic",
  size: { h: 318, d: 40, wr: 0.7 },
  spine: {
    bg: "linear-gradient(180deg, #35c2b0 0 7%, #ffd23f 7% 10%, #ff7a5c 10% 90%, #ffd23f 90% 93%, #35c2b0 93%)",
    color: "#2a0c05",
    label: "DOMINICANA",
    sub: "NPH · FEBRUARY 2025",
  },
  coverBg: "#8fd6f0",
  paper: "#f4eddd",
  cover: (
    <span className="bookcover edu-cover-nph">
      <span className="edu-cover-nph-sun" aria-hidden="true" />
      <span className="edu-cover-nph-title">Dominicana</span>
      <span className="edu-cover-nph-walls" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
      <Bicycle className="edu-cover-nph-bike" weight="bold" aria-hidden="true" />
    </span>
  ),
  pages: bookPages(
    {
      id: "nph",
      title: "Dominicana",
      kicker: "Service trip · February 2025",
      subtitle: "A week of service with NPH and the Francesca Rava Foundation",
      meta: ["Dominican Republic", "Helped build a community bike shed"],
      accent: "#ff7a5c",
    },
    stories.nph,
  ),
};

/* ------------------------------------------------------------------------ */
/* Shelf fillers: real subjects and course books, glued to the shelf         */
/* ------------------------------------------------------------------------ */

function filler(
  id: string,
  label: string,
  sub: string,
  bg: string,
  color: string,
  size: BookDef["size"],
  { font, lean }: { font?: SpineFont; lean?: number } = {},
): BookDef {
  return {
    id,
    title: label,
    size: { wr: 0.7, ...size },
    spine: { bg, color, label, sub, font },
    coverBg: bg,
    lean,
  };
}

const GILT = "#d9b46a";
/** Gilt lettering: a touch brighter than the bands, for legibility. */
const GILT_TEXT = "#efd495";

export type ShelfItem =
  /** `decor`: an untitled cloth binding that only fills out the shelf. */
  | { kind: "book"; book: BookDef; decor?: boolean }
  | { kind: "prop"; prop: "bookend" | "plant" | "trophy" | "globe" | "stack" | "ball" };

export type Shelf = {
  id: string;
  label: string;
  note: string;
  items: ShelfItem[];
};

const book = (entry: BookDef): ShelfItem => ({ kind: "book", book: entry });

// Untitled cloth bindings with gilt bands pack each shelf out to the uprights,
// the way a real library shelf is full. Picked by index, so every render
// (server and client) builds the same shelf.
const CLOTH = ["#5a1f24", "#1f3b2c", "#1d2a44", "#6b4a2a", "#2a2a2e", "#7a5a3a", "#3c2a4a", "#4a1a1a"];
const DECOR_HEIGHTS = [276, 300, 288, 262, 310, 294, 270, 284];
const DECOR_DEPTHS = [30, 38, 26, 42, 34, 28, 36, 24];

function decor(key: string, count: number, offset: number): ShelfItem[] {
  return Array.from({ length: count }, (_, index) => {
    const n = index + offset;
    const cloth = CLOTH[n % CLOTH.length];
    const bands = [
      `${cloth} 0 7%`,
      `${GILT} 7% 7.8%`,
      `${cloth} 7.8% 10%`,
      `${GILT} 10% 10.8%`,
      `${cloth} 10.8% 89.2%`,
      `${GILT} 89.2% 90%`,
      `${cloth} 90% 92.2%`,
      `${GILT} 92.2% 93%`,
      `${cloth} 93%`,
    ];
    return {
      kind: "book",
      decor: true,
      book: {
        id: `${key}-${index}`,
        title: "",
        size: {
          h: DECOR_HEIGHTS[(n * 3) % DECOR_HEIGHTS.length],
          d: DECOR_DEPTHS[(n * 5) % DECOR_DEPTHS.length],
          wr: 0.7,
        },
        spine: { bg: `linear-gradient(180deg, ${bands.join(", ")})`, color: GILT, label: "" },
        coverBg: cloth,
      },
    };
  });
}
const prop = (name: Extract<ShelfItem, { kind: "prop" }>["prop"]): ShelfItem => ({
  kind: "prop",
  prop: name,
});

export const shelves: Shelf[] = [
  {
    id: "diploma",
    label: "The IB Diploma",
    note: "American School of Milan",
    items: [
      ...decor("diploma-left", 8, 0),
      prop("bookend"),
      book(filler("physics", "PHYSICS", "HIGHER LEVEL", "#8e2a2e", GILT_TEXT, { h: 300, d: 44 })),
      book(filler("computer-science", "COMPUTER SCIENCE", "HIGHER LEVEL", "#16545e", GILT_TEXT, { h: 306, d: 46 })),
      book(filler("economics", "ECONOMICS", "HIGHER LEVEL", "#8a6a16", "#fbf3dc", { h: 296, d: 42 })),
      book(ib),
      book(filler("math", "MATH AA", "STANDARD LEVEL", "#a35a1f", "#fbeee0", { h: 272, d: 34 })),
      book(filler("english", "ENGLISH LANG & LIT", "STANDARD LEVEL", "#3f6b2a", "#eef4e2", { h: 280, d: 36 })),
      book(filler("french", "FRANÇAIS", "AB INITIO", "#4f3d7a", "#efe9fb", { h: 262, d: 30 })),
      book(filler("tok", "THEORY OF KNOWLEDGE", "IB CORE", "#2b2b30", GILT_TEXT, { h: 286, d: 26 }, { font: "serif" })),
      book(filler("ee", "EXTENDED ESSAY", "IB CORE", "#5d4a36", "#f3e6cf", { h: 282, d: 22 }, { font: "serif" })),
      book(filler("cas", "CAS", "IB CORE", "#7a2f4f", "#fbe9f0", { h: 268, d: 20 }, { lean: -5 })),
      prop("plant"),
      ...decor("diploma-right", 8, 6),
    ],
  },
  {
    id: "after-class",
    label: "After class",
    note: "Teams, clubs and tutoring",
    items: [
      ...decor("after-left", 8, 3),
      prop("trophy"),
      book(filler("playbook", "PLAYBOOK", "VARSITY BASKETBALL", "#b4541c", "#fff1e3", { h: 282, d: 30 })),
      book(varsity),
      book(filler("scorecards", "SCORECARDS", "VARSITY GOLF", "#1f5a3a", "#eaf6ee", { h: 262, d: 26 })),
      prop("ball"),
      book(filler("astronomy", "ASTRONOMY", "CLUB", "#1d2340", "#c9d3ff", { h: 300, d: 40 })),
      book(clubs),
      book(filler("ai-club", "AI CLUB", "LLM BASICS", "#2d2d33", "#e5e5ea", { h: 276, d: 30 }, { font: "mono" })),
      book(filler("tutoring", "PHYSICS PROBLEMS", "TUTORING", "#6d2227", "#fde9e7", { h: 290, d: 34 }, { lean: -6 })),
      prop("bookend"),
      ...decor("after-right", 8, 9),
    ],
  },
  {
    id: "away",
    label: "Away from school",
    note: "Summer school and service",
    items: [
      ...decor("away-left", 7, 5),
      prop("stack"),
      book(filler("civil", "CIVIL", "ENGINEERING", "#2f4a6b", "#e4ecf6", { h: 296, d: 30 })),
      book(filler("mechanical", "MECHANICAL", "ENGINEERING", "#3b4a55", "#e7edf1", { h: 296, d: 30 })),
      book(filler("electrical", "ELECTRICAL", "ENGINEERING", "#4b3f68", "#ece8f6", { h: 296, d: 30 })),
      book(oxford),
      book(filler("study-buddy", "AI STUDY BUDDY", "PROJECT REPORT", "#f2efe6", "#1b2a44", { h: 270, d: 20 }, { font: "mono" })),
      prop("globe"),
      book(nph),
      prop("bookend"),
      ...decor("away-right", 7, 13),
    ],
  },
];

export const openableBooks = [ib, varsity, clubs, oxford, nph];
