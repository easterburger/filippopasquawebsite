"use client";

import {
  Fragment,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useSound, useTickSound } from "@/components/sound/SoundProvider";

// Every letter hangs from its top edge like a wind chime. Brushing the cursor
// through the text drags letters along with it, a vertical pass parts them
// like a bead curtain, a click or tap plucks them outward, and damped springs
// let them wobble home. An optional breeze sweeps through now and then so the
// line never sits completely still.

export type SwingMark = {
  /** A run of words exactly as it appears in `text`, within a single line. */
  words: string;
  /** Wraps the swinging words so decorations can sit alongside them. */
  render: (words: ReactNode) => ReactNode;
};

type SwingTextProps = {
  /** "\n" starts a new line; each line wraps with balanced lengths. */
  text: string;
  className?: string;
  /** Starts the staggered blur-in; the physics works regardless. */
  revealed: boolean;
  onRevealComplete?: () => void;
  /** Stagger between words in ms. */
  wordDelay?: number;
  marks?: SwingMark[];
  /** Occasional gentle gust through the letters while nobody is touching them. */
  breeze?: boolean;
};

type Chime = {
  el: HTMLSpanElement;
  // Rest centre relative to the host; transforms never touch these.
  x: number;
  y: number;
  // Positive swings the bottom of the letter to the right.
  angle: number;
  spin: number;
  lift: number;
  rise: number;
};

// Angular spring: ~2 Hz with light damping, so a swing rings a few times.
const STIFFNESS = 160;
const DAMPING = 4.2;
// deg/s² of push per px/s of horizontal cursor speed at the centre of the reach.
const PUSH = 5.6;
// deg/s² per px/s of vertical speed, pushing letters away from the cursor's path.
const PART = 4.2;
// Reach of the cursor, in multiples of the font size.
const REACH = 1.75;
const MAX_ANGLE = 34;
const MAX_SPEED = 5000;
// Cursor speed is eased through tanh around this (px/s), so a slow drag still
// leans the letters visibly while a flick can't slam them into the stops.
const SOFT_SPEED = 950;
const PLUCK = 320;
const LIFT_STIFFNESS = 220;
const LIFT_DAMPING = 22;
// The breeze: a soft front that crosses the text at this speed (px/s).
const GUST_SPEED = 900;
const GUST_PUSH = 1.5;
const ENABLED_QUERY = "(prefers-reduced-motion: no-preference)";

/**
 * Letter centre relative to `host`. Offsets ignore transforms, so this is the
 * rest position even mid-swing, and summing up the offsetParent chain keeps it
 * right when a mark wraps letters in a positioned box of its own.
 */
