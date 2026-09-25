"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  LockSimple,
  Pause,
  Play,
  X,
} from "@phosphor-icons/react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { Anton } from "next/font/google";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

import { useSound, useTickSound } from "@/components/sound/SoundProvider";

import BubbleMenu from "../BubbleMenu";
import { portfolioMenuItems } from "../portfolio-menu";

import type { MusicTrackId } from "./record-music";
import ScrollReveal from "./ScrollReveal";
import type { Collection, Release } from "./types";
import { useRecordMusic } from "./useRecordMusic";

import "./experience.css";

// A record crate: sleeves along the top, one giant word that takes on each
// record's colours, and a player that slides the vinyl out into its story.
// Experience and Education are both crates, each with its own collection.

const loud = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-loud",
});

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const HOVERLESS_QUERY = "(hover: none)";

function subscribeHoverless(onChange: () => void) {
  const media = window.matchMedia(HOVERLESS_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** True on touch-only devices; false during SSR and on hover-capable ones. */
function useHoverless() {
  return useSyncExternalStore(
    subscribeHoverless,
    () => window.matchMedia(HOVERLESS_QUERY).matches,
    () => false,
  );
}

type WordEntry = Pick<Release, "word" | "logo" | "logoFill" | "caret"> & { id: string };

/** Share of the stage width a word fills unless its collection says otherwise. */
const FIT_DEFAULT = 0.94;

/** Hover has to rest this long on a sleeve before the headline changes, so
 *  sweeping across the crate doesn't fire every word in between. */
const HOVER_INTENT_MS = 70;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FLY = { duration: 0.62, ease: [0.3, 0.9, 0.25, 1] as const };
const SLIDE = { duration: 0.7, ease: EASE_OUT };
const DISC_OUT = "52%";

// Voices for each beat of the record choreography.
const SFX = {
  out: "sleeveSlide",
  slide: "vinylSlide",
  land: "needleDrop",
  back: "vinylBack",
} as const;

type Rect = { left: number; top: number; width: number; height: number };

/* ------------------------------------------------------------------------ */
/* Giant word                                                                */
/* ------------------------------------------------------------------------ */

/** Font size per word so each one fills the stage width without overflowing
 *  the height; measured at 100px from hidden copies with the same styling. */
function useFittedSizes(
  stageRef: React.RefObject<HTMLDivElement | null>,
  fitFor: (id: string) => number,
) {
  const [sizes, setSizes] = useState<Record<string, number>>({});

  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const maxWidth = stage.clientWidth;
      const maxHeight = window.innerHeight * 0.4;
      const next: Record<string, number> = {};
      stage
        .querySelectorAll<HTMLElement>("[data-measure]")
        .forEach((element) => {
          const { width, height } = element.getBoundingClientRect();
          if (!width || !height) return;
          const id = element.dataset.measure as string;
          const fit = fitFor(id);
          next[id] = Math.floor(
            Math.min((maxWidth * fit * 100) / width, (maxHeight * 100) / height),
          );
        });
      setSizes(next);
    };

    measure();
    void document.fonts?.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stageRef, fitFor]);

  return sizes;
}

function WordGlyphs({ entry }: { entry: WordEntry }) {
  if (entry.logo) {
    return (
      <span
        className={`xp-logo-word is-${entry.id}`}
        style={
          {
            "--logo": `url(${entry.logo})`,
            "--logo-fill": entry.logoFill ?? "#f4efe6",
          } as CSSProperties
        }
      />
    );
  }
  return (
    <>
      {Array.from(entry.word).map((char, index) => (
        <span key={index} className="xp-letter-mask">
          <span className="xp-letter" style={{ "--i": index } as CSSProperties}>
            {/* A plain space would collapse inside its own box. */}
            {char === " " ? " " : char}
          </span>
        </span>
      ))}
      {entry.caret ? <span className="xp-caret" /> : null}
    </>
  );
}

/** At most two words are ever on stage: the one rising in and the one fading
 *  out. A newer change replaces the fading word outright, so fast hovering
 *  never stacks half-finished words on top of each other. */
