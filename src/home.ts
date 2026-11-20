import { $, h, icons, INK } from './ui';
import { isMuted, setMuted, sfx } from './audio';
import { KIKO_EYES, kikoMarkup, kikoTrick } from './kiko';
import type { Nav, Screen } from './main';

const KX = 650;
const KY = 448;

const palm = (x: number, y: number, flip: boolean, scale: number) => `
  <g class="palm" transform="translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 0C20-130-10-270-60-380" stroke="${INK}" stroke-width="58" fill="none"/>
    <path d="M0 0C20-130-10-270-60-380" stroke="#c98a4b" stroke-width="44" fill="none"/>
    <path d="M0 0C20-130-10-270-60-380" stroke="#a36a30" stroke-width="44" stroke-dasharray="5 44" stroke-linecap="butt" fill="none"/>
    <g class="fronds" fill="#34b866" stroke="${INK}" stroke-width="7">
      <path d="M-60-380C-120-500-240-540-330-500C-230-490-140-450-60-380Z" fill="#2a9d58"/>
      <path d="M-60-380C0-500 120-540 210-500C110-490 20-450-60-380Z" fill="#2a9d58"/>
      <path d="M-60-380C-90-480-70-560-40-600C-30-530-30-450-60-380Z"/>
      <path d="M-60-380C-140-470-260-450-330-350C-240-400-150-400-60-380Z"/>
      <path d="M-60-380C20-470 140-450 210-350C120-400 30-400-60-380Z"/>
    </g>
    <circle cx="-40" cy="-356" r="22" fill="#7a4a22" stroke="${INK}" stroke-width="6"/>
    <circle class="coconut" cx="-82" cy="-358" r="22" fill="#7a4a22" stroke="${INK}" stroke-width="6"/>
  </g>`;

