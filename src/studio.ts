import { $, h, icons } from './ui';
import { sfx } from './audio';
import { kikoSvg } from './kiko';
import { PAGE_IDS, PAPER_H as H, PAPER_W as W, pageImage, pageUrl } from './pages';
import { drawStamp, stampIcon, STAMPS, type StampId } from './stamps';
import { getArt, getDraft, newId, putArt, setDraft } from './store';
import type { Nav, Screen } from './main';

const COLORS = ['rainbow', '#ff4d4d', '#ff9a3c', '#ffd23f', '#3ecf6e', '#19c3c9', '#3d8bff', '#8a5cf0', '#ff7ac8', '#9b6a44', '#2b1f4d', '#ffffff'];
const COLOR_NAMES = ['Rainbow', 'Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Pink', 'Brown', 'Black', 'White'];
const STAMP_COLORS: Record<StampId, string> = {
  star: '#ffd23f', heart: '#ff4d4d', flower: '#ff7ac8', fish: '#ff9a3c', shell: '#19c3c9', sun: '#ffb627', kiko: '#2d6cf0',
};
const BRUSH = [12, 30, 64];
const STAMP = [90, 150, 230];
const UNDO_MAX = 8;

type Tool = 'brush' | 'eraser' | StampId;
interface Pt { x: number; y: number }
interface Stroke { last: Pt; mid: Pt; lastStamp: Pt }

const blobOf = (cv: HTMLCanvasElement) => new Promise<Blob | null>((res) => cv.toBlob(res, 'image/png'));

function drawBlob(c: CanvasRenderingContext2D, blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    const done = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onload = () => {
      c.drawImage(img, 0, 0, W, H);
      done();
    };
    img.onerror = done;
    img.src = url;
  });
}

