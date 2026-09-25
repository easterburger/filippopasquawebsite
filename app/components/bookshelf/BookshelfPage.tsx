"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import BubbleMenu from "../BubbleMenu";
import SubpageBackLink from "../SubpageBackLink";
import { portfolioMenuItems } from "../portfolio-menu";

import { computeGeometry } from "./geometry";
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
