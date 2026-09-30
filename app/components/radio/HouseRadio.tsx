"use client";

import {
  ArrowUpRight,
  ArrowsOutSimple,
  CaretDown,
  Pause,
  Play,
  Power,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerSlash,
  Stop,
} from "@phosphor-icons/react";
import { motion, type Transition } from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { setCursorExclusion } from "../cursor-exclusion";
import { BEFORE_NAVIGATE_EVENT } from "../PageTransition";
import { DEFAULT_STATION, DIAL_MAX, DIAL_MIN, STATIONS } from "./stations";
import { playStatic, primeStatic } from "./static";
import {
  canSetVolume,
  loadYouTubeApi,
  PLAYER_STATE,
  YOUTUBE_TIMEOUT_MS,
  type YouTubePlayer,
} from "./youtube";

import "./house-radio.css";

// FP FM: a little black radio at the foot of the home page that behaves like
// a Dynamic Island. It sits there as a radio; tapped, it springs open into the
// full hi-fi; folded while music plays, it shrinks to a live player that keeps
// going until it's stopped.
//
// The music is YouTube's own player, and YouTube's rules shape the design: the
// video must stay on screen, uncovered and at least 200px, whenever it plays,
// and it may only start once it's visible. So even the folded "live" radio
// keeps the video showing, only a stopped radio goes back to its small shape,
// and playback pauses whenever the video can't be seen (a hidden tab, leaving
// the page).

type View = "idle" | "live" | "open";
type Status = "off" | "tuning" | "playing" | "paused" | "blocked" | "unavailable";
type Box = { w: number; h: number };
type Metrics = {
  idle: Box;
  live: Box;
  open: Box;
  /** Where the video sits in each view, from the island's bottom centre. */
  liveScreen: { x: number; y: number };
  openScreen: { x: number; y: number };
};

const VOLUME_KEY = "fp-radio-volume";
const DEFAULT_VOLUME = 70;
/** About how long the island takes to spring open. */
const MORPH_MS = 560;
/** Arrow keys and the dial can race through stations; only the one you stop on loads. */
const TUNE_SETTLE_MS = 280;
const FADE_OUT_MS = 200;

const ISLAND_SPRING: Transition = { type: "spring", bounce: 0.24, visualDuration: 0.5 };
const RADIUS: Record<View, number> = { idle: 30, live: 36, open: 32 };

const STATUS_TEXT: Record<Status, string> = {
  off: "Off air",
  tuning: "Tuning",
  playing: "On air",
  paused: "Paused",
  blocked: "Press play",
  unavailable: "No signal",
};

const dialPosition = (frequency: number) =>
  ((frequency - DIAL_MIN) / (DIAL_MAX - DIAL_MIN)) * 100;

const DIAL_TICKS = Array.from(
  { length: Math.round((DIAL_MAX - DIAL_MIN) * 2) + 1 },
  (_, i) => DIAL_MIN + i / 2,
);

