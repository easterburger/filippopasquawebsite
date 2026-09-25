"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import BubbleMenu from "./BubbleMenu";
import { computeGeometry } from "./bookshelf/geometry";
import OpenBookOverlay, { type OpenGeometry } from "./bookshelf/OpenBookOverlay";
import ShelfBook from "./bookshelf/ShelfBook";
import { bookHasContent, type BookDef } from "./bookshelf/types";
import { openableBooks, shelves, type ShelfItem } from "./education/books";
import { portfolioMenuItems } from "./portfolio-menu";

import "./education/library.css";

// Education is a library: a lamp-lit bookcase with three shelves. Five books
// open into real pages; the rest are the subjects and course books around them.

type OpenedState = { book: BookDef; geometry: OpenGeometry };

function Prop({ name }: { name: Extract<ShelfItem, { kind: "prop" }>["prop"] }) {
  return (
    <span className={`edu-prop edu-prop-${name}`} aria-hidden="true">
      {name === "stack" ? (
        <>
          <span />
          <span />
          <span />
        </>
      ) : null}
      {name === "trophy" ? <span className="edu-prop-trophy-plate">ESC · 1st</span> : null}
      {name === "plant" ? (
        <>
          <span className="edu-prop-leaf" />
          <span className="edu-prop-leaf" />
          <span className="edu-prop-leaf" />
          <span className="edu-prop-leaf" />
        </>
      ) : null}
    </span>
  );
}

export default function EducationPage() {
  const [opened, setOpened] = useState<OpenedState | null>(null);
  const slotsRef = useRef(new Map<string, HTMLElement>());
  const openerRef = useRef<HTMLElement | null>(null);
  // Mirrors `opened` for the deep-link timer, which outlives renders.
  const openRef = useRef(false);

  const registerSlot = useCallback((id: string, element: HTMLElement | null) => {
    if (element) slotsRef.current.set(id, element);
    else slotsRef.current.delete(id);
  }, []);

  const openBook = useCallback((book: BookDef, rect: DOMRect) => {
    if (!bookHasContent(book)) return;
    // Focus returns here on close. A deep-linked book has nothing focused
    // yet (just <body>), so it falls back to the book's own shelf slot.
    const active = document.activeElement;
    openerRef.current =
      active instanceof HTMLElement && active !== document.body
        ? active
        : (slotsRef.current.get(book.id) ?? null);
    openRef.current = true;
    setOpened({ book, geometry: computeGeometry(book, rect) });
    window.history.replaceState(null, "", `#${book.id}`);
  }, []);

  const handleClosed = useCallback(() => {
    openRef.current = false;
    setOpened(null);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  // Focus goes back to the book that was opened, once the shelves stop being
  // inert (focusing an inert element does nothing).
  useEffect(() => {
    if (opened || !openerRef.current) return;
    openerRef.current.focus({ preventScroll: true });
    openerRef.current = null;
  }, [opened]);

  // Deep links (/education#oxford) take that book off the shelf by themselves
  // once it has landed: measuring mid-entrance would make it fly from (and
  // back to) the wrong spot. A book the visitor opened first wins.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const book = openableBooks.find((entry) => entry.id === id);
    if (!book) return;
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      const slot = slotsRef.current.get(id);
      if (!slot) return;
      await Promise.all(
        slot.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
      );
      if (cancelled || openRef.current) return;
      slot.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
      openBook(book, slot.getBoundingClientRect());
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [openBook]);

  return (
    <main className="edu-library">
      <div className="edu-menu-slot" inert={opened !== null}>
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
      </div>

      <div className="edu-room" aria-hidden="true">
        <span className="edu-lamp" />
      </div>

      <div className="edu-library-body" inert={opened !== null}>
        <header className="edu-library-hero">
          <p className="edu-library-kicker">The library</p>
          <h1 className="edu-library-heading">Education</h1>
          <p className="edu-library-intro">
            School, summers and everything around them. The five books with a
            ribbon open: pull one off the shelf to read it.
          </p>
        </header>

        <div className="edu-case">
          <span className="edu-case-crown" aria-hidden="true" />
          {shelves.map((shelf, shelfIndex) => (
            <section
              key={shelf.id}
              className="edu-shelf"
              aria-labelledby={`shelf-${shelf.id}`}
            >
              <div className="edu-shelf-scroller">
                <ul className="edu-shelf-row">
                  {shelf.items.map((item, itemIndex) => {
                    if (item.kind === "prop") {
                      return (
                        <li
                          key={`${item.prop}-${itemIndex}`}
                          className="edu-shelf-item is-prop"
                          aria-hidden="true"
                        >
                          <Prop name={item.prop} />
                        </li>
                      );
                    }
                    // Books drop in along each shelf, a shelf a beat after the
                    // one above; a full case lands in under two seconds.
                    const index = Math.round(itemIndex / 4) + shelfIndex * 2;
                    const real = bookHasContent(item.book);
                    // Filler spines are aria-hidden art, so their title is
                    // repeated as text for screen readers.
                    const label =
                      real || item.decor
                        ? null
                        : `${item.book.spine.label} · ${item.book.spine.sub}`;
                    return (
                      <li
                        key={item.book.id}
                        className={`edu-shelf-item${real ? " is-real" : ""}${
                          item.decor ? " is-decor" : ""
                        }`}
                        aria-hidden={item.decor ? true : undefined}
                        title={label ?? undefined}
                        style={
                          real
                            ? ({ "--ribbon-delay": `${140 + index * 90 + 520}ms` } as CSSProperties)
                            : undefined
                        }
                      >
                        {label ? (
                          <span className="edu-sr-only">{label.toLowerCase()}</span>
                        ) : null}
                        <ShelfBook
                          book={item.book}
                          index={index}
                          onOpen={openBook}
                          hidden={opened?.book.id === item.book.id}
                          registerSlot={registerSlot}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="edu-shelf-board">
                <h2 id={`shelf-${shelf.id}`} className="edu-shelf-card">
                  <span>{shelf.label}</span>
                  <small>{shelf.note}</small>
                </h2>
              </div>
            </section>
          ))}
          <span className="edu-case-plinth" aria-hidden="true" />
        </div>
      </div>

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
