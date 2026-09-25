// Background music for the Experience records: one loop per record,
// synthesised note by note with Web Audio. No samples and no downloads, so
// every sound is original and free to use.
//
// Music runs on its own AudioContext rather than the sound-effects engine's:
// turning effects off suspends that context, and the music has its own switch.

export type MusicTrackId =
  | "skycloud"
  | "dawn"
  | "zayno"
  | "lumostudio"
  | "bds"
  | "pasqua";

const MUSIC_GAIN = 0.5;
const FADE_IN = 0.9;
const FADE_OUT = 0.8;
const LOOKAHEAD = 0.14;
const TICK_MS = 25;
const STEPS_PER_BAR = 16;

/* ------------------------------------------------------------------------ */
/* Instruments                                                               */
/* ------------------------------------------------------------------------ */

type Kit = {
  ctx: BaseAudioContext;
  /** Dry input of the track. */
  out: AudioNode;
  /** Echo send (feedback delay shared by the track). */
  send: AudioNode;
  noise: AudioBuffer;
};

const midi = (note: number) => 440 * 2 ** ((note - 69) / 12);

/** Exponential envelopes can't touch zero, so they start and end just above. */
function pluckEnvelope(gain: GainNode, time: number, peak: number, attack: number, decay: number) {
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);
}

function voice(kit: Kit, type: OscillatorType, freq: number, time: number, stop: number) {
  const osc = kit.ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  osc.start(time);
  osc.stop(stop);
  return osc;
}

/** Warm electric piano: sine body, a quiet octave partial for the tine. */
function epiano(kit: Kit, note: number, time: number, length: number, level: number) {
  const freq = midi(note);
  const out = kit.ctx.createGain();
  pluckEnvelope(out, time, level, 0.012, length);
  const tone = kit.ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2600;
  out.connect(tone);
  tone.connect(kit.out);

  const body = voice(kit, "sine", freq, time, time + length + 0.1);
  body.connect(out);
  const tine = kit.ctx.createGain();
  tine.gain.value = 0.22;
  const bright = voice(kit, "triangle", freq * 2.002, time, time + length + 0.1);
  bright.connect(tine);
  tine.connect(out);
}

/** Wide, slow pad: two detuned saws panned apart through a soft lowpass. */
function pad(kit: Kit, note: number, time: number, length: number, level: number, cutoff = 1000) {
  const freq = midi(note);
  const attack = Math.min(0.9, length * 0.4);
  const release = 1.1;
  const out = kit.ctx.createGain();
  out.gain.setValueAtTime(0, time);
  out.gain.linearRampToValueAtTime(level, time + attack);
  out.gain.setValueAtTime(level, time + length);
  out.gain.linearRampToValueAtTime(0, time + length + release);

  const filter = kit.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  filter.Q.value = 0.6;
  filter.connect(out);
  out.connect(kit.out);

  for (const [detune, pan] of [
    [-8, -0.45],
    [8, 0.45],
  ] as const) {
    const osc = voice(kit, "sawtooth", freq, time, time + length + release + 0.05);
    osc.detune.value = detune;
    const panner = kit.ctx.createStereoPanner();
    panner.pan.value = pan;
    osc.connect(panner);
    panner.connect(filter);
  }
}

/** Plucked string/synth: a bright saw whose filter closes as it decays. */
function pluck(
  kit: Kit,
  note: number,
  time: number,
  level: number,
  { decay = 0.32, bright = 3200, send = 0, type = "sawtooth" as OscillatorType } = {},
) {
  const osc = voice(kit, type, midi(note), time, time + decay + 0.05);
  const filter = kit.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(bright, time);
  filter.frequency.exponentialRampToValueAtTime(260, time + decay);
  const out = kit.ctx.createGain();
  pluckEnvelope(out, time, level, 0.004, decay);
  osc.connect(filter);
  filter.connect(out);
  out.connect(kit.out);
  if (send) {
    const wet = kit.ctx.createGain();
    wet.gain.value = send;
    out.connect(wet);
    wet.connect(kit.send);
  }
}

