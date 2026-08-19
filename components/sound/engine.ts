/**
 * Procedural sound engine for the site's interaction noises.
 *
 * Everything is synthesised with the Web Audio API rather than loaded from
 * files: the vocabulary we want (switch clicks, typewriter keys, teletype
 * chatter, split-flap clatter) is all short bursts of filtered noise plus a
 * little square/triangle body, which is how the machines being imitated
 * actually made sound. No assets, no network, and every voice stays tunable.
 */

export type VoiceName =
  | "click"
  | "clickSoft"
  | "hover"
  | "key"
  | "keyWide"
  | "keyReturn"
  | "keyBack"
  | "menuOpen"
  | "menuClose"
  | "teletype"
  | "bookSlide"
  | "pageFlip"
  | "pageTurn"
  | "thump";

const MASTER_GAIN = 0.3;
/** Beyond this many scheduled voices at once, new hits are dropped. */
const MAX_VOICES = 28;
const NOISE_SECONDS = 0.5;

/** Loudness of the sand hiss at full intensity. */
const SAND_GAIN = 0.32;
/**
 * The sand loop needs a much longer buffer than the one-shots: a half second
 * of noise on repeat has an audible 2 Hz cycle to it, which sounds like a
 * broken tape rather than grains.
 */
const SAND_NOISE_SECONDS = 3;

type BurstOptions = {
  start: number;
  duration: number;
  frequency: number;
  gain: number;
  q?: number;
  type?: BiquadFilterType;
};

/** Nodes of the continuous sand voice, built the first time it's asked for. */
type SandNodes = {
  output: GainNode;
  grit: GainNode;
};

type ToneOptions = {
  start: number;
  duration: number;
  from: number;
  to?: number;
  gain: number;
  type?: OscillatorType;
  lowpass?: number;
};

const vary = (value: number, amount: number) =>
  value * (1 + (Math.random() * 2 - 1) * amount);

export class RetroSoundEngine {
  private readonly context: AudioContext;
  private readonly master: GainNode;
  private readonly bus: GainNode;
  private readonly noise: AudioBuffer;
  private voices = 0;
  private enabled = true;
  private sand: SandNodes | null = null;
  private sandLevel = 0;
  private sandGrainAt = 0;

  constructor(context: AudioContext) {
    this.context = context;

    this.master = context.createGain();
    this.master.gain.value = MASTER_GAIN;

    // Keeps overlapping clatter from stacking into something harsh, and drops
    // the rumble that short noise bursts leave on laptop speakers.
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 12;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.08;

    const highpass = context.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 90;

    this.bus = context.createGain();
    this.bus.gain.value = 1;

    this.bus.connect(compressor);
    compressor.connect(highpass);
    highpass.connect(this.master);
    this.master.connect(context.destination);

    this.noise = this.createNoiseBuffer(NOISE_SECONDS);
  }

  private createNoiseBuffer(seconds: number) {
    const { sampleRate } = this.context;
    const length = Math.floor(sampleRate * seconds);
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private track(node: AudioScheduledSourceNode) {
    this.voices += 1;
    node.onended = () => {
      this.voices -= 1;
      node.onended = null;
    };
  }

  private get available() {
    return this.enabled && this.voices < MAX_VOICES;
  }

  /** Short burst of filtered noise: the "mechanical" half of every voice. */
  private burst({
    start,
    duration,
    frequency,
    gain,
    q = 1.2,
    type = "bandpass",
  }: BurstOptions) {
    const source = this.context.createBufferSource();
    source.buffer = this.noise;

    const filter = this.context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;

    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.0012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.bus);

    const offset = Math.random() * (NOISE_SECONDS - duration - 0.05);
    source.start(start, Math.max(0, offset), duration + 0.02);
    this.track(source);
  }

