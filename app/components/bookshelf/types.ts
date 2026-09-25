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
  /** Page-by-page books, paired into spreads when opened. Takes precedence
   *  over `spreads`: on a phone only the right-hand page is readable, so
   *  every page gets its turn on the right there. */
  pages?: ReactNode[];
  /** Resting lean on the shelf, degrees. */
  lean?: number;
};

export type ShelfTheme = "paper" | "terminal";

/** Normalize page lists, single spreads and multi-spread books into one
 *  list of spreads. `singlePage` is the phone layout, where the left page
 *  only peeks in from the edge. */
export function getBookSpreads(book: BookDef, singlePage = false): BookSpread[] {
  const pages = book.pages;
  if (pages?.length) {
    if (singlePage) {
      return pages.map((page, index) => ({
        left: index > 0 ? pages[index - 1] : null,
        right: page,
      }));
    }
    const spreads: BookSpread[] = [];
    for (let index = 0; index < pages.length; index += 2) {
      spreads.push({ left: pages[index], right: pages[index + 1] ?? null });
    }
    return spreads;
  }
  if (book.spreads?.length) return book.spreads;
  if (book.spread) return [book.spread];
  return [];
}

export function bookHasContent(book: BookDef): boolean {
  return Boolean(book.pages?.length || book.spreads?.length || book.spread);
}
