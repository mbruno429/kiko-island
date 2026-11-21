// Saved pictures live in IndexedDB on the device. If the browser refuses storage, or
// stalls, everything still works from memory for the current session.
//
// Pictures are stored as raw bytes (ArrayBuffer) rather than Blob objects: Safari on
// iPhone and iPad has a history of failing to read Blobs back out of IndexedDB.

export interface Art {
  id: string;
  created: number;
  /** Which colouring page the lines came from. */
  page: string;
  /** The paint layer only (transparent), so the picture can be reopened and edited. */
  paint: Blob;
  /** Paint plus line art on a transparent background: the gallery picture and future sticker. */
  full: Blob;
}

export interface Draft {
  page: string;
  paint: Blob | null;
  /** The gallery picture this draft was opened from, if any. */
  artId: string | null;
}

/** What is actually kept on disk. Blob only appears in records written by the first versions. */
type Bytes = ArrayBuffer | Blob;
interface ArtRecord extends Omit<Art, 'paint' | 'full'> {
  paint: Bytes;
  full: Bytes;
}
interface DraftRecord extends Omit<Draft, 'paint'> {
  paint: Bytes | null;
}

const DB = 'kikos-island';
const ART = 'art';
const KV = 'kv';
/** How long to wait for the browser's storage before carrying on without it. */
const PATIENCE = 4000;

const memArt = new Map<string, Art>();
let memDraft: Draft | undefined;
let dbPromise: Promise<IDBDatabase | null> | null = null;

const toBytes = (b: Blob): Promise<ArrayBuffer> =>
  typeof b.arrayBuffer === 'function' ? b.arrayBuffer() : new Response(b).arrayBuffer();
const toBlob = (b: Bytes): Blob => (b instanceof Blob ? b : new Blob([b], { type: 'image/png' }));

/** Run `start`, but settle on `fallback` if it has not answered within `ms` or throws. */
function patient<T>(fallback: T, start: (done: (value: T) => void) => void, ms = PATIENCE): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    const done = (value: T) => {
      clearTimeout(timer);
      resolve(value);
    };
    try {
      start(done);
    } catch {
      done(fallback);
    }
  });
}

function open(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = patient<IDBDatabase | null>(null, (done) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(ART, { keyPath: 'id' });
        req.result.createObjectStore(KV);
      };
      req.onsuccess = () => done(req.result);
      req.onerror = () => done(null);
      req.onblocked = () => done(null);
    });
  }
  return dbPromise;
}

async function read<T>(store: string, ask: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  const db = await open();
  if (!db) return undefined;
  return patient<T | undefined>(undefined, (done) => {
    const req = ask(db.transaction(store, 'readonly').objectStore(store));
    req.onsuccess = () => done(req.result);
    req.onerror = () => done(undefined);
  });
}

/** Resolves true only once the change is safely committed. */
async function commit(store: string, change: (s: IDBObjectStore) => void): Promise<boolean> {
  const db = await open();
  if (!db) return false;
  return patient(false, (done) => {
    const tx = db.transaction(store, 'readwrite');
    tx.oncomplete = () => done(true);
    tx.onerror = () => done(false);
    tx.onabort = () => done(false);
    change(tx.objectStore(store));
  });
}

// Changes run one at a time, in the order they were asked for, so a slow save can never
// land after (and undo) a newer one. A change that stalls is abandoned, not waited on.
let queue: Promise<unknown> = Promise.resolve();
function inOrder(change: () => Promise<boolean>): Promise<boolean> {
  const run = () => patient<boolean>(false, (done) => void change().then(done, () => done(false)), PATIENCE * 3);
  const result = queue.then(run, run);
  queue = result;
  return result;
}

export async function listArt(): Promise<Art[]> {
  const records = (await read<ArtRecord[]>(ART, (s) => s.getAll())) ?? [];
  const all = new Map<string, Art>();
  for (const r of records) {
    if (r && r.id && r.paint && r.full) all.set(r.id, { ...r, paint: toBlob(r.paint), full: toBlob(r.full) });
  }
  for (const a of memArt.values()) all.set(a.id, a);
  return [...all.values()].sort((a, b) => b.created - a.created);
}

export async function getArt(id: string): Promise<Art | undefined> {
  const held = memArt.get(id);
  if (held) return held;
  const r = await read<ArtRecord | undefined>(ART, (s) => s.get(id));
  return r && r.paint && r.full ? { ...r, paint: toBlob(r.paint), full: toBlob(r.full) } : undefined;
}

export async function putArt(art: Art): Promise<void> {
  memArt.set(art.id, art);
  const saved = await inOrder(async () => {
    const record: ArtRecord = { ...art, paint: await toBytes(art.paint), full: await toBytes(art.full) };
    return commit(ART, (s) => s.put(record));
  });
  // Keep the in-memory copy unless this exact picture is now safely on disk.
  if (saved && memArt.get(art.id) === art) memArt.delete(art.id);
}

export async function deleteArt(id: string): Promise<void> {
  memArt.delete(id);
  await inOrder(() => commit(ART, (s) => s.delete(id)));
}

export async function getDraft(): Promise<Draft | undefined> {
  if (memDraft) return memDraft;
  const r = await read<DraftRecord | undefined>(KV, (s) => s.get('draft'));
  return r ? { ...r, paint: r.paint ? toBlob(r.paint) : null } : undefined;
}

export async function setDraft(draft: Draft): Promise<void> {
  memDraft = draft;
  const saved = await inOrder(async () => {
    const record: DraftRecord = { ...draft, paint: draft.paint ? await toBytes(draft.paint) : null };
    return commit(KV, (s) => s.put(record, 'draft'));
  });
  if (saved && memDraft === draft) memDraft = undefined;
}

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
