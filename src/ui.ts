export const INK = '#2b1f4d';

/** Build one element from an HTML string. */
export function h<T extends HTMLElement = HTMLElement>(html: string): T {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild as T;
}

export function $<T extends Element = HTMLElement>(root: ParentNode, sel: string): T {
  const found = root.querySelector(sel);
  if (!found) throw new Error(`missing ${sel}`);
  return found as T;
}

/** A button that only fires after being held, so small hands can't trigger it by accident. */
export function holdButton(btn: HTMLElement, ms: number, fire: () => void): void {
  let timer = 0;
  const cancel = () => {
    window.clearTimeout(timer);
    btn.classList.remove('holding');
  };
  btn.style.setProperty('--hold-ms', `${ms}ms`);
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.classList.add('holding');
    timer = window.setTimeout(() => {
      cancel();
      fire();
    }, ms);
  });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) btn.addEventListener(ev, cancel);
}

const svg = (body: string) =>
  `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const icons = {
  home: svg(
    `<path d="M11 22V41H37V22" fill="#ffd23f"/><path d="M6 25 24 8l18 17" /><rect x="20" y="29" width="8" height="12" fill="#ff6b5e"/>`,
  ),
  brush: svg(
    `<path d="M41 6 22 27l5 5L43 9c1-2-1-4-2-3Z" fill="#ffd23f"/><path d="M22 27c-6-1-10 3-10 8 0 3-2 5-5 6 8 3 17 0 20-9Z" fill="#ff6b5e"/>`,
  ),
  eraser: svg(
    `<path d="M27 8 6 29l9 10h10l17-17Z" fill="#ff8fb8"/><path d="m16 19 14 14" /><path d="M15 39h27"/>`,
  ),
  undo: svg(`<path d="M17 11 7 20l10 9"/><path d="M8 20h20a10 10 0 0 1 0 20h-9"/>`),
  pages: svg(
    `<path d="M10 6h20l9 9v27H10Z" fill="#fffdf7"/><path d="M30 6v9h9"/><path d="m24 21 2.4 5 5.6.6-4.2 3.8 1.2 5.6-5-2.8-5 2.8 1.2-5.6-4.200-3.8 5.600-.6Z" fill="#ffd23f" stroke-width="3"/>`,
  ),
  trash: svg(
    `<path d="M11 14h26l-2 27H13Z" fill="#bfe9f5"/><path d="M7 14h34M19 14V8h10v6M20 22v12M28 22v12"/>`,
  ),
  save: svg(
    `<rect x="6" y="6" width="36" height="36" rx="4" fill="#fffdf7"/><path d="M24 34c-9-6-12-10-12-14a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 4-3 8-12 14Z" fill="#ff6b5e"/>`,
  ),
  art: svg(
    `<rect x="14" y="6" width="28" height="24" rx="3" fill="#bfe9f5"/><rect x="6" y="17" width="28" height="25" rx="3" fill="#fffdf7"/><path d="m10 37 7-9 5 6 3-3 6 6" fill="#3ecf6e"/><circle cx="26" cy="24" r="3" fill="#ffd23f" stroke-width="3"/>`,
  ),
  close: svg(`<path d="m12 12 24 24M36 12 12 36" stroke-width="6"/>`),
  soundOn: svg(
    `<path d="M7 19h8l10-9v28l-10-9H7Z" fill="#ffd23f"/><path d="M32 17c3 4 3 10 0 14M37 11c6 7 6 19 0 26"/>`,
  ),
  soundOff: svg(`<path d="M7 19h8l10-9v28l-10-9H7Z" fill="#d9d4e6"/><path d="m32 18 10 12M42 18 32 30"/>`),
};