/** Nylon-string guitar: triangle body with a soft pick transient. */
function nylon(kit: Kit, note: number, time: number, level: number) {
  pluck(kit, note, time, level, { decay: 0.7, bright: 1900, type: "triangle" });
  const tick = kit.ctx.createBufferSource();
  tick.buffer = kit.noise;
  const band = kit.ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2400;
  const gain = kit.ctx.createGain();
  pluckEnvelope(gain, time, level * 0.25, 0.001, 0.02);
  tick.connect(band);
  band.connect(gain);
  gain.connect(kit.out);
  tick.start(time, Math.random() * 1.5, 0.05);
}

/** Glassy bell: inharmonic partials, long tail into the echo. */
function bell(kit: Kit, note: number, time: number, level: number, send = 0.5) {
  const freq = midi(note);
  const out = kit.ctx.createGain();
  out.gain.value = 1;
  out.connect(kit.out);
  const wet = kit.ctx.createGain();
  wet.gain.value = send;
  out.connect(wet);
  wet.connect(kit.send);
  for (const [ratio, amount, decay] of [
    [1, 1, 1.8],
    [2.76, 0.28, 0.9],
    [5.4, 0.1, 0.45],
  ] as const) {
    const osc = voice(kit, "sine", freq * ratio, time, time + decay + 0.1);
    const gain = kit.ctx.createGain();
    pluckEnvelope(gain, time, level * amount, 0.004, decay);
    osc.connect(gain);
    gain.connect(out);
  }
}

function bass(kit: Kit, note: number, time: number, length: number, level: number, type: OscillatorType = "triangle") {
  const osc = voice(kit, type, midi(note), time, time + length + 0.1);
  const filter = kit.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = type === "square" ? 900 : 520;
  const out = kit.ctx.createGain();
  out.gain.setValueAtTime(0.0001, time);
  out.gain.exponentialRampToValueAtTime(level, time + 0.012);
  out.gain.setValueAtTime(level, time + Math.max(0.02, length - 0.06));
  out.gain.exponentialRampToValueAtTime(0.0001, time + length);
  osc.connect(filter);
  filter.connect(out);
  out.connect(kit.out);
}

/** Chip lead: a square with a hard gate, softened a touch. */
function chip(kit: Kit, note: number, time: number, length: number, level: number, type: OscillatorType = "square") {
  const osc = voice(kit, type, midi(note), time, time + length + 0.05);
  const filter = kit.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 4200;
  const out = kit.ctx.createGain();
  out.gain.setValueAtTime(0.0001, time);
  out.gain.exponentialRampToValueAtTime(level, time + 0.004);
  out.gain.setValueAtTime(level * 0.8, time + length * 0.7);
  out.gain.exponentialRampToValueAtTime(0.0001, time + length);
  osc.connect(filter);
  filter.connect(out);
  out.connect(kit.out);
}

function kick(kit: Kit, time: number, level: number) {
  const osc = kit.ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(44, time + 0.14);
  const out = kit.ctx.createGain();
  pluckEnvelope(out, time, level, 0.002, 0.3);
  osc.connect(out);
  out.connect(kit.out);
  osc.start(time);
  osc.stop(time + 0.34);
}

/** Filtered noise hit: hats, brushes, snares, shakers. */
function noiseHit(
  kit: Kit,
  time: number,
  level: number,
  { type = "highpass" as BiquadFilterType, freq = 7000, q = 0.7, attack = 0.001, decay = 0.04 } = {},
) {
  const source = kit.ctx.createBufferSource();
  source.buffer = kit.noise;
  const filter = kit.ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const out = kit.ctx.createGain();
  pluckEnvelope(out, time, level, attack, decay);
  source.connect(filter);
  filter.connect(out);
  out.connect(kit.out);
  source.start(time, Math.random() * 1.5, attack + decay + 0.05);
}

const hat = (kit: Kit, time: number, level: number, open = false) =>
  noiseHit(kit, time, level, { freq: 7400, decay: open ? 0.14 : 0.035 });