/** Gumamela, the red hibiscus. */
const gumamela = (x: number, y: number, scale: number) => `
  <g transform="translate(${x} ${y}) scale(${scale})">
    <g class="gumamela" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M0 0C-8-44-52-74-96-78C-62-50-30-30 0 0Z" fill="#34b866"/>
      <path d="M0 0C8-44 52-74 96-78C62-50 30-30 0 0Z" fill="#2a9d58"/>
      <path d="M0 0V-100" fill="none" stroke-width="9"/>
      <g fill="#e8334a">
        ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-172" rx="25" ry="34" transform="rotate(${a} 0 -134)"/>`).join('')}
      </g>
      <circle cx="0" cy="-134" r="13" fill="#b3122e"/>
      <path d="M0-134 26-176" fill="none" stroke-width="5"/><circle cx="28" cy="-180" r="8" fill="#ffd23f" stroke-width="4"/>
    </g>
  </g>`;

const cloud = (cls: string, y: number, s: number) => `
  <g transform="translate(0 ${y}) scale(${s})">
    <g class="cloud ${cls}"><g class="puff" fill="#fff">
      <ellipse cx="0" cy="0" rx="90" ry="38"/><ellipse cx="-50" cy="-26" rx="52" ry="36"/><ellipse cx="26" cy="-38" rx="60" ry="44"/>
    </g></g>
  </g>`;

const scene = `
<svg class="scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fb8ee"/><stop offset="1" stop-color="#c9f2fb"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22c1c9"/><stop offset="1" stop-color="#0b7fa3"/></linearGradient>
    <clipPath id="above-water"><rect x="-300" y="-600" width="600" height="600"/></clipPath>
    <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset="1" stop-color="#f4b860"/></linearGradient>
  </defs>
  <rect x="-400" y="-600" width="2400" height="1200" fill="url(#sky)"/>
  <g class="sun">
    <g class="sun-spin">
      <path d="${sunRays(1330, 170, 90, 136)}" fill="#ffb627" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    </g>
    <circle cx="1330" cy="170" r="84" fill="#ffd23f" stroke="${INK}" stroke-width="7"/>
    <g stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none">
      <path d="M1300 158v12M1360 158v12M1302 192q28 24 56 0"/>
    </g>
  </g>
  ${cloud('c1', 120, 1)}${cloud('c2', 250, 0.7)}${cloud('c3', 60, 0.55)}
  <g class="bulkan">
    <g class="smoke" fill="#fff"><ellipse cx="1100" cy="344" rx="24" ry="16"/><ellipse cx="1122" cy="320" rx="30" ry="20"/><ellipse cx="1102" cy="298" rx="22" ry="15"/></g>
    <path d="M790 600C930 566 1030 460 1076 384Q1090 362 1104 384C1150 460 1250 566 1390 600Z" fill="#58b383" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M1084 398C1068 456 1038 508 1000 560M1096 398C1112 460 1142 512 1182 560M1090 410V540" fill="none" stroke="#2f8f5b" stroke-width="6" stroke-linecap="round"/>
  </g>
  <rect class="sea" x="-400" y="560" width="2400" height="600" fill="url(#sea)"/>
  <path d="M-400 560H2000" stroke="${INK}" stroke-width="6"/>
  <g class="waves" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".55">
    <path class="wave" d="M90 640q26-22 52 0t52 0"/><path class="wave w2" d="M1180 660q26-22 52 0t52 0"/>
    <path class="wave w2" d="M420 690q26-22 52 0t52 0"/><path class="wave" d="M1420 730q26-22 52 0t52 0"/>
    <path class="wave" d="M-120 760q26-22 52 0t52 0"/><path class="wave w2" d="M930 610q26-22 52 0t52 0"/>
  </g>
  <g transform="translate(1068 628) scale(1.1)">
    <g class="bangka" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M0-8V-110" fill="none"/>
      <path d="M0 -104.0L12 -102.0L12 -17.0L0 -16.0Z" fill="#e8334a" stroke="none"/><path d="M12 -102.0L24 -100.0L24 -18.0L12 -17.0Z" fill="#ffd23f" stroke="none"/><path d="M24 -100.0L36 -98.0L36 -19.0L24 -18.0Z" fill="#3ecf6e" stroke="none"/><path d="M36 -98.0L48 -96.0L48 -20.0L36 -19.0Z" fill="#3d8bff" stroke="none"/>
      <path d="M0-104 48-96V-20L0-16Z" fill="none"/>
      <path d="M-32-2V20M32-2V20" fill="none"/>
      <path d="M-84-16C-56 14 56 14 84-16C56-2-56-2-84-16Z" fill="#fffdf7"/>
      <path d="M-62 2C-30 10 30 10 62 2" fill="none" stroke="#e8334a" stroke-width="5"/>
      <path d="M-58 22H58" fill="none" stroke-width="13"/><path d="M-58 22H58" fill="none" stroke="#d9b25a" stroke-width="5"/>
    </g>
  </g>
  <g class="fx-sea"></g>
  ${palm(300, 840, false, 1)}
  ${palm(1345, 850, true, 0.82)}
  <path d="M-420 1100C-100 780 500 700 800 700C1100 700 1700 780 2020 1100Z" fill="url(#sand)" stroke="${INK}" stroke-width="8"/>
  <g fill="#f0a94e" opacity=".7"><circle cx="980" cy="760" r="6"/><circle cx="300" cy="900" r="6"/><circle cx="1240" cy="850" r="7"/><circle cx="760" cy="930" r="6"/></g>
  <g transform="translate(494 800) scale(0.9)">
    <g class="kubo" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#d9b25a" stroke-width="5">
        <rect x="-98" y="-66" width="13" height="66"/><rect x="-36" y="-66" width="13" height="66"/><rect x="26" y="-66" width="13" height="66"/><rect x="88" y="-66" width="13" height="66"/>
      </g>
      <rect x="-112" y="-158" width="224" height="88" fill="#ecd08a"/>
      <path d="M-112-128H112M-112-100H112" fill="none" stroke="#c9a253" stroke-width="4"/>
      <rect x="-70" y="-146" width="46" height="76" fill="#6b4423"/>
      <rect x="24" y="-140" width="56" height="40" fill="#6b4423"/>
      <path d="M52-140V-100M24-120H80" fill="none" stroke-width="4"/>
      <rect x="-124" y="-78" width="248" height="16" rx="5" fill="#b07c26"/>
      <path d="M-70-62-80 0M-24-62-14 0M-73-42H-21M-76-22H-18" fill="none" stroke-width="5"/>
      <g class="kubo-roof">
        <path d="M-160-150-74-262H74L160-150Z" fill="#d6a443"/>
        <path d="M-160-150q16 18 32 0t32 0t32 0t32 0t32 0t32 0t32 0t32 0t32 0t32 0" fill="#b07c26"/>
        <path d="M-104-198H104M-84-232H84" fill="none" stroke="#b07c26" stroke-width="6"/>
      </g>
    </g>
  </g>
  ${gumamela(168, 940, 1)}${gumamela(1452, 962, 0.86)}
  <g class="saucer" transform="translate(1130 792) rotate(-13)" stroke="${INK}" stroke-width="7" stroke-linejoin="round">
    <path d="M-52-14C-52-78 52-78 52-14Z" fill="#a8ecff"/>
    <ellipse cx="0" cy="0" rx="118" ry="36" fill="#cfd6ea"/>
    <g class="saucer-lights" stroke-width="5"><circle cx="-66" cy="4" r="11"/><circle cx="0" cy="12" r="11"/><circle cx="66" cy="4" r="11"/></g>
  </g>
  <path d="M1010 826C1080 800 1200 806 1262 838Z" fill="#ffd98a" stroke="none"/>
  <path d="M1012 825C1080 800 1198 806 1260 837" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <path class="starfish" d="${starPath(372, 900, 46, 21)}" fill="#ff6b5e" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  <g class="kiko-spot" transform="translate(${KX} ${KY})">${kikoMarkup()}</g>
