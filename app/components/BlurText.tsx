"use client";

import { motion, type Transition } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useSound } from "@/components/sound/SoundProvider";

type AnimationSnapshot = Record<string, number | string>;

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: AnimationSnapshot;
  animationTo?: AnimationSnapshot[];
  easing?: (value: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
  active?: boolean;
}

function buildKeyframes(
  from: AnimationSnapshot,
  steps: AnimationSnapshot[],
) {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((step) => Object.keys(step)),
  ]);
  const keyframes: Record<string, Array<number | string | undefined>> = {};

  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])];
  });

  return keyframes;
}

export default function BlurText({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (value) => value,
  onAnimationComplete,
  stepDuration = 0.35,
  active = true,
  tag = "p",
  id,
}: BlurTextProps & { tag?: "p" | "h1" | "h2" | "span"; id?: string }) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { sequence } = useSound();
  const revealing = inView && active;

  // One teletype tick per segment, scheduled on the audio clock so the chatter
  // lands with the stagger instead of chasing it from a timer.
  useEffect(() => {
    if (!revealing) return;
    sequence("teletype", elements.length, delay / 1000);
  }, [revealing, sequence, elements.length, delay]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !active) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, active]);

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction],
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction],
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from(
    { length: stepCount },
    (_, index) => (stepCount === 1 ? 0 : index / (stepCount - 1)),
  );
  const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
  const Tag = tag;

  return (
    <Tag ref={ref as never} id={id} className={className}>
      {elements.map((segment, index) => {
        const transition: Transition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            className="blur-text-segment"
            key={`${segment}-${index}`}
            initial={fromSnapshot}
            animate={revealing ? animateKeyframes : fromSnapshot}
            transition={transition}
            onAnimationComplete={
              index === elements.length - 1
                ? onAnimationComplete
                : undefined
            }
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" &&
              index < elements.length - 1 &&
              "\u00A0"}
          </motion.span>
        );
      })}
    </Tag>
  );
}
