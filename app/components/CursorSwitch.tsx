"use client";

import { Prohibit, SquaresFour, Waves, type Icon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useRef, type KeyboardEvent } from "react";

import { CURSOR_MODES, setCursorMode, useCursorMode, type CursorMode } from "./cursor-mode";

import "./cursor-switch.css";

// A small segmented control above the home headline for picking what follows
// the cursor. It only renders where there is a cursor to follow (see
// useCursorEffectsAvailable at the call site).

const OPTIONS: Record<CursorMode, { label: string; icon: Icon }> = {
  pixel: { label: "Pixel", icon: SquaresFour },
  ripple: { label: "Ripple", icon: Waves },
  off: { label: "Off", icon: Prohibit },
};

const NEXT_KEYS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

export default function CursorSwitch({ ready }: { ready: boolean }) {
  const mode = useCursorMode();
  const buttonsRef = useRef<Partial<Record<CursorMode, HTMLButtonElement | null>>>({});

  const choose = (next: CursorMode) => {
    setCursorMode(next);
    buttonsRef.current[next]?.focus();
  };

  // Radio group keys: arrows move the choice along (wrapping), Home and End
  // jump to the ends.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = CURSOR_MODES.indexOf(mode);
    const last = CURSOR_MODES.length - 1;
    let target: number | null = null;

    if (event.key in NEXT_KEYS) {
      target = (index + NEXT_KEYS[event.key] + CURSOR_MODES.length) % CURSOR_MODES.length;
    } else if (event.key === "Home") {
      target = 0;
    } else if (event.key === "End") {
      target = last;
    }
    if (target === null) return;

    event.preventDefault();
    choose(CURSOR_MODES[target]);
  };

  return (
    <motion.div
      className="cursor-switch"
      role="radiogroup"
      aria-label="Cursor effect"
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, y: -12, filter: "blur(10px)" }}
      animate={
        ready
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: -12, filter: "blur(10px)" }
      }
      transition={{ duration: 0.55, delay: ready ? 0.12 : 0, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="cursor-switch-label" aria-hidden="true">
        Cursor
      </span>
      {CURSOR_MODES.map((option) => {
        const { label, icon: OptionIcon } = OPTIONS[option];
        const selected = option === mode;
        return (
          <button
            key={option}
            ref={(node) => {
              buttonsRef.current[option] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={`cursor-switch-option${selected ? " is-selected" : ""}`}
            onClick={() => choose(option)}
          >
            {selected && (
              <motion.span
                layoutId="cursor-switch-thumb"
                className="cursor-switch-thumb"
                aria-hidden="true"
                transition={{ type: "spring", stiffness: 520, damping: 40 }}
              />
            )}
            <OptionIcon className="cursor-switch-icon" weight="bold" aria-hidden="true" />
            <span className="cursor-switch-text">{label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}
