"use client";

import { useReducedMotion } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { useSound } from "@/components/sound/SoundProvider";

import { usePageTransition } from "../PageTransition";

import { DoorArt } from "./DeskObjects";
import { DOORS, type Door, type DoorId } from "./rooms";

import "./desk.css";

// The home page is Filippo's desk seen from above: his name and what he does
// on the paper, and a souvenir from every room of the site around it. Each
// souvenir is a link; opening one grows its most room-like part (the disc,
// the cover, the photo, the seal) into that room's colour on the way in.

type Portal = {
  door: Door;
  from: string;
  to: string;
  /** Where the visitor clicked; if they have left (Back), nothing happens. */
  path: string;
};

/** The red double scribble under the surname; hovering redraws it. */
function NameScribble({ children }: { children: ReactNode }) {
  const [round, setRound] = useState(0);
  return (
    <span className="desk-scribbled" onPointerEnter={() => setRound((value) => value + 1)}>
      {children}
      <svg
        key={round}
        className={`desk-scribble${round ? " is-redraw" : ""}`}
        viewBox="0 0 200 24"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M3 13 C 34 6, 66 17, 100 11 S 164 5, 197 12" />
        <path d="M18 19 C 66 14, 124 21, 186 15" />
      </svg>
    </span>
  );
}

function Rise({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <span className="desk-mask">
      <span className="desk-rise" style={{ "--rise": `${delay}s` } as CSSProperties}>
        {children}
      </span>
    </span>
  );
}