function restCentre(el: HTMLElement, host: Element) {
  let x = el.offsetLeft + el.offsetWidth / 2;
  let y = el.offsetTop + el.offsetHeight / 2;
  let parent = el.offsetParent as HTMLElement | null;
  while (parent && parent !== host) {
    x += parent.offsetLeft + parent.clientLeft;
    y += parent.offsetTop + parent.clientTop;
    parent = parent.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

const soften = (speed: number) => SOFT_SPEED * Math.tanh(speed / SOFT_SPEED);

/** Where each mark starts: `line:word` → mark and its length in words. */
function locateMarks(lines: string[][], marks: SwingMark[]) {
  const starts = new Map<string, { mark: SwingMark; length: number }>();
  for (const mark of marks) {
    const target = mark.words.split(" ");
    lines.some((line, lineIndex) =>
      line.some((_, start) => {
        const hit = target.every((word, offset) => line[start + offset] === word);
        if (hit) starts.set(`${lineIndex}:${start}`, { mark, length: target.length });
        return hit;
      }),
    );
  }
  return starts;
}

export default function SwingText({
  text,
  className = "",
  revealed,
  onRevealComplete,
  wordDelay = 86,
  marks = [],
  breeze = false,
}: SwingTextProps) {
  const rootRef = useRef<HTMLParagraphElement>(null);
  const { sequence } = useSound();
  const chimeTick = useTickSound("hover", 70);
  const lines = text.split("\n").map((line) => line.split(" "));
  const lineOffsets = lines.map((_, index) =>
    lines.slice(0, index).reduce((count, line) => count + line.length, 0),
  );
  const wordCount = lines.reduce((count, line) => count + line.length, 0);
  const markStarts = locateMarks(lines, marks);

  const onCompleteRef = useRef(onRevealComplete);
  useEffect(() => {
    onCompleteRef.current = onRevealComplete;
  });

  const breezeRef = useRef(breeze);
  useEffect(() => {
    breezeRef.current = breeze;
  }, [breeze]);

  useEffect(() => {
    if (!revealed) return;
    // Reduced motion skips the entrance, so there's no animationend to wait for.
    if (!window.matchMedia(ENABLED_QUERY).matches) {
      onCompleteRef.current?.();
      return;
    }
    sequence("teletype", wordCount, wordDelay / 1000);
  }, [revealed, sequence, wordCount, wordDelay]);

  useEffect(() => {
    const root = rootRef.current;
    const host = root?.offsetParent as HTMLElement | null;
    if (!root || !host) return;
    if (!window.matchMedia(ENABLED_QUERY).matches) return;

    const chimes: Chime[] = Array.from(
      root.querySelectorAll<HTMLSpanElement>(".swing-char"),
    ).map((el) => ({ el, x: 0, y: 0, angle: 0, spin: 0, lift: 0, rise: 0 }));

    let fontSize = 60;
    let reach = fontSize * REACH;
    let bounds = { left: 0, right: 0 };
    let dirty = true;
    const measure = () => {
      fontSize = parseFloat(getComputedStyle(root).fontSize) || 60;
      reach = fontSize * REACH;
      bounds = { left: Infinity, right: -Infinity };
      for (const chime of chimes) {
        const centre = restCentre(chime.el, host);
        chime.x = centre.x;
        chime.y = centre.y;
        bounds.left = Math.min(bounds.left, centre.x);
        bounds.right = Math.max(bounds.right, centre.x);
      }
      dirty = false;
    };
    // A font swap or rewrap can move letters without resizing the paragraph,
    // so fonts are watched too, and every wake-up re-measures anyway.
    const markDirty = () => {
      dirty = true;
    };
    const resizeObserver = new ResizeObserver(markDirty);
    resizeObserver.observe(root);
    document.fonts?.addEventListener("loadingdone", markDirty);

    const pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false, lastT: 0 };
    const gust = { active: false, front: 0, until: 0 };
    let frame = 0;
    let lastTime = 0;

    const step = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 1 / 30) : 1 / 60;
      lastTime = time;
      if (dirty) measure();

      const origin = host.getBoundingClientRect();
      const originX = origin.left + host.clientLeft;
      const originY = origin.top + host.clientTop;
      // Speed decays when the cursor stops, so a parked cursor only lifts.
      const decay = Math.exp(-dt * 10);
      pointer.vx *= decay;
      pointer.vy *= decay;
      let awake =
        pointer.inside && Math.abs(pointer.vx) + Math.abs(pointer.vy) > 1;

      if (gust.active) {
        gust.front += GUST_SPEED * dt;
        if (gust.front > gust.until) gust.active = false;
        else awake = true;
      }

      for (const chime of chimes) {
        let push = 0;
        let liftTarget = 0;
        if (pointer.inside) {
          const dx = originX + chime.x - pointer.x;
          const dy = originY + chime.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < reach) {
            const near = 1 - (distance / reach) ** 2;
            const falloff = near * near;
            // Which side of the cursor's path the letter hangs on, eased to
            // zero right under it so a letter can't flip-flop.
            const side = Math.max(-1, Math.min(1, dx / (fontSize * 0.35)));
            push =
              (soften(pointer.vx) * PUSH +
                Math.abs(soften(pointer.vy)) * side * PART) *
              falloff;
            liftTarget = -reach * 0.06 * falloff;
            if (Math.abs(push) > 1100 && Math.abs(chime.spin) < 40) chimeTick();
          }
        }
        if (gust.active) {
          // The front leans forward a little per line, like wind through grass.
          const dx = chime.x - (gust.front - chime.y * 0.35);
          if (Math.abs(dx) < reach) {
            const near = 1 - (dx / reach) ** 2;
            push += GUST_SPEED * GUST_PUSH * near * near;
          }
        }

        chime.spin += (push - STIFFNESS * chime.angle - DAMPING * chime.spin) * dt;
        chime.angle = Math.max(
          -MAX_ANGLE,
          Math.min(MAX_ANGLE, chime.angle + chime.spin * dt),
        );
        chime.rise +=
          (LIFT_STIFFNESS * (liftTarget - chime.lift) - LIFT_DAMPING * chime.rise) * dt;
        chime.lift += chime.rise * dt;

        const settled =
          Math.abs(chime.angle) < 0.05 &&
          Math.abs(chime.spin) < 0.5 &&
          Math.abs(chime.lift - liftTarget) < 0.05 &&
          Math.abs(chime.rise) < 0.5;
        if (settled) {
          // Park exactly at rest (or at the lift a still cursor holds).
          chime.angle = chime.spin = chime.rise = 0;
          chime.lift = liftTarget;
          chime.el.style.transform = liftTarget
            ? `translate3d(0, ${liftTarget.toFixed(2)}px, 0)`
            : "";
        } else {
          awake = true;
          // CSS rotates clockwise, which swings a top-hung letter's foot left.
          chime.el.style.transform = `translate3d(0, ${chime.lift.toFixed(2)}px, 0) rotate(${(-chime.angle).toFixed(2)}deg)`;
        }
      }

      frame = awake ? requestAnimationFrame(step) : 0;
      if (!frame) lastTime = 0;
    };

    const wake = () => {
      if (frame) return;
      // Asleep means everything is at rest, so this is a free chance to catch
      // any layout change the observers missed.
      dirty = true;
      frame = requestAnimationFrame(step);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = root.getBoundingClientRect();
      const inside =
        event.clientX > rect.left - reach &&
        event.clientX < rect.right + reach &&
        event.clientY > rect.top - reach &&
        event.clientY < rect.bottom + reach;

      const now = event.timeStamp;
      const elapsed = (now - pointer.lastT) / 1000;
      if (pointer.inside && elapsed > 0 && elapsed < 0.1) {
        const clamp = (speed: number) =>
          Math.max(-MAX_SPEED, Math.min(MAX_SPEED, speed));
        pointer.vx += (clamp((event.clientX - pointer.x) / elapsed) - pointer.vx) * 0.5;
        pointer.vy += (clamp((event.clientY - pointer.y) / elapsed) - pointer.vy) * 0.5;
      } else {
        pointer.vx = pointer.vy = 0;
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.lastT = now;
      pointer.inside = inside;
      if (inside) wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (dirty) measure();
      const origin = host.getBoundingClientRect();
      const radius = reach * 2;
      let plucked = false;
      for (const chime of chimes) {
        const dx = origin.left + host.clientLeft + chime.x - event.clientX;
        const dy = origin.top + host.clientTop + chime.y - event.clientY;
        const distance = Math.hypot(dx, dy);
        if (distance > radius) continue;
        const strength = 1 - distance / radius;
        // Outward from the tap: letters to the right kick right.
        chime.spin += Math.sign(dx || 1) * PLUCK * strength;
        chime.rise -= reach * 1.1 * strength;
        plucked = true;
      }
      if (plucked) {
        chimeTick();
        wake();
      }
    };

    const onLeave = () => {
      pointer.inside = false;
      pointer.vx = pointer.vy = 0;
    };

    // The breeze waits for a quiet moment: no cursor in the text, tab visible.
    let gustTimer = 0;
    const scheduleGust = (delay: number) => {
      gustTimer = window.setTimeout(() => {
        const quiet =
          breezeRef.current &&
          !document.hidden &&
          !gust.active &&
          (!pointer.inside || performance.now() - pointer.lastT > 2500);
        if (quiet) {
          if (dirty) measure();
          gust.active = true;
          gust.front = bounds.left - reach;
          gust.until = bounds.right + reach + fontSize * 2;
          wake();
        }
        scheduleGust(7000 + Math.random() * 5000);
      }, delay);
    };
    scheduleGust(2600);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onPointerDown);
      document.fonts?.removeEventListener("loadingdone", markDirty);
      resizeObserver.disconnect();
      window.clearTimeout(gustTimer);
      cancelAnimationFrame(frame);
      for (const chime of chimes) chime.el.style.transform = "";
    };
  }, [text, chimeTick]);

  const renderWord = (word: string, wordIndex: number) => (
    <span
      className="swing-word"
      style={
        {
          "--word-index": wordIndex,
          "--word-delay": `${wordDelay}ms`,
        } as CSSProperties
      }
      onAnimationEnd={
        wordIndex === wordCount - 1
          ? () => onCompleteRef.current?.()
          : undefined
      }
    >
      {Array.from(word).map((char, charIndex) => (
        <span key={charIndex} className="swing-char">
          {char}
        </span>
      ))}
    </span>
  );

  return (
    <p
      ref={rootRef}
      className={`swing-text ${className}${revealed ? " is-revealed" : ""}`}
    >
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      {lines.map((line, lineIndex) => {
        const nodes: ReactNode[] = [];
        for (let index = 0; index < line.length; ) {
          const wordIndex = lineOffsets[lineIndex] + index;
          const start = markStarts.get(`${lineIndex}:${index}`);
          const length = start?.length ?? 1;
          const words = line.slice(index, index + length).map((word, offset) => (
            <Fragment key={offset}>
              {offset > 0 && " "}
              {renderWord(word, wordIndex + offset)}
            </Fragment>
          ));
          nodes.push(
            <Fragment key={`${index}-${line[index]}`}>
              {index > 0 && " "}
              {start ? start.mark.render(words) : words}
            </Fragment>,
          );
          index += length;
        }
        return (
          <span key={lineIndex} className="swing-line" aria-hidden="true">
            {nodes}
          </span>
        );
      })}
    </p>
  );
}
