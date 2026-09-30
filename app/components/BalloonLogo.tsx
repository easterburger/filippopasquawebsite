"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";

import "./balloon-logo.css";

// Filippo's initials as two foil letter balloons floating in the top-left
// corner of the home page (a generated photo, cut out; the same image makes
// the favicons through scripts/build-favicons.mjs). It can be grabbed and
// dragged anywhere on the screen: it leans into the direction it is pulled,
// like a balloon on a string, and stays where it is let go. A click without a
// drag goes back to the top.

/** Degrees of lean per px/s of drag speed, and the most it will lean. */
const LEAN = 0.018;
const MAX_LEAN = 24;

/**
 * The balloon turns around its vertical axis. A photo has no depth, so it is
 * stacked as copies spread through the balloon's thickness, shaped like a
 * pillow: the middle copy is the full outline (the seam) and darker, the
 * faces in front and behind are a little smaller. Turned sideways it still
 * looks inflated, and from behind it shows its mirrored back like a real
 * balloon.
 */
const LAYERS = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
const OUTER = 4;

function layerStyle(layer: number) {
  const out = Math.abs(layer) / OUTER;
  return {
    "--layer": layer,
    "--layer-scale": 1 - out * out * 0.07,
    "--shade": 0.7 + 0.3 * out ** 1.5,
  } as CSSProperties;
}

export default function BalloonLogo({ ready }: { ready: boolean }) {
  const reduceMotion = useReducedMotion();
  const boundsRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const speed = useVelocity(x);
  const lean = useSpring(
    useTransform(speed, (value) => Math.max(-MAX_LEAN, Math.min(MAX_LEAN, value * LEAN))),
    { stiffness: 180, damping: 14 },
  );

  const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    // Letting go after a drag is not a click.
    if (draggedRef.current) {
      event.preventDefault();
      draggedRef.current = false;
    }
  };

  return (
    <>
      <div ref={boundsRef} className="balloon-bounds" aria-hidden="true" />
      <motion.a
        className={`balloon-logo${ready ? " is-ready" : ""}`}
        href="#top"
        aria-label="Filippo Pasqua, back to the top"
        draggable={false}
        drag
        dragConstraints={boundsRef}
        dragElastic={0.12}
        dragMomentum={!reduceMotion}
        dragTransition={{ power: 0.18, timeConstant: 260 }}
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onClick={handleClick}
        whileDrag={{ scale: 1.06, cursor: "grabbing" }}
        style={{ x, y }}
      >
        <motion.span
          className="balloon-float"
          aria-hidden="true"
          style={{ rotate: reduceMotion ? 0 : lean }}
        >
          <svg className="balloon-string" viewBox="0 0 20 64" preserveAspectRatio="none">
            <path d="M10 0 C 4 14, 16 26, 10 38 S 5 54, 11 64" />
          </svg>
          <span className="balloon-spin">
            {LAYERS.map((depth) => (
              <img
                key={depth}
                className="balloon-art"
                src="/hero-assets/fp-balloon.webp"
                alt=""
                width={520}
                height={520}
                draggable={false}
                style={layerStyle(depth)}
              />
            ))}
          </span>
        </motion.span>
      </motion.a>
    </>
  );
}
