import { INK } from './ui';

// Kiko is this app's own character: a round, three-eyed blue alien with four arms,
// glowing antennae and a garland of sampaguita (white jasmine) flowers.
// The same geometry draws the coloured character and the colouring-page outline.
// Limbs are open paths that start and end on the body's edge, so the outline version
// has no hidden lines showing through. The outline version masks the body's lines under
// the garland flowers for the same reason.

export const KIKO_W = 300;
export const KIKO_H = 340;

/** Eye centres in Kiko's own coordinates, used to make the pupils follow a finger. */
export const KIKO_EYES = [
  { x: 112, y: 168 },
  { x: 188, y: 168 },
  { x: 150, y: 120 },
];

/** Flower centres of the sampaguita garland, hanging in an arc under Kiko's smile. */
const GARLAND_R = 15;
const GARLAND: Array<[number, number]> = [12, 38, 64, 90, 116, 142, 168].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return [Math.round(150 + 88 * Math.cos(a)), Math.round(222 + 64 * Math.sin(a))];
});

export function kikoMarkup(opts: { outline?: boolean; stroke?: number } = {}): string {
  const o = !!opts.outline;
  const sw = opts.stroke ?? 7;
  const fill = (c: string) => (o ? 'none' : c);
  const body = fill('#2d6cf0');
  const dark = fill('#1f4fc4');
  const eye = (cx: number, cy: number, r: number, pr: number) => `
    <g class="kiko-eye">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill('#fff')}"/>
      <g class="kiko-pupil">
        <circle cx="${cx}" cy="${cy}" r="${pr}" fill="${INK}" stroke="none"/>
        ${o ? '' : `<circle cx="${cx + pr * 0.35}" cy="${cy - pr * 0.35}" r="${pr * 0.32}" fill="#fff" stroke="none"/>`}
      </g>
    </g>`;
  return `
  <g class="kiko" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
    ${o ? '' : `<ellipse cx="150" cy="330" rx="96" ry="13" fill="rgba(43,31,77,.2)" stroke="none"/>`}
    <g class="kiko-wrap">
      <g class="kiko-ant kiko-ant-l">
        <path d="M116 100C104 62 84 46 70 32" fill="none"/>
        <circle class="kiko-bulb" cx="66" cy="24" r="16" fill="${fill('#ffd23f')}"/>
      </g>
      <g class="kiko-ant kiko-ant-r">
        <path d="M184 100C196 62 216 46 230 32" fill="none"/>
        <circle class="kiko-bulb" cx="234" cy="24" r="16" fill="${fill('#ffd23f')}"/>
      </g>
      <g ${o ? 'mask="url(#kiko-garland-cut)"' : ''}>
        <path d="M85 288C62 300 64 330 96 330C120 330 136 328 135 316" fill="${dark}"/>
        <path d="M215 288C238 300 236 330 204 330C180 330 164 328 165 316" fill="${dark}"/>
        <path d="M52 216C22 216 8 256 28 274C42 286 62 284 71 270" fill="${body}"/>
        <path d="M248 216C278 216 292 256 272 274C258 286 238 284 229 270" fill="${body}"/>
        <g class="kiko-arm kiko-arm-l">
          <path d="M64 150C42 132 38 108 42 90C46 74 24 68 14 86C0 112 14 172 53 195" fill="${body}"/>
        </g>
        <g class="kiko-arm kiko-arm-r">
          <path d="M236 150C258 132 262 108 258 90C254 74 276 68 286 86C300 112 286 172 247 195" fill="${body}"/>
        </g>
        <ellipse cx="150" cy="205" rx="98" ry="112" fill="${body}"/>
        <ellipse cx="150" cy="248" rx="60" ry="58" fill="${fill('#cfe2ff')}" ${o ? `stroke-width="${sw * 0.7}"` : 'stroke="none"'}/>
      </g>
      ${
        o
          ? `<mask id="kiko-garland-cut" maskUnits="userSpaceOnUse" x="-20" y="-20" width="340" height="380">
               <rect x="-20" y="-20" width="340" height="380" fill="#fff" stroke="none"/>
               ${GARLAND.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${GARLAND_R + sw / 2 - 0.5}" fill="#000" stroke="none"/>`).join('')}
             </mask>`
          : `<g fill="#1f4fc4" stroke="none"><circle cx="78" cy="140" r="9"/><circle cx="222" cy="146" r="7"/><circle cx="96" cy="118" r="5"/></g>
             <g fill="#ff8fb8" stroke="none" opacity=".8"><ellipse cx="82" cy="206" rx="13" ry="9"/><ellipse cx="218" cy="206" rx="13" ry="9"/></g>`
      }
      <g class="kiko-garland" stroke-width="${sw * 0.6}">
        ${GARLAND.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${GARLAND_R}" fill="${fill('#ffffff')}"/><circle cx="${x}" cy="${y}" r="4" fill="${fill('#ffd23f')}" stroke="${o ? INK : 'none'}"/>`).join('')}
      </g>
      ${eye(112, 168, 27, 12)}
      ${eye(188, 168, 27, 12)}
      ${eye(150, 120, 20, 9)}
      <path class="kiko-mouth" d="M112 216Q150 224 188 216Q150 272 112 216Z" fill="${fill('#5a1e3c')}"/>
      ${o ? '' : `<ellipse cx="150" cy="239" rx="14" ry="6" fill="#ff7a9a" stroke="none"/>`}
      <rect x="136" y="218" width="14" height="13" rx="3" fill="${fill('#fff')}" stroke-width="${sw * 0.6}"/>
    </g>
  </g>`;
}

/** A standalone Kiko picture, for places that are not already inside an SVG. */
export function kikoSvg(className = ''): string {
  return `<svg class="${className}" viewBox="0 0 ${KIKO_W} ${KIKO_H}" aria-hidden="true">${kikoMarkup()}</svg>`;
}

const TRICKS = ['jump', 'spin', 'wiggle', 'squish'] as const;

/** Play a random trick on a `.kiko` element. Returns the trick so callers can pick a sound. */
export function kikoTrick(kiko: Element, trick?: (typeof TRICKS)[number]): string {
  const t = trick ?? TRICKS[Math.floor(Math.random() * TRICKS.length)];
  kiko.removeAttribute('data-trick');
  // Reading a layout value restarts the CSS animation when the same trick repeats.
  void (kiko as SVGGElement).getBoundingClientRect();
  kiko.setAttribute('data-trick', t);
  return t;
}