function nearestStation(frequency: number) {
  let best = 0;
  STATIONS.forEach((station, i) => {
    if (Math.abs(station.frequency - frequency) < Math.abs(STATIONS[best].frequency - frequency)) {
      best = i;
    }
  });
  return best;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function readStoredVolume() {
  try {
    const stored = window.localStorage.getItem(VOLUME_KEY);
    const value = Number(stored);
    if (stored !== null && value >= 0 && value <= 100) return value;
  } catch {
    // Storage can be off; use the default.
  }
  return DEFAULT_VOLUME;
}

function offsetWithin(element: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

export default function HouseRadio({ ready }: { ready: boolean }) {
  const [view, setView] = useState<View>("idle");
  const [index, setIndex] = useState(DEFAULT_STATION);
  const [status, setStatus] = useState<Status>("off");
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [volumeFixed, setVolumeFixed] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [dragFrequency, setDragFrequency] = useState<number | null>(null);
  const [broken, setBroken] = useState<ReadonlySet<number>>(new Set());
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLElement>(null);
  const liveSlotRef = useRef<HTMLDivElement>(null);
  const openSlotRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLButtonElement>(null);
  const livePlayRef = useRef<HTMLButtonElement>(null);
  const openPlayRef = useRef<HTMLButtonElement>(null);
  const stationRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerReadyRef = useRef(false);
  const creatingRef = useRef(false);
  const viewRef = useRef<View>("idle");
  const indexRef = useRef(DEFAULT_STATION);
  /** The station whose video the player actually holds. */
  const loadedIndexRef = useRef(DEFAULT_STATION);
  const announcedIndexRef = useRef(-1);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const unmutedVolumeRef = useRef(DEFAULT_VOLUME);
  const volumeFixedRef = useRef(false);
  /** Whether the listener wants sound (as opposed to what the player is doing). */
  const wantPlayRef = useRef(false);
  /** Whether the video is out and on screen, so YouTube lets it play. */
  const visibleRef = useRef(false);
  const closingRef = useRef(false);
  const hiddenPauseRef = useRef(false);
  const focusAfterRef = useRef<"face" | "live" | "open" | null>(null);
  const failuresRef = useRef(0);
  const timersRef = useRef({ start: 0, tune: 0, fade: 0, watchdog: 0 });
  const dragStationRef = useRef<number | null>(null);

  const station = STATIONS[index];
  const shownFrequency = dragFrequency ?? station.frequency;
  // While the needle is dragged, the display previews where it'll land.
  const shownStation = dragFrequency === null ? station : STATIONS[nearestStation(dragFrequency)];
  const isPlaying = status === "playing";
  const showsPause = status === "playing" || status === "tuning";
  const progress = time.duration > 0 ? Math.min(1, time.current / time.duration) : 0;
  const screenPos =
    metrics && view === "open" ? metrics.openScreen : metrics?.liveScreen ?? { x: 0, y: 0 };

  /* Measuring ---------------------------------------------------------------
     All three faces are laid out all the time (only one is visible), so the
     island always knows the size to spring to and where the video goes. */

  useLayoutEffect(() => {
    const idle = idleRef.current;
    const live = liveRef.current;
    const open = openRef.current;
    const liveSlot = liveSlotRef.current;
    const openSlot = openSlotRef.current;
    if (!idle || !live || !open || !liveSlot || !openSlot) return;

    const box = (element: HTMLElement): Box => ({ w: element.offsetWidth, h: element.offsetHeight });
    const screenIn = (layer: HTMLElement, slot: HTMLElement) => {
      const { x, y } = offsetWithin(slot, layer);
      return {
        x: x + slot.offsetWidth / 2 - layer.offsetWidth / 2,
        y: y + slot.offsetHeight - layer.offsetHeight,
      };
    };
    const measure = () =>
      setMetrics({
        idle: box(idle),
        live: box(live),
        open: box(open),
        liveScreen: screenIn(live, liveSlot),
        openScreen: screenIn(open, openSlot),
      });

    const observer = new ResizeObserver(measure);
    [idle, live, open].forEach((layer) => observer.observe(layer));
    return () => observer.disconnect();
  }, []);

  /* Lifecycle ---------------------------------------------------------------- */


  // Tear the player down with the page.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach((timer) => {
        window.clearTimeout(timer);
        window.clearInterval(timer);
      });
      playerRef.current?.destroy();
      playerRef.current = null;
      setCursorExclusion(null);
    };
  }, []);

  // Elapsed time, only while there's something to count.
  useEffect(() => {
    if (view === "idle" || !isPlaying) return;
    const tick = () => {
      const player = playerRef.current;
      if (!player) return;
      setTime({ current: player.getCurrentTime(), duration: player.getDuration() });
    };
    tick();
    const interval = window.setInterval(tick, 500);
    return () => window.clearInterval(interval);
  }, [view, isPlaying]);

  // Focus follows the island: into the face that just appeared, if focus was
  // in the one that went away. (It can only land once that face's inert is
  // lifted, hence after the render.)
  useEffect(() => {
    const target = focusAfterRef.current;
    focusAfterRef.current = null;
    if (!target) return;
    const element =
      target === "face" ? faceRef.current : target === "live" ? livePlayRef.current : openPlayRef.current;
    element?.focus({ preventScroll: true });
  }, [view]);

  // Keep the pixel trail off the video while it's out.
  useEffect(() => {
    if (view === "idle") {
      const timeout = window.setTimeout(() => setCursorExclusion(null), 300);
      return () => window.clearTimeout(timeout);
    }
    let raf = 0;
    const started = performance.now();
    const publish = () => {
      const frame = frameRef.current;
      if (frame) {
        const rect = frame.getBoundingClientRect();
        setCursorExclusion({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
      }
    };
    // Follow the spring, then settle.
    const follow = (now: number) => {
      publish();
      if (now - started < 1100) raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    window.addEventListener("resize", publish);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", publish);
    };
  }, [view, metrics]);

  // Open: Escape or a press outside folds it down to the live player.
  useEffect(() => {
    if (view !== "open") return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || !rootRef.current?.contains(document.activeElement)) return;
      event.preventDefault();
      collapse();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) collapse();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
    // collapse() works through refs and state setters, so any render's copy will do.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // YouTube's player may only play where it can be seen: pause with a hidden
  // tab and pick up again on return; stop before a page transition covers it.
  useEffect(() => {
    const onVisibility = () => {
      const player = playerRef.current;
      if (!player || !playerReadyRef.current) return;
      if (document.hidden) {
        if (player.getPlayerState() === PLAYER_STATE.PLAYING) {
          hiddenPauseRef.current = true;
          player.pauseVideo();
        }
      } else if (hiddenPauseRef.current) {
        hiddenPauseRef.current = false;
        if (wantPlayRef.current && viewRef.current !== "idle") playSelected();
      }
    };
    const onLeave = () => {
      wantPlayRef.current = false;
      visibleRef.current = false;
      clearTimers();
      playerRef.current?.pauseVideo();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(BEFORE_NAVIGATE_EVENT, onLeave);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(BEFORE_NAVIGATE_EVENT, onLeave);
    };
    // playSelected() works through refs, so the first render's copy will do.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Player -------------------------------------------------------------------- */

  /** Change face; the ref updates at once so player events see it straight away. */
  function go(next: View) {
    viewRef.current = next;
    setView(next);
  }

  function clearTimers() {
    const timers = timersRef.current;
    window.clearTimeout(timers.start);
    window.clearTimeout(timers.tune);
    window.clearInterval(timers.fade);
    timers.fade = 0;
  }

  /** At least half the video on screen, in a visible tab. */
  function screenIsSeen() {
    const frame = frameRef.current;
    if (!frame || document.hidden) return false;
    const rect = frame.getBoundingClientRect();
    const seenW = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
    const seenH = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    return seenW > 0 && seenH > 0 && seenW * seenH >= (rect.width * rect.height) / 2;
  }

  function canPlayNow() {
    return playerReadyRef.current && visibleRef.current && wantPlayRef.current && screenIsSeen();
  }

  function applyPlayerVolume(player: YouTubePlayer) {
    if (volumeRef.current === 0) {
      player.mute();
    } else {
      player.unMute();
      player.setVolume(volumeRef.current);
    }
  }

  /** Play the selected station, loading it first if the player holds another. */
  function playSelected() {
    const player = playerRef.current;
    if (!player || !canPlayNow()) return;
    applyPlayerVolume(player);
    if (loadedIndexRef.current !== indexRef.current) {
      loadedIndexRef.current = indexRef.current;
      player.loadVideoById(STATIONS[indexRef.current].videoId);
    } else {
      player.playVideo();
    }
  }

  function announce(text: string) {
    setAnnouncement(text);
  }

  function markBroken(failed: number) {
    setBroken((previous) => new Set(previous).add(failed));
    failuresRef.current += 1;
    if (failuresRef.current >= STATIONS.length) {
      setStatus("unavailable");
      announce("The radio couldn't play anything from YouTube.");
      return;
    }
    // Only skip ahead if the failed record is still the one wanted.
    if (failed === indexRef.current) tune(failed + 1, { quiet: true, settle: 0 });
  }

  function giveUp() {
    window.clearTimeout(timersRef.current.watchdog);
    playerRef.current?.destroy();
    playerRef.current = null;
    playerReadyRef.current = false;
    creatingRef.current = false;
    setStatus("unavailable");
    announce("The radio couldn't reach YouTube.");
  }

  function ensurePlayer() {
    if (playerRef.current || creatingRef.current) return;
    creatingRef.current = true;
    window.clearTimeout(timersRef.current.watchdog);
    timersRef.current.watchdog = window.setTimeout(() => {
      if (!playerReadyRef.current) giveUp();
    }, YOUTUBE_TIMEOUT_MS + 4000);

    loadYouTubeApi()
      .then((YT) => {
        const screen = screenRef.current;
        if (!screen) {
          creatingRef.current = false;
          return;
        }
        // The API swaps this node for its iframe; keeping it out of React's
        // tree means React never trips over the swap.
        const mount = document.createElement("div");
        screen.replaceChildren(mount);
        loadedIndexRef.current = indexRef.current;
        playerRef.current = new YT.Player(mount, {
          width: "100%",
          height: "100%",
          videoId: STATIONS[indexRef.current].videoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            playsinline: 1,
            controls: 0,
            rel: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              window.clearTimeout(timersRef.current.watchdog);
              playerReadyRef.current = true;
              creatingRef.current = false;
              target.getIframe().title = "FP FM: the record playing now";
              playSelected();
            },
            onStateChange: ({ target, data }) => {
              if (data === PLAYER_STATE.PLAYING) {
                // Never play where it can't be seen (YouTube's rule).
                if (!visibleRef.current || document.hidden) {
                  target.pauseVideo();
                  return;
                }
                failuresRef.current = 0;
                wantPlayRef.current = true;
                setStatus("playing");
                if (announcedIndexRef.current !== loadedIndexRef.current) {
                  announcedIndexRef.current = loadedIndexRef.current;
                  const now = STATIONS[loadedIndexRef.current];
                  announce(`Now playing: ${now.title} by ${now.artist}, ${now.year}.`);
                }
              } else if (data === PLAYER_STATE.BUFFERING) {
                if (wantPlayRef.current) setStatus("tuning");
              } else if (data === PLAYER_STATE.PAUSED) {
                if (!hiddenPauseRef.current) {
                  setStatus(viewRef.current === "idle" ? "off" : "paused");
                }
              } else if (data === PLAYER_STATE.ENDED) {
                // On to the next record, like the station would.
                if (!closingRef.current) tune(indexRef.current + 1, { quiet: true, settle: 0 });
              }
            },
            onError: () => markBroken(loadedIndexRef.current),
            onAutoplayBlocked: () => {
              setStatus("blocked");
              announce("Press play to start the radio.");
            },
          },
        });
      })
      .catch(() => giveUp());
  }

  /* Controls ------------------------------------------------------------------ */

  const turnOn = () => {
    primeStatic();
    const stored = readStoredVolume();
    const fixed = !canSetVolume();
    volumeFixedRef.current = fixed;
    setVolumeFixed(fixed);
    // Where volume can't be set (iOS), only muting counts.
    const initial = fixed ? (stored === 0 ? 0 : 100) : stored;
    volumeRef.current = initial;
    if (initial > 0) unmutedVolumeRef.current = initial;
    setVolumeState(initial);

    if (status === "unavailable") failuresRef.current = 0;
    closingRef.current = false;
    wantPlayRef.current = true;
    if (document.activeElement === faceRef.current) focusAfterRef.current = "open";
    go("open");
    setStatus("tuning");
    ensurePlayer();

    // Start once the video is out, per YouTube's rules.
    window.clearTimeout(timersRef.current.start);
    timersRef.current.start = window.setTimeout(() => {
      visibleRef.current = true;
      playSelected();
    }, MORPH_MS);

    // Bring the current station into view in the list (not the page).
    const list = listRef.current;
    const row = stationRefs.current[indexRef.current];
    if (list && row) list.scrollTop = row.offsetTop - (list.clientHeight - row.offsetHeight) / 2;
  };

  const expand = () => {
    if (rootRef.current?.contains(document.activeElement)) focusAfterRef.current = "open";
    go("open");
  };

  /** Fold the open radio down to the live player; the music keeps going. */
  function collapse() {
    if (viewRef.current !== "open") return;
    if (!playerRef.current) {
      stop();
      return;
    }
    if (rootRef.current?.contains(document.activeElement)) focusAfterRef.current = "live";
    setDragFrequency(null);
    go("live");
  }

  /** Off: fade the record out, pause, and go back to being a small radio. */
  function stop() {
    if (closingRef.current) return;
    closingRef.current = true;
    wantPlayRef.current = false;
    clearTimers();
    const player = playerRef.current;

    const finish = () => {
      closingRef.current = false;
      visibleRef.current = false;
      hiddenPauseRef.current = false;
      if (rootRef.current?.contains(document.activeElement)) focusAfterRef.current = "face";
      go("idle");
      setDragFrequency(null);
      setStatus((current) => (current === "unavailable" ? current : "off"));
    };

    if (
      !player ||
      !playerReadyRef.current ||
      player.getPlayerState() !== PLAYER_STATE.PLAYING ||
      volumeFixedRef.current
    ) {
      if (player && playerReadyRef.current) player.pauseVideo();
      finish();
      return;
    }

    // Fade rather than cut, then fold.
    const from = volumeRef.current;
    const steps = 6;
    let step = 0;
    timersRef.current.fade = window.setInterval(() => {
      step += 1;
      player.setVolume(Math.round(from * (1 - step / steps)));
      if (step >= steps) {
        window.clearInterval(timersRef.current.fade);
        timersRef.current.fade = 0;
        player.pauseVideo();
        player.setVolume(volumeRef.current);
        finish();
      }
    }, FADE_OUT_MS / steps);
  }

  function tune(target: number, { quiet = false, settle = TUNE_SETTLE_MS } = {}) {
    const next = (target + STATIONS.length) % STATIONS.length;
    if (!quiet) playStatic(volumeRef.current);
    indexRef.current = next;
    setIndex(next);
    setTime({ current: 0, duration: 0 });
    wantPlayRef.current = true;
    setStatus((current) => (current === "unavailable" ? current : "tuning"));

    window.clearTimeout(timersRef.current.tune);
    timersRef.current.tune = window.setTimeout(() => {
      const player = playerRef.current;
      if (!player || !playerReadyRef.current || indexRef.current !== next) return;
      if (canPlayNow()) {
        playSelected();
      } else {
        // Can't play yet (still opening, tab hidden): have it ready.
        loadedIndexRef.current = next;
        player.cueVideoById(STATIONS[next].videoId);
      }
    }, settle);
  }

  const togglePlay = () => {
    const pausing = status === "playing" || status === "tuning";
    wantPlayRef.current = !pausing;
    setStatus(pausing ? "paused" : "tuning");
    const player = playerRef.current;
    if (!player || !playerReadyRef.current) return;
    if (pausing) player.pauseVideo();
    else playSelected();
  };

  const applyVolume = (next: number) => {
    volumeRef.current = next;
    if (next > 0) unmutedVolumeRef.current = next;
    setVolumeState(next);
    const player = playerRef.current;
    if (player && playerReadyRef.current) applyPlayerVolume(player);
    try {
      window.localStorage.setItem(VOLUME_KEY, String(next));
    } catch {
      // It just won't be remembered.
    }
  };

  const toggleMute = () =>
    applyVolume(volume === 0 ? unmutedVolumeRef.current || DEFAULT_VOLUME : 0);

  /* The dial: drag the needle and it snaps to the nearest station ---------- */

  const frequencyAt = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return DIAL_MIN + ratio * (DIAL_MAX - DIAL_MIN);
  };

  const onDialDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const frequency = frequencyAt(event);
    dragStationRef.current = nearestStation(frequency);
    setDragFrequency(frequency);
  };

  const onDialMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragFrequency === null) return;
    const frequency = frequencyAt(event);
    setDragFrequency(frequency);
    const nearest = nearestStation(frequency);
    if (nearest !== dragStationRef.current) {
      // Crackle as the needle crosses each station.
      dragStationRef.current = nearest;
      playStatic(volumeRef.current * 0.6);
    }
  };

  const onDialUp = () => {
    if (dragFrequency === null) return;
    const target = dragStationRef.current ?? nearestStation(dragFrequency);
    setDragFrequency(null);
    dragStationRef.current = null;
    if (target !== indexRef.current) tune(target);
  };

  /* Station list keys: arrows tune up and down the dial -------------------- */

  const onStationKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let target: number | null = null;
    if (event.key in moves) target = (index + moves[event.key] + STATIONS.length) % STATIONS.length;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = STATIONS.length - 1;
    if (target === null) return;
    event.preventDefault();
    if (target === index) return;
    tune(target);
    const row = stationRefs.current[target];
    row?.focus({ preventScroll: true });
    row?.scrollIntoView({ block: "nearest" });
  };

  const playLabel = showsPause ? "Pause" : "Play";
  const PlayIcon = showsPause ? Pause : Play;

  return (
    <div
      ref={rootRef}
      className={`house-radio${ready ? " is-ready" : ""}${volumeFixed ? " is-volume-fixed" : ""}`}
      data-view={view}
      data-status={status}
      inert={!ready}
      style={{ "--radio-needle": `${dialPosition(shownFrequency)}%` } as CSSProperties}
    >
      <span className="radio-antenna" aria-hidden="true" />

      <motion.div
        className="radio-island"
        initial={false}
        animate={
          metrics
            ? { width: metrics[view].w, height: metrics[view].h, borderRadius: RADIUS[view] }
            : { borderRadius: RADIUS[view] }
        }
        transition={ISLAND_SPRING}
      >
        {/* Idle: a small radio. */}
        <div
          ref={idleRef}
          className="radio-layer radio-layer-idle"
          data-active={view === "idle"}
          inert={view !== "idle"}
        >
          <button
            ref={faceRef}
            type="button"
            className="radio-face"
            aria-label={`Turn on the radio: ${station.frequency} FM, ${station.title} by ${station.artist}`}
            onClick={turnOn}
          >
            <span className="radio-grille" aria-hidden="true" />
            <span className="radio-face-panel" aria-hidden="true">
              <span className="radio-face-lcd">
                <span className="radio-face-freq">
                  {station.frequency.toFixed(1)}
                  <small>FM</small>
                </span>
                <span className="radio-face-marquee">
                  <span>
                    {station.title} · {station.artist} ·&nbsp;
                  </span>
                  <span>
                    {station.title} · {station.artist} ·&nbsp;
                  </span>
                </span>
              </span>
              <span className="radio-face-controls">
                <span className="radio-knob" />
                <span className="radio-presets">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="radio-power">
                  <Power weight="bold" />
                </span>
              </span>
            </span>
          </button>
        </div>

        {/* Live: folded, still playing, video still showing. */}
        <div
          ref={liveRef}
          className="radio-layer radio-layer-live"
          data-active={view === "live"}
          inert={view !== "live"}
        >
          <div ref={liveSlotRef} className="radio-slot" />
          <div className="radio-live-side">
            <p className="radio-live-top">
              <span className="radio-onair-lamp" aria-hidden="true" />
              <span className="radio-live-status">{STATUS_TEXT[status]}</span>
              <span className="radio-live-freq">{station.frequency.toFixed(1)} FM</span>
            </p>
            <button
              type="button"
              className="radio-live-track"
              aria-label={`Open the radio: ${station.title} by ${station.artist}`}
              onClick={expand}
            >
              <span className="radio-live-title">{station.title}</span>
              <span className="radio-live-artist">{station.artist}</span>
            </button>
            <span className="radio-eq radio-live-eq" aria-hidden="true">
              {Array.from({ length: 9 }, (_, bar) => (
                <span key={bar} />
              ))}
            </span>
            <div className="radio-live-controls">
              <button
                ref={livePlayRef}
                type="button"
                className="radio-button radio-play"
                aria-label={playLabel}
                onClick={togglePlay}
              >
                <PlayIcon weight="fill" />
              </button>
              <button
                type="button"
                className="radio-button"
                aria-label="Next station"
                onClick={() => tune(index + 1)}
              >
                <SkipForward weight="fill" />
              </button>
              <button
                type="button"
                className="radio-button radio-stop"
                aria-label="Stop the radio"
                onClick={stop}
              >
                <Stop weight="fill" />
              </button>
              <button
                type="button"
                className="radio-button"
                aria-label="Open the radio"
                onClick={expand}
              >
                <ArrowsOutSimple weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Open: the whole hi-fi. */}
        <section
          ref={openRef}
          className="radio-layer radio-layer-open"
          data-active={view === "open"}
          inert={view !== "open"}
          aria-label="FP FM radio"
        >
          <header className="radio-header">
            <p className="radio-brand">
              FP <span>FM</span>
            </p>
            <span className="radio-onair">
              <span className="radio-onair-lamp" aria-hidden="true" />
              {STATUS_TEXT[status]}
            </span>
            <a
              className="radio-youtube"
              href={`https://www.youtube.com/watch?v=${station.videoId}`}
              target="_blank"
              rel="noreferrer"
            >
              Watch on YouTube
              <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
            <button
              type="button"
              className="radio-chip radio-stop"
              aria-label="Stop the radio"
              onClick={stop}
            >
              <Stop weight="fill" />
            </button>
            <button
              type="button"
              className="radio-chip"
              aria-label="Fold the radio away (it keeps playing)"
              onClick={collapse}
            >
              <CaretDown weight="bold" />
            </button>
          </header>

          <div ref={openSlotRef} className="radio-slot" />

          <div className="radio-tuner">
            <div className="radio-display">
              <p className="radio-frequency" aria-hidden="true">
                {shownFrequency.toFixed(1)}
                <span>FM</span>
              </p>
              <div className={`radio-track${dragFrequency !== null ? " is-preview" : ""}`}>
                <p className="radio-track-title">{shownStation.title}</p>
                <p className="radio-track-artist">
                  {shownStation.artist} <span>· {shownStation.year}</span>
                </p>
              </div>
            </div>

            <div
              className={`radio-dial${dragFrequency !== null ? " is-dragging" : ""}`}
              aria-hidden="true"
              onPointerDown={onDialDown}
              onPointerMove={onDialMove}
              onPointerUp={onDialUp}
              onPointerCancel={onDialUp}
            >
              <div className="radio-dial-ticks">
                {DIAL_TICKS.map((tick) => (
                  <span
                    key={tick}
                    className={`radio-dial-tick${Number.isInteger(tick) ? " is-major" : ""}`}
                    style={{ left: `${dialPosition(tick)}%` }}
                  >
                    {Number.isInteger(tick) && tick % 2 === 0 && <em>{tick}</em>}
                  </span>
                ))}
              </div>
              {STATIONS.map((item, i) => (
                <span
                  key={item.videoId}
                  className={`radio-dial-station${i === index ? " is-current" : ""}`}
                  style={{ left: `${dialPosition(item.frequency)}%` }}
                />
              ))}
              <span className="radio-dial-needle" />
            </div>

            <div className="radio-progress">
              <span>{formatTime(time.current)}</span>
              <span className="radio-progress-bar">
                <span style={{ transform: `scaleX(${progress})` }} />
              </span>
              <span>{formatTime(time.duration)}</span>
            </div>

            <div className="radio-transport">
              <button
                type="button"
                className="radio-button"
                aria-label="Previous station"
                onClick={() => tune(index - 1)}
              >
                <SkipBack weight="fill" />
              </button>
              <button
                ref={openPlayRef}
                type="button"
                className="radio-button radio-play"
                aria-label={playLabel}
                onClick={togglePlay}
              >
                <PlayIcon weight="fill" />
              </button>
              <button
                type="button"
                className="radio-button"
                aria-label="Next station"
                onClick={() => tune(index + 1)}
              >
                <SkipForward weight="fill" />
              </button>

              <span className="radio-eq" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((bar) => (
                  <span key={bar} />
                ))}
              </span>

              <button
                type="button"
                className="radio-button radio-mute"
                aria-label={volume === 0 ? "Unmute" : "Mute"}
                onClick={toggleMute}
              >
                {volume === 0 ? <SpeakerSlash weight="bold" /> : <SpeakerHigh weight="bold" />}
              </button>
              <input
                className="radio-volume"
                type="range"
                min={0}
                max={100}
                step={1}
                value={volume}
                aria-label="Volume"
                style={{ "--radio-volume": `${volume}%` } as CSSProperties}
                onChange={(event) => applyVolume(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="radio-stations">
            <p className="radio-stations-label" aria-hidden="true">
              Stations <span>{STATIONS.length}</span>
            </p>
            <div
              ref={listRef}
              className="radio-station-list"
              role="radiogroup"
              aria-label="Stations"
              onKeyDown={onStationKeys}
            >
              {STATIONS.map((item, i) => {
                const current = i === index;
                return (
                  <button
                    key={item.videoId}
                    ref={(node) => {
                      stationRefs.current[i] = node;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={current}
                    tabIndex={current ? 0 : -1}
                    className={`radio-station${current ? " is-current" : ""}${broken.has(i) ? " is-broken" : ""}`}
                    onClick={() => {
                      if (!current) tune(i);
                    }}
                  >
                    <span className="radio-station-freq">{item.frequency.toFixed(1)}</span>
                    <span className="radio-station-text">
                      <span className="radio-station-title">{item.title}</span>
                      <span className="radio-station-artist">{item.artist}</span>
                    </span>
                    <span className="radio-station-year">&apos;{String(item.year).slice(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* The video: one player that moves between the live and open faces,
            never covered by anything. */}
        <motion.div
          ref={frameRef}
          className="radio-screen-frame"
          initial={false}
          animate={{ x: screenPos.x, y: screenPos.y, opacity: view === "idle" ? 0 : 1 }}
          transition={ISLAND_SPRING}
        >
          <div ref={screenRef} className="radio-screen" />
          {status === "unavailable" && (
            <p className="radio-screen-note">YouTube didn&apos;t load. Check your connection or blocker.</p>
          )}
        </motion.div>
      </motion.div>

      <p className="radio-sr" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