  /** Pitched body: the "electronic" half — square blips, key thocks, bells. */
  private tone({
    start,
    duration,
    from,
    to,
    gain,
    type = "square",
    lowpass,
  }: ToneOptions) {
    const oscillator = this.context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    if (to !== undefined && to !== from) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(20, to),
        start + duration,
      );
    }

    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.0015);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    let tail: AudioNode = envelope;
    if (lowpass) {
      const filter = this.context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = lowpass;
      envelope.connect(filter);
      tail = filter;
    }

    oscillator.connect(envelope);
    tail.connect(this.bus);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
    this.track(oscillator);
  }

  /**
   * Paper page air: a continuous noise whoosh whose bandpass center sweeps
   * up then down — that's what reads as a sheet moving through the air,
   * rather than a click made of short static bursts.
   */
  private paperWhoosh({
    start,
    duration,
    gain,
    freqFrom,
    freqPeak,
    freqTo,
  }: {
    start: number;
    duration: number;
    gain: number;
    freqFrom: number;
    freqPeak: number;
    freqTo: number;
  }) {
    if (!this.available) return;

    const source = this.context.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;

    const band = this.context.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.55;
    band.frequency.setValueAtTime(freqFrom, start);
    band.frequency.exponentialRampToValueAtTime(
      Math.max(80, freqPeak),
      start + duration * 0.38,
    );
    band.frequency.exponentialRampToValueAtTime(
      Math.max(60, freqTo),
      start + duration,
    );

    const air = this.context.createBiquadFilter();
    air.type = "highpass";
    air.frequency.value = 180;

    const envelope = this.context.createGain();
    // Slow attack (lift), swell through the swing, taper before the settle.
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain * 0.45, start + 0.04);
    envelope.gain.exponentialRampToValueAtTime(gain, start + duration * 0.32);
    envelope.gain.exponentialRampToValueAtTime(
      gain * 0.55,
      start + duration * 0.7,
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    source.connect(band);
    band.connect(air);
    air.connect(envelope);
    envelope.connect(this.bus);

    const offset = Math.random() * (NOISE_SECONDS * 0.6);
    source.start(start, offset);
    source.stop(start + duration + 0.03);
    this.track(source);
  }

  /** Dry paper-edge scrape layered over the whoosh for fiber texture. */
  private paperCrackle({
    start,
    duration,
    gain,
  }: {
    start: number;
    duration: number;
    gain: number;
  }) {
    if (!this.available) return;

    const source = this.context.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;

    const edge = this.context.createBiquadFilter();
    edge.type = "bandpass";
    edge.frequency.value = vary(2400, 0.2);
    edge.Q.value = 1.4;

    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.02);
    // Tiny gain wobble so it doesn't sound like a static hiss.
    const ticks = 5;
    for (let i = 1; i < ticks; i += 1) {
      const t = start + (duration * i) / ticks;
      const level = gain * (0.35 + Math.random() * 0.65);
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), t);
    }
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    source.connect(edge);
    edge.connect(envelope);
    envelope.connect(this.bus);

    source.start(start, Math.random() * 0.2);
    source.stop(start + duration + 0.02);
    this.track(source);
  }

  /** Soft slap as the page lands flat. */
  private paperSettle({ start, gain }: { start: number; gain: number }) {
    this.burst({
      start,
      duration: 0.028,
      frequency: vary(340, 0.12),
      gain: gain * 0.85,
      q: 0.6,
      type: "lowpass",
    });
    this.burst({
      start: start + 0.008,
      duration: 0.018,
      frequency: vary(1200, 0.15),
      gain: gain * 0.35,
      q: 0.9,
      type: "bandpass",
    });
  }

  /** `delaySeconds` schedules the hit ahead on the audio clock. */
  play(name: VoiceName, delaySeconds = 0) {
    if (!this.available || this.context.state !== "running") return;
    const now = this.context.currentTime + 0.001 + Math.max(0, delaySeconds);

    switch (name) {
      // Snap of a hard plastic switch.
      case "click":
        this.burst({
          start: now,
          duration: 0.006,
          frequency: vary(2400, 0.12),
          gain: 0.5,
          q: 1.1,
        });
        this.tone({
          start: now,
          duration: 0.02,
          from: vary(1150, 0.08),
          to: 820,
          gain: 0.05,
          lowpass: 3600,
        });
        break;

      // Same switch, further away: used for links and nav pills.
      case "clickSoft":
        this.burst({
          start: now,
          duration: 0.005,
          frequency: vary(1700, 0.12),
          gain: 0.3,
          q: 1,
        });
        this.tone({
          start: now,
          duration: 0.016,
          from: vary(900, 0.08),
          to: 680,
          gain: 0.03,
          lowpass: 2600,
        });
        break;

      // Barely-there tick, so sweeping the cursor never becomes a nuisance.
      case "hover":
        this.burst({
          start: now,
          duration: 0.0035,
          frequency: vary(3400, 0.1),
          gain: 0.075,
          q: 0.7,
          type: "highpass",
        });
        break;

      // Typewriter key: bright strike plus a wooden thock underneath.
      case "key":
        this.burst({
          start: now,
          duration: 0.009,
          frequency: vary(2000, 0.18),
          gain: 0.42,
          q: 1.4,
        });
        this.tone({
          start: now,
          duration: 0.05,
          from: vary(168, 0.12),
          to: 120,
          gain: 0.11,
          type: "triangle",
          lowpass: 900,
        });
        break;

      // Space bar: wider, deeper, slower to settle.
      case "keyWide":
        this.burst({
          start: now,
          duration: 0.013,
          frequency: vary(1500, 0.14),
          gain: 0.46,
          q: 1.2,
        });
        this.tone({
          start: now,
          duration: 0.075,
          from: vary(108, 0.1),
          to: 82,
          gain: 0.14,
          type: "triangle",
          lowpass: 700,
        });
        break;

      // Carriage return: the key, then the little bell.
      case "keyReturn":
        this.burst({
          start: now,
          duration: 0.012,
          frequency: vary(1800, 0.12),
          gain: 0.46,
          q: 1.3,
        });
        this.tone({
          start: now,
          duration: 0.07,
          from: vary(140, 0.1),
          to: 96,
          gain: 0.13,
          type: "triangle",
          lowpass: 800,
        });
        this.tone({
          start: now + 0.03,
          duration: 0.34,
          from: 1980,
          gain: 0.05,
          type: "sine",
        });
        this.tone({
          start: now + 0.03,
          duration: 0.26,
          from: 2640,
          gain: 0.028,
          type: "sine",
        });
        break;

      // Backspace: duller, no body, so deleting reads differently.
      case "keyBack":
        this.burst({
          start: now,
          duration: 0.007,
          frequency: vary(1150, 0.12),
          gain: 0.3,
          q: 1,
        });
        break;

      case "menuOpen":
        this.tone({
          start: now,
          duration: 0.14,
          from: 210,
          to: 880,
          gain: 0.045,
          lowpass: 2400,
        });
        this.burst({
          start: now,
          duration: 0.15,
          frequency: 1200,
          gain: 0.1,
          q: 0.6,
        });
        this.burst({
          start: now + 0.13,
          duration: 0.006,
          frequency: 2400,
          gain: 0.34,
          q: 1.1,
        });
        break;

      case "menuClose":
        this.tone({
          start: now,
          duration: 0.16,
          from: 840,
          to: 190,
          gain: 0.045,
          lowpass: 2200,
        });
        this.burst({
          start: now,
          duration: 0.16,
          frequency: 900,
          gain: 0.09,
          q: 0.6,
        });
        this.burst({
          start: now + 0.15,
          duration: 0.008,
          frequency: 1500,
          gain: 0.3,
          q: 1,
        });
        break;

      // A book sliding off a wooden shelf: low friction hiss, tiny end tick.
      case "bookSlide":
        this.burst({
          start: now,
          duration: 0.13,
          frequency: vary(430, 0.15),
          gain: 0.16,
          q: 0.5,
          type: "lowpass",
        });
        this.burst({
          start: now + 0.11,
          duration: 0.006,
          frequency: vary(1500, 0.15),
          gain: 0.1,
          q: 1,
        });
        break;

      // Cover swing on first open: the original bright paper flutter / clank.
      case "pageFlip":
        this.burst({
          start: now,
          duration: 0.04,
          frequency: vary(750, 0.15),
          gain: 0.2,
          q: 0.8,
        });
        this.burst({
          start: now + 0.055,
          duration: 0.045,
          frequency: vary(1450, 0.15),
          gain: 0.26,
          q: 0.9,
        });
        this.burst({
          start: now + 0.115,
          duration: 0.06,
          frequency: vary(2450, 0.12),
          gain: 0.2,
          q: 0.9,
        });
        this.tone({
          start: now + 0.02,
          duration: 0.12,
          from: 320,
          to: 780,
          gain: 0.02,
          type: "sine",
        });
        break;

      // Mid-book page turn: soft, quiet whoosh — kept well under other voices.
      case "pageTurn":
        this.paperWhoosh({
          start: now,
          duration: 0.38,
          gain: 0.07,
          freqFrom: vary(500, 0.1),
          freqPeak: vary(1400, 0.1),
          freqTo: vary(620, 0.1),
        });
        this.paperCrackle({
          start: now + 0.05,
          duration: 0.22,
          gain: 0.025,
        });
        this.paperSettle({ start: now + 0.4, gain: 0.05 });
        break;

      // A cover thudding shut.
      case "thump":
        this.tone({
          start: now,
          duration: 0.09,
          from: vary(105, 0.1),
          to: 52,
          gain: 0.17,
          type: "triangle",
          lowpass: 320,
        });
        this.burst({
          start: now,
          duration: 0.035,
          frequency: vary(210, 0.15),
          gain: 0.28,
          q: 0.7,
          type: "lowpass",
        });
        break;

      // Dot-matrix / teletype tick used while text animates in.
      case "teletype":
        this.tone({
          start: now,
          duration: 0.009,
          from: vary(1520, 0.16),
          to: vary(1280, 0.1),
          gain: 0.045,
          lowpass: 4200,
        });
        this.burst({
          start: now,
          duration: 0.003,
          frequency: vary(2700, 0.15),
          gain: 0.12,
          q: 1.1,
        });
        break;
    }
  }

  /**
   * Evenly spaced run of one voice, used for text that reveals itself a word
   * or letter at a time. Scheduling the whole run up front keeps it locked to
   * the animation's stagger without a pile of JavaScript timers.
   */
  sequence(name: VoiceName, count: number, gapSeconds: number, jitter = 0.25) {
    if (!this.enabled || this.context.state !== "running") return;

    const total = Math.min(Math.max(count, 0), 24);
    for (let index = 0; index < total; index += 1) {
      const offset = index * gapSeconds * (1 + (Math.random() * 2 - 1) * jitter);
      this.play(name, Math.max(0, offset));
    }
  }

  /**
   * Departure-board clatter. The flaps fire far too often to drive one sound
   * per flip from React, so a whole burst is scheduled on the audio clock and
   * tapered off to match the board settling row by row.
   */
  clatter(durationSeconds: number, intensity = 1) {
    if (!this.enabled || this.context.state !== "running") return;
    // A burst schedules dozens of voices at once, so skip it outright if the
    // previous one is still ringing rather than piling clatter on clatter.
    if (this.voices > MAX_VOICES) return;

    const duration = Math.min(Math.max(durationSeconds, 0.15), 4);
    const count = Math.min(Math.max(Math.round(duration * 22), 6), 44);
    const start = this.context.currentTime + 0.001;

    for (let index = 0; index < count; index += 1) {
      const progress = index / count;
      // Thins out towards the end, the way the last few flaps trail off.
      const taper = 1 - progress * 0.65;
      if (Math.random() > taper + 0.25) continue;

      const at = start + duration * progress + Math.random() * 0.02;
      this.burst({
        start: at,
        duration: 0.007,
        frequency: 900 + Math.random() * 800,
        gain: (0.16 + Math.random() * 0.12) * taper * intensity,
        q: 1.3,
      });

      if (Math.random() < 0.35) {
        this.tone({
          start: at,
          duration: 0.03,
          from: vary(150, 0.2),
          to: 110,
          gain: 0.045 * taper * intensity,
          type: "triangle",
          lowpass: 800,
        });
      }
    }
  }

  /**
   * The sand voice runs continuously instead of firing per event, because it
   * imitates something that only makes noise while it's being disturbed. Two
   * grades of grain are always sounding under a closed gain: a low shush for
   * the mass shifting, and a bright fizz for grains skittering over it.
   */
  private createSand(): SandNodes {
    const context = this.context;
    const noise = this.createNoiseBuffer(SAND_NOISE_SECONDS);

    const output = context.createGain();
    output.gain.value = 0;
    output.connect(this.bus);

    const shush = context.createBiquadFilter();
    shush.type = "bandpass";
    shush.frequency.value = 760;
    shush.Q.value = 0.7;
    shush.connect(output);

    const fizz = context.createBiquadFilter();
    fizz.type = "bandpass";
    fizz.frequency.value = 4300;
    fizz.Q.value = 1.7;

    // Rides on top of the shush and opens up as the stirring gets faster.
    const grit = context.createGain();
    grit.gain.value = 0.2;
    fizz.connect(grit);
    grit.connect(output);

    const loop = (destination: AudioNode, rate: number, offset: number) => {
      const source = context.createBufferSource();
      source.buffer = noise;
      source.loop = true;
      source.playbackRate.value = rate;
      source.connect(destination);
      // Different rates and start offsets keep the two layers from lining up
      // into one recognisable loop.
      source.start(context.currentTime, offset);
    };

    loop(shush, 0.78, 0);
    loop(fizz, 1.43, SAND_NOISE_SECONDS * 0.5);

    // Two resonances that never settle. Without them the hiss reads as plain
    // static; the slow wander is what makes it feel unsettled and alive.
    const modulate = (
      target: AudioParam,
      frequency: number,
      depth: number,
      type: OscillatorType,
    ) => {
      const oscillator = context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      const amount = context.createGain();
      amount.gain.value = depth;
      oscillator.connect(amount);
      amount.connect(target);
      oscillator.start();
    };

    modulate(shush.frequency, 0.19, 240, "sine");
    modulate(fizz.frequency, 3.3, 950, "triangle");

    this.sand = { output, grit };
    return this.sand;
  }

  /**
   * Sets how hard the sand is being stirred, from 0 to 1. Callers push a value
   * every animation frame and the ramps do the smoothing, so nothing has to
   * decide when a grain of sound starts or stops.
   */
  setSand(intensity: number) {
    const level = this.enabled ? Math.min(Math.max(intensity, 0), 1) : 0;
    // Nothing has ever been stirred, so don't build the voice just to silence it.
    if (level === 0 && !this.sand) return;

    const nodes = this.sand ?? this.createSand();
    const rising = level > this.sandLevel;
    this.sandLevel = level;

    const now = this.context.currentTime;
    // Squared, so a slow drag stays a whisper and only a real shove roars.
    nodes.output.gain.setTargetAtTime(
      SAND_GAIN * level * level,
      now,
      // Grains answer the cursor immediately but take their time settling.
      rising ? 0.03 : 0.14,
    );
    nodes.grit.gain.setTargetAtTime(0.16 + level * 0.7, now, 0.09);

    if (this.context.state !== "running") return;

    // Individual grains flicking loose. The looped layers alone are too smooth
    // to sound granular, and these irregular ticks are what sell it as sand.
    if (level > 0.1 && this.available && now - this.sandGrainAt > 0.03) {
      this.sandGrainAt = now;
      if (Math.random() < level) {
        this.burst({
          start: now + 0.002,
          duration: 0.004,
          frequency: vary(5000, 0.3),
          gain: 0.04 + level * 0.08,
          q: 2.4,
        });
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(enabled ? MASTER_GAIN : 0, now, 0.015);
    if (!enabled) this.setSand(0);
  }

  async resume() {
    if (this.context.state === "running") return;
    try {
      await this.context.resume();
    } catch {
      // Still waiting on a user gesture; the next one will try again.
    }
  }

  suspend() {
    if (this.context.state !== "running") return;
    // Whatever was stirring the sand isn't animating any more, so it will never
    // report its way back down to silence. Close the hiss before freezing.
    this.setSand(0);
    void this.context.suspend().catch(() => {});
  }

  get state() {
    return this.context.state;
  }
}

let engine: RetroSoundEngine | null = null;
let unsupported = false;

/** The engine if one already exists, without creating an AudioContext. */
export function peekSoundEngine(): RetroSoundEngine | null {
  return engine;
}

/** Lazily builds the shared engine. Returns null when audio isn't available. */
export function getSoundEngine(): RetroSoundEngine | null {
  if (engine) return engine;
  if (unsupported || typeof window === "undefined") return null;

  const Constructor =
    window.AudioContext ??
    (window as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!Constructor) {
    unsupported = true;
    return null;
  }

  try {
    engine = new RetroSoundEngine(new Constructor({ latencyHint: "interactive" }));
  } catch {
    unsupported = true;
    return null;
  }

  return engine;
}
