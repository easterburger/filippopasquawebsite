"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import BlurText from "./BlurText";
import HeroActionMark from "./HeroActionMark";
import { MeltLayer, useMeltFill } from "./melt-fill";

const SOFT_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const CURTAIN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

const GATE_TITLE = "Hey, I'm Filippo.";

type IntroGateProps = {
  onEnter: () => void;
};

export default function IntroGate({ onEnter }: IntroGateProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isLeaving, setIsLeaving] = useState(false);
  const [isTitleDone, setIsTitleDone] = useState(false);
  const meltProps = useMeltFill();

  useEffect(() => {
    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";

    return () => {
      style.overflow = previousOverflow;
    };
  }, []);

  const handleEnter = () => {
    if (isLeaving) return;

    if (shouldReduceMotion) {
      onEnter();
      return;
    }

    setIsLeaving(true);
  };

  const showAction = isTitleDone || Boolean(shouldReduceMotion);

  return (
    <div
      className="intro-gate"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
    >
      <motion.div
        className="intro-gate-inner"
        initial={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        animate={
          isLeaving
            ? { opacity: 0, y: -18, filter: "blur(12px)" }
            : { opacity: 1, y: 0, filter: "blur(0px)" }
        }
        transition={{ duration: 0.4, ease: SOFT_EASE }}
      >
        <BlurText
          text={GATE_TITLE}
          className="intro-gate-title"
          animateBy="words"
          direction="top"
          delay={130}
          stepDuration={0.46}
          threshold={0.1}
          onAnimationComplete={() => setIsTitleDone(true)}
        />

        <motion.div
          className="intro-gate-action-shell"
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 18, scale: 0.94, filter: "blur(10px)" }
          }
          animate={
            showAction
              ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
              : { opacity: 0, y: 18, scale: 0.94, filter: "blur(10px)" }
          }
          transition={{ duration: 0.72, ease: SOFT_EASE, delay: 0.12 }}
        >
          <button
            type="button"
            className="hero-action intro-gate-action"
            onClick={handleEnter}
            {...meltProps}
          >
            <MeltLayer />
            <span className="hero-action-label" data-label="open site">
              <span className="hero-action-default">open site</span>
            </span>
            <HeroActionMark kind="down" />
          </button>

          {showAction && !isLeaving && (
            <span className="intro-gate-action-pulse" aria-hidden="true" />
          )}
        </motion.div>
      </motion.div>

      {isLeaving && (
        <motion.div
          className="intro-gate-curtain"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.78, ease: CURTAIN_EASE, delay: 0.14 }}
          onAnimationComplete={onEnter}
        />
      )}
    </div>
  );
}
