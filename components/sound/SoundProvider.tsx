"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getSoundEngine, peekSoundEngine, type VoiceName } from "./engine";

const STORAGE_KEY = "fp-sound-enabled";

/**
 * Anything that should click when pressed. Covering it here means individual
 * components don't have to know the sound layer exists; only elements wanting
 * a specific voice opt in with data-sound.
 */
const INTERACTIVE_SELECTOR =
  'a[href], button, [role="button"], input[type="submit"], input[type="button"], summary, [data-sound]';

const EXPLICIT_VOICES: Record<string, VoiceName> = {
  click: "click",
  "click-soft": "clickSoft",
  key: "key",
  "menu-open": "menuOpen",
  "menu-close": "menuClose",
  teletype: "teletype",
};

const HOVER_GAP_MS = 55;

/* ------------------------------------------------------------------------- */
/* Preference store                                                          */
/*                                                                           */
/* The visitor's choice lives outside React so it can be read during render   */
/* without a hydration mismatch, and so the always-stable play() helpers can  */
/* check it without re-subscribing.                                           */
/* ------------------------------------------------------------------------- */

const listeners = new Set<() => void>();
let cachedPreference: boolean | null = null;

function readStoredPreference() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "1";
  } catch {
    // Private browsing can refuse storage; fall through to the default.
  }

  // On by default, except for visitors asking for reduced motion: they've
  // signalled they want less sensory noise, so they opt in instead.
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getPreference() {
  if (cachedPreference === null) cachedPreference = readStoredPreference();
  return cachedPreference;
}

function getServerPreference() {
  return false;
}

function subscribeToPreference(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writePreference(next: boolean) {
  if (cachedPreference === next) return;
  cachedPreference = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // The choice just won't survive a reload.
  }
  listeners.forEach((listener) => listener());
}

/** Readable from anywhere, including render, without subscribing. */
export function isSoundEnabled() {
  return typeof window === "undefined" ? false : getPreference();
}

/**
 * Browsers refuse to start an AudioContext before the visitor interacts, and
 * creating one early just earns a console warning, so nothing is built until
 * the first gesture lands.
 */
let gestureSeen = false;

function activeEngine() {
  if (!gestureSeen || !isSoundEnabled()) return null;
  return getSoundEngine();
}

const emptySubscribe = () => () => {};
const clientTrue = () => true;
const serverFalse = () => false;

/* ------------------------------------------------------------------------- */

type SoundContextValue = {
  /** Whether the visitor wants sound. False until the client has hydrated. */
  enabled: boolean;
  /** True once hydrated, so sound UI can mount without a mismatch. */
  ready: boolean;
  setEnabled: (next: boolean) => void;
  toggle: () => void;
  play: (voice: VoiceName) => void;
  /** Evenly spaced run of one voice, for text revealing a segment at a time. */
  sequence: (voice: VoiceName, count: number, gapSeconds: number) => void;
  clatter: (durationSeconds: number, intensity?: number) => void;
  /**
   * Continuous granular hiss at the given intensity (0 to 1). Safe to call
   * every animation frame; the engine smooths it.
   */
  sand: (intensity: number) => void;
};

const noop = () => {};

const SoundContext = createContext<SoundContextValue>({
  enabled: false,
  ready: false,
  setEnabled: noop,
  toggle: noop,
  play: noop,
  sequence: noop,
  clatter: noop,
  sand: noop,
});

export function useSound() {
  return useContext(SoundContext);
}

/**
 * Plays a voice at most once every `minGapMs`. Animation-driven sounds (text
 * revealing, glyphs scrambling) fire far faster than anything should be heard,
 * so callers tick freely and this decides what actually sounds.
 */
export function useTickSound(voice: VoiceName, minGapMs = 90) {
  const { play } = useSound();
  const lastRef = useRef(0);

  return useCallback(() => {
    const now =
      typeof performance === "undefined" ? Date.now() : performance.now();
    if (now - lastRef.current < minGapMs) return;
    lastRef.current = now;
    play(voice);
  }, [play, voice, minGapMs]);
}

