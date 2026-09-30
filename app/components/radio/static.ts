// A short burst of FM static for when the dial moves. Built from noise on the
// spot, so there's no sample to download. The context is started by the press
// that turns the radio on (primeStatic), which is what browsers need before
// making sound, and it's suspended again whenever nothing is crackling.

let context: AudioContext | null = null;
let sounding = 0;

export function primeStatic() {
  try {
    const primed = (context ??= new AudioContext());
    // Starting it once inside a press unlocks it for good; then it can rest.
    void primed.resume().then(() => {
      if (sounding === 0) void primed.suspend();
    });
  } catch {
    // No Web Audio: the dial just moves silently.
  }
}

export function playStatic(volume: number) {
  if (volume <= 0 || !context) return;
  try {
    if (context.state === "suspended") void context.resume();

    const duration = 0.24;
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      // Hiss with the odd pop in it.
      samples[i] = (Math.random() * 2 - 1) * (Math.random() < 0.06 ? 1 : 0.32);
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    const band = context.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 2200;
    band.Q.value = 0.6;
    const gain = context.createGain();
    const now = context.currentTime;
    const peak = 0.1 * (volume / 100);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(band).connect(gain).connect(context.destination);
    sounding += 1;
    source.onended = () => {
      sounding -= 1;
      if (sounding === 0) void context?.suspend();
    };
    source.start(now);
    source.stop(now + duration);
  } catch {
    // No Web Audio: the dial just moves silently.
  }
}
