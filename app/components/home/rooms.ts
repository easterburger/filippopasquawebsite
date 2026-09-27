import type { VoiceName } from "@/components/sound/engine";

import { portfolioMenuItems } from "../portfolio-menu";

// The four doors on the home desk: one souvenir from each room of the site.
// Tape colours come from the menu, so the desk and the menu never disagree.

export type DoorId = "record" | "book" | "photo" | "letter";

export type Door = {
  id: DoorId;
  href: string;
  /** The label-tape text, which is also the start of the link's name. */
  label: string;
  /** Rest of the accessible name, read after the label. */
  sr: string;
  /** Small print that slides out under the label on hover. */
  strip: string;
  /** Label tape colour (the menu's colour for the page). */
  tape: string;
  /** The room's own background, which floods the screen on the way in. */
  room: string;
  /** Shape the room grows from: the disc and the seal are round. */
  portal: "circle" | "rect";
  hoverVoice: VoiceName;
  goVoice: VoiceName;
  /** Entrance delay after the curtain lifts, in seconds. */
  delay: number;
};

function tape(href: string) {
  return portfolioMenuItems.find((item) => item.href === href)?.hoverStyles?.bgColor ?? "#e9b936";
}

export const DOORS: Door[] = [
  {
    id: "record",
    href: "/experience",
    label: "experience",
    sr: ", projects and internships",
    strip: "4 products · 2 internships",
    tape: tape("/experience"),
    room: "#0a0a0b",
    portal: "circle",
    hoverVoice: "vinylSlide",
    goVoice: "needleDrop",
    delay: 0.6,
  },
  {
    id: "book",
    href: "/education",
    label: "education",
    sr: ", the IB Diploma and Oxford Royale",
    strip: "IB · Oxford Royale",
    tape: tape("/education"),
    room: "#0f1813",
    portal: "rect",
    hoverVoice: "pageFlip",
    goVoice: "bookSlide",
    delay: 0.5,
  },
  {
    id: "photo",
    href: "/about",
    label: "about me",
    sr: ", who I am",
    strip: "Milan · 4 languages",
    tape: tape("/about"),
    room: "#3e8fdd",
    portal: "rect",
    hoverVoice: "crateFlick",
    goVoice: "clickSoft",
    delay: 0.4,
  },
  {
    id: "letter",
    href: "/contact",
    label: "contact",
    sr: ", get in touch",
    strip: "say ciao",
    tape: tape("/contact"),
    room: "#244e3b",
    portal: "circle",
    hoverVoice: "pageTurn",
    goVoice: "sleeveSlide",
    delay: 0.3,
  },
];
