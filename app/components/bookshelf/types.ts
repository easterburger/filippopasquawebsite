import type { ReactNode } from "react";

export type SpineFont = "sans" | "serif" | "mono";

export type BookSpread = {
  left: ReactNode;
  right: ReactNode;
};

export type BookDef = {
  id: string;
  /** Accessible name; also announced on the open spread. */
  title: string;
  /** Physical proportions in px at desktop scale: standing height, spine depth,
   *  and cover width as a ratio of height (default 0.72). */
  size: { h: number; d: number; wr?: number };
  spine: {
    bg: string;
    color: string;
    label: string;
    sub?: string;
    font?: SpineFont;
  };
  /** Tint of the page-block edges. */
  paper?: string;
  /** Front cover artwork. Fillers can omit it and rely on coverBg. */
  cover?: ReactNode;
  /** Flat cover color used when no artwork is given, and for the back cover. */
  coverBg?: string;
  /** Single two-page spread. Prefer `spreads` when a book has more than one. */
  spread?: BookSpread;
  /** Multi-page books: each entry is one open left/right pair. When set,
   *  takes precedence over `spread`. */
  spreads?: BookSpread[];
  /** Resting lean on the shelf, degrees. */
  lean?: number;
};

export type ShelfTheme = "paper" | "terminal";

/** Normalize single-spread and multi-spread books into one list. */
export function getBookSpreads(book: BookDef): BookSpread[] {
  if (book.spreads?.length) return book.spreads;
  if (book.spread) return [book.spread];
  return [];
}

export function bookHasContent(book: BookDef): boolean {
  return getBookSpreads(book).length > 0;
}