function resolveKeyVoice(event: KeyboardEvent): VoiceName | null {
  if (event.key === "Enter") return "keyReturn";
  if (event.key === "Backspace" || event.key === "Delete") return "keyBack";
  if (event.key === " ") return "keyWide";
  // Everything else that produces a character; arrows and modifiers stay silent.
  return event.key.length === 1 ? "key" : null;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA";
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(
    subscribeToPreference,
    getPreference,
    getServerPreference,
  );
  const ready = useSyncExternalStore(emptySubscribe, clientTrue, serverFalse);

  const play = useCallback((voice: VoiceName) => {
    activeEngine()?.play(voice);
  }, []);

  const sequence = useCallback(
    (voice: VoiceName, count: number, gapSeconds: number) => {
      activeEngine()?.sequence(voice, count, gapSeconds);
    },
    [],
  );

  const clatter = useCallback((durationSeconds: number, intensity?: number) => {
    activeEngine()?.clatter(durationSeconds, intensity);
  }, []);

  const sand = useCallback((intensity: number) => {
    activeEngine()?.setSand(intensity);
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    writePreference(next);
  }, []);

  const toggle = useCallback(() => {
    writePreference(!getPreference());
  }, []);

  // Keep the engine in step with the preference. Switching sound back on gets
  // an audible confirmation once the context is actually running.
  const firstSyncRef = useRef(true);
  useEffect(() => {
    const engine = gestureSeen ? getSoundEngine() : peekSoundEngine();
    if (!engine) return;

    const isFirstSync = firstSyncRef.current;
    firstSyncRef.current = false;

    engine.setEnabled(enabled);

    if (!enabled) {
      engine.suspend();
      return;
    }

    void engine.resume().then(() => {
      if (!isFirstSync && isSoundEnabled()) engine.play("click");
    });
  }, [enabled]);

  // The audio clock can't start until the visitor interacts with the page, so
  // the first gesture (usually the intro gate) is what actually opens it. This
  // watches regardless of the preference, so flipping sound on mid-visit has a
  // gesture on record and can start playing immediately.
  useEffect(() => {
    const onGesture = () => {
      gestureSeen = true;
      const engine = activeEngine();
      if (engine) void engine.resume();
    };

    const options = { capture: true, passive: true } as const;
    window.addEventListener("pointerdown", onGesture, options);
    window.addEventListener("keydown", onGesture, options);
    return () => {
      window.removeEventListener("pointerdown", onGesture, options);
      window.removeEventListener("keydown", onGesture, options);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      const engine = getSoundEngine();
      if (!engine) return;
      if (document.visibilityState === "visible") void engine.resume();
      else engine.suspend();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled]);

  // One set of capture-phase listeners covers every button, link and field on
  // the site. Capture matters: some controls stop propagation of pointerdown.
  useEffect(() => {
    if (!enabled) return;

    let lastHovered: Element | null = null;
    let lastHoverAt = 0;

    const findTarget = (event: Event) => {
      const node = event.target;
      if (!(node instanceof Element)) return null;
      return node.closest(INTERACTIVE_SELECTOR);
    };

    const onPointerDown = (event: PointerEvent) => {
      const element = findTarget(event);
      if (!element) return;

      const explicit = element.getAttribute("data-sound");
      if (explicit === "none") return;

      if (explicit && EXPLICIT_VOICES[explicit]) {
        play(EXPLICIT_VOICES[explicit]);
        return;
      }

      play(element.matches("a[href]") ? "clickSoft" : "click");
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      const element = findTarget(event);
      if (!element || element === lastHovered) return;
      lastHovered = element;

      if (element.getAttribute("data-sound") === "none") return;

      const now = performance.now();
      if (now - lastHoverAt < HOVER_GAP_MS) return;
      lastHoverAt = now;

      play("hover");
    };

    const onPointerOut = (event: PointerEvent) => {
      if (findTarget(event) === lastHovered) lastHovered = null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (!isTypingTarget(event.target)) return;

      const voice = resolveKeyVoice(event);
      if (voice) play(voice);
    };

    const options = { capture: true, passive: true } as const;
    window.addEventListener("pointerdown", onPointerDown, options);
    window.addEventListener("pointerover", onPointerOver, options);
    window.addEventListener("pointerout", onPointerOut, options);
    window.addEventListener("keydown", onKeyDown, options);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, options);
      window.removeEventListener("pointerover", onPointerOver, options);
      window.removeEventListener("pointerout", onPointerOut, options);
      window.removeEventListener("keydown", onKeyDown, options);
    };
  }, [enabled, play]);

  const value = useMemo<SoundContextValue>(
    () => ({ enabled, ready, setEnabled, toggle, play, sequence, clatter, sand }),
    [enabled, ready, setEnabled, toggle, play, sequence, clatter, sand],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}
