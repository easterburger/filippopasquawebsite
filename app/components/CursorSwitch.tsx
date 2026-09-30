"use client";

import { CaretDown, Prohibit, SquaresFour, Waves, type Icon } from "@phosphor-icons/react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

import { CURSOR_MODES, setCursorMode, useCursorMode, type CursorMode } from "./cursor-mode";

import "./cursor-switch.css";

// A "Cursor" pill above the home headline. Its arrow stretches the pill into
// a bar of choices; picking one slides the ink over to it and the bar folds
// back into the pill. It only renders where there is a cursor to follow (see
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

const MORPH: Transition = { type: "spring", stiffness: 420, damping: 36, mass: 0.9 };
/** Long enough to see the ink land on the new choice before folding. */
const CLOSE_AFTER_PICK_MS = 380;

export default function CursorSwitch({ ready }: { ready: boolean }) {
  const mode = useCursorMode();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const radiosRef = useRef<Partial<Record<CursorMode, HTMLButtonElement | null>>>({});
  const closeTimerRef = useRef(0);
  const optionsId = useId();

  // Outside press, or Escape from inside, folds the bar back up.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      window.clearTimeout(closeTimerRef.current);
      setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || !rootRef.current?.contains(document.activeElement)) return;
      event.preventDefault();
      window.clearTimeout(closeTimerRef.current);
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  // Opened from the arrow button: carry focus into the choices.
  useEffect(() => {
    if (open && document.activeElement === toggleRef.current) {
      radiosRef.current[mode]?.focus();
    }
    // Only on opening; later changes of mode move focus themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = () => {
    window.clearTimeout(closeTimerRef.current);
    setOpen((isOpen) => !isOpen);
  };

  const pick = (next: CursorMode) => {
    setCursorMode(next);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      // Only pull focus back if it's still with us.
      const active = document.activeElement;
      if (rootRef.current?.contains(active) || active === document.body) {
        toggleRef.current?.focus();
      }
    }, CLOSE_AFTER_PICK_MS);
  };

  // Tabbing away folds it too.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!open || rootRef.current?.contains(event.relatedTarget as Node | null)) return;
    if (event.relatedTarget === null) return;
    window.clearTimeout(closeTimerRef.current);
    setOpen(false);
  };

  // Radio group keys: arrows move the choice along (wrapping) without folding
  // the bar, Home and End jump to the ends.
  const handleRadioKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = CURSOR_MODES.indexOf(mode);
    let target: number | null = null;
    if (event.key in NEXT_KEYS) {
      target = (index + NEXT_KEYS[event.key] + CURSOR_MODES.length) % CURSOR_MODES.length;
    } else if (event.key === "Home") {
      target = 0;
    } else if (event.key === "End") {
      target = CURSOR_MODES.length - 1;
    }
    if (target === null) return;
    event.preventDefault();
    window.clearTimeout(closeTimerRef.current);
    const next = CURSOR_MODES[target];
    setCursorMode(next);
    radiosRef.current[next]?.focus();
  };

  return (
    <motion.div
      ref={rootRef}
      className="cursor-switch"
      data-open={open}
      inert={!ready}
      onBlur={handleBlur}
      initial={{ opacity: 0, y: -12, filter: "blur(10px)" }}
      animate={
        ready
          ? { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }
          : { opacity: 0, y: -12, filter: "blur(10px)" }
      }
      transition={{ duration: 0.55, delay: ready ? 0.12 : 0, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        layout
        layoutDependency={open}
        className="cursor-pill"
        style={{ borderRadius: 999 }}
        transition={MORPH}
        // The whole pill answers the mouse; the arrow button is the one
        // keyboards and screen readers use.
        onClick={(event) => {
          if (!(event.target as Element).closest("button")) toggle();
        }}
      >
        <motion.span
          layout="position"
          layoutDependency={open}
          className="cursor-pill-label"
          transition={MORPH}
          aria-hidden="true"
        >
          Cursor
        </motion.span>

        <AnimatePresence initial={false} mode="popLayout">
          {open && (
            <motion.div
              key="options"
              id={optionsId}
              layout="position"
              className="cursor-pill-options"
              role="radiogroup"
              aria-label="Cursor effect"
              onKeyDown={handleRadioKeys}
              initial={{ opacity: 0, filter: "blur(6px)", x: -8 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              exit={{ opacity: 0, filter: "blur(6px)", x: -8, transition: { duration: 0.16 } }}
              transition={{ ...MORPH, opacity: { duration: 0.24, delay: 0.06 } }}
            >
              {CURSOR_MODES.map((option) => {
                const { label, icon: OptionIcon } = OPTIONS[option];
                const selected = option === mode;
                return (
                  <button
                    key={option}
                    ref={(node) => {
                      radiosRef.current[option] = node;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    className={`cursor-pill-option${selected ? " is-selected" : ""}`}
                    onClick={() => pick(option)}
                  >
                    {selected && (
                      <motion.span
                        layoutId="cursor-pill-thumb"
                        className="cursor-pill-thumb"
                        aria-hidden="true"
                        transition={{ type: "spring", stiffness: 520, damping: 40 }}
                      />
                    )}
                    <OptionIcon className="cursor-pill-icon" weight="bold" aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          ref={toggleRef}
          layout="position"
          layoutDependency={open}
          transition={MORPH}
          type="button"
          className="cursor-pill-toggle"
          aria-label={`Cursor effect: ${OPTIONS[mode].label}`}
          aria-expanded={open}
          aria-controls={open ? optionsId : undefined}
          onClick={toggle}
        >
          <CaretDown weight="bold" aria-hidden="true" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