const brush = (kit: Kit, time: number, level: number) =>
  noiseHit(kit, time, level, { type: "bandpass", freq: 2600, q: 0.5, attack: 0.03, decay: 0.16 });
const snare = (kit: Kit, time: number, level: number) =>
  noiseHit(kit, time, level, { type: "bandpass", freq: 1800, q: 0.8, decay: 0.14 });
const rim = (kit: Kit, time: number, level: number) =>
  noiseHit(kit, time, level, { type: "bandpass", freq: 1500, q: 4, decay: 0.025 });

/* ------------------------------------------------------------------------ */
/* Tracks                                                                    */
/* ------------------------------------------------------------------------ */

type Track = {
  bpm: number;
  bars: number;
  /** Delay on odd 16ths, as a share of a 16th, for a laid-back feel. */
  swing?: number;
  /** Echo time in 16ths and how much of it feeds back. */
  echo: { steps: number; feedback: number; wet: number };
  crackle: number;
  /** Trim so the gentler tracks sit as loud as the busy ones. */
  gain?: number;
  play: (kit: Kit, step: number, bar: number, time: number, sixteenth: number) => void;
};

// Chords as MIDI notes; bass roots an octave or two below.
const DAWN_CHORDS = [
  [53, 57, 60, 64], // Fmaj7
  [52, 55, 59, 62], // Em7
  [50, 53, 57, 60], // Dm7
  [48, 52, 55, 59], // Cmaj7
];
const DAWN_ROOTS = [41, 40, 38, 36];
const DAWN_MELODY: Array<Array<[number, number]>> = [
  [[0, 72], [3, 69], [6, 67], [10, 69], [12, 72]],
  [[2, 71], [6, 67], [10, 64], [14, 67]],
  [[0, 69], [4, 72], [7, 74], [10, 72], [12, 69]],
  [[2, 67], [6, 64], [8, 67], [12, 71]],
];

const ZAYNO_CHORDS = [
  [60, 64, 67], // C
  [55, 59, 62], // G
  [57, 60, 64], // Am
  [53, 57, 60], // F
];
const ZAYNO_ROOTS = [36, 31, 33, 29];

const LUMO_CHORDS = [
  [50, 54, 57, 61, 64], // Dmaj9
  [47, 50, 54, 57, 61], // Bm9
  [43, 47, 50, 54, 57], // Gmaj9
  [45, 49, 52, 54, 59], // A6/9
];
const LUMO_ROOTS = [38, 35, 31, 33];

const SKY_CHORDS = [
  [51, 55, 58, 62], // Ebmaj7
  [48, 51, 55, 58, 62], // Cm9
  [44, 48, 51, 55], // Abmaj7
  [46, 50, 53, 55], // Bb6
];
const SKY_ROOTS = [39, 36, 32, 34];

const BDS_CHORDS = [
  [57, 60, 64], // Am
  [53, 57, 60], // F
  [48, 52, 55], // C
  [55, 59, 62], // G
];
const BDS_ROOTS = [45, 41, 36, 43];
// [step, note, length in 16ths]
const BDS_LEAD: Array<Array<[number, number, number]>> = [
  [[0, 76, 2], [2, 79, 2], [4, 81, 4], [8, 79, 2], [10, 76, 2], [12, 74, 4]],
  [[0, 72, 2], [2, 74, 2], [4, 76, 6], [12, 72, 2], [14, 74, 2]],
  [[0, 76, 2], [2, 79, 2], [4, 84, 4], [8, 83, 2], [10, 81, 2], [12, 79, 4]],
  [[0, 79, 4], [4, 76, 2], [6, 74, 2], [8, 71, 4], [12, 74, 4]],
  [[0, 81, 2], [2, 84, 2], [4, 86, 4], [8, 84, 2], [10, 81, 2], [12, 79, 4]],
  [[0, 77, 4], [4, 76, 2], [6, 74, 2], [8, 72, 8]],
  [[0, 76, 2], [2, 79, 2], [4, 76, 2], [6, 74, 2], [8, 72, 4], [12, 74, 4]],
  [[0, 71, 2], [2, 74, 2], [4, 79, 4], [8, 83, 6], [14, 86, 2]],
];