export function studio(nav: Nav, params: { artId?: string } = {}): Screen {
  const el = h(`
    <div class="screen studio">
      <aside class="rail rail-left">
        <button class="btn round" id="studio-home" aria-label="Home">${icons.home}</button>
        <div class="swatches">
          ${COLORS.map((c, i) => `<button class="swatch" data-color="${c}" style="--c:${c === 'rainbow' ? 'transparent' : c}" aria-label="${COLOR_NAMES[i]}"></button>`).join('')}
        </div>
      </aside>
      <div class="paper-wrap">
        <div class="paper">
          <canvas width="${W}" height="${H}" aria-label="Drawing paper"></canvas>
          <img class="lines" alt="" draggable="false">
        </div>
      </div>
      <aside class="rail rail-right">
        ${[14, 26, 42].map((d, i) => `<button class="btn round size" data-size="${i}" aria-label="${['Small', 'Medium', 'Big'][i]} size"><i style="width:${d}px;height:${d}px"></i></button>`).join('')}
        <button class="btn round" id="undo" aria-label="Undo">${icons.undo}</button>
        <button class="btn round" id="pages" aria-label="Colouring pages">${icons.pages}</button>
        <button class="btn round" id="trash" aria-label="Start a new picture">${icons.trash}</button>
        <button class="btn round save" id="save" aria-label="Save to My Art">${icons.save}</button>
      </aside>
      <div class="tray">
        <button class="btn round tool" data-tool="brush" aria-label="Paintbrush">${icons.brush}</button>
        <button class="btn round tool" data-tool="eraser" aria-label="Eraser">${icons.eraser}</button>
        ${STAMPS.map((s) => `<button class="btn round tool stamp" data-tool="${s}" aria-label="${s} stamp"></button>`).join('')}
      </div>
    </div>`);

  const wrap = $(el, '.paper-wrap');
  const paper = $(el, '.paper');
  const canvas = $<HTMLCanvasElement>(el, 'canvas');
  const lines = $<HTMLImageElement>(el, '.lines');
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  el.querySelectorAll<HTMLElement>('.tool.stamp').forEach((b) => b.appendChild(stampIcon(b.dataset.tool as StampId, STAMP_COLORS[b.dataset.tool as StampId])));

  let tool: Tool = 'brush';
  let size = 1;
  let color = 'rainbow';
  let hue = Math.random() * 360;
  let page = 'blank';
  let artId: string | null = null;
  let hasPaint = false;
  let alive = true;
  let draftTimer = 0;
  const undo: ImageData[] = [];
  const strokes = new Map<number, Stroke>();

  // --- layout: keep the paper 3:2 and as large as the space allows ---
  const fit = () => {
    const r = wrap.getBoundingClientRect();
    const w = Math.max(60, Math.min(r.width, (r.height - 10) * 1.5));
    paper.style.width = `${w}px`;
    paper.style.height = `${w / 1.5}px`;
  };
  const ro = new ResizeObserver(fit);
  ro.observe(wrap);

  const sync = () => {
    el.querySelectorAll<HTMLElement>('.swatch').forEach((b) => b.classList.toggle('on', b.dataset.color === color));
    el.querySelectorAll<HTMLElement>('.size').forEach((b) => b.classList.toggle('on', Number(b.dataset.size) === size));
    el.querySelectorAll<HTMLElement>('.tool').forEach((b) => b.classList.toggle('on', b.dataset.tool === tool));
  };
  const setPage = (id: string) => {
    page = PAGE_IDS.includes(id) ? id : 'blank';
    lines.src = pageUrl(page);
  };

  // --- saving ---
  const saveDraft = async () => {
    window.clearTimeout(draftTimer);
    const paint = hasPaint ? await blobOf(canvas) : null;
    await setDraft({ page, paint, artId });
  };
  const queueDraft = () => {
    window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(() => void saveDraft(), 1200);
  };

  /** The picture as it looks on screen: paint with the page's lines on top. */
  const snapshot = (): HTMLCanvasElement => {
    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const c = out.getContext('2d') as CanvasRenderingContext2D;
    c.drawImage(canvas, 0, 0);
    if (lines.complete && lines.naturalWidth) c.drawImage(lines, 0, 0, W, H);
    return out;
  };

  let saving = false;
  const saveArt = async () => {
    if (saving) return;
    if (!hasPaint) {
      sfx.tick();
      const btn = $(el, '#save');
      btn.classList.remove('nope');
      void btn.offsetWidth;
      btn.classList.add('nope');
      return;
    }
    saving = true;
    try {
      // Celebrate straight away; encoding the picture can take a moment on a tablet.
      const picture = snapshot();
      cheer(picture);
      const [paint, full] = await Promise.all([blobOf(canvas), blobOf(picture)]);
      if (!paint) return;
      const existing = artId ? await getArt(artId) : undefined;
      artId = artId ?? newId();
      await putArt({ id: artId, created: existing?.created ?? Date.now(), page, paint, full: full ?? paint });
      void saveDraft();
    } finally {
      saving = false;
    }
  };

  const cheer = (picture: HTMLCanvasElement) => {
    if (!alive) return;
    const colors = ['#ffd23f', '#ff6b5e', '#3ecf6e', '#ff7ac8', '#3d8bff'];
    const bits = Array.from({ length: 18 }, (_, i) =>
      `<i class="bit" style="--x:${(Math.random() * 100).toFixed(0)}%;--d:${(Math.random() * 0.5).toFixed(2)}s;--r:${(Math.random() * 360).toFixed(0)}deg;background:${colors[i % colors.length]}"></i>`,
    ).join('');
    const o = h(`
      <div class="overlay cheer" role="status">
        ${bits}
        <div class="cheer-row">
          <figure class="frame"></figure>
          ${kikoSvg('cheer-kiko')}
        </div>
        <p class="banner">Ang galing!<small>Saved to My Art</small></p>
      </div>`);
    $(o, '.frame').appendChild(picture);
    const close = () => o.remove();
    o.addEventListener('pointerdown', close);
    window.setTimeout(close, 2600);
    el.appendChild(o);
    sfx.fanfare();
  };

  // --- drawing ---
  const pushUndo = () => {
    try {
      undo.push(ctx.getImageData(0, 0, W, H));
      if (undo.length > UNDO_MAX) undo.shift();
    } catch {
      /* out of memory: carry on without this undo step */
    }
  };
  const pos = (e: PointerEvent): Pt => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const ink = () => {
    if (color !== 'rainbow') return color;
    hue = (hue + 5) % 360;
    return `hsl(${hue.toFixed(0)} 95% 58%)`;
  };
  const stampAt = (p: Pt) => {
    const id = tool as StampId;
    const c = color === 'rainbow' ? `hsl(${(Math.random() * 360).toFixed(0)} 90% 60%)` : color;
    drawStamp(ctx, id, p.x, p.y, STAMP[size], c, (Math.random() - 0.5) * 0.5);
    sfx.boop([0, 2, 4, 7, 9, 12][Math.floor(Math.random() * 6)]);
  };
  const dot = (p: Pt) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  };
  const prepare = () => {
    const erasing = tool === 'eraser';
    ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    ctx.lineWidth = BRUSH[size] * (erasing ? 1.6 : 1);
    ctx.strokeStyle = ctx.fillStyle = erasing ? '#000' : ink();
  };

  const down = (e: PointerEvent) => {
    e.preventDefault();
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety */
    }
    if (strokes.size === 0) pushUndo();
    const p = pos(e);
    strokes.set(e.pointerId, { last: p, mid: p, lastStamp: p });
    hasPaint = hasPaint || tool !== 'eraser';
    if (tool === 'brush' || tool === 'eraser') {
      prepare();
      dot(p);
    } else {
      stampAt(p);
    }
  };

  const extend = (s: Stroke, p: Pt) => {
    if (tool === 'brush' || tool === 'eraser') {
      prepare();
      const m = { x: (s.last.x + p.x) / 2, y: (s.last.y + p.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(s.mid.x, s.mid.y);
      ctx.quadraticCurveTo(s.last.x, s.last.y, m.x, m.y);
      ctx.stroke();
      s.mid = m;
      s.last = p;
    } else if (Math.hypot(p.x - s.lastStamp.x, p.y - s.lastStamp.y) > STAMP[size] * 0.9) {
      stampAt(p);
      s.lastStamp = p;
    }
  };

  const move = (e: PointerEvent) => {
    const s = strokes.get(e.pointerId);
    if (!s) return;
    e.preventDefault();
    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    for (const ev of events.length ? events : [e]) extend(s, pos(ev));
  };

  const up = (e: PointerEvent) => {
    const s = strokes.get(e.pointerId);
    if (!s) return;
    if (tool === 'brush' || tool === 'eraser') {
      prepare();
      ctx.beginPath();
      ctx.moveTo(s.mid.x, s.mid.y);
      ctx.lineTo(s.last.x, s.last.y);
      ctx.stroke();
    }
    strokes.delete(e.pointerId);
    ctx.globalCompositeOperation = 'source-over';
    queueDraft();
  };

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  // --- controls ---
  el.querySelectorAll<HTMLElement>('.swatch').forEach((b) =>
    b.addEventListener('click', () => {
      color = b.dataset.color as string;
      if (tool === 'eraser') tool = 'brush';
      sfx.tick();
      sync();
    }),
  );
  el.querySelectorAll<HTMLElement>('.size').forEach((b) =>
    b.addEventListener('click', () => {
      size = Number(b.dataset.size);
      sfx.tick();
      sync();
    }),
  );
  el.querySelectorAll<HTMLElement>('.tool').forEach((b) =>
    b.addEventListener('click', () => {
      tool = b.dataset.tool as Tool;
      sfx.pop();
      sync();
    }),
  );

  $(el, '#undo').addEventListener('click', () => {
    const prev = undo.pop();
    if (!prev) return sfx.tick();
    ctx.putImageData(prev, 0, 0);
    hasPaint = true;
    sfx.pop();
    queueDraft();
  });

  $(el, '#trash').addEventListener('click', () => {
    pushUndo();
    ctx.clearRect(0, 0, W, H);
    hasPaint = false;
    artId = null;
    sfx.whoosh();
    queueDraft();
  });

  $(el, '#save').addEventListener('click', () => void saveArt());

  $(el, '#pages').addEventListener('click', () => {
    sfx.pop();
    const o = h(`
      <div class="overlay">
        <div class="sheet" role="dialog" aria-label="Pick a page">
          ${PAGE_IDS.map((id) => `<button class="thumb ${id === page ? 'on' : ''}" data-page="${id}" aria-label="${id} page"><img src="${pageUrl(id)}" alt=""></button>`).join('')}
        </div>
      </div>`);
    o.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.thumb');
      if (btn) {
        setPage(btn.dataset.page as string);
        sfx.pop();
        queueDraft();
      }
      o.remove();
    });
    el.appendChild(o);
  });

  $(el, '#studio-home').addEventListener('click', () => {
    sfx.pop();
    nav('home');
  });

  const onHide = () => {
    if (document.visibilityState === 'hidden') void saveDraft();
  };
  document.addEventListener('visibilitychange', onHide);

  // --- restore: nothing a child drew is ever lost by leaving the studio ---
  const restore = async () => {
    const draft = await getDraft();
    const opening = params.artId && params.artId !== draft?.artId ? await getArt(params.artId) : undefined;
    if (opening) {
      if (draft?.paint) {
        // Tuck the unfinished picture into the gallery before opening another one.
        const scratch = document.createElement('canvas');
        scratch.width = W;
        scratch.height = H;
        const sc = scratch.getContext('2d') as CanvasRenderingContext2D;
        await drawBlob(sc, draft.paint);
        try {
          sc.drawImage(await pageImage(draft.page), 0, 0, W, H);
        } catch {
          /* keep the paint */
        }
        const old = draft.artId ? await getArt(draft.artId) : undefined;
        await putArt({ id: draft.artId ?? newId(), created: old?.created ?? Date.now(), page: draft.page, paint: draft.paint, full: (await blobOf(scratch)) ?? draft.paint });
      }
      setPage(opening.page);
      artId = opening.id;
      await drawBlob(ctx, opening.paint);
      hasPaint = true;
      void saveDraft();
    } else if (draft) {
      setPage(draft.page);
      artId = draft.artId;
      if (draft.paint) {
        await drawBlob(ctx, draft.paint);
        hasPaint = true;
      }
    }
  };

  setPage('blank');
  sync();
  void restore();

  return {
    el,
    destroy() {
      alive = false;
      ro.disconnect();
      document.removeEventListener('visibilitychange', onHide);
      void saveDraft();
    },
  };
}
