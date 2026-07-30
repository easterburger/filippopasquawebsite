"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";

const styles = {
  wrapper: {
    display: "inline-block",
    whiteSpace: "pre-wrap",
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    border: 0,
  },
} as const;

type DecryptedTextProps = {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: "view" | "hover" | "inViewHover" | "click";
  clickMode?: "once" | "toggle";
};

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  clickMode = "once",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(animateOn !== "click");
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");

  const containerRef = useRef<HTMLSpanElement | null>(null);
  const orderRef = useRef<number[]>([]);
  const pointerRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo(
    () =>
      useOriginalCharsOnly
        ? Array.from(new Set(text.split(""))).filter((character) => character !== " ")
        : characters.split(""),
    [useOriginalCharsOnly, text, characters],
  );

  const shuffleText = useCallback(
    (originalText: string, currentRevealed: Set<number>) =>
      originalText
        .split("")
        .map((character, index) => {
          if (character === " ") return " ";
          if (currentRevealed.has(index)) return originalText[index];
          return (
            availableChars[Math.floor(Math.random() * availableChars.length)] ??
            character
          );
        })
        .join(""),
    [availableChars],
  );

  const computeOrder = useCallback(
    (length: number) => {
      if (revealDirection === "start") {
        return Array.from({ length }, (_, index) => index);
      }

      if (revealDirection === "end") {
        return Array.from({ length }, (_, index) => length - 1 - index);
      }

      const order: number[] = [];
      const middle = Math.floor(length / 2);
      let offset = 0;

      while (order.length < length) {
        const index =
          offset % 2 === 0
            ? middle + offset / 2
            : middle - Math.ceil(offset / 2);
        if (index >= 0 && index < length) order.push(index);
        offset += 1;
      }

      return order;
    },
    [revealDirection],
  );

  const fillAllIndices = useCallback(
    () => new Set(Array.from({ length: text.length }, (_, index) => index)),
    [text.length],
  );

  const removeRandomIndices = useCallback(
    (set: Set<number>, count: number) => {
      const values = Array.from(set);
      for (let index = 0; index < count && values.length > 0; index += 1) {
        values.splice(Math.floor(Math.random() * values.length), 1);
      }
      return new Set(values);
    },
    [],
  );

  const encryptInstantly = useCallback(() => {
    const emptySet = new Set<number>();
    setRevealedIndices(emptySet);
    setDisplayText(shuffleText(text, emptySet));
    setIsDecrypted(false);
  }, [text, shuffleText]);

  const triggerDecrypt = useCallback(() => {
    if (sequential) {
      orderRef.current = computeOrder(text.length);
      pointerRef.current = 0;
    }
    setRevealedIndices(new Set());
    setDirection("forward");
    setIsAnimating(true);
  }, [sequential, computeOrder, text.length]);

  const triggerReverse = useCallback(() => {
    const allIndices = fillAllIndices();
    if (sequential) {
      orderRef.current = computeOrder(text.length).slice().reverse();
      pointerRef.current = 0;
    }
    setRevealedIndices(allIndices);
    setDisplayText(shuffleText(text, allIndices));
    setDirection("reverse");
    setIsAnimating(true);
  }, [sequential, computeOrder, fillAllIndices, shuffleText, text]);

  useEffect(() => {
    if (!isAnimating) return;
    let currentIteration = 0;

    intervalRef.current = setInterval(() => {
      setRevealedIndices((previousRevealed) => {
        if (sequential && direction === "forward") {
          if (previousRevealed.size < text.length) {
            const nextIndex = computeOrder(text.length).find(
              (index) => !previousRevealed.has(index),
            );
            const nextRevealed = new Set(previousRevealed);
            if (nextIndex !== undefined) nextRevealed.add(nextIndex);
            setDisplayText(shuffleText(text, nextRevealed));
            return nextRevealed;
          }
        }

        if (sequential && direction === "reverse") {
          if (pointerRef.current < orderRef.current.length) {
            const nextRevealed = new Set(previousRevealed);
            nextRevealed.delete(orderRef.current[pointerRef.current]);
            pointerRef.current += 1;
            setDisplayText(shuffleText(text, nextRevealed));
            if (nextRevealed.size === 0) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setIsAnimating(false);
              setIsDecrypted(false);
            }
            return nextRevealed;
          }
        }

        if (!sequential && direction === "forward") {
          setDisplayText(shuffleText(text, previousRevealed));
          currentIteration += 1;
          if (currentIteration >= maxIterations) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsAnimating(false);
            setDisplayText(text);
            setIsDecrypted(true);
          }
          return previousRevealed;
        }

        if (!sequential && direction === "reverse") {
          const currentSet =
            previousRevealed.size === 0 ? fillAllIndices() : previousRevealed;
          const removeCount = Math.max(
            1,
            Math.ceil(text.length / Math.max(1, maxIterations)),
          );
          const nextSet = removeRandomIndices(currentSet, removeCount);
          setDisplayText(shuffleText(text, nextSet));
          currentIteration += 1;

          if (nextSet.size === 0 || currentIteration >= maxIterations) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsAnimating(false);
            setIsDecrypted(false);
            setDisplayText(shuffleText(text, new Set()));
            return new Set();
          }
          return nextSet;
        }

        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsAnimating(false);
        setIsDecrypted(direction === "forward");
        return previousRevealed;
      });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    isAnimating,
    text,
    speed,
    maxIterations,
    sequential,
    shuffleText,
    direction,
    fillAllIndices,
    removeRandomIndices,
    computeOrder,
  ]);

  const handleClick = () => {
    if (animateOn !== "click") return;

    if (clickMode === "once" && !isDecrypted) triggerDecrypt();
    if (clickMode === "toggle") {
      if (isDecrypted) triggerReverse();
      else triggerDecrypt();
    }
  };

  const triggerHoverDecrypt = useCallback(() => {
    if (isAnimating) return;
    setRevealedIndices(new Set());
    setIsDecrypted(false);
    setDisplayText(text);
    setDirection("forward");
    setIsAnimating(true);
  }, [isAnimating, text]);

  const resetToPlainText = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsAnimating(false);
    setRevealedIndices(new Set());
    setDisplayText(text);
    setIsDecrypted(true);
    setDirection("forward");
  }, [text]);

  useEffect(() => {
    if (animateOn !== "view" && animateOn !== "inViewHover") return;
    const currentElement = containerRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            triggerDecrypt();
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(currentElement);
    return () => observer.disconnect();
  }, [animateOn, hasAnimated, triggerDecrypt]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (animateOn === "click") encryptInstantly();
      else {
        setDisplayText(text);
        setIsDecrypted(true);
      }
      setRevealedIndices(new Set());
      setDirection("forward");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [animateOn, text, encryptInstantly]);

  const animateProps =
    animateOn === "hover" || animateOn === "inViewHover"
      ? {
          onMouseEnter: triggerHoverDecrypt,
          onMouseLeave: resetToPlainText,
        }
      : animateOn === "click"
        ? { onClick: handleClick }
        : {};

  return (
    <motion.span
      className={parentClassName}
      ref={containerRef}
      style={styles.wrapper}
      {...animateProps}
    >
      <span style={styles.srOnly}>{text}</span>
      <span aria-hidden="true">
        {displayText.split("").map((character, index) => {
          const isRevealedOrDone =
            revealedIndices.has(index) || (!isAnimating && isDecrypted);

          return (
            <span
              key={`${index}-${character}`}
              className={isRevealedOrDone ? className : encryptedClassName}
            >
              {character}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
