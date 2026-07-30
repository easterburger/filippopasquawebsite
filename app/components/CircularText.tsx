"use client";

import { useEffect } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import "./CircularText.css";

const getRotationTransition = (
  duration: number,
  from: number,
  loop = true,
) => ({
  from,
  to: from + 360,
  ease: "linear",
  duration,
  type: "tween" as const,
  repeat: loop ? Infinity : 0,
});

const getTransition = (duration: number, from: number) => ({
  rotate: getRotationTransition(duration, from),
  scale: {
    type: "spring" as const,
    damping: 20,
    stiffness: 300,
  },
});

type CircularTextProps = {
  text: string;
  spinDuration?: number;
  onHover?: "slowDown" | "speedUp" | "pause" | "goBonkers";
  className?: string;
};

export default function CircularText({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  className = "",
}: CircularTextProps) {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      controls.set({ rotate: 0, scale: 1 });
      return;
    }

    const start = rotation.get();
    void controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  }, [spinDuration, text, onHover, controls, rotation, reduceMotion]);

  const handleHoverStart = () => {
    if (!onHover || reduceMotion) return;
    const start = rotation.get();
    let transitionConfig = getTransition(spinDuration, start);
    let scale = 1;

    if (onHover === "slowDown")
      transitionConfig = getTransition(spinDuration * 2, start);
    if (onHover === "speedUp")
      transitionConfig = getTransition(spinDuration / 4, start);
    if (onHover === "pause") {
      transitionConfig = {
        rotate: { type: "spring", damping: 20, stiffness: 300 },
        scale: { type: "spring", damping: 20, stiffness: 300 },
      } as ReturnType<typeof getTransition>;
    }
    if (onHover === "goBonkers") {
      transitionConfig = getTransition(spinDuration / 20, start);
      scale = 0.82;
    }

    void controls.start({
      rotate: start + 360,
      scale,
      transition: transitionConfig,
    });
  };

  const handleHoverEnd = () => {
    if (reduceMotion) return;
    const start = rotation.get();
    void controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  };

  return (
    <motion.div
      className={`circular-text ${className}`}
      style={{ rotate: rotation }}
      initial={{ rotate: 0 }}
      animate={controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      aria-hidden="true"
    >
      {letters.map((letter, index) => {
        const rotationDegrees = (360 / letters.length) * index;
        const transform = `rotateZ(${rotationDegrees}deg)`;

        return (
          <span
            key={`${letter}-${index}`}
            style={{ transform, WebkitTransform: transform }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
}
