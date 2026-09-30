"use client";

import { useSyncExternalStore } from "react";

// Which effect follows the cursor: the pixel trail (on every page), ripples in
// the home hero, or nothing. Picked from the switch above the home headline
// and remembered on this device. Like the sound preference, it lives outside
// React so every reader agrees without a provider.

export const CURSOR_MODES = ["pixel", "ripple", "off"] as const;
export type CursorMode = (typeof CURSOR_MODES)[number];

const STORAGE_KEY = "fp-cursor-trail";
const DEFAULT_MODE: CursorMode = "pixel";

/** Both effects follow a mouse, and both are motion. */
export const CURSOR_EFFECTS_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const listeners = new Set<() => void>();
let cachedMode: CursorMode | null = null;

const isCursorMode = (value: unknown): value is CursorMode =>
  CURSOR_MODES.includes(value as CursorMode);

function readStoredMode(): CursorMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isCursorMode(stored)) return stored;
  } catch {
    // Private browsing can refuse storage; fall through to the default.
  }
  return DEFAULT_MODE;
}

function getMode() {
  if (cachedMode === null) cachedMode = readStoredMode();
  return cachedMode;
}

const getServerMode = () => DEFAULT_MODE;

function notify() {
  listeners.forEach((listener) => listener());
}

// Keeps other open tabs in step.
function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  cachedMode = isCursorMode(event.newValue) ? event.newValue : DEFAULT_MODE;
  notify();
}

function subscribeToMode(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function setCursorMode(next: CursorMode) {
  if (getMode() === next) return;
  cachedMode = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The choice just won't survive a reload.
  }
  notify();
}

export function useCursorMode() {
  return useSyncExternalStore(subscribeToMode, getMode, getServerMode);
}

function subscribeToEffectsQuery(listener: () => void) {
  const media = window.matchMedia(CURSOR_EFFECTS_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

const getEffectsAvailable = () =>
  window.matchMedia(CURSOR_EFFECTS_QUERY).matches;
const getServerEffectsAvailable = () => false;

/** False on touch screens and for visitors who asked for reduced motion. */
export function useCursorEffectsAvailable() {
  return useSyncExternalStore(
    subscribeToEffectsQuery,
    getEffectsAvailable,
    getServerEffectsAvailable,
  );
}