const PASQUA_CHORDS = [
  [52, 55, 59, 64], // Cmaj7 (upper voicing)
  [52, 55, 57, 60], // Am7
  [53, 57, 60, 62], // Dm7
  [53, 55, 59, 62], // G7
];
const PASQUA_ROOTS = [36, 33, 38, 31];
const PASQUA_MELODY: Array<Array<[number, number]>> = [
  [[0, 76], [3, 74], [6, 72], [10, 69]],
  [[0, 72], [6, 71], [10, 69], [12, 67]],
  [[0, 74], [3, 72], [6, 69], [10, 65]],
  [[0, 71], [6, 74], [10, 77], [12, 76]],
];
const BOSSA = [0, 3, 6, 10, 12];

const TRACKS: Record<MusicTrackId, Track> = {
  // Lo-fi sunrise: lazy electric piano, brushed kit, a melody in the back half.
  dawn: {
    bpm: 78,
    bars: 8,
    swing: 0.22,
    echo: { steps: 3, feedback: 0.3, wet: 0.18 },
    crackle: 0.06,
    play(kit, step, bar, time, sixteenth) {
      const chord = DAWN_CHORDS[bar % 4];
      if (step === 0) {
        chord.forEach((note) => epiano(kit, note, time, sixteenth * 11, 0.045));
        bass(kit, DAWN_ROOTS[bar % 4], time, sixteenth * 7, 0.11);
      }
      if (step === 10) chord.slice(1).forEach((note) => epiano(kit, note, time, sixteenth * 5, 0.03));
      if (step === 8) bass(kit, DAWN_ROOTS[bar % 4] + 7, time, sixteenth * 4, 0.07);
      if (step === 0 || step === 10) kick(kit, time, 0.16);
      if (step === 4 || step === 12) brush(kit, time, 0.05);
      if (step % 4 === 2) hat(kit, time, 0.022);
      if (bar >= 4) {
        for (const [at, note] of DAWN_MELODY[bar - 4]) {
          if (at === step) epiano(kit, note + 12, time, sixteenth * 3, 0.03);
        }
      }
    },
  },

  // Focused study-pop: four on the floor, plucky arpeggios, octave bass.
  zayno: {
    bpm: 112,
    bars: 8,
    echo: { steps: 3, feedback: 0.28, wet: 0.16 },
    crackle: 0.035,
    play(kit, step, bar, time) {
      const chord = ZAYNO_CHORDS[bar % 4];
      const root = ZAYNO_ROOTS[bar % 4];
      if (step % 4 === 0) kick(kit, time, 0.2);
      if (step === 4 || step === 12) snare(kit, time, 0.05);
      if (step % 4 === 2) hat(kit, time, 0.03, step === 14);
      if (bar >= 4 && step % 2 === 1) hat(kit, time, 0.012);
      if (step % 2 === 0) bass(kit, root + (step % 4 === 2 ? 12 : 0), time, 0.12, 0.08, "sawtooth");
      if (bar < 2) {
        if (step === 0 || step === 6 || step === 12) {
          chord.forEach((note) => pluck(kit, note + 12, time, 0.03, { decay: 0.4, send: 0.3 }));
        }
      } else {
        const tones = [...chord, chord[0] + 12, chord[1] + 12];
        const pattern = [0, 1, 2, 3, 4, 3, 2, 1];
        pluck(kit, tones[pattern[step % 8]] + 12, time, 0.028, { decay: 0.22, bright: 4200, send: 0.35 });
      }
    },
  },

  // Amber study ambient: slow pads, sub bass, bells in threes over fours.
  lumostudio: {
    bpm: 70,
    bars: 8,
    echo: { steps: 6, feedback: 0.42, wet: 0.3 },
    crackle: 0.05,
    gain: 1.5,
    play(kit, step, bar, time, sixteenth) {
      const chord = LUMO_CHORDS[bar % 4];
      if (step === 0) {
        chord.forEach((note) => pad(kit, note, time, sixteenth * 15, 0.02, 900));
        bass(kit, LUMO_ROOTS[bar % 4], time, sixteenth * 15, 0.07, "sine");
      }
      if (bar >= 2 && step % 3 === 0) {
        const index = (bar * 16 + step) / 3;
        const note = chord[Math.floor(index) % chord.length] + 24;
        bell(kit, note, time, 0.035, 0.45);
      }
      if (bar >= 4 && step === 8) rim(kit, time, 0.018);
    },
  },

  // Floaty cloud synthwave: wide pads, shimmering high arps, soft half-time pulse.
  skycloud: {
    bpm: 96,
    bars: 8,
    echo: { steps: 3, feedback: 0.45, wet: 0.32 },
    crackle: 0.04,
    play(kit, step, bar, time, sixteenth) {
      const chord = SKY_CHORDS[bar % 4];
      if (step === 0) {
        chord.forEach((note) => pad(kit, note, time, sixteenth * 15, 0.022, 1300));
        bass(kit, SKY_ROOTS[bar % 4], time, sixteenth * 14, 0.08, "sine");
      }
      if (step === 0 || step === 8) kick(kit, time, 0.13);
      hat(kit, time, step % 2 ? 0.008 : 0.014);
      if (bar >= 2) {
        const tones = [...chord, ...chord.map((note) => note + 12)];
        const note = tones[(step * 3) % tones.length] + 24;
        pluck(kit, note, time, 0.018, { decay: 0.18, bright: 5200, send: 0.6, type: "triangle" });
      }
    },
  },

  // Italo arcade: square lead, triangle bass arps, noise drums. Tutto bene!
  bds: {
    bpm: 140,
    bars: 8,
    echo: { steps: 3, feedback: 0.2, wet: 0.1 },
    crackle: 0.03,
    play(kit, step, bar, time, sixteenth) {
      const root = BDS_ROOTS[bar % 4];
      const chord = BDS_CHORDS[bar % 4];
      if (step === 0 || step === 6 || step === 8) kick(kit, time, 0.17);
      if (step === 4 || step === 12) {
        noiseHit(kit, time, 0.06, { type: "bandpass", freq: 2200, q: 0.6, decay: 0.1 });
      }
      if (step % 2 === 1) noiseHit(kit, time, 0.018, { freq: 8000, decay: 0.02 });
      if (step % 2 === 0) {
        bass(kit, root - 12 + (step % 4 === 2 ? 12 : 0), time, sixteenth * 1.8, 0.07, "triangle");
      }
      for (const [at, note, length] of BDS_LEAD[bar]) {
        if (at === step) chip(kit, note, time, sixteenth * length * 0.92, 0.028);
      }
      if (bar >= 4) {
        chip(kit, chord[step % 3] + 12, time, sixteenth * 0.8, 0.009, "square");
      }
    },
  },

  // Verona lounge: nylon bossa comping, walking bass, brushes and rim.
  pasqua: {
    bpm: 92,
    bars: 8,
    echo: { steps: 4, feedback: 0.25, wet: 0.12 },
    crackle: 0.055,
    gain: 1.35,
    play(kit, step, bar, time) {
      const chord = PASQUA_CHORDS[bar % 4];
      const root = PASQUA_ROOTS[bar % 4];
      if (BOSSA.includes(step)) {
        chord.forEach((note, index) => nylon(kit, note, time + index * 0.012, 0.028));
      }
      if (step === 0 || step === 8) bass(kit, root, time, 0.32, 0.1, "sine");
      if (step === 6 || step === 14) bass(kit, root + 7, time, 0.22, 0.08, "sine");
      if (step % 4 === 2) brush(kit, time, 0.035);
      if (bar % 2 === 1 && BOSSA.includes(step)) rim(kit, time, 0.02);
      if (bar >= 4) {
        for (const [at, note] of PASQUA_MELODY[bar - 4]) {
          if (at === step) nylon(kit, note, time, 0.05);
        }
      }
    },
  },

};

