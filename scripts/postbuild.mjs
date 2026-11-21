// Runs after `vite build`. From dist/index.html it writes:
//  - index.html at the repo root: the page GitHub Pages serves straight from the main branch.
//  - dist/preview.html: a head-less fragment (title + styles + body + scripts) for hosts
//    that wrap the page in their own document skeleton.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');

const note = '<!-- Built from src/ by "npm run build". Do not edit by hand: change src/ and rebuild. -->';
if (!/^<!doctype html>/i.test(html)) throw new Error('dist/index.html does not start with a doctype');
writeFileSync('index.html', html.replace(/^<!doctype html>/i, (doctype) => `${doctype}\n${note}`));

const grab = (re) => [...html.matchAll(re)].map((m) => m[0]);
const title = grab(/<title>[\s\S]*?<\/title>/g)[0];
const meta = grab(/<meta name="claude:[^>]*>/g).join('\n');
const styles = grab(/<style[\s\S]*?<\/style>/g).join('\n');
const scripts = grab(/<script[\s\S]*?<\/script>/g).join('\n');
writeFileSync('dist/preview.html', [title, meta, styles, '<div id="app"></div>', scripts].join('\n'));

console.log(`index.html ${(html.length / 1024).toFixed(0)} KB`);