function BigWord({
  activeId,
  words,
  fitFor,
}: {
  activeId: string;
  /** The default word first, then one per record. */
  words: WordEntry[];
  fitFor: (id: string) => number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sizes = useFittedSizes(stageRef, fitFor);
  const [shownId, setShownId] = useState(activeId);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  if (activeId !== shownId) {
    setLeavingId(shownId);
    setShownId(activeId);
  }

  const entryFor = (id: string) =>
    words.find((entry) => entry.id === id) ?? words[0];
  const shown = entryFor(shownId);
  const leaving = leavingId ? entryFor(leavingId) : null;
  const sizeFor = (id: string) =>
    sizes[id] ? ({ fontSize: sizes[id] } as CSSProperties) : undefined;

  return (
    <div ref={stageRef} className="xp-word-stage" aria-hidden="true">
      {words.map((entry) => (
        <span
          key={entry.id}
          data-measure={entry.id}
          className={`xp-word xp-word-measure is-${entry.id}`}
        >
          <WordGlyphs entry={entry} />
        </span>
      ))}

      {leaving ? (
        <div
          key={`out-${leaving.id}`}
          className={`xp-word is-${leaving.id} is-out`}
          style={sizeFor(leaving.id)}
          onAnimationEnd={(event) => {
            if (event.animationName === "xp-word-out") setLeavingId(null);
          }}
        >
          <WordGlyphs entry={leaving} />
        </div>
      ) : null}

      <div
        key={`in-${shown.id}`}
        className={`xp-word is-${shown.id} is-in`}
        style={sizeFor(shown.id)}
      >
        <WordGlyphs entry={shown} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Record player                                                             */
/* ------------------------------------------------------------------------ */

type PlayerProps<Id extends MusicTrackId> = {
  collection: Collection<Id>;
  index: number;
  onIndex: (index: number) => void;
  getOrigin: (id: string) => Rect | null;
  onClosed: () => void;
  /** Opened by a click (not a deep link), so audio is allowed to start. */
  gesture: boolean;
};

function StoryTitle({ release }: { release: Release }) {
  const long = !release.logo && release.word.length > 8;
  return (
    <h2 className={`xp-story-title xp-word is-${release.id}${long ? " is-long" : ""}`}>
      {release.logo ? (
        <span
          className={`xp-logo-word is-${release.id}`}
          role="img"
          aria-label={release.title}
          style={
            {
              "--logo": `url(${release.logo})`,
              "--logo-fill": release.logoFill ?? "#f4efe6",
            } as CSSProperties
          }
        />
      ) : (
        <>
          <span className="xp-letter" aria-hidden="true">
            {release.word}
          </span>
          <span className="xp-sr-only">{release.title}</span>
          {release.caret ? <span className="xp-caret" aria-hidden="true" /> : null}
        </>
      )}
    </h2>
  );
}

function MusicToggle({
  playing,
  onToggle,
  compact = false,
}: {
  playing: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      className={`xp-music${playing ? " is-playing" : ""}${compact ? " is-compact" : ""}`}
      onClick={onToggle}
      aria-label={
        compact
          ? playing
            ? "Pause the music"
            : "Play this record's music"
          : playing
            ? "Now playing, pause the music"
            : "Play the record"
      }
      data-sound="none"
    >
      <span className="xp-music-icon" aria-hidden="true">
        {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
      </span>
      {compact ? null : (
        <span className="xp-music-label">{playing ? "Now playing" : "Play the record"}</span>
      )}
      <span className="xp-music-bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}

function RecordPlayer<Id extends MusicTrackId>({
  collection,
  index,
  onIndex,
  getOrigin,
  onClosed,
  gesture,
}: PlayerProps<Id>) {
  const { releases, stories } = collection;
  const reduceMotion = useReducedMotion();
  const { play } = useSound();
  const [shown, setShown] = useState(index);
  const [phase, setPhase] = useState<"opening" | "open" | "closing">(
    "opening",
  );
  const playerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(true);
  // Every async step of the choreography checks this after each await, so a
  // close (or unmount) cancels whatever is still in flight.
  const runRef = useRef(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const disc = useMotionValue(reduceMotion ? DISC_OUT : "0%");
  const backdrop = useMotionValue(reduceMotion ? 1 : 0);
  const fade = useMotionValue(1);

  const release = releases[shown];
  const story = stories[release.id];
  const next = releases[(shown + 1) % releases.length];
  const music = useRecordMusic(release.id, gesture);

  /** The flyer's box without its current transform: where it rests. */
  const restingBox = useCallback(() => {
    const flyer = flyerRef.current;
    if (!flyer) return null;
    const box = flyer.getBoundingClientRect();
    const size = box.width / (scale.get() || 1);
    return {
      x: box.left + box.width / 2 - x.get(),
      y: box.top + box.height / 2 - y.get(),
      size,
    };
  }, [x, y, scale]);

  // Fly the sleeve out of the crate, then slide the record out of it.
  useIsomorphicLayoutEffect(() => {
    const run = ++runRef.current;
    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";
    // The story scroller takes focus, so arrow keys and Space scroll it.
    scrollRef.current?.focus({ preventScroll: true });

    const rest = restingBox();
    const origin = getOrigin(releases[index].id);
    if (reduceMotion || !rest || !origin) {
      disc.set(DISC_OUT);
      backdrop.set(1);
      busyRef.current = false;
      setPhase("open");
    } else {
      x.set(origin.left + origin.width / 2 - rest.x);
      y.set(origin.top + origin.height / 2 - rest.y);
      scale.set(origin.width / rest.size);

      void (async () => {
        play(SFX.out);
        animate(backdrop, 1, { duration: 0.45 });
        await Promise.all([
          animate(x, 0, FLY),
          animate(y, 0, FLY),
          animate(scale, 1, FLY),
        ]);
        if (runRef.current !== run) return;
        play(SFX.slide);
        await animate(disc, DISC_OUT, SLIDE);
        if (runRef.current !== run) return;
        play(SFX.land);
        busyRef.current = false;
        setPhase("open");
      })();
    }

    return () => {
      runRef.current += 1;
      style.overflow = previousOverflow;
    };
    // The opening choreography runs once per mount.
  }, []);

  // Changing records: back to the top, the disc goes back in, the sleeve
  // swaps, and the new record slides out.
  useEffect(() => {
    if (index === shown || phase !== "open") return;
    const run = runRef.current;
    busyRef.current = true;
    void (async () => {
      scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
      if (!reduceMotion) {
        play(SFX.back);
        await animate(disc, "0%", { duration: 0.32, ease: [0.5, 0, 0.75, 0] });
        if (runRef.current !== run) return;
      }
      setShown(index);
      // The story remounts for the new record; don't leave focus on <body>.
      window.requestAnimationFrame(() => {
        const player = playerRef.current;
        if (player && !player.contains(document.activeElement)) {
          scrollRef.current?.focus({ preventScroll: true });
        }
      });
      if (!reduceMotion) {
        play(SFX.slide);
        await animate(disc, DISC_OUT, SLIDE);
        if (runRef.current !== run) return;
        play(SFX.land);
      }
      busyRef.current = false;
    })();
  }, [index, shown, phase, reduceMotion, disc, play]);

  const close = useCallback(() => {
    if (phase === "closing") return;
    const run = ++runRef.current;
    setPhase("closing");
    busyRef.current = true;
    void (async () => {
      const scroller = scrollRef.current;
      const origin = getOrigin(releases[shown].id);
      // Deep in the story the deck is off screen: just fade the page away.
      if (reduceMotion || !origin || (scroller?.scrollTop ?? 0) > 40) {
        x.stop();
        y.stop();
        scale.stop();
        disc.stop();
        if (!reduceMotion) {
          animate(backdrop, 0, { duration: 0.35 });
          await animate(fade, 0, { duration: 0.35 });
          if (runRef.current !== run) return;
        }
        onClosed();
        return;
      }
      play(SFX.back);
      await animate(disc, "0%", { duration: 0.34, ease: [0.5, 0, 0.75, 0] });
      if (runRef.current !== run) return;
      // Measured without the transform, so closing mid-flight still lands in
      // the crate slot.
      const rest = restingBox();
      if (!rest) {
        onClosed();
        return;
      }
      animate(backdrop, 0, { duration: 0.4 });
      await Promise.all([
        animate(x, origin.left + origin.width / 2 - rest.x, FLY),
        animate(y, origin.top + origin.height / 2 - rest.y, FLY),
        animate(scale, origin.width / rest.size, FLY),
      ]);
      if (runRef.current !== run) return;
      play("thump");
      onClosed();
    })();
  }, [phase, shown, releases, reduceMotion, getOrigin, onClosed, disc, backdrop, fade, x, y, scale, play, restingBox]);

  const step = useCallback(
    (delta: number) => {
      if (busyRef.current) return;
      onIndex((index + delta + releases.length) % releases.length);
    },
    [index, onIndex, releases.length],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, step]);

  const meta = [release.role, release.where, release.team].filter(Boolean);

  return (
    <div
      ref={playerRef}
      className={`xp-player is-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${release.title}, ${release.kind}`}
      style={
        {
          "--accent": release.accent,
          "--accent-ink": release.accentInk,
          "--tint": release.tint,
        } as CSSProperties
      }
    >
      <motion.div className="xp-player-backdrop" style={{ opacity: backdrop }} />

      <motion.div
        ref={scrollRef}
        className="xp-player-scroll"
        style={{ opacity: fade }}
        tabIndex={-1}
      >
        <article className="xp-story">
          <header className="xp-story-head">
            <div className="xp-deck" aria-hidden="true">
              <motion.div
                ref={flyerRef}
                className="xp-deck-flyer"
                style={{ x, y, scale }}
              >
                <motion.div className="xp-vinyl-slide" style={{ x: disc }}>
                  <div className="xp-vinyl">
                    <div className="xp-vinyl-spin">
                      <div className="xp-vinyl-label">{release.label}</div>
                    </div>
                    <span className="xp-vinyl-sheen" />
                    <span className="xp-vinyl-hole" />
                  </div>
                </motion.div>
                <div key={release.id} className="xp-deck-sleeve">
                  {release.cover}
                </div>
              </motion.div>
            </div>

            <div key={release.id} className="xp-story-intro">
              <p className="xp-story-kicker">
                {release.sideLabel} · {release.when}
              </p>
              <StoryTitle release={release} />
              <p className="xp-story-dek">{story.dek}</p>
              <p className="xp-story-meta">{meta.join(" · ")}</p>
              <div className="xp-story-actions">
                {release.link ? (
                  <a
                    className="xp-story-link"
                    href={release.link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {release.link.label}
                    <ArrowUpRight weight="bold" aria-hidden="true" />
                  </a>
                ) : release.privateNote ? (
                  <span className="xp-story-private">
                    <LockSimple weight="bold" aria-hidden="true" />
                    {release.privateNote}
                  </span>
                ) : release.note ? (
                  <span className="xp-story-private">{release.note}</span>
                ) : null}
                <MusicToggle playing={music.playing} onToggle={music.toggle} />
              </div>
              <p className="xp-story-cue" aria-hidden="true">
                Scroll to read the story
              </p>
            </div>
          </header>

          <div key={release.id} className="xp-story-body">
            {story.sections.map((section, sectionIndex) => (
              <Fragment key={section.label}>
                <section className="xp-chapter" aria-label={section.label}>
                  <p className="xp-chapter-label">
                    <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                    {section.label}
                  </p>
                  <ScrollReveal
                    paragraphs={section.paragraphs}
                    scrollContainer={scrollRef}
                  />
                </section>

                {sectionIndex === 0 ? (
                  <blockquote className="xp-quote">
                    <p>{story.quote}</p>
                  </blockquote>
                ) : null}

                {sectionIndex === 2 && release.shot ? (
                  <figure className="xp-shot">
                    <img src={release.shot.src} alt={release.shot.alt} loading="lazy" />
                    <figcaption>{release.shot.alt}</figcaption>
                  </figure>
                ) : null}
              </Fragment>
            ))}

            <footer className="xp-liner">
              <h3 className="xp-liner-title">Liner notes</h3>
              <dl className="xp-liner-specs">
                {story.specs.map((spec) => (
                  <div key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <button type="button" className="xp-next" onClick={() => step(1)}>
                <span className="xp-next-sleeve" aria-hidden="true">
                  {next.cover}
                </span>
                <span className="xp-next-copy">
                  <small>Next record</small>
                  <strong>{next.title}</strong>
                </span>
                <ArrowRight weight="bold" aria-hidden="true" />
              </button>
            </footer>
          </div>
        </article>
      </motion.div>

      <button
        type="button"
        className="xp-player-close"
        onClick={close}
        aria-label="Put the record back"
      >
        <X weight="bold" />
      </button>

      <nav className="xp-nowplaying" aria-label="Records">
        <span className="xp-nowplaying-disc" aria-hidden="true">
          <span className="xp-vinyl-label">{release.label}</span>
        </span>
        <span className="xp-nowplaying-title">
          <small>
            {shown + 1} / {releases.length}
          </small>
          {release.title}
        </span>
        <MusicToggle playing={music.playing} onToggle={music.toggle} compact />
        <button type="button" onClick={() => step(-1)} aria-label="Previous record">
          <ArrowLeft weight="bold" />
        </button>
        <button type="button" onClick={() => step(1)} aria-label="Next record">
          <ArrowRight weight="bold" />
        </button>
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Page                                                                      */
/* ------------------------------------------------------------------------ */

export default function RecordCrate<Id extends MusicTrackId>({
  collection,
}: {
  collection: Collection<Id>;
}) {
  const { releases, fit, hashAliases } = collection;
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string>("default");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openedByClick, setOpenedByClick] = useState(false);
  // Touch devices get the crate playing itself until the visitor touches it.
  const [autoplay, setAutoplay] = useState(true);
  const deepLinkTimerRef = useRef(0);
  const [cursorOn, setCursorOn] = useState(false);
  const touch = useHoverless();
  const sleevesRef = useRef(new Map<string, HTMLButtonElement>());
  const openerRef = useRef<HTMLElement | null>(null);
  const hoverTimerRef = useRef(0);
  const flick = useTickSound("crateFlick", 60);

  const previewSoon = useCallback((id: string, delay = HOVER_INTENT_MS) => {
    window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => setActiveId(id), delay);
  }, []);

  useEffect(() => () => window.clearTimeout(hoverTimerRef.current), []);

  const cursorX = useSpring(0, { stiffness: 420, damping: 34 });
  const cursorY = useSpring(0, { stiffness: 420, damping: 34 });

  const active = releases.find((entry) => entry.id === activeId);

  const words = useMemo<WordEntry[]>(
    () => [
      { id: "default", word: collection.word },
      ...releases.map(({ id, word, logo, logoFill, caret }) => ({
        id,
        word,
        logo,
        logoFill,
        caret,
      })),
    ],
    [collection.word, releases],
  );
  const fitFor = useCallback(
    (id: string) => fit?.[id as Id | "default"] ?? FIT_DEFAULT,
    [fit],
  );

  useEffect(() => {
    if (!touch) return;
    const stop = () => setAutoplay(false);
    window.addEventListener("pointerdown", stop, { capture: true, once: true });
    return () => window.removeEventListener("pointerdown", stop, { capture: true });
  }, [touch]);

  // Without hover, the crate plays itself: each record takes the stage in turn.
  useEffect(() => {
    if (!touch || !autoplay || openIndex !== null || reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveId((current) => {
        const at = releases.findIndex((entry) => entry.id === current);
        return releases[(at + 1) % releases.length].id;
      });
    }, 2600);
    return () => window.clearInterval(timer);
  }, [touch, autoplay, openIndex, reduceMotion, releases]);

  useEffect(() => {
    if (touch) return;
    const onMove = (event: PointerEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [touch, cursorX, cursorY]);

  const getOrigin = useCallback((id: string): Rect | null => {
    const element = sleevesRef.current.get(id);
    if (!element) return null;
    const { left, top, width, height } = element.getBoundingClientRect();
    return { left, top, width, height };
  }, []);

  const openRelease = useCallback((index: number, byClick = true) => {
    window.clearTimeout(deepLinkTimerRef.current);
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCursorOn(false);
    setOpenedByClick(byClick);
    setOpenIndex(index);
  }, []);

  const handleClosed = useCallback(() => {
    setOpenIndex(null);
    window.history.replaceState(null, "", window.location.pathname);
    openerRef.current?.focus({ preventScroll: true });
    openerRef.current = null;
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    window.history.replaceState(null, "", `#${releases[openIndex].id}`);
  }, [openIndex, releases]);

  // Deep links (/experience#dawn, /education#oxford, and the old
  // /work/projects#dawn) play that record once the crate has landed.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const id = hashAliases?.[hash] ?? hash;
    const index = releases.findIndex((entry) => entry.id === id);
    if (index < 0) return;
    deepLinkTimerRef.current = window.setTimeout(() => openRelease(index, false), 700);
    return () => window.clearTimeout(deepLinkTimerRef.current);
  }, [openRelease, releases, hashAliases]);

  const shownRelease = openIndex === null ? null : releases[openIndex];

  return (
    <main
      className={`xp-page ${loud.variable}`}
      style={
        {
          "--crate-count": releases.length,
          "--accent": active?.accent ?? "#f2efe8",
          "--accent-ink": active?.accentInk ?? "#101010",
        } as CSSProperties
      }
    >
      {/* While a record is open the page behind it is inert: out of the tab
          order, clicks and the accessibility tree. */}
      <div className="xp-menu-slot" inert={openIndex !== null}>
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

      <h1 className="xp-sr-only">{collection.heading}</h1>

      <div
        inert={openIndex !== null}
        className="xp-crate"
        onPointerLeave={() => {
          if (touch) return;
          previewSoon("default", 140);
          setCursorOn(false);
        }}
      >
        {(["A", "B"] as const).map((side) => (
          <section
            key={side}
            className="xp-crate-side"
            aria-label={collection.sides[side]}
          >
            <ul className="xp-crate-row">
              {releases.map((release, index) =>
                release.side !== side ? null : (
                  <li key={release.id}>
                    <button
                      ref={(element) => {
                        if (element) sleevesRef.current.set(release.id, element);
                        else sleevesRef.current.delete(release.id);
                      }}
                      type="button"
                      className={`xp-sleeve${
                        activeId === release.id ? " is-active" : ""
                      }${shownRelease?.id === release.id ? " is-out" : ""}`}
                      aria-label={`Play ${release.title}: ${release.kind}`}
                      aria-haspopup="dialog"
                      style={{ "--sleeve-index": index } as CSSProperties}
                      onPointerEnter={() => {
                        if (touch) return;
                        flick();
                        previewSoon(release.id);
                        setCursorOn(true);
                      }}
                      onFocus={() => setActiveId(release.id)}
                      onClick={() => openRelease(index)}
                    >
                      {release.cover}
                    </button>
                  </li>
                ),
              )}
            </ul>
          </section>
        ))}
      </div>

      <BigWord activeId={activeId} words={words} fitFor={fitFor} />

      {!touch ? (
        <motion.div
          className={`xp-cursor${cursorOn && active ? " is-on" : ""}`}
          style={{ x: cursorX, y: cursorY }}
          aria-hidden="true"
        >
          <span className="xp-cursor-disc">
            <ArrowUpRight weight="bold" />
          </span>
        </motion.div>
      ) : null}

      {openIndex !== null ? (
        <RecordPlayer
          collection={collection}
          index={openIndex}
          onIndex={setOpenIndex}
          getOrigin={getOrigin}
          onClosed={handleClosed}
          gesture={openedByClick}
        />
      ) : null}
    </main>
  );
}