/* ------------------------------------------------------------------------ */
/* Decks: one playing track with its bus, echo and crackle                   */
/* ------------------------------------------------------------------------ */

function makeNoise(ctx: BaseAudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Surface noise of an old record: faint hiss with sparse pops. */
function makeCrackle(ctx: BaseAudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.05;
    if (Math.random() < 0.00018) {
      const length = 8 + Math.floor(Math.random() * 30);
      const size = 0.3 + Math.random() * 0.7;
      for (let j = 0; j < length && i + j < data.length; j += 1) {
        data[i + j] += size * (1 - j / length) * (j % 2 ? -1 : 1);
      }
    }
  }
  return buffer;
}

class Deck {
  readonly id: MusicTrackId;
  private readonly ctx: BaseAudioContext;
  private readonly track: Track;
  private readonly bus: GainNode;
  private readonly kit: Kit;
  private readonly crackle: AudioBufferSourceNode;
  private readonly sixteenth: number;
  private readonly start: number;
  private count = 0;

  constructor(ctx: BaseAudioContext, destination: AudioNode, id: MusicTrackId, noise: AudioBuffer, crackle: AudioBuffer) {
    this.ctx = ctx;
    this.id = id;
    this.track = TRACKS[id];
    this.sixteenth = 60 / this.track.bpm / 4;
    this.start = ctx.currentTime + 0.08;

    this.bus = ctx.createGain();
    this.bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.bus.gain.exponentialRampToValueAtTime(this.track.gain ?? 1, ctx.currentTime + FADE_IN);
    this.bus.connect(destination);

    const echo = ctx.createDelay(2);
    echo.delayTime.value = this.sixteenth * this.track.echo.steps;
    const feedback = ctx.createGain();
    feedback.gain.value = this.track.echo.feedback;
    const wet = ctx.createGain();
    wet.gain.value = this.track.echo.wet;
    const damp = ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 3200;
    echo.connect(damp);
    damp.connect(feedback);
    feedback.connect(echo);
    damp.connect(wet);
    wet.connect(this.bus);

    this.kit = { ctx, out: this.bus, send: echo, noise };

    this.crackle = ctx.createBufferSource();
    this.crackle.buffer = crackle;
    this.crackle.loop = true;
    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = "bandpass";
    crackleFilter.frequency.value = 2400;
    crackleFilter.Q.value = 0.4;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = this.track.crackle;
    this.crackle.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(this.bus);
    this.crackle.start(this.start);
  }

