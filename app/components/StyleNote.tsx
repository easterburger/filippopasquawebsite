"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, X } from "@phosphor-icons/react";

/**
 * The site changes its skin from page to page on purpose, which a visitor has
 * no way of knowing. This is the footnote that says so: a peephole in the
 * corner of the homepage rather than a paragraph taking up the hero.
 */
export default function StyleNote({ ready = true }: { ready?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Dismissing from inside the note leaves focus on a button that's about to
  // be unmounted, so it goes back to the eye that opened it.
  const closeNote = () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      toggleRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className={`style-note${ready ? " is-ready" : ""}${
        isOpen ? " is-open" : ""
      }`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            id="style-note-panel"
            className="style-note-panel"
            aria-labelledby="style-note-heading"
            initial={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(12px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              className="style-note-close"
              onClick={closeNote}
              aria-label="Close the note"
            >
              <X weight="bold" size={14} />
            </button>

            <p className="style-note-eyebrow">A note on the design</p>
            <h2 id="style-note-heading" className="style-note-heading">
              Every page is its own world.
            </h2>
            <p className="style-note-body">
              Nothing here shares a style with the page before it. That’s
              deliberate: every page gets its own type, palette and motion,
              built from scratch, so this site is a handful of separate design
              problems instead of one template repeated.
            </p>
            <p className="style-note-body">
              It’s a challenge I set myself — I’d rather show range than one
              safe house style. So if it feels inconsistent, that part’s on
              purpose.
            </p>
            <p className="style-note-sign">— Filippo</p>
          </motion.aside>
        )}
      </AnimatePresence>

      <button
        ref={toggleRef}
        type="button"
        className="style-note-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={isOpen ? "style-note-panel" : undefined}
        aria-label={
          isOpen
            ? "Hide the note about the site's design"
            : "Why does every page look different?"
        }
      >
        <span className="style-note-label">
          {isOpen ? "hide note" : "why so different?"}
        </span>
        <span className="style-note-icon" aria-hidden="true">
          <Eye weight="bold" size={18} />
        </span>
      </button>
    </div>
  );
}