</svg>`;

// Tagalog words Kiko says, with their English meaning underneath.
const GREETINGS: Array<[string, string]> = [
  ['Kumusta!', 'hello'],
  ['Mabuhay!', 'welcome'],
  ['Salamat!', 'thank you'],
  ['Maganda!', 'beautiful'],
  ['Magaling!', 'well done'],
];
// The Tagalog name of each thing on the island, shown when it is tapped.
const NAMES = {
  araw: ['Araw', 'sun'],
  ulap: ['Ulap', 'cloud'],
  niyog: ['Niyog', 'coconut'],
  isda: ['Isda', 'fish'],
  bituin: ['Bituin', 'star'],
  bangka: ['Bangka', 'boat'],
  kubo: ['Bahay kubo', 'nipa hut'],
  bulaklak: ['Bulaklak', 'flower'],
  bulkan: ['Bulkan', 'volcano'],
} as const;

function starPath(cx: number, cy: number, outer: number, inner: number): string {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
  }
  return d + 'Z';
}

function sunRays(cx: number, cy: number, inner: number, outer: number): string {
  let d = '';
  // Eight rays, like the sun on the Philippine flag.
  for (let i = 0; i < 16; i++) {
    const r = i % 2 ? inner : outer;
    const a = (i * Math.PI) / 8;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
  }
  return d + 'Z';
}

const FISH_COLORS = ['#ff9a3c', '#ff7ac8', '#ffd23f', '#3ecf6e', '#ff6b5e'];

export function home(nav: Nav): Screen {
  const el = h(`
    <div class="screen home">
      ${scene}
      <header class="home-top">
        <h1 class="title" data-text="Kiko’s Island">Kiko’s Island</h1>
        <button class="btn round sound" id="sound-toggle" aria-label="Sound on or off"></button>
      </header>
      <div class="bubble" role="status"><b></b><span></span></div>
      <nav class="home-doors">
        <button class="door door-draw" id="open-studio">${icons.brush}<span>Draw<small>Gumuhit</small></span></button>
        <button class="door door-art" id="open-gallery">${icons.art}<span>My Art<small>Mga guhit ko</small></span></button>
      </nav>
    </div>`);

  const svg = $<SVGSVGElement>(el, '.scene');
  const kiko = $<SVGGElement>(el, '.kiko');
  const fx = $<SVGGElement>(el, '.fx-sea');

  const toSvg = (e: PointerEvent | MouseEvent) => {
    const m = svg.getScreenCTM();
    if (!m) return { x: 800, y: 500 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  // Kiko watches the finger.
  const pupils = [...el.querySelectorAll<SVGGElement>('.kiko-pupil')];
  const look = (e: PointerEvent) => {
    const p = toSvg(e);
    pupils.forEach((pupil, i) => {
      const dx = p.x - (KX + KIKO_EYES[i].x);
      const dy = p.y - (KY + KIKO_EYES[i].y);
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(i === 2 ? 7 : 10, d / 12);
      pupil.style.transform = `translate(${((dx / d) * reach).toFixed(1)}px, ${((dy / d) * reach).toFixed(1)}px)`;
    });
  };
  el.addEventListener('pointermove', look);
  el.addEventListener('pointerdown', look);

  const restart = (node: Element, cls: string) => {
    node.classList.remove(cls);
    void node.getBoundingClientRect();
    node.classList.add(cls);
  };

  // Speech bubble: a Tagalog word with its meaning.
  const bubble = $(el, '.bubble');
  const spot = $<SVGGElement>(el, '.kiko-spot');
  let greeting = 0;
  let bubbleTimer = 0;
  /** Put the bubble above Kiko, or beside Kiko when the screen is too short for that. */
  const placeBubble = () => {
    const host = el.getBoundingClientRect();
    const k = spot.getBoundingClientRect();
    const t = $(el, '.title').getBoundingClientRect();
    const w = bubble.offsetWidth;
    const hgt = bubble.offsetHeight;
    let side = 'above';
    let left = k.left + k.width / 2 - w / 2;
    let top = k.top - hgt - 16;
    const hitsTitle = top < t.bottom + 4 && left < t.right && left + w > t.left;
    if (top < host.top + 6 || hitsTitle) {
      side = 'right';
      left = k.right + 14;
      top = Math.max(host.top + 8, k.top + k.height * 0.12);
      if (left + w > host.right - 8) {
        side = 'left';
        left = k.left - w - 14;
      }
    }
    left = Math.max(host.left + 8, Math.min(left, host.right - w - 8));
    bubble.dataset.side = side;
    bubble.style.left = `${left - host.left}px`;
    bubble.style.top = `${top - host.top}px`;
  };
  const say = ([word, meaning]: readonly [string, string]) => {
    $(bubble, 'b').textContent = word;
    $(bubble, 'span').textContent = meaning;
    placeBubble();
    restart(bubble, 'show');
    window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(() => bubble.classList.remove('show'), 2600);
  };
  /** Tapping a thing plays its little animation and sound, and Kiko says its name. */
  const toy = (sel: string, name: readonly [string, string] | null, sound: () => void, target?: string) =>
    el.querySelectorAll(sel).forEach((node) =>
      node.addEventListener('pointerdown', () => {
        restart(target ? $(node, target) : node, 'go');
        sound();
        if (name) say(name);
      }),
    );

  kiko.addEventListener('pointerdown', () => {
    kikoTrick(kiko);
    sfx.giggle();
    greeting = (greeting + 1) % GREETINGS.length;
    say(GREETINGS[greeting]);
  });
  toy('.sun', NAMES.araw, () => sfx.boop(12), '.sun-spin');
  toy('.cloud', NAMES.ulap, () => sfx.pop(), '.puff');
  toy('.palm', NAMES.niyog, () => window.setTimeout(() => sfx.bonk(), 420));
  toy('.starfish', NAMES.bituin, () => sfx.boop(7));
  toy('.saucer', null, () => sfx.beep());
  toy('.kubo', NAMES.kubo, () => sfx.boop(4));
  toy('.bangka', NAMES.bangka, () => sfx.splash());
  toy('.gumamela', NAMES.bulaklak, () => sfx.boop(9));
  toy('.bulkan', NAMES.bulkan, () => sfx.whoosh(), '.smoke');
  const hello = window.setTimeout(() => say(GREETINGS[0]), 700);

  $(el, '.sea').addEventListener('pointerdown', (e) => {
    const p = toSvg(e as PointerEvent);
    const color = FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)];
    const dir = Math.random() < 0.5 ? -1 : 1;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${p.x.toFixed(0)} ${Math.max(600, p.y).toFixed(0)}) scale(${dir} 1)`);
    g.innerHTML = `
      <ellipse class="ripple" cx="0" cy="0" rx="50" ry="12" fill="none" stroke="#fff" stroke-width="6"/>
      <g clip-path="url(#above-water)"><g class="jumper" stroke="${INK}" stroke-width="5" stroke-linejoin="round">
        <path d="M22 0 50-20V20Z" fill="${color}"/><ellipse cx="0" cy="0" rx="34" ry="21" fill="${color}"/>
        <circle cx="-16" cy="-5" r="4" fill="${INK}" stroke="none"/>
      </g></g>`;
    fx.appendChild(g);
    sfx.splash();
    say(NAMES.isda);
    window.setTimeout(() => g.remove(), 1000);
  });

  const sound = $(el, '#sound-toggle');
  const paintSound = () => (sound.innerHTML = isMuted() ? icons.soundOff : icons.soundOn);
  paintSound();
  sound.addEventListener('click', () => {
    setMuted(!isMuted());
    paintSound();
    sfx.pop();
  });

  $(el, '#open-studio').addEventListener('click', () => {
    sfx.pop();
    nav('studio');
  });
  $(el, '#open-gallery').addEventListener('click', () => {
    sfx.pop();
    nav('gallery');
  });

  return {
    el,
    destroy() {
      window.clearTimeout(hello);
      window.clearTimeout(bubbleTimer);
    },
  };
}