  /** Schedules every 16th that starts before `until` (audio clock). */
  scheduleUntil(until: number) {
    const { bars, swing = 0 } = this.track;
    // After a main-thread stall, skip the 16ths that are already in the past
    // instead of firing them all at once (bar alignment comes from count).
    const late = this.ctx.currentTime - (this.start + this.count * this.sixteenth);
    if (late > 0.05) this.count += Math.ceil(late / this.sixteenth);
    for (;;) {
      const grid = this.start + this.count * this.sixteenth;
      if (grid >= until) return;
      const step = this.count % STEPS_PER_BAR;
      const bar = Math.floor(this.count / STEPS_PER_BAR) % bars;
      const time = grid + (step % 2 === 1 ? swing * this.sixteenth : 0);
      this.track.play(this.kit, step, bar, time, this.sixteenth);
      this.count += 1;
    }
  }

  fadeOut() {
    const now = this.ctx.currentTime;
    const gain = this.bus.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(Math.max(0.0001, gain.value), now);
    gain.exponentialRampToValueAtTime(0.0001, now + FADE_OUT);
    this.crackle.stop(now + FADE_OUT + 0.05);
    return FADE_OUT;
  }

  disconnect() {
    this.bus.disconnect();
  }
}

/* ------------------------------------------------------------------------ */
/* Player                                                                     */
/* ------------------------------------------------------------------------ */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let crackle: AudioBuffer | null = null;
let deck: Deck | null = null;
let timer = 0;
let hiddenPause = false;
let suspendTimer = 0;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