export default function DeskHero({
  entered,
  onSettled,
}: {
  entered: boolean;
  onSettled: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const { play } = useSound();
  const { transitionTo } = usePageTransition();
  const [opening, setOpening] = useState<DoorId | null>(null);
  const [portal, setPortal] = useState<Portal | null>(null);
  const [nudging, setNudging] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef(false);
  const measureTimerRef = useRef(0);
  const touchedRef = useRef(false);
  const hoverAtRef = useRef(new Map<DoorId, number>());
  const settledRef = useRef(onSettled);

  useEffect(() => {
    settledRef.current = onSettled;
  }, [onSettled]);

  // The menu and the corner buttons come in once the desk has landed.
  useEffect(() => {
    if (!entered) return;
    const timeout = window.setTimeout(() => settledRef.current(), reduceMotion ? 0 : 1600);
    return () => window.clearTimeout(timeout);
  }, [entered, reduceMotion]);

  // One unprompted hint that the objects move: the record peeks out of its
  // sleeve once, unless the visitor has already reached for the desk.
  useEffect(() => {
    if (!entered || reduceMotion) return;
    let stop = 0;
    const start = window.setTimeout(() => {
      if (touchedRef.current) return;
      setNudging(true);
      stop = window.setTimeout(() => setNudging(false), 1100);
    }, 3000);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, [entered, reduceMotion]);

  useEffect(() => () => window.clearTimeout(measureTimerRef.current), []);

  // Grow the room out of the object, then hand over to the page curtain,
  // already painted in the same colour. A cancelled animation (the page went
  // away, say through Back) goes nowhere.
  useEffect(() => {
    if (!portal) return;
    let live = true;
    const element = portalRef.current;
    const finish = () => {
      if (!live || window.location.pathname !== portal.path) return;
      transitionTo(portal.door.href, { alreadyCovered: true, color: portal.door.room });
    };
    if (!element || typeof element.animate !== "function") {
      finish();
      return;
    }
    const animation = element.animate([{ clipPath: portal.from }, { clipPath: portal.to }], {
      duration: 620,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
    });
    animation.finished.then(finish, () => undefined);
    return () => {
      live = false;
      animation.cancel();
    };
  }, [portal, transitionTo]);

  const open = (event: ReactMouseEvent<HTMLAnchorElement>, door: Door) => {
    // New tabs, new windows and downloads stay the browser's business.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    if (leavingRef.current) return;
    leavingRef.current = true;
    play(door.goVoice);
    setOpening(door.id);

    if (reduceMotion) {
      transitionTo(door.href, { color: door.room });
      return;
    }

    const anchor = event.currentTarget;
    const path = window.location.pathname;
    measureTimerRef.current = window.setTimeout(() => {
      if (window.location.pathname !== path) return;
      const part = anchor.querySelector<HTMLElement>("[data-portal]") ?? anchor;
      const rect = part.getBoundingClientRect();
      // The portal is fixed to the viewport minus any scrollbar.
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      if (door.portal === "circle") {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const radius = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy));
        setPortal({
          door,
          path,
          from: `circle(${rect.width / 2}px at ${cx}px ${cy}px)`,
          to: `circle(${radius}px at ${cx}px ${cy}px)`,
        });
      } else {
        setPortal({
          door,
          path,
          from: `inset(${rect.top}px ${width - rect.right}px ${height - rect.bottom}px ${rect.left}px round 3px)`,
          to: "inset(0px 0px 0px 0px round 0px)",
        });
      }
    }, 160);
  };

  const hover = (door: Door, pointerType: string, at: number) => {
    touchedRef.current = true;
    if (pointerType !== "mouse") return;
    // At most one sound per door every 250ms, however fast the pointer moves.
    const now = at;
    if (now - (hoverAtRef.current.get(door.id) ?? -Infinity) < 250) return;
    hoverAtRef.current.set(door.id, now);
    play(door.hoverVoice);
  };

  return (
    <div className={`desk${entered ? " is-entered" : ""}${opening ? " is-leaving" : ""}`}>
      <div className="desk-copy">
        <h1 id="hero-heading" className="desk-title">
          <span className="desk-line desk-kicker">
            <Rise delay={0.45}>
              <span lang="it">Ciao</span>, I’m
            </Rise>
          </span>{" "}
          <span className="desk-line desk-first">
            <Rise delay={0.52}>Filippo</Rise>
          </span>{" "}
          <span className="desk-line desk-last">
            <NameScribble>
              <Rise delay={0.6}>Pasqua.</Rise>
            </NameScribble>
          </span>
        </h1>
        <p className="desk-lede">
          <Rise delay={0.74}>IB student and software developer from Italy.</Rise>
        </p>
        <p className="desk-sub">
          I build AI-agent products. Right now that’s Dawn, a personal AI employee you text,
          and SkyCloud, a whole team of them.
        </p>
        <p className="desk-hint">
          Explore the desk: pick something up to step inside.
          <svg className="desk-hint-arrow" viewBox="0 0 96 44" aria-hidden="true">
            <path pathLength={1} d="M4 30 C 26 40, 52 38, 70 22 C 76 16, 80 12, 86 8" />
            <path pathLength={1} className="desk-hint-head" d="M76 6 L 87 7 L 84 18" />
          </svg>
        </p>
      </div>

      <nav
        className="desk-scene"
        aria-label="Pages"
        onFocus={() => {
          touchedRef.current = true;
        }}
      >
        <ul role="list" className="desk-list">
          {DOORS.map((door) => (
            <li key={door.id} className={`desk-slot desk-slot--${door.id}`}>
              <a
                className={`desk-door desk-door--${door.id}${
                  opening === door.id ? " is-opening" : ""
                }${nudging && door.id === "record" ? " is-nudging" : ""}`}
                href={door.href}
                data-sound="none"
                style={{ "--delay": `${door.delay}s`, "--tape": door.tape } as CSSProperties}
                onClick={(event) => open(event, door)}
                onPointerEnter={(event) => hover(door, event.pointerType, event.timeStamp)}
              >
                <span className="desk-drop">
                  <DoorArt id={door.id} />
                </span>
                <span className="dymo">
                  <span className="dymo-tape">{door.label}</span>
                  <span className="sr-only">{door.sr}</span>
                  <span className="dymo-strip" aria-hidden="true">
                    {door.strip}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* On <body>, so nothing on the page (menu, corner buttons) sits above it. */}
      {portal
        ? createPortal(
            <div
              ref={portalRef}
              className="desk-portal"
              aria-hidden="true"
              style={{ background: portal.door.room, clipPath: portal.from }}
            />,
            document.body,
          )
        : null}
    </div>
  );
}
