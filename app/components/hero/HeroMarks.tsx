"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { SwingMark } from "../SwingText";

import "./hero-marks.css";

// Hand-made touches for the home headline. Each wraps a run of swinging words
// (through SwingText's marks) and draws next to them; every decoration is
// aria-hidden, so the sentence still reads as plain text.

/** Remounting the SVG restarts its draw-on animation, so hover redraws it. */
function useRedraw() {
  const [round, setRound] = useState(0);
  return { round, redraw: () => setRound((value) => value + 1) };
}

function Underline({ children }: { children: ReactNode }) {
  const { round, redraw } = useRedraw();
  return (
    <span className="hero-mark hero-mark-underline" onPointerEnter={redraw}>
      {children}
      <svg
        key={round}
        className={`hero-scribble${round ? " is-redraw" : ""}`}
        viewBox="0 0 200 24"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M3 13 C 34 6, 66 17, 100 11 S 164 5, 197 12" />
        <path className="is-second" d="M18 19 C 66 14, 124 21, 186 15" />
      </svg>
    </span>
  );
}

function Circle({ children }: { children: ReactNode }) {
  const { round, redraw } = useRedraw();
  return (
    <span className="hero-mark hero-mark-circle" onPointerEnter={redraw}>
      {children}
      <svg
        key={round}
        className={`hero-scribble${round ? " is-redraw" : ""}`}
        viewBox="0 0 120 100"
        aria-hidden="true"
      >
        <path
          pathLength={1}
          d="M66 10 C 28 5, 6 26, 9 52 C 12 80, 60 94, 94 82 C 118 72, 119 34, 96 18 C 78 6, 46 7, 26 20"
        />
      </svg>
    </span>
  );
}

const STICKERS = [
  { src: "/hero-stickers/dawn-icon.webp", className: "is-square", x: "-16%", y: "-118%", r: -12 },
  { src: "/hero-stickers/skycloud-icon.webp", className: "is-square", x: "18%", y: "-150%", r: 7 },
  { src: "/hero-stickers/tuttobene-icon.webp", className: "is-square is-cover", x: "52%", y: "-136%", r: 14 },
  { src: "/hero-stickers/zayno.png", className: "is-wide", x: "80%", y: "-98%", r: -8 },
] as const;

const subscribeNothing = () => () => {};

/** Highlighter swipe; hovering (or tapping) pops project stickers around it. */
function Stickers({ children, auto }: { children: ReactNode; auto: boolean }) {
  // Hover, tap and the one-off intro pop are separate sources, so none of
  // them can cancel another (a mouse click no longer hides them, the auto
  // hide doesn't close them while hovered).
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [intro, setIntro] = useState(false);
  const open = hovered || pinned || intro;
  // Sticker images stay out of the server HTML so they never compete with the
  // first paint; they load once the page is interactive.
  const client = useSyncExternalStore(subscribeNothing, () => true, () => false);

  // One unprompted pop after the headline lands, so people find it.
  useEffect(() => {
    if (!auto) return;
    const show = window.setTimeout(() => setIntro(true), 2900);
    const hide = window.setTimeout(() => setIntro(false), 4700);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [auto]);

  return (
    <span
      className={`hero-mark hero-mark-stickers${open ? " is-open" : ""}`}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setHovered(false);
      }}
      onPointerUp={(event) => {
        // Touch has no hover: a tap toggles them instead.
        if (event.pointerType === "touch") setPinned((value) => !value);
      }}
    >
      <span className="hero-highlight" aria-hidden="true" />
      {children}
      <span className="hero-stickers" aria-hidden="true">
        {STICKERS.map((sticker, index) => (
          <span
            key={sticker.src}
            className={`hero-sticker ${sticker.className}`}
            style={
              {
                "--x": sticker.x,
                "--y": sticker.y,
                "--r": `${sticker.r}deg`,
                "--i": index,
              } as CSSProperties
            }
          >
            {client ? <img src={sticker.src} alt="" /> : null}
          </span>
        ))}
      </span>
    </span>
  );
}

/** A little tricolore ribbon that keeps waving under "Italy". */
function Ribbon({ children }: { children: ReactNode }) {
  const wave = (y: number) =>
    `M0 ${y} q 25 -5 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0`;
  return (
    <span className="hero-mark hero-mark-ribbon">
      {children}
      <span className="hero-ribbon" aria-hidden="true">
        <svg viewBox="0 0 400 24" preserveAspectRatio="none">
          <path className="is-green" d={wave(6)} />
          <path className="is-white" d={wave(12)} />
          <path className="is-red" d={wave(18)} />
        </svg>
      </span>
    </span>
  );
}

/** Motion lines beside "Hi," as if the word were waving. */
function Wave({ children }: { children: ReactNode }) {
  return (
    <span className="hero-mark hero-mark-wave">
      <svg className="hero-wave" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M30 14 C 24 17, 21 23, 22 30" />
        <path d="M21 8 C 13 12, 9 21, 11 32" />
        <path d="M12 3 C 2 8, -2 20, 1 34" />
      </svg>
      {children}
    </span>
  );
}

export function heroMarks({ autoStickers }: { autoStickers: boolean }): SwingMark[] {
  return [
    { words: "Hi,", render: (words) => <Wave>{words}</Wave> },
    { words: "Filippo Pasqua.", render: (words) => <Underline>{words}</Underline> },
    { words: "IB", render: (words) => <Circle>{words}</Circle> },
    {
      words: "software developer",
      render: (words) => <Stickers auto={autoStickers}>{words}</Stickers>,
    },
    { words: "Italy.", render: (words) => <Ribbon>{words}</Ribbon> },
  ];
}
