"use client";

import { useReducedMotion } from "motion/react";
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";

import "./scroll-reveal.css";

// A story whose words wait as solid grey pills and turn into text as the reader
// scrolls. The pills fade darker the further they sit from the reveal front, so
// the unread text reads like a gradient running down the page. Every frame is
// written straight to CSS custom properties on the word spans; React only
// renders the words once.

export type ScrollRevealParagraph = {
  text: string;
  /** First occurrence (case-insensitive) is tinted with --accent. */
  highlight?: string;
};

type ScrollRevealProps = {
  paragraphs: ScrollRevealParagraph[];
  /**
   * The element that scrolls the story. Defaults to the nearest scrolling
   * ancestor, then the window.
   */
  scrollContainer?: RefObject<HTMLElement | null>;
  className?: string;
  /** Share of the container height where a paragraph's top starts revealing. */
  start?: number;
  /** Share of the container height where its bottom is fully revealed. */
  end?: number;
};

type Word = {
  segments: { text: string; mark: boolean }[];
  mark: boolean;
};

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Words that fade in together at the front, so it glides rather than ticks. */
const SOFT = 1.6;
/** Time constant (ms) the front eases toward the scroll position with. */
const SMOOTH_MS = 70;
/** Quiet frames to keep polling after the last change, for layout that moves without scrolling. */
const SETTLE_FRAMES = 45;
// Grey level of a pill by its distance (in words) past the front.
const SHADES: ReadonlyArray<readonly [number, number]> = [
  [0, 0xdc],
  [4, 0xbd],
  [9, 0x9a],
  [14, 0x77],
  [19, 0x55],
  [24, 0x3a],
  [30, 0x1f],
];
const FADE_WORDS = SHADES[SHADES.length - 1][0];
const LIGHT = SHADES[0][1];
const DARK = SHADES[SHADES.length - 1][1];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** 1 right after the front (#dcdcdc), 0 once the pill has faded to #1f1f1f. */
function shadeAt(distance: number) {
  for (let i = 1; i < SHADES.length; i++) {
    const [to, level] = SHADES[i];
    if (distance <= to) {
      const [from, previous] = SHADES[i - 1];
      const t = (distance - from) / (to - from);
      return (previous + (level - previous) * t - DARK) / (LIGHT - DARK);
    }
  }
  return 0;
}

// Solid pill, then a translucent one while the word fades in over it.
function pillAlpha(reveal: number) {
  if (reveal <= 0) return 1;
  if (reveal < 0.3) return 1 - (reveal / 0.3) * 0.78;
  return 0.22 * (1 - (reveal - 0.3) / 0.7);
}

function inkAlpha(reveal: number) {
  return clamp((reveal - 0.12) / 0.72, 0, 1);
}

function tokenize(paragraphs: ScrollRevealParagraph[]): Word[][] {
  return paragraphs.map(({ text, highlight }) => {
    const phrase = highlight?.trim() ?? "";
    const from = phrase ? text.toLowerCase().indexOf(phrase.toLowerCase()) : -1;
    const to = from < 0 ? -1 : from + phrase.length;

    return Array.from(text.matchAll(/\S+/g), (match) => {
      const word = match[0];
      const offset = match.index ?? 0;
      const markFrom = clamp(from - offset, 0, word.length);
      const markTo = clamp(to - offset, 0, word.length);
      if (from < 0 || markTo <= markFrom) {
        return { segments: [{ text: word, mark: false }], mark: false };
      }
      // Punctuation glued to the phrase stays white once revealed.
      const segments = [
        { text: word.slice(0, markFrom), mark: false },
        { text: word.slice(markFrom, markTo), mark: true },
        { text: word.slice(markTo), mark: false },
      ].filter((segment) => segment.text);
      return { segments, mark: true };
    });
  });
}

function findScroller(node: HTMLElement): HTMLElement | null {
  for (
    let element = node.parentElement;
    element && element !== document.body && element !== document.documentElement;
    element = element.parentElement
  ) {
    const { overflowY } = getComputedStyle(element);
    if (overflowY === "auto" || overflowY === "scroll") return element;
  }
  return null;
}

export default function ScrollReveal({
  paragraphs,
  scrollContainer,
  className = "",
  start = 0.78,
  end = 0.42,
}: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Parents usually pass a fresh array literal; only real text changes should
  // rebuild the words and restart the scroll wiring.
  const signature = JSON.stringify(paragraphs);
  const story = useMemo(
    () => tokenize(JSON.parse(signature) as ScrollRevealParagraph[]),
    [signature],
  );

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) return;

    const words = Array.from(root.querySelectorAll<HTMLElement>(".sr-w"));
    const blocks = Array.from(root.querySelectorAll<HTMLElement>(".sr-para"));
    const counts = blocks.map((block) => block.querySelectorAll(".sr-w").length);
    const marks = words.map((word) => word.classList.contains("is-mark"));
    const total = words.length;
    if (!total) return;

    const scroller = scrollContainer?.current ?? findScroller(root);
    const written = words.map(() => ["", "", ""]);

    // Each paragraph reveals its share of words between `start` and `end`;
    // summing them and handing the count out in reading order keeps a single
    // front even when neighbouring paragraphs' windows overlap.
    const measure = () => {
      let viewTop = 0;
      let height = window.innerHeight;
      let remaining: number;
      if (scroller) {
        viewTop = scroller.getBoundingClientRect().top + scroller.clientTop;
        height = scroller.clientHeight;
        remaining = scroller.scrollHeight - height - scroller.scrollTop;
      } else {
        remaining =
          document.documentElement.scrollHeight - height - window.scrollY;
      }
      remaining = Math.max(0, remaining);

      const startY = start * height;
      let revealed = 0;
      blocks.forEach((block, index) => {
        const rect = block.getBoundingClientRect();
        const top = rect.top - viewTop;
        // Where the bottom sits when fully revealed. Pulled down to wherever
        // it rests at max scroll, so a story near the end of a short page
        // still finishes instead of stalling as pills.
        const endY = Math.max(end * height, top + rect.height - remaining);
        const span = startY - endY + rect.height;
        const progress = span > 0 ? (startY - top) / span : 1;
        revealed += counts[index] * clamp(progress, 0, 1);
      });
      return (revealed / total) * (total - 1 + SOFT);
    };

    const paint = (front: number, from: number, to: number) => {
      const first = Math.max(0, Math.floor(from));
      const last = Math.min(total - 1, Math.ceil(to));
      for (let index = first; index <= last; index++) {
        const reveal = clamp((front - index) / SOFT, 0, 1);
        const shade = shadeAt(Math.max(0, index - front));
        // Highlight pills keep some colour far down the page as a teaser.
        const mix = marks[index] ? 30 + shade * 40 : shade * 100;
        const next = [
          `${mix.toFixed(1)}%`,
          pillAlpha(reveal).toFixed(3),
          `${(inkAlpha(reveal) * 100).toFixed(1)}%`,
        ];
        const previous = written[index];
        const style = words[index].style;
        if (next[0] !== previous[0]) style.setProperty("--sr-mix", next[0]);
        if (next[1] !== previous[1]) style.setProperty("--sr-pill", next[1]);
        if (next[2] !== previous[2]) style.setProperty("--sr-text", next[2]);
        written[index] = next;
      }
    };

    let shown = measure();
    paint(shown, 0, total - 1);
    root.dataset.live = "";

    let frame = 0;
    let lastTime = 0;
    let quiet = 0;

    const tick = (time: number) => {
      frame = 0;
      const dt = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;

      const goal = measure();
      const previous = shown;
      shown += (goal - shown) * (1 - Math.exp(-dt / SMOOTH_MS));
      if (Math.abs(goal - shown) < 0.002) shown = goal;

      if (shown !== previous) {
        paint(
          shown,
          Math.min(previous, shown) - SOFT - 1,
          Math.max(previous, shown) + FADE_WORDS + 1,
        );
        quiet = 0;
      } else {
        quiet += 1;
      }

      if (quiet < SETTLE_FRAMES) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    };

    const wake = () => {
      quiet = 0;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    const resizeObserver = new ResizeObserver(wake);
    resizeObserver.observe(root);
    if (scroller) resizeObserver.observe(scroller);
    // Entrance animations move the story without a scroll event.
    wake();

    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      resizeObserver.disconnect();
      delete root.dataset.live;
      for (const word of words) {
        word.style.removeProperty("--sr-mix");
        word.style.removeProperty("--sr-pill");
        word.style.removeProperty("--sr-text");
      }
    };
  }, [story, scrollContainer, start, end, reduceMotion]);

  return (
    <div ref={rootRef} className={`sr-story ${className}`.trim()}>
      {story.map((words, paragraphIndex) => (
        <p key={paragraphIndex} className="sr-para">
          {words.map((word, wordIndex) => (
            <Fragment key={wordIndex}>
              {wordIndex > 0 ? " " : null}
              <span className={word.mark ? "sr-w is-mark" : "sr-w"}>
                {word.segments.map((segment, segmentIndex) =>
                  segment.mark ? (
                    <span key={segmentIndex} className="sr-mark">
                      {segment.text}
                    </span>
                  ) : (
                    <Fragment key={segmentIndex}>{segment.text}</Fragment>
                  ),
                )}
              </span>
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
