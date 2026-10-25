// tools/make-tutorial-pictures.mjs — makes the 5 tutorial pictures:
// real screenshots of Minute Zero, cropped, with amber arrows + a ring around
// the button each card talks about. NOT part of the app (the app has no build step);
// run it only if the screens change and the pictures need updating.
//
//   npm install playwright   (once)
//   node tools/make-tutorial-pictures.mjs
//   then convert the PNGs in tools/out/ to WebP (quality 80) into images/
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import fs from 'fs';
const OUT = fileURLToPath(new URL('./out', import.meta.url));
fs.mkdirSync(OUT, { recursive: true });
const W = 375, H = 300;                       // crop in CSS px; x2 = 750x600 (4:3)
// CHROMIUM_PATH (optional): use an already-installed Chromium instead of Playwright's own.
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await b.newContext({ viewport: { width: W, height: 740 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
const PAGE = new URL('../index.html', import.meta.url).href;
const still = () => p.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });

// Draw arrows. Each mark: {sel, from:[dx,dy] (arrow tail, relative to the target's center
// in CSS px), shape:'rect'|'circle'}. Returns nothing; adds an SVG over the page.
async function mark(marks) {
  await p.evaluate((marks) => {
    document.querySelectorAll('.tut-overlay').forEach(e => e.remove());
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'tut-overlay');
    const dh = document.documentElement.scrollHeight;
    svg.setAttribute('width', innerWidth); svg.setAttribute('height', dh);
    Object.assign(svg.style, { position: 'absolute', left: 0, top: 0, zIndex: 9999, pointerEvents: 'none', overflow: 'visible' });
    const add = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
    const AMBER = '#f5c542', DARK = '#111';
    // Spotlight: dim everything except the marked buttons (holes cut with an SVG mask).
    const defs = add('defs', {});
    const mask = document.createElementNS(NS, 'mask'); mask.setAttribute('id', 'tut-mask'); defs.appendChild(mask);
    const mrect = (attrs) => { const e = document.createElementNS(NS, attrs.tag); delete attrs.tag; for (const k in attrs) e.setAttribute(k, attrs[k]); mask.appendChild(e); };
    mrect({ tag: 'rect', x: 0, y: 0, width: innerWidth, height: dh, fill: 'white' });
    for (const m of marks) {
      const r = document.querySelector(m.sel).getBoundingClientRect();
      const x = r.left + scrollX, y = r.top + scrollY;
      if (m.shape === 'circle') mrect({ tag: 'ellipse', cx: x + r.width / 2, cy: y + r.height / 2, rx: r.width / 2 + 5, ry: r.height / 2 + 5, fill: 'black' });
      else mrect({ tag: 'rect', x: x - 5, y: y - 5, width: r.width + 10, height: r.height + 10, rx: 16, fill: 'black' });
    }
    add('rect', { x: 0, y: 0, width: innerWidth, height: dh, fill: 'rgba(0,0,0,0.6)', mask: 'url(#tut-mask)' });
    for (const m of marks) {
      const r = document.querySelector(m.sel).getBoundingClientRect();
      const x = r.left + scrollX, y = r.top + scrollY, cx = x + r.width / 2, cy = y + r.height / 2;
      const pad = 5;
      // ring around the target (dark under amber so it shows on any color)
      for (const [c, w] of [[DARK, 9], [AMBER, 5]]) {
        if (m.shape === 'circle') add('ellipse', { cx, cy, rx: r.width / 2 + pad, ry: r.height / 2 + pad, fill: 'none', stroke: c, 'stroke-width': w });
        else add('rect', { x: x - pad, y: y - pad, width: r.width + 2 * pad, height: r.height + 2 * pad, rx: 16, fill: 'none', stroke: c, 'stroke-width': w });
      }
      // arrow: from the tail toward the center, stopping at the ring's edge
      if (!m.from) continue;
      const tx = cx + m.from[0], ty = cy + m.from[1];
      let dx = cx - tx, dy = cy - ty; const len = Math.hypot(dx, dy); dx /= len; dy /= len;
      const hw = r.width / 2 + pad + 6, hh = r.height / 2 + pad + 6;
      const t = m.shape === 'circle' ? Math.min(hw, hh) : Math.min(Math.abs(dx) > 1e-6 ? hw / Math.abs(dx) : 1e9, Math.abs(dy) > 1e-6 ? hh / Math.abs(dy) : 1e9);
      const ex = cx - dx * t, ey = cy - dy * t;           // arrow tip
      const L = 20, S = 13;                               // head length / half width
      const bx = ex - dx * L, by = ey - dy * L;
      const head = `${ex},${ey} ${bx - dy * S},${by + dx * S} ${bx + dy * S},${by - dx * S}`;
      add('line', { x1: tx, y1: ty, x2: bx, y2: by, stroke: DARK, 'stroke-width': 12, 'stroke-linecap': 'round' });
      add('polygon', { points: head, fill: DARK, stroke: DARK, 'stroke-width': 6, 'stroke-linejoin': 'round' });
      add('line', { x1: tx, y1: ty, x2: bx, y2: by, stroke: AMBER, 'stroke-width': 7, 'stroke-linecap': 'round' });
      add('polygon', { points: head, fill: AMBER });
    }
    document.body.appendChild(svg);
  }, marks);
}
// Screenshot a W x H window starting at page y (clamped to the page).
async function shot(name, y) {
  const dh = await p.evaluate(() => document.documentElement.scrollHeight);
  y = Math.max(0, Math.min(Math.round(y), dh - H));
  await p.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y, width: W, height: H }, fullPage: true });
}
const topOf = (sel) => p.$eval(sel, e => e.getBoundingClientRect().top + scrollY);

// 1. Call 911 / Text 911 (top bar)
await p.goto(PAGE); await still();
await mark([{ sel: '#call911', from: [0, 85] }, { sel: '#text911-top', from: [0, 85] }]);
await shot('tutorial-call911', 0);

// 2. START
await mark([{ sel: '#btn-start', from: [-170, -125], shape: 'circle' }]);
const st = await p.$eval('#btn-start', e => { const r = e.getBoundingClientRect(); return r.top + scrollY + r.height / 2; });
await shot('tutorial-start', st - H / 2);

// 3. Pick what you see: "Not sure?" and the first situation
await p.click('#btn-start'); await still();
await p.$eval('.tut-overlay', e => e.remove()).catch(() => {});
const notSure = '#scenario-list > :nth-child(1)';
const second = '#scenario-list > :nth-child(2)';
await mark([{ sel: notSure, from: [110, -80] }, { sel: second }]);
const y3 = await topOf(notSure);
await shot('tutorial-pick', y3 - 75);

// 4. Dispatcher mode: big log buttons
await p.click('#scenario-list >> text=Severe bleeding');
await p.click('#btn-mode-dispatcher'); await still();
const firstLog = '#screen-dispatcher .js-log-actions > :nth-child(1)';
await mark([{ sel: firstLog, from: [150, -95] }]);
const y4 = await topOf('#screen-dispatcher .js-log-actions');
await shot('tutorial-log', y4 - 95);

// 5. Handoff button
await p.click(firstLog);
await p.$eval('.tut-overlay', e => e.remove());
const hand = '#log-panel .js-open-handoff';
await mark([{ sel: hand, from: [140, -85] }]);
const y5 = await topOf(hand);
await shot('tutorial-handoff', y5 - 130);
await b.close();
