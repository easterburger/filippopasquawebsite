// Just enough of the YouTube IFrame Player API for the radio. The script is
// only requested when someone turns the radio on, so a visit that never does
// makes no requests to YouTube.

export const PLAYER_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export type YouTubePlayer = {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  getIframe(): HTMLIFrameElement;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
};

type PlayerEvent = { target: YouTubePlayer; data: number };

export type PlayerOptions = {
  width: number | string;
  height: number | string;
  videoId: string;
  host?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: PlayerEvent) => void;
    onStateChange?: (event: PlayerEvent) => void;
    onError?: (event: PlayerEvent) => void;
    onAutoplayBlocked?: (event: PlayerEvent) => void;
  };
};

type YouTubeNamespace = {
  Player: new (element: HTMLElement, options: PlayerOptions) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeNamespace & { loaded?: number };
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** A network that swallows YouTube (a block page, a filter) never errors; it just never answers. */
export const YOUTUBE_TIMEOUT_MS = 12000;

let apiPromise: Promise<YouTubeNamespace> | null = null;

export function loadYouTubeApi(): Promise<YouTubeNamespace> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const fail = () => {
      window.clearTimeout(timeout);
      apiPromise = null;
      reject(new Error("The YouTube player could not load."));
    };
    const timeout = window.setTimeout(fail, YOUTUBE_TIMEOUT_MS);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      window.clearTimeout(timeout);
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = fail;
    document.head.append(script);
  });

  return apiPromise;
}

/** iOS won't let pages set media volume; only muting works there. */
export function canSetVolume() {
  const probe = document.createElement("video");
  probe.volume = 0.5;
  return probe.volume === 0.5;
}
