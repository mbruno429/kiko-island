// Saved pictures live in IndexedDB on the tablet. If the browser refuses storage,
// everything still works from memory for the current session.

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

const DB = 'kikos-island';
const ART = 'art';
const KV = 'kv';

const memArt = new Map<string, Art>();
const memKv = new Map<string, unknown>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

function open(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB, 1);
        req.onupgradeneeded = () => {
          req.result.createObjectStore(ART, { keyPath: 'id' });
          req.result.createObjectStore(KV);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
        req.onblocked = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
  return dbPromise;
}

function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  return open().then(
    (db) =>
      new Promise<T | undefined>((resolve) => {
        if (!db) return resolve(undefined);
        try {
          const req = fn(db.transaction(store, mode).objectStore(store));
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      }),
  );
}

export async function listArt(): Promise<Art[]> {
  const fromDb = (await run<Art[]>(ART, 'readonly', (s) => s.getAll())) ?? [];
  const all = new Map<string, Art>();
  for (const a of fromDb) all.set(a.id, a);
  for (const a of memArt.values()) all.set(a.id, a);
  return [...all.values()].sort((a, b) => b.created - a.created);
}

export async function getArt(id: string): Promise<Art | undefined> {
  return memArt.get(id) ?? (await run<Art>(ART, 'readonly', (s) => s.get(id)));
}

export async function putArt(art: Art): Promise<void> {
  memArt.set(art.id, art);
  const ok = await run(ART, 'readwrite', (s) => s.put(art));
  if (ok !== undefined) memArt.delete(art.id);
}

export async function deleteArt(id: string): Promise<void> {
  memArt.delete(id);
  await run(ART, 'readwrite', (s) => s.delete(id));
}

export async function getDraft(): Promise<Draft | undefined> {
  return (memKv.get('draft') as Draft | undefined) ?? (await run<Draft>(KV, 'readonly', (s) => s.get('draft')));
}

export async function setDraft(draft: Draft): Promise<void> {
  memKv.set('draft', draft);
  const ok = await run(KV, 'readwrite', (s) => s.put(draft, 'draft'));
  if (ok !== undefined) memKv.delete('draft');
}

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
