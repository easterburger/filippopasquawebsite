"use client";

import { HandWaving, MapPin, SealCheck } from "@phosphor-icons/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import type { SwingMark } from "../SwingText";

import "./hero-marks.css";

// Little pieces of interface set into the home headline: a waving hand, an
// account badge with a profile card, an abbreviation with its tooltip, a
// selected phrase with a caret, and a flag. They wrap runs of swinging words
// (through SwingText's marks) and are all decoration: the sentence itself is
// read from SwingText's screen-reader copy.

/** The photo in the profile card; swap it for a current one. */
const CARD_PHOTO_SRC = "/hero-assets/filippo-card.webp";

const subscribeNothing = () => () => {};

/** Images stay out of the server HTML so they never compete with first paint. */
function useClient() {
  return useSyncExternalStore(subscribeNothing, () => true, () => false);
}

/**
 * Open while hovered (mouse) or after a tap (touch), as separate sources so
 * one never cancels the other. A tap anywhere else, or Escape, closes it.
 */
function usePeek() {
  const ref = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setHovered(false);
      setPinned(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const root = ref.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handlers = {
    onPointerEnter: (event: ReactPointerEvent) => {
      if (event.pointerType !== "touch") setHovered(true);
    },
    onPointerLeave: (event: ReactPointerEvent) => {
      if (event.pointerType !== "touch") setHovered(false);
    },
    onPointerUp: (event: ReactPointerEvent) => {
      if (event.pointerType === "touch") setPinned((value) => !value);
    },
  };
  return { ref, open, handlers };
}

/**
 * A default account picture made solid: a light-blue head and shoulders,
 * shaded like a soft 3D figure. The head and torso turn by different amounts,
 * so the little bust reads as an object slowly turning on a stand.
 */
function AvatarBust() {
  const id = useId().replace(/:/g, "");
  const url = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className="hero-bust" viewBox="0 0 100 100">
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="30%" r="75%">
          <stop offset="0" stopColor="#f5faff" />
          <stop offset="1" stopColor="#cfe5ff" />
        </radialGradient>
        <radialGradient id={`${id}-skin`} cx="36%" cy="28%" r="78%">
          <stop offset="0" stopColor="#f2f9ff" />
          <stop offset="0.28" stopColor="#b3dbff" />
          <stop offset="0.7" stopColor="#6cb2f5" />
          <stop offset="1" stopColor="#3f86d9" />
        </radialGradient>
        <radialGradient id={`${id}-body`} cx="38%" cy="12%" r="95%">
          <stop offset="0" stopColor="#e9f5ff" />
          <stop offset="0.3" stopColor="#a6d3ff" />
          <stop offset="0.72" stopColor="#5fa7f0" />
          <stop offset="1" stopColor="#3a7fd2" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id={`${id}-glint`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>
      <g clipPath={url("clip")}>
        <circle cx="50" cy="50" r="50" fill={url("bg")} />
        <g className="hero-bust-body">
          <path d="M14 108 C 14 80, 30 66, 50 66 C 70 66, 86 80, 86 108 Z" fill={url("body")} />
          <ellipse cx="38" cy="78" rx="9" ry="3.2" fill="#ffffff" opacity="0.5" filter={url("glint")} transform="rotate(-18 38 78)" />
        </g>
        <ellipse className="hero-bust-shadow" cx="50" cy="66" rx="15" ry="4.5" fill="#2e6cb8" opacity="0.35" filter={url("soft")} />
        <g className="hero-bust-head">
          <circle cx="50" cy="40" r="19" fill={url("skin")} />
          <ellipse cx="43" cy="31" rx="6" ry="3.4" fill="#ffffff" opacity="0.75" filter={url("glint")} transform="rotate(-28 43 31)" />
        </g>
      </g>
      <circle cx="50" cy="50" r="48.8" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="2.4" />
    </svg>
  );
}

/** "Hi," with a hand that waves when the headline lands and on hover. */
function WavingHi({ children }: { children: ReactNode }) {
  const [round, setRound] = useState(0);
  return (
    <span
      className="hero-mark hero-mark-hi"
      onPointerEnter={() => setRound((value) => value + 1)}
    >
      <span key={round} className={`hero-hand${round ? " is-again" : ""}`} aria-hidden="true">
        <HandWaving weight="fill" />
      </span>
      {children}
    </span>
  );
}

/** The name as an account badge; hovering opens a profile card with a photo. */
function AccountBadge({ children }: { children: ReactNode }) {
  const client = useClient();
  const { ref, open, handlers } = usePeek();
  return (
    <span ref={ref} className={`hero-mark hero-badge${open ? " is-open" : ""}`} {...handlers}>
      <span className="hero-badge-pill" aria-hidden="true" />
      <span className="hero-badge-avatar" aria-hidden="true">
        <AvatarBust />
      </span>
      {children}
      <span className="hero-badge-check" aria-hidden="true">
        <SealCheck weight="fill" />
      </span>

      <span className="hero-card" aria-hidden="true">
        <span className="hero-card-photo">
          {client ? (
            <img src={CARD_PHOTO_SRC} alt="" width={560} height={560} loading="lazy" />
          ) : null}
        </span>
        <span className="hero-card-name">
          Filippo Pasqua
          <SealCheck weight="fill" />
        </span>
        <span className="hero-card-role">IB student · software developer</span>
        <span className="hero-card-meta">
          <MapPin weight="fill" />
          Milan, Italy
        </span>
        <span className="hero-card-note">Me, a few years back.</span>
      </span>
    </span>
  );
}

/** "IB" set like an abbreviation, with its tooltip. */
function Abbreviation({ children }: { children: ReactNode }) {
  const { ref, open, handlers } = usePeek();
  return (
    <span ref={ref} className={`hero-mark hero-abbr${open ? " is-open" : ""}`} {...handlers}>
      {children}
      <span className="hero-tip" aria-hidden="true">
        <strong>International Baccalaureate</strong>
        Diploma Programme · American School of Milan
      </span>
    </span>
  );
}

const STICKERS = [
  { src: "/hero-stickers/dawn-icon.webp", className: "is-square", x: "-16%", y: "-118%", r: -12 },
  { src: "/hero-stickers/skycloud-icon.webp", className: "is-square", x: "18%", y: "-150%", r: 7 },
  { src: "/hero-stickers/tuttobene-icon.webp", className: "is-square is-cover", x: "52%", y: "-136%", r: 14 },
  { src: "/hero-stickers/zayno.png", className: "is-wide", x: "80%", y: "-98%", r: -8 },
] as const;

/**
 * "software developer" selected like text in an editor, with a blinking caret.
 * Hovering (or tapping) pops the apps he has built around it.
 */
function Selection({ children, auto }: { children: ReactNode; auto: boolean }) {
  const client = useClient();
  const { ref, open: peeking, handlers } = usePeek();
  const [intro, setIntro] = useState(false);
  const open = peeking || intro;

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
    <span ref={ref} className={`hero-mark hero-select${open ? " is-open" : ""}`} {...handlers}>
      <span className="hero-select-box" aria-hidden="true" />
      {children}
      <span className="hero-caret" aria-hidden="true" />
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

/** "Italy." with a small tricolore flying beside it. */
function Flag({ children }: { children: ReactNode }) {
  return (
    <span className="hero-mark hero-flag-mark">
      {children}
      <span className="hero-flag" aria-hidden="true">
        <span className="hero-flag-pole" />
        <span className="hero-flag-cloth">
          <span />
          <span />
          <span />
        </span>
      </span>
    </span>
  );
}

export function heroMarks({ autoStickers }: { autoStickers: boolean }): SwingMark[] {
  return [
    { words: "Hi,", render: (words) => <WavingHi>{words}</WavingHi> },
    { words: "Filippo Pasqua.", render: (words) => <AccountBadge>{words}</AccountBadge> },
    { words: "IB", render: (words) => <Abbreviation>{words}</Abbreviation> },
    {
      words: "software developer",
      render: (words) => <Selection auto={autoStickers}>{words}</Selection>,
    },
    { words: "Italy.", render: (words) => <Flag>{words}</Flag> },
  ];
}
