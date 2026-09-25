"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const CURTAIN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const LIFT_DURATION = 0.9;

// Ends on the Italian greeting, which then gets a longer hold before the lift.
const GREETINGS = [
  { text: "Hello", lang: "en" },
  { text: "Bonjour", lang: "fr" },
  { text: "Hola", lang: "es" },
  { text: "Hallo", lang: "de" },
  { text: "Olá", lang: "pt" },
  { text: "Привет", lang: "ru" },
  { text: "こんにちは", lang: "ja" },
  { text: "안녕하세요", lang: "ko" },
  { text: "你好", lang: "zh" },
  { text: "नमस्ते", lang: "hi" },
  { text: "مرحبا", lang: "ar" },
  { text: "Ciao", lang: "it" },
] as const;

const FIRST_HOLD_MS = 850;
const STEP_MS = 140;
const LAST_HOLD_MS = 650;

// The curve hangs below the panel; its control point sits at the bottom of the
// viewBox and flattens to the top edge as the panel lifts away.
const CURVED_EDGE = "M0 0 L100 0 Q50 100 0 0 Z";
const FLAT_EDGE = "M0 0 L100 0 Q50 0 0 0 Z";

type IntroGateProps = {
  /** Fires as the curtain starts lifting, so the page can animate in beneath it. */
  onReveal: () => void;
  /** Fires once the curtain is fully off-screen. */
  onDone: () => void;
};

export default function IntroGate({ onReveal, onDone }: IntroGateProps) {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";

    return () => {
      style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (isLeaving) return;

    // Flashing through words is exactly what reduced motion asks us not to do.
    if (shouldReduceMotion) {
      const timeout = window.setTimeout(() => setIsLeaving(true), 700);
      return () => window.clearTimeout(timeout);
    }

    const isLast = index === GREETINGS.length - 1;
    const delay =
      index === 0 ? FIRST_HOLD_MS : isLast ? LAST_HOLD_MS : STEP_MS;

    const timeout = window.setTimeout(() => {
      if (isLast) {
        setIsLeaving(true);
      } else {
        setIndex((current) => current + 1);
      }
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [index, isLeaving, shouldReduceMotion]);

  useEffect(() => {
    if (isLeaving) onReveal();
    // onReveal is a fresh closure each parent render; the lift only starts once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeaving]);

  const greeting = GREETINGS[index];

  return (
    <motion.div
      className="intro-gate"
      aria-hidden="true"
      initial={false}
      // Same keys and units in every state: dropping a key makes Motion animate
      // it back to its base value, which settles instantly and fires
      // onAnimationComplete before the lift has even started.
      animate={
        isLeaving
          ? shouldReduceMotion
            ? { y: "0%", opacity: 0 }
            : { y: "-100%", opacity: 1 }
          : { y: "0%", opacity: 1 }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0.4, ease: "easeOut" }
          : { duration: LIFT_DURATION, ease: CURTAIN_EASE }
      }
      onAnimationComplete={() => {
        if (isLeaving) onDone();
      }}
    >
      <motion.p
        className="intro-gate-greeting"
        initial={false}
        animate={
          isLeaving && !shouldReduceMotion
            ? { opacity: 0, y: -40 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.5, ease: CURTAIN_EASE }}
      >
        <span className="intro-gate-dot" />
        <span
          key={greeting.lang}
          lang={greeting.lang}
          dir={greeting.lang === "ar" ? "rtl" : undefined}
        >
          {greeting.text}
        </span>
      </motion.p>

      {!shouldReduceMotion && (
        <svg
          className="intro-gate-curve"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d={CURVED_EDGE}
            initial={false}
            animate={{ d: isLeaving ? FLAT_EDGE : CURVED_EDGE }}
            transition={{
              duration: LIFT_DURATION - 0.1,
              ease: CURTAIN_EASE,
              delay: 0.1,
            }}
          />
        </svg>
      )}
    </motion.div>
  );
}
