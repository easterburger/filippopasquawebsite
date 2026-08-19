"use client";

import { useEffect, useState } from "react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

import { isSoundEnabled, useSound } from "./SoundProvider";

const HINT_KEY = "fp-sound-hint-seen";
const HINT_DURATION_MS = 4600;

/**
 * Sound starts on, so a first-time visitor gets the label spelled out for a
 * moment: nobody should have to hunt for the mute control.
 */
function shouldHintOnFirstVisit() {
  if (typeof window === "undefined" || !isSoundEnabled()) return false;
  try {
    return window.sessionStorage.getItem(HINT_KEY) !== "1";
  } catch {
    return false;
  }
}

export default function SoundToggle() {
  const { enabled, ready, toggle } = useSound();
  const [hinting, setHinting] = useState(shouldHintOnFirstVisit);

  useEffect(() => {
    if (!hinting) return;

    try {
      window.sessionStorage.setItem(HINT_KEY, "1");
    } catch {
      // The hint simply shows again next visit.
    }

    const timeout = window.setTimeout(() => setHinting(false), HINT_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [hinting]);

  if (!ready) return null;

  const handleClick = () => {
    setHinting(false);
    toggle();
  };

  return (
    <button
      type="button"
      className={`sound-toggle${hinting ? " is-hinting" : ""}`}
      onClick={handleClick}
      aria-pressed={enabled}
      aria-label={
        enabled ? "Turn interface sound off" : "Turn interface sound on"
      }
      title={enabled ? "Sound on" : "Sound off"}
      data-sound="none"
    >
      <span className="sound-toggle-icon" aria-hidden="true">
        {enabled ? (
          <SpeakerHigh weight="bold" size={18} />
        ) : (
          <SpeakerSlash weight="bold" size={18} />
        )}
      </span>
      <span className="sound-toggle-label">
        {enabled ? "sound on" : "sound off"}
      </span>
    </button>
  );
}
