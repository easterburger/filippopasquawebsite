"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  isMusicPlaying,
  startMusic,
  stopMusic,
  subscribeMusic,
  switchMusic,
  type MusicTrackId,
} from "./record-music";

const PREFERENCE_KEY = "fp-record-music";

function readPreference() {
  try {
    return window.localStorage.getItem(PREFERENCE_KEY) === "on";
  } catch {
    return false;
  }
}

function writePreference(on: boolean) {
  try {
    window.localStorage.setItem(PREFERENCE_KEY, on ? "on" : "off");
  } catch {
    // Private mode or blocked storage: the switch still works for this visit.
  }
}

/**
 * Music for the record player. Plays the open record's loop while switched on,
 * follows the record as it changes, and fades out when the player closes.
 * Once a visitor turns music on it stays on for the next record they open.
 * Auto-start only happens when the record was opened by a click: browsers
 * need that gesture for audio, and a deep link doesn't provide one.
 */
export function useRecordMusic(id: MusicTrackId, gesture: boolean) {
  const playing = useSyncExternalStore(subscribeMusic, isMusicPlaying, () => false);

  useEffect(() => {
    if (gesture && readPreference()) startMusic(id);
    return () => stopMusic();
    // Only the first record decides whether to start; changes switch below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    switchMusic(id);
  }, [id]);

  const toggle = useCallback(() => {
    if (isMusicPlaying()) {
      stopMusic();
      writePreference(false);
    } else {
      startMusic(id);
      writePreference(true);
    }
  }, [id]);

  return { playing, toggle };
}
