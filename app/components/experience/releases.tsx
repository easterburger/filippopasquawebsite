import type { Release } from "./types";

// The Experience page is a record crate: products on the left, internships on
// the right. Every fact here comes from the project and internship write-ups.

export type ReleaseId =
  | "skycloud"
  | "dawn"
  | "zayno"
  | "lumostudio"
  | "bds"
  | "pasqua";

export const releases: Array<Release<ReleaseId>> = [
  {
    id: "skycloud",
    side: "A",
    sideLabel: "Project",
    title: "SkyCloud",
    word: "SKYCLOUD",
    logo: "/projects/skycloud/skycloud-wordmark-white.png",
    logoFill:
      "url(/projects/skycloud/sky.webp) center 40% / cover no-repeat, #7fb4ff",
    kind: "A team of AI employees",
    role: "Founder & solo developer",
    team: "Team of one",
    when: "Sep 2026 – now",
    privateNote: "Invite-only · Mac app in progress",
    accent: "#2b8cff",
    accentInk: "#ffffff",
    tint: "#07142a",
    cover: (
      <span className="sleeve sleeve-skycloud">
        <img src="/projects/skycloud/skycloud.webp" alt="" />
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-skycloud">
        <img src="/projects/skycloud/midnight-sky.webp" alt="" />
      </span>
    ),
  },
  {
    id: "dawn",
    side: "A",
    sideLabel: "Project",
    title: "Dawn",
    word: "DAWN",
    kind: "AI personal employee",
    role: "Founder & solo developer",
    team: "Team of one",
    when: "Jun 2026 – now",
    link: {
      href: "https://dawn-assistant.vercel.app/",
      label: "Meet Dawn",
      display: "dawn-assistant.vercel.app",
    },
    shot: { src: "/projects/dawn.webp", alt: "Dawn's landing page" },
    accent: "#ff8a3d",
    accentInk: "#1c0f22",
    tint: "#1a0f24",
    cover: (
      <span className="sleeve sleeve-dawn">
        <img src="/projects/dawn-cover.webp" alt="" />
        <span className="sleeve-dawn-word">DAWN</span>
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-dawn">
        <img src="/projects/dawn-cover.webp" alt="" />
      </span>
    ),
  },
  {
    id: "zayno",
    side: "A",
    sideLabel: "Project",
    title: "Zayno",
    word: "ZAYNO",
    kind: "AI workspace for students",
    role: "Founder & solo developer",
    team: "Team of one",
    when: "Nov 2025 – Jun 2026",
    link: {
      href: "https://zaynoai.vercel.app/",
      label: "Try Zayno",
      display: "zaynoai.vercel.app",
    },
    shot: { src: "/projects/zayno.webp", alt: "Zayno's landing page" },
    accent: "#ffd83d",
    accentInk: "#16161a",
    tint: "#0d1426",
    cover: (
      <span className="sleeve sleeve-zayno">
        <span className="sleeve-zayno-mark">
          <img src="/stickers/zayno.png" alt="" />
        </span>
        <span className="sleeve-zayno-band">Student edition</span>
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-zayno">
        <img src="/stickers/zayno.png" alt="" />
      </span>
    ),
  },
  {
    id: "lumostudio",
    side: "A",
    sideLabel: "Project",
    title: "LumoStudio",
    word: "LUMOSTUDIO",
    caret: true,
    kind: "Private desktop AI tutor",
    role: "Founder & solo developer",
    team: "Team of one · OurMind",
    when: "Aug 2025 – Nov 2025",
    privateNote: "Private build · never publicly released",
    accent: "#e4aa5b",
    accentInk: "#15130f",
    tint: "#15120c",
    cover: (
      <span className="sleeve sleeve-lumo">
        <span className="sleeve-lumo-glow" />
        <span className="sleeve-lumo-word">lumostudio_</span>
        <span className="sleeve-lumo-foot">Rust · Tauri · v1.0.5</span>
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-lumo">lumo_</span>
    ),
  },
  {
    id: "bds",
    side: "B",
    sideLabel: "Internship",
    title: "Borromeo de Silva",
    word: "BDS",
    kind: "Tutto Bene hill-climb game",
    role: "Software development intern",
    when: "Summer 2026 · 3 weeks",
    where: "Milano, Italy",
    link: {
      href: "https://tuttobenegame2026.vercel.app/",
      label: "Play Tutto Bene",
      display: "tuttobenegame2026.vercel.app",
    },
    shot: {
      src: "/projects/tuttobene.webp",
      alt: "Tutto Bene hill climb title screen",
    },
    accent: "#ef9d94",
    accentInk: "#232e7a",
    tint: "#10142e",
    cover: (
      <span className="sleeve sleeve-borromeo">
        <img src="/projects/tuttobene.webp" alt="" />
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-borromeo">
        <img src="/stickers/tutto-bene.png" alt="" />
      </span>
    ),
  },
  {
    id: "pasqua",
    side: "B",
    sideLabel: "Internship",
    title: "Pasqua Wines",
    word: "PASQUA",
    logo: "/stickers/pasqua-logo-white.png",
    logoFill: "#f4efe6",
    kind: "Internal tools & AI",
    role: "Software & AI intern",
    when: "Summer 2025 · 2 weeks",
    where: "Verona, Italy",
    privateNote: "Internal tools · not public",
    accent: "#d9486a",
    accentInk: "#fff4e6",
    tint: "#1c080d",
    cover: (
      <span className="sleeve sleeve-pasqua">
        <img
          className="sleeve-pasqua-logo"
          src="/stickers/pasqua-logo-white.png"
          alt=""
        />
        <img
          className="sleeve-pasqua-bottle"
          src="/stickers/pasqua-amarone.png"
          alt=""
        />
      </span>
    ),
    label: (
      <span className="vinyl-label-art vinyl-label-pasqua">
        <img src="/stickers/pasqua-logo.png" alt="" />
      </span>
    ),
  },
];
