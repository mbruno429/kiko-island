import { INK } from './ui';
import { kikoMarkup } from './kiko';

// Colouring pages: line art that sits on top of the paint, so the lines never get covered.
// Every page is drawn for a 1500 x 1000 sheet with transparent fills.

export const PAPER_W = 1500;
export const PAPER_H = 1000;

const sheet = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAPER_W} ${PAPER_H}" width="${PAPER_W}" height="${PAPER_H}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const star = (cx: number, cy: number, r: number) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return `<path d="${d}Z"/>`;
};

const waves = (y: number, from: number, to: number, step = 75) => {
  let d = `M${from} ${y}`;
  for (let x = from; x < to; x += step) d += `q${step / 4} -34 ${step / 2} 0t${step / 2} 0`;
  return `<path d="${d}"/>`;
};

const kikoPage = sheet(`
  <g transform="translate(360 56) scale(2.6)">${kikoMarkup({ outline: true, stroke: 4.6 })}</g>
  <path d="M90 944H520M1010 944H1410"/>
  ${star(190, 200, 70)}${star(1290, 170, 86)}${star(1220, 560, 50)}${star(250, 610, 44)}
  <circle cx="1130" cy="330" r="22"/><circle cx="330" cy="400" r="18"/>
`);

const fishPage = sheet(`
  ${waves(110, 0, 1500, 150)}
  <path d="M300 500C450 250 900 250 1050 500C900 750 450 750 300 500Z"/>
  <path d="M1050 500 1290 320C1240 440 1240 560 1290 680Z"/>
  <path d="M560 324C610 190 770 180 810 316"/>
  <path d="M640 690C680 780 770 790 800 688"/>
  <circle cx="470" cy="450" r="46"/><circle cx="470" cy="450" r="18" fill="${INK}"/>
  <path d="M370 560Q430 610 500 572"/>
  <path d="M620 372Q690 500 620 628"/>
  <path d="M760 420q50 40 0 80M760 520q50 40 0 80M880 440q44 34 0 68M880 520q44 34 0 68"/>
  <circle cx="200" cy="390" r="38"/><circle cx="150" cy="270" r="24"/><circle cx="235" cy="200" r="15"/>
  <path d="M1180 1000C1140 920 1230 880 1190 800C1160 740 1230 700 1210 640"/>
  <path d="M1330 1000C1370 930 1290 900 1330 830C1356 784 1310 750 1330 710"/>
  <path d="M120 1000C160 940 90 900 130 840"/>
  ${star(420, 880, 60)}
`);

const saucerPage = sheet(`
  <path d="M560 372C560 196 940 196 940 372"/>
  <ellipse cx="750" cy="470" rx="420" ry="110"/>
  <circle cx="750" cy="300" r="44"/>
  <circle cx="734" cy="294" r="8" fill="${INK}"/><circle cx="766" cy="294" r="8" fill="${INK}"/>
  <path d="M732 316Q750 332 768 316"/>
  <path d="M728 262Q718 236 704 228M772 262Q782 236 796 228"/>
  <circle cx="470" cy="486" r="30"/><circle cx="610" cy="516" r="30"/><circle cx="750" cy="526" r="30"/><circle cx="890" cy="516" r="30"/><circle cx="1030" cy="486" r="30"/>
  <path d="M580 572 470 900M920 572 1030 900"/>
  <path d="M470 900Q750 960 1030 900"/>
  <circle cx="1270" cy="210" r="92"/>
  <path d="M1168 248C1110 290 1140 320 1290 262C1440 204 1450 150 1362 166"/>
  ${star(200, 180, 70)}${star(330, 640, 46)}${star(1250, 700, 64)}${star(1060, 130, 36)}${star(140, 420, 34)}
  <circle cx="1180" cy="480" r="16"/><circle cx="380" cy="300" r="14"/>
`);

