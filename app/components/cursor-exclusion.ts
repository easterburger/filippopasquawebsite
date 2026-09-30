// A rectangle the cursor trail must not paint over: the radio's YouTube
// player, which YouTube requires to stay uncovered while it plays. The radio
// publishes the player's box here and the pixel trail cuts a hole for it.

export type ExclusionRect = { left: number; top: number; width: number; height: number };

let current: ExclusionRect | null = null;
const listeners = new Set<(rect: ExclusionRect | null) => void>();

export function setCursorExclusion(rect: ExclusionRect | null) {
  current = rect;
  listeners.forEach((listener) => listener(rect));
}

export function subscribeCursorExclusion(listener: (rect: ExclusionRect | null) => void) {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}
