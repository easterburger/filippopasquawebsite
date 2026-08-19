"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

import { useSound } from "@/components/sound/SoundProvider";

import { bookHasContent, type BookDef } from "./types";

const TILT_RANGE = 7;

type ShelfBookProps = {
  book: BookDef;
  /** Called with the slot's rect so the overlay clone can start from it. */
  onOpen?: (book: BookDef, rect: DOMRect) => void;
  /** True while this book's overlay clone is on stage. */
  hidden?: boolean;
  /** Lets the parent find this slot again for hash deep-links. */
  registerSlot?: (id: string, el: HTMLElement | null) => void;
  /** Stagger index for the entrance animation. */
  index?: number;
};

function prefersCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function ShelfBook({
  book,
  onOpen,
  hidden,
  registerSlot,
  index = 0,
}: ShelfBookProps) {
  const { play } = useSound();
  const slotRef = useRef<HTMLElement | null>(null);
  const [isOut, setIsOut] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [coarsePointer] = useState(prefersCoarsePointer);

  // Cursor-tracking tilt lives in motion values so pointer movement never
  // re-renders the tree.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 170, damping: 16 });
  const springY = useSpring(tiltY, { stiffness: 170, damping: 16 });

  const isReal = bookHasContent(book);
  const wr = book.size.wr ?? 0.72;

  const setSlot = useCallback(
    (el: HTMLElement | null) => {
      slotRef.current = el;
      registerSlot?.(book.id, el);
    },
    [registerSlot, book.id],
  );

  const pullOut = () => {
    if (!isOut) play("bookSlide");
    setIsOut(true);
  };

  const putBack = () => {
    setIsOut(false);
    tiltX.set(0);
    tiltY.set(0);
  };

  const handleMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (coarsePointer) return;
    const el = slotRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    tiltY.set(nx * TILT_RANGE);
    tiltX.set(-ny * TILT_RANGE);
  };

  const handleClick = () => {
    const el = slotRef.current;
    if (!el) return;

    if (isReal && onOpen) {
      onOpen(book, el.getBoundingClientRect());
      return;
    }

    // Fillers are glued to the shelf: a wiggle and a dull thud say "not this one".
    if (isWiggling) return;
    play("thump");
    setIsWiggling(true);
    window.setTimeout(() => setIsWiggling(false), 480);
  };

  const style = {
    "--bh": `${book.size.h}px`,
    "--bw": `${Math.round(book.size.h * wr)}px`,
    "--bd": `${book.size.d}px`,
    "--lean": `${book.lean ?? 0}deg`,
    "--spine-bg": book.spine.bg,
    "--spine-color": book.spine.color,
    "--cover-bg": book.coverBg ?? book.spine.bg,
    "--paper": book.paper ?? "#efe9da",
    "--enter-delay": `${140 + index * 90}ms`,
  } as CSSProperties;

  const className = [
    "book3d-slot",
    isOut ? "is-out" : "",
    hidden ? "is-ghost" : "",
    isWiggling ? "is-wiggling" : "",
    isReal ? "is-real" : "is-filler",
  ]
    .filter(Boolean)
    .join(" ");

  const spineFontClass =
    book.spine.font === "serif"
      ? " is-serif"
      : book.spine.font === "mono"
        ? " is-mono"
        : "";

  const inner = (
    <>
      <span className="book3d-shadow" aria-hidden="true" />
      <span className="book3d-pivot">
        <motion.span
          className="book3d-tilt"
          style={{ rotateX: springX, rotateY: springY }}
        >
          <span className="book3d-box">
            <span className="bookface bookface-front">
              {book.cover ?? <span className="bookcover-plain" />}
            </span>
            <span className="bookface bookface-back" />
            <span className={`bookface bookface-spine${spineFontClass}`}>
              <span className="bookspine-label">{book.spine.label}</span>
              {book.spine.sub ? (
                <span className="bookspine-sub">{book.spine.sub}</span>
              ) : null}
            </span>
            <span className="bookface bookface-pages-fore" />
            <span className="bookface bookface-pages-top" />
          </span>
        </motion.span>
      </span>
    </>
  );

  // Touch: open on tap without sticky hover pull-out. Desktop: hover reveals.
  const sharedHandlers = coarsePointer
    ? {
        onClick: handleClick,
      }
    : {
        onPointerEnter: pullOut,
        onPointerLeave: putBack,
        onPointerCancel: putBack,
        onPointerMove: handleMove,
        onClick: handleClick,
      };

  if (!isReal) {
    return (
      <span
        ref={setSlot}
        className={className}
        style={style}
        aria-hidden="true"
        data-sound="none"
        {...sharedHandlers}
      >
        {inner}
      </span>
    );
  }

  return (
    <button
      ref={setSlot as (el: HTMLButtonElement | null) => void}
      type="button"
      className={className}
      style={style}
      aria-haspopup="dialog"
      aria-label={`Open the ${book.title} book`}
      data-sound="none"
      onFocus={coarsePointer ? undefined : pullOut}
      onBlur={coarsePointer ? undefined : putBack}
      {...sharedHandlers}
    >
      {inner}
    </button>
  );
}
