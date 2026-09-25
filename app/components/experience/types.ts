import type { ReactNode } from "react";

import type { MusicTrackId } from "./record-music";

// A record crate is a list of records, a long-form story for each, and a few
// words about the page. Experience is one.

export type Release<Id extends MusicTrackId = MusicTrackId> = {
  /** Also picks the record's music loop and its deep link (#id). */
  id: Id;
  side: "A" | "B";
  sideLabel: string;
  title: string;
  /** What the giant headline shows while this sleeve is hovered. */
  word: string;
  /** Official wordmark (white on transparent) shown instead of the word. */
  logo?: string;
  /** What the wordmark is filled with (any CSS background). */
  logoFill?: string;
  /** A blinking terminal caret after the word. */
  caret?: boolean;
  kind: string;
  role: string;
  team?: string;
  when: string;
  where?: string;
  link?: { href: string; label: string; display: string };
  /** Shown with a lock where there is nothing public to link to. */
  privateNote?: string;
  /** Plain note in the link's place, for records that aren't products. */
  note?: string;
  shot?: { src: string; alt: string };
  /** Cursor bubble / UI accent and the arrow drawn on it. */
  accent: string;
  accentInk: string;
  /** Overlay tint behind the record player. */
  tint: string;
  cover: ReactNode;
  label: ReactNode;
};

export type StoryParagraph = { text: string; highlight?: string };

export type Story = {
  dek: string;
  sections: Array<{ label: string; paragraphs: StoryParagraph[] }>;
  quote: string;
  specs: Array<{ label: string; value: string }>;
};

export type Collection<Id extends MusicTrackId = MusicTrackId> = {
  /** Page title, read out by screen readers. */
  heading: string;
  /** The giant word while no sleeve is hovered. */
  word: string;
  releases: Array<Release<Id>>;
  stories: Record<Id, Story>;
  /** What each side of the crate holds, for screen readers. */
  sides: { A: string; B: string };
  /** Share of the stage width a word may fill, where the default is wrong. */
  fit?: Partial<Record<Id | "default", number>>;
  /** Old deep links that should still open a record. */
  hashAliases?: Record<string, Id>;
};
