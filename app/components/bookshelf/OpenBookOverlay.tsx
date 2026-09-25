"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { useSound } from "@/components/sound/SoundProvider";

import { getBookSpreads, type BookDef, type BookSpread } from "./types";

export type OpenGeometry = {
  /** Offset from stage center to the shelf slot center. */
  dx: number;
  dy: number;
  /** Shelf size divided by display size. */
  scale: number;
  /** Display dimensions of one page. */
  W: number;
  H: number;
  D: number;
  /** How far the box slides right once open: W/2 centers the full spread on
   *  desktop; 0 keeps the right page centered on narrow screens. */
  shift: number;
};

const FLY = { duration: 0.62, ease: [0.3, 0.9, 0.25, 1] as const };
const SWING = { duration: 0.72, ease: [0.24, 0.8, 0.3, 1] as const };
const TURN = { duration: 0.62, ease: [0.45, 0.05, 0.2, 1] as const };
const SWIPE_THRESHOLD = 56;

type Phase = "flying" | "open" | "closing";

type TurnState = {
  dir: 1 | -1;
  from: number;
  to: number;
  leafFront: ReactNode;
  leafBack: ReactNode;
};

type OpenBookOverlayProps = {
  book: BookDef;
  geometry: OpenGeometry;
  onClosed: () => void;
};

function prefersCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function OpenBookOverlay({
  book,
  geometry,
  onClosed,
}: OpenBookOverlayProps) {
  const { play } = useSound();
  const reduceMotion = useReducedMotion();
  const spreads = getBookSpreads(book, geometry.shift === 0);
  const pageCount = spreads.length;
  const [pageIndex, setPageIndex] = useState(0);
  const [turn, setTurn] = useState<TurnState | null>(null);
  const [phase, setPhase] = useState<Phase>(
    reduceMotion ? "open" : "flying",
  );
  const [coarsePointer] = useState(prefersCoarsePointer);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const closingRef = useRef(false);
  const turningRef = useRef(false);
  const pageIndexRef = useRef(0);
  const swipeRef = useRef<{ id: number; x: number; y: number } | null>(null);

  // Every choreographed transform is a motion value: first paint starts at the
  // shelf slot, so there is never a flash of the finished state.
  const x = useMotionValue(reduceMotion ? 0 : geometry.dx);
  const y = useMotionValue(reduceMotion ? 0 : geometry.dy);
  const scale = useMotionValue(reduceMotion ? 1 : geometry.scale);
  const boxRotate = useMotionValue(reduceMotion ? 0 : 90);
  const coverRotate = useMotionValue(reduceMotion ? -178 : 0);
  const shift = useMotionValue(reduceMotion ? geometry.shift : 0);
  const backdrop = useMotionValue(0);
  const leafRotate = useMotionValue(0);

  // Soft shadow that peaks when the turning leaf is edge-on. Lift clears the
  // open cover's translateZ so the leaf never ducks under the left page.
  const coverZ = geometry.D / 2;
  const leafShade = useTransform(leafRotate, [-180, -90, 0], [0.08, 0.42, 0.08]);
  const leafLift = useTransform(
    leafRotate,
    [-180, -90, 0],
    [coverZ + 6, coverZ + 28, coverZ + 6],
  );

  // Gentle lean following the cursor once the book is open (desktop only).
  const leanX = useMotionValue(0);
  const leanY = useMotionValue(0);
  const leanSpringX = useSpring(leanX, { stiffness: 90, damping: 18 });
  const leanSpringY = useSpring(leanY, { stiffness: 90, damping: 18 });

  const isSinglePage = geometry.shift === 0;

  useEffect(() => {
    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    let cancelled = false;

    if (reduceMotion) {
      animate(backdrop, 1, { duration: 0.2 });
    } else {
      const run = async () => {
        animate(backdrop, 1, { duration: 0.45 });
        await Promise.all([
          animate(x, 0, FLY).then(() => {}),
          animate(y, 0, FLY).then(() => {}),
          animate(scale, 1, FLY).then(() => {}),
          animate(boxRotate, 0, FLY).then(() => {}),
        ]);
        if (cancelled) return;
        play("pageFlip");
        await Promise.all([
          animate(coverRotate, -178, SWING).then(() => {}),
          animate(shift, geometry.shift, SWING).then(() => {}),
        ]);
        if (cancelled) return;
        setPhase("open");
      };
      void run();
    }

    return () => {
      cancelled = true;
      style.overflow = previousOverflow;
    };
    // Choreography runs once per mounted book.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = () => {
    if (closingRef.current || turningRef.current) return;
    closingRef.current = true;
    setPhase("closing");
    setTurn(null);

    if (reduceMotion) {
      animate(backdrop, 0, { duration: 0.16 });
      window.setTimeout(onClosed, 170);
      return;
    }

    const run = async () => {
      await Promise.all([
        animate(coverRotate, 0, {
          duration: 0.5,
          ease: [0.5, 0, 0.7, 0.4],
        }).then(() => {}),
        animate(shift, 0, { duration: 0.5, ease: [0.5, 0, 0.7, 0.4] }).then(
          () => {},
        ),
      ]);
      play("thump");
      animate(backdrop, 0, { duration: 0.4 });
      await Promise.all([
        animate(x, geometry.dx, FLY).then(() => {}),
        animate(y, geometry.dy, FLY).then(() => {}),
        animate(scale, geometry.scale, FLY).then(() => {}),
        animate(boxRotate, 90, FLY).then(() => {}),
      ]);
      onClosed();
    };
    void run();
  };

  const goToPage = (next: number) => {
    if (phase !== "open" || pageCount < 2 || turningRef.current) return;
    const from = pageIndexRef.current;
    const to = Math.max(0, Math.min(pageCount - 1, next));
    if (to === from) return;

    const dir: 1 | -1 = to > from ? 1 : -1;
    const outgoing = spreads[from] as BookSpread;
    const incoming = spreads[to] as BookSpread;

    if (reduceMotion) {
      pageIndexRef.current = to;
      setPageIndex(to);
      play("pageTurn");
      return;
    }

    turningRef.current = true;
    play("pageTurn");

    // Forward: leaf rests on the right (0) and swings onto the left (-178).
    // Backward: leaf starts on the left (-178) and swings onto the right (0).
    const startAngle = dir === 1 ? 0 : -178;
    const endAngle = dir === 1 ? -178 : 0;
    leafRotate.set(startAngle);

    setTurn({
      dir,
      from,
      to,
      // Face visible when the leaf is flat on the right stack.
      leafFront: dir === 1 ? outgoing.right : incoming.right,
      // Face visible when the leaf is flat against the left page.
      leafBack: dir === 1 ? incoming.left : outgoing.left,
    });

    void animate(leafRotate, endAngle, TURN).then(() => {
      pageIndexRef.current = to;
      setPageIndex(to);
      setTurn(null);
      turningRef.current = false;
    });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose();
        return;
      }
      if (phase !== "open") return;
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        goToPage(pageIndexRef.current + 1);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goToPage(pageIndexRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pageCount]);

  const handleLean = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || turningRef.current || coarsePointer) return;
    const nx = (event.clientX / window.innerWidth) * 2 - 1;
    const ny = (event.clientY / window.innerHeight) * 2 - 1;
    leanY.set(nx * 4);
    leanX.set(-ny * 3);
  };

  const resetLean = () => {
    leanX.set(0);
    leanY.set(0);
  };

  const handleSwipeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "open" || pageCount < 2) return;
    if (event.pointerType === "mouse") return;
    swipeRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleSwipeEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || start.id !== event.pointerId) return;
    if (phase !== "open" || turningRef.current) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.35) {
      return;
    }

    if (dx < 0) goToPage(pageIndexRef.current + 1);
    else goToPage(pageIndexRef.current - 1);
  };

  const spineFontClass =
    book.spine.font === "serif"
      ? " is-serif"
      : book.spine.font === "mono"
        ? " is-mono"
        : "";

  const style = {
    "--bh": `${geometry.H}px`,
    "--bw": `${geometry.W}px`,
    "--bd": `${geometry.D}px`,
    "--spine-bg": book.spine.bg,
    "--spine-color": book.spine.color,
    "--cover-bg": book.coverBg ?? book.spine.bg,
    "--paper": book.paper ?? "#efe9da",
  } as CSSProperties;

  // While a leaf is turning, the destination right (forward) or destination
  // left (backward) is already under the leaf so it reveals mid-swing.
  const leftContent = turn
    ? turn.dir === 1
      ? spreads[turn.from]?.left
      : spreads[turn.to]?.left
    : spreads[pageIndex]?.left;
  const rightContent = turn
    ? turn.dir === 1
      ? spreads[turn.to]?.right
      : spreads[turn.from]?.right
    : spreads[pageIndex]?.right;

  const canPrev = pageIndex > 0 && !turn;
  const canNext = pageIndex < pageCount - 1 && !turn;
  const folio = turn ? turn.to + 1 : pageIndex + 1;

  // Which spread each side is showing. Keying the page by it mounts every
  // page fresh, so a long page scrolled to its end doesn't hand that scroll
  // position to the next one.
  const rightKey = turn ? (turn.dir === 1 ? turn.to : turn.from) : pageIndex;
  const leftKey = turn ? (turn.dir === 1 ? turn.from : turn.to) : pageIndex;
  const current = spreads[turn ? turn.to : pageIndex];

  return (
    <div
      className={[
        "openbook-overlay",
        `is-${phase}`,
        turn ? "is-turning" : "",
        isSinglePage ? "is-single" : "",
        // Pages big enough for full-size type.
        geometry.H >= 640 && geometry.W >= 440 ? "is-roomy" : "",
        coarsePointer ? "is-touch" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
      style={style}
    >
      <motion.div
        className="openbook-backdrop"
        style={{ opacity: backdrop }}
        onClick={requestClose}
      />

      <button
        ref={closeRef}
        type="button"
        className="openbook-close"
        onClick={requestClose}
        aria-label="Close the book"
        data-sound="none"
      >
        <X weight="bold" size={18} />
      </button>

      {pageCount > 1 && phase === "open" ? (
        <nav className="openbook-pager" aria-label="Book pages">
          <button
            type="button"
            className="openbook-pager-btn"
            onClick={() => goToPage(pageIndex - 1)}
            disabled={!canPrev}
            aria-label="Previous spread"
            data-sound="none"
          >
            <CaretLeft weight="bold" size={16} />
          </button>
          <span className="openbook-pager-folio" aria-live="polite">
            {folio}
            <span aria-hidden="true"> / </span>
            {pageCount}
          </span>
          <button
            type="button"
            className="openbook-pager-btn"
            onClick={() => goToPage(pageIndex + 1)}
            disabled={!canNext}
            aria-label="Next spread"
            data-sound="none"
          >
            <CaretRight weight="bold" size={16} />
          </button>
        </nav>
      ) : null}

      {/* The 3D book paints the right page before the cover (and the left
          page on it), and on phones keeps the previous page as a peek. Screen
          readers get the open spread here instead, in reading order. */}
      <div className="openbook-sr">
        {isSinglePage ? null : current?.left}
        {current?.right}
      </div>

      <div
        aria-hidden="true"
        className="openbook-stage"
        onPointerMove={handleLean}
        onPointerLeave={resetLean}
        onPointerDown={handleSwipeStart}
        onPointerUp={handleSwipeEnd}
        onPointerCancel={() => {
          swipeRef.current = null;
        }}
      >
        <motion.div className="openbook-flyer" style={{ x, y, scale }}>
          <motion.div
            className="openbook-lean"
            style={{ rotateX: leanSpringX, rotateY: leanSpringY }}
          >
            <motion.div className="openbook-shifter" style={{ x: shift }}>
              <motion.div
                className="openbook-box"
                style={{ rotateY: boxRotate }}
              >
                <span className="openbook-block" aria-hidden="true">
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

                <div className="openbook-page openbook-page-right">
                  <div key={rightKey} className="openbook-page-swap">
                    {rightContent}
                  </div>
                </div>

                {turn ? (
                  <motion.div
                    className="openbook-turn-leaf"
                    style={{
                      rotateY: leafRotate,
                      z: leafLift,
                    }}
                    aria-hidden="true"
                  >
                    <span className="openbook-turn-face openbook-turn-front">
                      {turn.leafFront}
                      <motion.span
                        className="openbook-turn-shade"
                        style={{ opacity: leafShade }}
                      />
                    </span>
                    <span className="openbook-turn-face openbook-turn-back">
                      {turn.leafBack}
                      <motion.span
                        className="openbook-turn-shade is-verso"
                        style={{ opacity: leafShade }}
                      />
                    </span>
                  </motion.div>
                ) : null}

                <motion.div
                  className="openbook-cover"
                  style={{ z: geometry.D / 2, rotateY: coverRotate }}
                >
                  <span className="openbook-cover-front">
                    {book.cover ?? <span className="bookcover-plain" />}
                  </span>
                  <span className="openbook-cover-back">
                    <div className="openbook-page openbook-page-left">
                      <div key={leftKey} className="openbook-page-swap">
                        {leftContent}
                      </div>
                    </div>
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