// A beach scene with a bahay kubo (nipa hut on stilts) and a coconut palm.
const islandPage = sheet(`
  <circle cx="1290" cy="190" r="92"/>
  <path d="M1290 56V22M1290 358V324M1156 190H1122M1458 190H1424M1195 95 1171 71M1409 309 1385 285M1195 285 1171 309M1409 71 1385 95"/>
  <path transform="translate(-250 -70)" d="M1040 300a66 66 0 0 1 112-56a80 80 0 0 1 146 14a60 60 0 0 1 12 118h-260a52 52 0 0 1-10-76Z"/>
  <path d="M150 800C350 620 1150 620 1350 800"/>
  <g transform="translate(-350 36)">
    <path d="M705 668C690 550 715 450 752 398"/>
    <path d="M775 666C765 560 792 470 826 410"/>
    <path d="M790 320C700 230 560 250 480 350C590 310 700 318 790 320Z"/>
    <path d="M800 320C880 220 1030 230 1110 330C1000 300 900 310 800 320Z"/>
    <path d="M780 300C720 190 590 160 500 200C610 210 710 250 780 300Z"/>
    <path d="M810 300C860 190 990 150 1080 190C980 204 880 246 810 300Z"/>
    <path d="M795 292C770 200 790 130 830 90C836 160 826 236 795 292Z"/>
    <circle cx="762" cy="366" r="28"/><circle cx="824" cy="378" r="28"/>
  </g>
  <g transform="translate(130 0)">
    <path d="M580 470 672 374H828L920 470Z"/>
    <path d="M636 438H864M664 406H836"/>
    <rect x="620" y="470" width="260" height="110"/>
    <rect x="656" y="496" width="62" height="84"/>
    <rect x="768" y="500" width="72" height="50"/><path d="M804 500V550M768 525H840"/>
    <rect x="600" y="580" width="300" height="26"/>
    <rect x="636" y="606" width="22" height="60"/><rect x="704" y="606" width="22" height="62"/><rect x="772" y="606" width="22" height="66"/><rect x="840" y="606" width="22" height="72"/>
  </g>
  ${star(1060, 742, 52)}
  <path d="M520 722q30-34 60 0M1150 772q26-30 52 0"/>
  ${waves(800, 0, 150)}${waves(800, 1350, 1500)}
  ${waves(880, 0, 1500, 150)}${waves(960, 0, 1500, 150)}
`);

// A parol: the star-shaped lantern hung at Christmas.
const parolPage = (() => {
  const cx = 750;
  const cy = 440;
  const at = (deg: number, r: number): [number, number] => [cx + Math.cos((deg * Math.PI) / 180) * r, cy + Math.sin((deg * Math.PI) / 180) * r];
  const f = ([x, y]: [number, number]) => `${x.toFixed(0)} ${y.toFixed(0)}`;
  let star5 = '';
  let facets = '';
  let dots = '';
  for (let i = 0; i < 10; i++) {
    const v = at(-90 + i * 36, i % 2 ? 122 : 300);
    star5 += `${i ? 'L' : 'M'}${f(v)}`;
    facets += `M${cx} ${cy}L${f(v)}`;
    if (i % 2) {
      const [x, y] = at(-90 + i * 36, 250);
      dots += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="34"/>`;
    }
  }
  const tassel = (x: number) => `<path d="M${x} 725V760M${x - 22} 760H${x + 22}L${x + 38} 930H${x - 38}ZM${x - 12} 800 ${x - 16} 930M${x + 12} 800 ${x + 16} 930"/>`;
  return sheet(`
    <circle cx="${cx}" cy="79" r="26"/>
    <circle cx="${cx}" cy="${cy}" r="335"/>
    <path d="${star5}Z"/><path d="${facets}"/>
    ${dots}${tassel(574)}${tassel(926)}
  `);
})();

// A jeepney, seen from the side.
const jeepneyPage = sheet(`
  <path d="M210 700V580Q210 540 250 540H430L500 400Q510 380 540 380H1250Q1290 380 1290 420V700H1195A115 115 0 0 0 965 700H535A115 115 0 0 0 305 700Z"/>
  <circle cx="420" cy="715" r="92"/><circle cx="420" cy="715" r="38"/>
  <circle cx="1080" cy="715" r="92"/><circle cx="1080" cy="715" r="38"/>
  <path d="M532 420H552V524H480Z"/>
  <rect x="590" y="420" width="140" height="104"/><rect x="750" y="420" width="140" height="104"/><rect x="910" y="420" width="140" height="104"/><rect x="1070" y="420" width="140" height="104"/>
  <path d="M240 566H1290"/>
  <path d="M600 380V330H1220V380M755 330V380M910 330V380M1065 330V380"/>
  <circle cx="250" cy="606" r="22"/>
  <path d="M210 650H168V692H210"/>
  <path d="M300 540V462M300 462 356 482 300 502"/>
  ${star(660, 636, 36)}${star(750, 636, 36)}${star(840, 636, 36)}
  <path d="M60 812H1440"/>
  <path transform="translate(-880 -180)" d="M1040 300a66 66 0 0 1 112-56a80 80 0 0 1 146 14a60 60 0 0 1 12 118h-260a52 52 0 0 1-10-76Z"/>
  <circle cx="1300" cy="170" r="76"/>
  <path d="M1300 60V30M1300 310V280M1190 170H1160M1440 170H1410M1222 92 1201 71M1399 269 1378 248M1222 248 1201 269M1399 71 1378 92"/>
  <path d="M130 900H330M480 900H680M830 900H1030M1180 900H1380"/>
`);

export const PAGES: Record<string, string> = {
  blank: sheet(''),
  kiko: kikoPage,
  fish: fishPage,
  saucer: saucerPage,
  island: islandPage,
  parol: parolPage,
  jeepney: jeepneyPage,
};
export const PAGE_IDS = Object.keys(PAGES);

export const pageUrl = (id: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PAGES[id] ?? PAGES.blank)}`;

/** Load a page as an image that can be drawn onto a canvas when saving. */
export function pageImage(id: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = pageUrl(id);
  });
}