/** Background tabs throttle timers, which would make the scheduler stutter,
 *  so music pauses while hidden, with a short fade either side (no pops). */
function onVisibility() {
  if (!ctx || !master) return;
  const audio = ctx;
  const gain = master.gain;
  const now = audio.currentTime;
  window.clearTimeout(suspendTimer);
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(gain.value, now);
  if (document.hidden) {
    if (!deck) return;
    hiddenPause = true;
    gain.setTargetAtTime(0, now, 0.015);
    suspendTimer = window.setTimeout(() => void audio.suspend().catch(() => {}), 90);
  } else if (hiddenPause) {
    hiddenPause = false;
    void audio.resume().then(() => {
      if (!master) return;
      const at = audio.currentTime;
      master.gain.cancelScheduledValues(at);
      master.gain.setValueAtTime(0, at);
      master.gain.setTargetAtTime(MUSIC_GAIN, at, 0.08);
    }).catch(() => {});
  }
}

function ensureContext() {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;
  const Constructor =
    window.AudioContext ??
    (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Constructor) return null;
  try {
    ctx = new Constructor({ latencyHint: "playback" });
  } catch {
    return null;
  }
  master = ctx.createGain();
  master.gain.value = MUSIC_GAIN;
  // Glue for the mix, and a guard against any pile-up of notes.
  const glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -18;
  glue.knee.value = 10;
  glue.ratio.value = 4;
  glue.attack.value = 0.01;
  glue.release.value = 0.2;
  master.connect(glue);
  glue.connect(ctx.destination);
  noise = makeNoise(ctx, 2);
  crackle = makeCrackle(ctx, 6);
  // Playing state depends on the context actually running (autoplay rules).
  ctx.addEventListener("statechange", notify);
  document.addEventListener("visibilitychange", onVisibility);
  return ctx;
}

function tick() {
  if (ctx && deck) deck.scheduleUntil(ctx.currentTime + LOOKAHEAD);
}

function retire(old: Deck) {
  const seconds = old.fadeOut();
  window.setTimeout(() => old.disconnect(), (seconds + 0.6) * 1000);
}

/** Starts (or crossfades to) a record's loop. Call from a user gesture. */
export function startMusic(id: MusicTrackId) {
  const audio = ensureContext();
  if (!audio || !master || !noise || !crackle) return;
  void audio.resume().catch(() => {});
  if (deck?.id === id) {
    notify();
    return;
  }
  if (deck) retire(deck);
  deck = new Deck(audio, master, id, noise, crackle);
  tick();
  if (!timer) timer = window.setInterval(tick, TICK_MS);
  notify();
}

/** Crossfades to another record, but only if music is already playing. */
export function switchMusic(id: MusicTrackId) {
  if (deck && deck.id !== id) startMusic(id);
}

export function stopMusic() {
  if (!deck) return;
  retire(deck);
  deck = null;
  hiddenPause = false;
  window.clearInterval(timer);
  timer = 0;
  notify();
}

/** True only when a loop is loaded and audible, or paused for a hidden tab.
 *  A context the browser refused to start (no gesture) doesn't count. */
export function isMusicPlaying() {
  return deck !== null && (ctx?.state === "running" || hiddenPause);
}

export function subscribeMusic(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Renders a few bars of a track offline and returns its peak level (0..1),
 * for checking the mix without speakers.
 */
export async function measureTrackPeak(id: MusicTrackId, seconds = 8) {
  const offline = new OfflineAudioContext(2, Math.ceil(44100 * seconds), 44100);
  const out = offline.createGain();
  out.gain.value = MUSIC_GAIN;
  out.connect(offline.destination);
  const offlineDeck = new Deck(offline, out, id, makeNoise(offline, 2), makeCrackle(offline, 6));
  offlineDeck.scheduleUntil(seconds);
  const buffer = await offline.startRendering();
  let peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) peak = Math.max(peak, Math.abs(data[i]));
  }
  return peak;
}
