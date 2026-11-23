import { audioContext } from './audio';

// Spoken Tagalog words. Every clip in src/voice/ is built into the page, so speech works
// offline like everything else. A word that has no clip is simply not spoken.
const files = import.meta.glob<string>('./voice/*.mp3', { eager: true, query: '?inline', import: 'default' });

/** Word id (the clip's file name) to its MP3 data as base64 text. */
const clips = new Map<string, string>();
for (const [path, dataUri] of Object.entries(files)) {
  clips.set(path.slice(path.lastIndexOf('/') + 1, -'.mp3'.length), dataUri.slice(dataUri.indexOf(',') + 1));
}

const decoded = new Map<string, Promise<AudioBuffer | null>>();

function load(a: AudioContext, id: string): Promise<AudioBuffer | null> {
  let pending = decoded.get(id);
  if (!pending) {
    pending = new Promise<AudioBuffer | null>((resolve) => {
      try {
        const text = atob(clips.get(id) ?? '');
        const bytes = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
        // Passing callbacks keeps this working on older iPhones, which return no promise.
        const promise = a.decodeAudioData(bytes.buffer, resolve, () => resolve(null)) as Promise<AudioBuffer> | undefined;
        promise?.catch(() => resolve(null));
      } catch {
        resolve(null);
      }
    });
    decoded.set(id, pending);
  }
  return pending;
}

interface Saying {
  id: string;
  source: AudioBufferSourceNode | null;
  /** Clock time by which this word will have finished. */
  until: number;
}
let saying: Saying | null = null;

/** Stop whatever word is being said. */
export function hush(): void {
  if (saying?.source) {
    try {
      saying.source.onended = null;
      saying.source.stop();
    } catch {
      /* it had already finished */
    }
  }
  saying = null;
}

/**
 * Say a word out loud. `delay` (ms) leaves room for the tap's sound effect to finish first.
 * Asking again for the word already being said lets it finish; a different word cuts in.
 */
export function speak(id: string, delay = 0): void {
  if (!clips.has(id)) return;
  const a = audioContext();
  if (!a) return;
  const asked = performance.now();
  if (saying && saying.id === id && asked < saying.until) return;
  hush();
  const mine: Saying = { id, source: null, until: asked + delay + 4000 };
  saying = mine;
  void load(a, id).then((buffer) => {
    if (!buffer || saying !== mine) return;
    const source = a.createBufferSource();
    source.buffer = buffer;
    source.connect(a.destination);
    const wait = Math.max(0, asked + delay - performance.now()) / 1000;
    source.start(a.currentTime + wait);
    source.onended = () => {
      if (saying === mine) saying = null;
    };
    mine.source = source;
    mine.until = performance.now() + (wait + buffer.duration) * 1000;
  });
}

/** Decode every clip ahead of time, so the first tap on each thing speaks without a pause. */
export function warmVoice(): void {
  const a = audioContext();
  if (!a) return;
  for (const id of clips.keys()) void load(a, id);
}
