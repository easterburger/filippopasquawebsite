import { Basketball, Bicycle, Golf, Planet } from "@phosphor-icons/react";

import type { Release } from "../experience/types";

// Education as a record crate: school on the left, time away on the right.
// Facts come from the CV and the Oxford Royale project report.

export type EducationId = "ib" | "varsity" | "clubs" | "oxford" | "nph";

/** Physics, CS, Economics (higher level), then Math, English, French. */
const SUBJECT_COLOURS = ["#e84249", "#2db4ca", "#e9b936", "#f28c38", "#8ec84c", "#9a77d3"];

export const records: Array<Release<EducationId>> = [
  {
    id: "ib",
    side: "A",
    sideLabel: "School",
    title: "IB Diploma",
    word: "IB DIPLOMA",
    kind: "International Baccalaureate Diploma",
    role: "IB Diploma student",
    where: "American School of Milan",
    when: "2024 – now",
    note: "Higher level: Physics · Computer Science · Economics",
    accent: "#2db4ca",
    accentInk: "#07181c",
    tint: "#08171a",
    cover: (
      <span className="sleeve sleeve-ib">
        <span className="sleeve-ib-bands">
          {SUBJECT_COLOURS.map((colour) => (
            <span key={colour} style={{ background: colour }} />
          ))}
        </span>
        <span className="sleeve-ib-word">IB</span>
        <span className="sleeve-ib-foot">Diploma</span>
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-ib">
        <span>IB</span>
      </span>
    ),
  },
  {
    id: "varsity",
    side: "A",
    sideLabel: "School",
    title: "Varsity basketball & golf",
    word: "VARSITY",
    kind: "Two varsity teams",
    role: "Varsity athlete",
    where: "American School of Milan",
    when: "Two years",
    note: "ESC tournaments · golf 1st as a team, basketball 3rd",
    accent: "#f07f2e",
    accentInk: "#1c0d03",
    tint: "#170c06",
    cover: (
      <span className="sleeve sleeve-varsity">
        <span className="sleeve-varsity-letter">V</span>
        <span className="sleeve-varsity-balls">
          <Basketball weight="fill" />
          <Golf weight="fill" />
        </span>
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-varsity">
        <span>V</span>
      </span>
    ),
  },
  {
    id: "clubs",
    side: "A",
    sideLabel: "School",
    title: "Clubs & tutoring",
    word: "AFTER CLASS",
    kind: "Astronomy Club, AI Club and physics tutoring",
    role: "Member & physics tutor",
    where: "American School of Milan",
    when: "2025 – now",
    note: "Astronomy · AI · Physics tutoring",
    accent: "#9db2ff",
    accentInk: "#0a0f26",
    tint: "#070b1d",
    cover: (
      <span className="sleeve sleeve-clubs">
        <Planet className="sleeve-clubs-planet" weight="duotone" />
        <span className="sleeve-clubs-word">after class</span>
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-clubs">
        <Planet weight="fill" />
      </span>
    ),
  },
  {
    id: "oxford",
    side: "B",
    sideLabel: "Summer school",
    title: "Oxford Royale",
    word: "OXFORD",
    kind: "Summer engineering programme",
    role: "Engineering student",
    team: "Final project: team of three",
    where: "Oxford, England",
    when: "Summer 2025",
    note: "Civil · Mechanical · Electrical engineering",
    shot: {
      src: "/education/oxford-study-buddy.webp",
      alt: "AI Study Buddy's architecture, from our Oxford project report",
    },
    accent: "#e2c07a",
    accentInk: "#0c1a33",
    tint: "#061229",
    cover: (
      <span className="sleeve sleeve-oxford">
        <span className="sleeve-oxford-word">Oxford</span>
        <svg
          className="sleeve-oxford-skyline"
          viewBox="0 0 100 34"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 34V22h6v-4l3-9 3 9v4h5V16h4v-3l2-4 2 4v3h4v18h3V20c0-5 4-9 9-9s9 4 9 9v1h2v-4h3l2-11 2 11h3v6h5V14l3-8 3 8v13h4v-5h4l3-7 3 7v12h6V21h5v13z" />
        </svg>
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-oxford">
        <span>Ox</span>
      </span>
    ),
  },
  {
    id: "nph",
    side: "B",
    sideLabel: "Service trip",
    title: "NPH Dominican Republic",
    word: "DOMINICANA",
    kind: "A week of service with NPH",
    role: "Volunteer",
    team: "With the Francesco Rava Foundation",
    where: "Dominican Republic",
    when: "February 2025",
    note: "Built a community bike shed",
    accent: "#ff7a5c",
    accentInk: "#2a0c05",
    tint: "#1a0c09",
    cover: (
      <span className="sleeve sleeve-nph">
        <span className="sleeve-nph-walls">
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
        <span className="sleeve-nph-sun" />
        <Bicycle className="sleeve-nph-bike" weight="bold" />
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-nph">
        <Bicycle weight="bold" />
      </span>
    ),
  },
];
