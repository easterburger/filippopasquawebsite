"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import BubbleMenu from "../BubbleMenu";
import SubpageBackLink from "../SubpageBackLink";
import { portfolioMenuItems } from "../portfolio-menu";

import OpenBookOverlay, { type OpenGeometry } from "./OpenBookOverlay";
import ShelfBook from "./ShelfBook";
import { bookHasContent, type BookDef, type ShelfTheme } from "./types";

type BookshelfPageProps = {
  theme: ShelfTheme;
  kicker: string;
  heading: string;
  intro: string;
  shelfLabel: string;
  books: BookDef[];
};

type OpenedState = {
  book: BookDef;
  geometry: OpenGeometry;
};

function computeGeometry(book: BookDef, rect: DOMRect): OpenGeometry {
  const wr = book.size.wr ?? 0.72;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Phone: strong single-page reading. Tablet portrait: large single page.
  // Tablet landscape / small laptop: modest spread. Desktop: full spread.
  const mode =
    vw < 640 ? "phone" : vw < 900 || (vw < 1024 && vh > vw) ? "tablet" : "desktop";

  // Leave room for close, pager, sound toggle, and iOS safe areas.
  const usableH = vh - (mode === "phone" ? 112 : 96);

  let H: number;
  let W: number;
  let shift: number;

  if (mode === "phone") {
    W = Math.min(vw * 0.92, 400);
    H = Math.min(W / wr, usableH * 0.88);
    W = H * wr;
    shift = 0;
  } else if (mode === "tablet") {
    // Prefer a readable single page when the two-page spread would shrink
    // each leaf below a comfortable size.
    const spreadPageCap = Math.min(vw * 0.4, 420);
    const singleCap = Math.min(vw * 0.72, 480);
    const useSingle = spreadPageCap < 300 || vw < 820;

    if (useSingle) {
      W = Math.min(singleCap, usableH * wr * 0.9);
      H = Math.min(W / wr, usableH * 0.9);
      W = H * wr;
      shift = 0;
    } else {
      H = Math.min(usableH * 0.88, 700);
      W = H * wr;
      if (W > spreadPageCap) {
        W = spreadPageCap;
        H = W / wr;
      }
      shift = W / 2;
    }
  } else {
    H = Math.min(usableH * 0.94, 820);
    W = H * wr;
    const maxW = Math.min(vw * 0.47, 580);
    if (W > maxW) {
      W = maxW;
      H = W / wr;
    }
    shift = W / 2;
  }

  const D = Math.max(14, Math.min(58, book.size.d * (H / book.size.h)));

  return {
    dx: rect.left + rect.width / 2 - vw / 2,
    dy: rect.top + rect.height / 2 - vh / 2,
    scale: rect.height / H,
    W,
    H,
    D,
    shift,
  };
}

export default function BookshelfPage({
  theme,
  kicker,
  heading,
  intro,
  shelfLabel,
  books,
}: BookshelfPageProps) {
  const [opened, setOpened] = useState<OpenedState | null>(null);
  const slotsRef = useRef(new Map<string, HTMLElement>());
  const openerRef = useRef<HTMLElement | null>(null);

  const registerSlot = useCallback((id: string, el: HTMLElement | null) => {
    if (el) slotsRef.current.set(id, el);
    else slotsRef.current.delete(id);
  }, []);

  const openBook = useCallback((book: BookDef, rect: DOMRect) => {
    if (!bookHasContent(book)) return;
    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setOpened({ book, geometry: computeGeometry(book, rect) });
    window.history.replaceState(null, "", `#${book.id}`);
  }, []);

  const handleClosed = useCallback(() => {
    setOpened(null);
    window.history.replaceState(null, "", window.location.pathname);
    openerRef.current?.focus({ preventScroll: true });
    openerRef.current = null;
  }, []);

  // Deep link: /work/projects#dawn pulls that book off the shelf by itself,
  // once the entrance animation has landed.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || !books.some((book) => book.id === id && bookHasContent(book)))
      return;

    const timeout = window.setTimeout(() => {
      const slot = slotsRef.current.get(id);
      const book = books.find((entry) => entry.id === id);
      if (slot && book) openBook(book, slot.getBoundingClientRect());
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [books, openBook]);

  return (
    <main className={`bookshelf-page is-${theme}`}>
      <BubbleMenu
        items={portfolioMenuItems}
        menuAriaLabel="Toggle portfolio navigation"
        menuBg="#f1efe6"
        menuContentColor="#181b20"
        useFixedPosition
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.1}
        glass
      />

      <SubpageBackLink
        className={theme === "terminal" ? "is-on-dark" : undefined}
      />

      <div className="bookshelf-backdrop" aria-hidden="true" />

      <header className="bookshelf-hero">
        <p className="bookshelf-kicker">{kicker}</p>
        <h1 className="bookshelf-heading">{heading}</h1>
        <p className="bookshelf-intro">{intro}</p>
      </header>

      <section className="bookcase" aria-label={shelfLabel}>
        <div className="bookshelf">
          <div className="bookshelf-row">
            {books.map((book, index) => (
              <ShelfBook
                key={book.id}
                book={book}
                index={index}
                onOpen={openBook}
                hidden={opened?.book.id === book.id}
                registerSlot={registerSlot}
              />
            ))}
          </div>
          <div className="bookshelf-board" aria-hidden="true" />
        </div>
      </section>

      {opened ? (
        <OpenBookOverlay
          key={opened.book.id}
          book={opened.book}
          geometry={opened.geometry}
          onClosed={handleClosed}
        />
      ) : null}
    </main>
  );
}
