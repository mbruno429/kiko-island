// Sound effects are synthesised here. The spoken Tagalog words are clips: see voice.ts.
type Ctor = typeof AudioContext;
let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = localStorage.getItem('kiko.muted') === '1';
} catch {
  /* storage unavailable: sound stays on */
}

export const isMuted = () => muted;
export function setMuted(m: boolean): void {
  muted = m;
  try {
    localStorage.setItem('kiko.muted', m ? '1' : '0');
  } catch {
    /* ignore */
  }
}

/** The shared audio context, or null while sound is switched off or unavailable. */
export function audioContext(): AudioContext | null {
  return ac();
}

function ac(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) {
      const C: Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: Ctor }).webkitAudioContext;
      // iPhones mute web page sound when the ring/silent switch is on silent. Asking for the
      // "playback" kind of audio (as music and video apps do) lets it play anyway; the
      // sound button in the app is then the way to make it quiet.
      const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (session) {
        try {
          session.type = 'playback';
        } catch {
          /* older iPhones: sound follows the silent switch */
        }
      }
      ctx = new C();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/**
 * iPhones and iPads only allow sound once the page has been touched, and only count a
 * finished tap for that. Call once at start-up; the first tap anywhere wakes the audio up.
 */
export function unlockAudio(onAwake?: () => void): void {
  let told = false;
  const wake = () => {
    const a = ac();
    if (!a) return;
    if (!told) {
      told = true;
      onAwake?.();
    }
    const src = a.createBufferSource();
    src.buffer = a.createBuffer(1, 1, 22050);
    src.connect(a.destination);
    src.start(0);
    if (a.state === 'running') {
      document.removeEventListener('touchend', wake);
      document.removeEventListener('click', wake);
    }
  };
  document.addEventListener('touchend', wake);
  document.addEventListener('click', wake);
}

interface Tone {
  from: number;
  to?: number;
  dur: number;
  at?: number;
  type?: OscillatorType;
  gain?: number;
}

function tone({ from, to = from, dur, at = 0, type = 'sine', gain = 0.18 }: Tone): void {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(dur: number, from: number, to: number, gain = 0.25): void {
  const a = ac();
  if (!a) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 0.9;
  const t = a.currentTime;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(a.destination);
  src.start(t);
}

export const sfx = {
  pop: () => tone({ from: 620, to: 240, dur: 0.09, gain: 0.2 }),
  tick: () => tone({ from: 880, to: 700, dur: 0.05, gain: 0.1, type: 'triangle' }),
  boop: (step = 0) => tone({ from: 330 * Math.pow(2, step / 12), to: 300 * Math.pow(2, step / 12), dur: 0.14, type: 'triangle', gain: 0.2 }),
  bonk: () => {
    tone({ from: 190, to: 80, dur: 0.18, gain: 0.3 });
    tone({ from: 420, to: 380, dur: 0.05, type: 'square', gain: 0.05 });
  },
  splash: () => noise(0.45, 2400, 500),
  whoosh: () => noise(0.35, 500, 3000, 0.16),
  giggle: () => {
    const base = 520 + Math.random() * 160;
    [0, 3, 1, 5, 2, 7].forEach((s, i) =>
      tone({ from: base * Math.pow(2, s / 12), to: base * Math.pow(2, (s + 3) / 12), dur: 0.08, at: i * 0.085, type: 'triangle', gain: 0.16 }),
    );
  },
  beep: () => {
    [0, 7, 12, 7].forEach((s, i) => tone({ from: 700 * Math.pow(2, s / 12), dur: 0.09, at: i * 0.1, type: 'square', gain: 0.06 }));
  },
  fanfare: () => {
    [0, 4, 7, 12, 16].forEach((s, i) =>
      tone({ from: 392 * Math.pow(2, s / 12), dur: i === 4 ? 0.5 : 0.16, at: i * 0.11, type: 'triangle', gain: 0.2 }),
    );
  },
};
