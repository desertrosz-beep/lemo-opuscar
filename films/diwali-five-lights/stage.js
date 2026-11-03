// Stage for "Five Lamps": carved teak frame, the Lamp Rail (five clay diyas, labels carved in the wood), cut-letter plaques,
// the channel plaque and the storyteller's subtitle placard.
import { piece, fill, cut, cutLine, ink, within, smooth, poly, cloud, beadLine, coin, plum, canvas } from './carve.js';
import { DYE } from './fig.js';
import { diyaPath, flamePath } from './props.js';
import { vnoise } from '/core/lib.js';

export const RAIL_Y = 1150;                                   // rail top, stage coords (cloth bottom = 1080)
export const RAIL_X = [480, 720, 960, 1200, 1440];
export const LABELS = ['HOME', 'FORTUNE', 'FREEDOM', 'RELEASE', 'KNOWLEDGE'];

// ---- frame: teak pillars, a scalloped arch lintel with a mango-leaf toran, the stage lip; spill = light on the inner edges
export function drawFrame(g, Cam, spill = 1) {
  g.save(); g.setTransform(Cam[0], Cam[1], Cam[2], Cam[3], Cam[4], Cam[5]);
  const teak = '#2a1308', teak2 = '#45200e', gold = '#9a7034';
  g.fillStyle = teak; g.fillRect(-600, -700, 3120, 700);
  // scalloped arch along the bottom of the lintel
  g.fillStyle = teak2; g.beginPath(); g.moveTo(-300, -30);
  for (let x = -300; x < 2220; x += 120) g.quadraticCurveTo(x + 60, 26, x + 120, -30);
  g.lineTo(2220, -200); g.lineTo(-300, -200); g.closePath(); g.fill();
  g.strokeStyle = gold; g.lineWidth = 3; g.beginPath(); g.moveTo(-300, -30); for (let x = -300; x < 2220; x += 120) g.quadraticCurveTo(x + 60, 26, x + 120, -30); g.stroke();
  for (let x = -240; x < 2200; x += 120) { g.beginPath(); g.arc(x, -110, 26, 0, 7); g.stroke(); g.beginPath(); g.arc(x, -110, 9, 0, 7); g.stroke(); }
  g.beginPath(); g.moveTo(-300, -200); g.lineTo(2220, -200); g.stroke();
  // toran: mango leaves + marigold beads hanging from the lintel
  for (let x = -260; x < 2200; x += 40) { const y = -6 + 18 * Math.sin((x + 260) / 240 * Math.PI) ** 2;
    g.fillStyle = '#1d3a14'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 9, y + 18, x, y + 36); g.quadraticCurveTo(x + 9, y + 18, x, y); g.fill();
    g.fillStyle = '#5a2a08'; g.beginPath(); g.arc(x + 20, y + 4, 7, 0, 7); g.fill(); }
  // pillars
  for (const x of [-260, 1920]) {
    const gr = g.createLinearGradient(x, 0, x + 260, 0); gr.addColorStop(0, '#160904'); gr.addColorStop(.5, '#3e1b0b'); gr.addColorStop(1, '#160904');
    g.fillStyle = gr; g.fillRect(x, -700, 260, 2400);
    g.strokeStyle = gold; g.lineWidth = 2.5; g.strokeRect(x + 30, 40, 200, 960);
    for (let y = 120; y < 1000; y += 140) { g.beginPath(); g.arc(x + 130, y, 30, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x + 100, y); g.lineTo(x + 160, y); g.moveTo(x + 130, y - 30); g.lineTo(x + 130, y + 30); g.stroke(); }
  }
  // stage lip
  g.fillStyle = teak; g.fillRect(-600, 1080, 3120, 900);
  g.fillStyle = '#5a2810'; g.fillRect(-300, 1080, 2520, 40);
  g.strokeStyle = gold; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-300, 1120); g.lineTo(2220, 1120); g.stroke();
  g.globalCompositeOperation = 'lighter';
  const sp = (x0, y0, x1, y1, gx0, gy0, gx1, gy1) => { const gr = g.createLinearGradient(gx0, gy0, gx1, gy1); gr.addColorStop(0, `rgba(255,170,90,${.3 * spill})`); gr.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); };
  sp(-300, -120, 2220, 0, 0, 0, 0, -120); sp(-300, 1080, 2220, 1200, 0, 1080, 0, 1200); sp(-160, -30, 0, 1110, 0, 0, -160, 0); sp(1920, -30, 2080, 1110, 1920, 0, 2080, 0);
  g.restore();
}

// ---- the Lamp Rail (front layer: real wood and clay, lit by its own flames). lit[k] = 0..1 flame size, t for flicker
let RAIL = null;
function railSprite() {
  if (RAIL) return RAIL;
  const [c, g] = canvas(1400, 220);
  g.translate(-260, -RAIL_Y + 60);
  const wood = '#3a1a0a';
  g.fillStyle = wood; g.beginPath(); g.moveTo(300, RAIL_Y); g.lineTo(1620, RAIL_Y); g.lineTo(1640, RAIL_Y + 30); g.lineTo(1610, RAIL_Y + 110); g.lineTo(310, RAIL_Y + 110); g.lineTo(280, RAIL_Y + 30); g.closePath(); g.fill();
  g.strokeStyle = '#8a6430'; g.lineWidth = 2.4; g.strokeRect(312, RAIL_Y + 34, 1296, 66);
  // lotus scallops along the top edge
  g.fillStyle = '#4e240e'; for (let x = 300; x < 1620; x += 30) { g.beginPath(); g.moveTo(x, RAIL_Y); g.quadraticCurveTo(x + 15, RAIL_Y - 16, x + 30, RAIL_Y); g.fill(); }
  // carved labels: cut into the wood, so they read as darker grooves with a lit lower lip
  g.font = '700 30px "Cormorant Garamond"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '4px';
  RAIL_X.forEach((x, k) => { g.fillStyle = 'rgba(214,160,90,.75)'; g.fillText(LABELS[k], x, RAIL_Y + 69 + 1.5); g.fillStyle = '#120703'; g.fillText(LABELS[k], x, RAIL_Y + 69); });
  for (let k = 0; k < 4; k++) { const x = (RAIL_X[k] + RAIL_X[k + 1]) / 2; g.fillStyle = '#8a6430'; g.beginPath(); g.arc(x, RAIL_Y + 67, 4, 0, 7); g.fill(); }
  RAIL = c; return c;
}
// clay diya on the rail (front layer)
function clayDiya(g, x, y, s) {
  g.fillStyle = '#6a2e12'; g.beginPath(); diyaPath(g, x, y, s); g.fill();
  g.strokeStyle = '#a0521e'; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(x - 40 * s, y + 4 * s); g.quadraticCurveTo(x, y + 9 * s, x + 46 * s, y + 2 * s); g.stroke();
  g.fillStyle = '#2a1206'; g.beginPath(); g.ellipse(x + 2 * s, y + 3 * s, 34 * s, 4 * s, 0, 0, 7); g.fill();     // oil
  g.strokeStyle = '#1a0a04'; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(x + 52 * s, y - 2 * s); g.lineTo(x + 60 * s, y - 8 * s); g.stroke(); // wick
}
export function flame(g, x, y, s, t, a = 1, seed = 0) {      // additive flame + glow at the wick tip (x,y)
  if (a <= 0) return;
  const f = 1 + .08 * Math.sin(t * 31 + seed) + .07 * vnoise(t * 9 + seed * 7) - .03, sw = (vnoise(t * 5 + 3 + seed) - .5) * 5 * s;
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, a);
  let gr = g.createRadialGradient(x, y - 16 * s, 0, x, y - 16 * s, 220 * s * a); gr.addColorStop(0, 'rgba(255,190,110,.5)'); gr.addColorStop(.3, 'rgba(255,150,70,.16)'); gr.addColorStop(1, 'rgba(255,120,40,0)');
  g.fillStyle = gr; g.fillRect(x - 240 * s, y - 260 * s, 480 * s, 480 * s);
  const h = 40 * s * f * a;
  g.beginPath(); g.moveTo(x - 7 * s, y); g.quadraticCurveTo(x - 10 * s, y - h * .45, x + sw, y - h); g.quadraticCurveTo(x + 10 * s, y - h * .45, x + 7 * s, y); g.closePath();
  gr = g.createLinearGradient(0, y, 0, y - h); gr.addColorStop(0, 'rgba(120,150,255,.8)'); gr.addColorStop(.18, 'rgba(255,240,200,1)'); gr.addColorStop(.6, 'rgba(255,190,90,.95)'); gr.addColorStop(1, 'rgba(255,120,40,.2)');
  g.fillStyle = gr; g.fill();
  g.restore();
}
export function smokeWisp(g, x, y, s, t, age, seed = 1) {
  if (age <= 0 || age > 4) return;
  g.save(); g.lineCap = 'round';
  for (let w = 0; w < 2; w++) {
    let px = x, py = y; const len = Math.min(1, age / 1.5) * 160 * s;
    for (let i = 1; i < 30; i++) { const u = i / 29, xx = x + Math.sin(u * 5 + t * .9 + seed + w * 2) * 10 * u * s + (vnoise(u * 3 + t * .4 + seed + w) - .5) * 30 * u * s, yy = y - u * len;
      g.strokeStyle = `rgba(150,110,80,${.22 * (1 - u) * Math.max(0, 1 - age / 4)})`; g.lineWidth = (2 + u * 8) * s; g.beginPath(); g.moveTo(px, py); g.lineTo(xx, yy); g.stroke(); px = xx; py = yy; }
  }
  g.restore();
}
// draw the rail in stage coords through Cam; lit[k] flame level; smoke[k] age since snuffed
export function drawRail(g, Cam, t, lit, smoke = [], glow = 1) {
  const k = Cam[0];
  g.save(); g.setTransform(Cam[0], 0, 0, Cam[3], Cam[4], Cam[5]);
  g.drawImage(railSprite(), 260, RAIL_Y - 60);
  // warm light from the lit diyas on the wood
  g.globalCompositeOperation = 'lighter';
  RAIL_X.forEach((x, i) => { const a = lit[i] || 0; if (a <= 0) return; const gr = g.createRadialGradient(x + 40, RAIL_Y, 0, x + 40, RAIL_Y, 200); gr.addColorStop(0, `rgba(255,160,80,${.32 * a * glow})`); gr.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = gr; g.fillRect(x - 200, RAIL_Y - 200, 480, 330); });
  g.globalCompositeOperation = 'source-over';
  RAIL_X.forEach((x, i) => clayDiya(g, x - 20, RAIL_Y - 14, .9));
  g.restore();
  RAIL_X.forEach((x, i) => {
    const wx = Cam[0] * (x - 20 + 58 * .9) + Cam[4], wy = Cam[3] * (RAIL_Y - 14 - 8 * .9) + Cam[5];
    if (lit[i] > 0) flame(g, wx, wy, .95 * k, t, lit[i], i * 3);
    if (smoke[i] > 0) smokeWisp(g, wx, wy, k, t, smoke[i], i * 5 + 1);
  });
}
export function railFlamePos(Cam, i) { return [Cam[0] * (RAIL_X[i] - 20 + 52) + Cam[4], Cam[3] * (RAIL_Y - 21) + Cam[5]]; }

// ---- cut-letter plaques (transmission pieces): dark hide, carved border, letters cut out so they glow
function plaque(w, h, lines, opt = {}) {
  return piece([-w / 2 - 30, -h / 2 - 30, w / 2 + 30, h / 2 + 30], g => {
    const outer = q => { const r = 30; q.moveTo(-w / 2 + r, -h / 2); q.lineTo(-r * 1.4, -h / 2); q.quadraticCurveTo(0, -h / 2 - 34, r * 1.4, -h / 2); q.lineTo(w / 2 - r, -h / 2); q.quadraticCurveTo(w / 2 + 14, -h / 2 - 14, w / 2, -h / 2 + r); q.lineTo(w / 2, h / 2 - r); q.quadraticCurveTo(w / 2 + 14, h / 2 + 14, w / 2 - r, h / 2); q.lineTo(-w / 2 + r, h / 2); q.quadraticCurveTo(-w / 2 - 14, h / 2 + 14, -w / 2, h / 2 - r); q.lineTo(-w / 2, -h / 2 + r); q.quadraticCurveTo(-w / 2 - 14, -h / 2 - 14, -w / 2 + r, -h / 2); q.closePath(); };
    fill(g, '#2e140a', outer);
    const bw = opt.bw || 24, band = q => { outer(q); q.rect(-w / 2 + bw, -h / 2 + bw, w - bw * 2, h - bw * 2); };
    fill(g, opt.band || DYE.crimson, band);
    within(g, band, () => { for (let x = -w / 2 + 34; x < w / 2 - 20; x += 24) { cut(g, q => { const y = -h / 2 + bw / 2 + 2; q.moveTo(x - 8, y + 5); q.quadraticCurveTo(x - 8, y - 6, x, y - 8); q.quadraticCurveTo(x + 8, y - 6, x + 8, y + 5); q.closePath(); }); coin(g, x, h / 2 - bw / 2, 5); } for (let y = -h / 2 + 40; y < h / 2 - 30; y += 22) { plum(g, -w / 2 + bw / 2, y, 3.2); plum(g, w / 2 - bw / 2, y, 3.2); } });
    for (const [x, y] of [[-w / 2 + 12, -h / 2 + 12], [w / 2 - 12, -h / 2 + 12], [-w / 2 + 12, h / 2 - 12], [w / 2 - 12, h / 2 - 12]]) { fill(g, DYE.emerald, q => q.arc(x, y, 19, 0, 7)); cloud(g, x, y, 11, 0, 2, 1); ink(g, 2, q => q.arc(x, y, 19, 0, 7)); }
    ink(g, 2.5, outer); ink(g, 1.8, q => q.rect(-w / 2 + bw, -h / 2 + bw, w - bw * 2, h - bw * 2));
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const L of lines) { g.font = L.font; g.letterSpacing = (L.ls || 0) + 'px'; g.fillText(L.text, L.x || 0, L.y); }
    g.restore();
    // hide bridges across the letters (how cut lettering holds together)
    for (const L of lines) if (L.bars) for (let k = 0; k < L.bars; k++) { const x = -w / 2 + 60 + (k + .5) * (w - 120) / L.bars; ink(g, 2.2, q => { q.moveTo(x, L.y - L.size * .42); q.lineTo(x + 5, L.y + L.size * .42); }, '#2e140a'); }
    if (opt.seal) {   // diya seal: a small round medallion with a carved lamp
      const sx = opt.seal[0], sy = opt.seal[1]; fill(g, DYE.crimson, q => q.arc(sx, sy, 44, 0, 7)); cut(g, q => { diyaPath(q, sx - 12, sy + 8, .44); }); cut(g, q => flamePath(q, sx + 14, sy + 4, .62)); ink(g, 2, q => q.arc(sx, sy, 44, 0, 7)); ink(g, 1.2, q => q.arc(sx, sy, 38, 0, 7));
    }
  }, { ss: 1.6, seed: 50 + (opt.seed || 0) });
}
const ORD = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH'];
let P = null;
export function buildStage() {
  if (P) return P;
  P = {
    title: plaque(1240, 400, [
      { text: 'FIVE LAMPS', font: '700 150px "Cormorant Garamond"', y: -62, ls: 22, size: 150, bars: 0 },
      { text: 'WHY DIWALI IS CELEBRATED', font: '700 56px "Cormorant Garamond"', y: 62, ls: 10, size: 56 },
      { text: 'a shadow puppet tale', font: 'italic 600 36px "Cormorant Garamond"', y: 128, size: 36 }], { seal: [500, -110], seed: 1 }),
    acts: ORD.map((o, i) => plaque(720, 230, [
      { text: `THE ${o} LAMP`, font: '700 62px "Cormorant Garamond"', y: -28, ls: 10, size: 62 },
      { text: LABELS[i], font: '700 44px "Cormorant Garamond"', y: 46, ls: 14, size: 44 }], { band: [DYE.crimson, DYE.rose, DYE.saffron, DYE.peacock, DYE.emerald][i], seed: 2 + i })),
    end: plaque(1180, 380, [
      { text: 'HAPPY DIWALI', font: '700 132px "Cormorant Garamond"', y: -46, ls: 16, size: 132 },
      { text: 'five stories · five lamps · one light', font: 'italic 600 46px "Cormorant Garamond"', y: 82, size: 46 }], { seal: [470, -112], seed: 9 }),
  };
  return P;
}

// ---- the channel plaque: a small cut-letter plaque, top-right, ~35 %, for the whole film (viewport coords)
let CH = null;
export function drawChannel(g, a = .35) {
  if (!CH) {
    const [c, q] = canvas(330, 74);
    q.fillStyle = '#2a1209'; q.beginPath(); q.roundRect(3, 3, 324, 68, 10); q.fill();
    q.strokeStyle = '#9a7034'; q.lineWidth = 2; q.beginPath(); q.roundRect(9, 9, 312, 56, 6); q.stroke();
    q.fillStyle = '#9a2a18'; for (const x of [22, 308]) { q.beginPath(); q.arc(x, 37, 7, 0, 7); q.fill(); }
    q.font = '700 34px "Cormorant Garamond"'; q.letterSpacing = '7px'; q.textAlign = 'center'; q.textBaseline = 'middle';
    const gr = q.createLinearGradient(0, 18, 0, 56); gr.addColorStop(0, '#ffe7b0'); gr.addColorStop(1, '#f0b860'); q.fillStyle = gr; q.fillText('NARRATUDE', 168, 39);
    CH = c;
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.drawImage(CH, 1920 - 330 - 34, 30); g.restore();
}

// ---- storyteller's placard (subtitles): dark lacquer board, thin gold line, a small diya seal; Cormorant Garamond 600
export function drawSub(g, text, a = 1, slide = 0, top = false) {
  if (!text || a <= 0) return null;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  g.font = '600 44px "Cormorant Garamond"';
  // wrap into two balanced lines when one would be too wide
  let lines = [text];
  if (g.measureText(text).width > 1300) {
    const wd = text.split(' '); let best = null;
    for (let i = 1; i < wd.length; i++) { const l1 = wd.slice(0, i).join(' '), l2 = wd.slice(i).join(' '), m = Math.max(g.measureText(l1).width, g.measureText(l2).width); if (!best || m < best[0]) best = [m, l1, l2]; }
    lines = [best[1], best[2]];
  }
  const tw = Math.max(...lines.map(l => g.measureText(l).width)), seal = 44, padL = 20, padR = 34, gap = 18, lh = 50;
  const w = padL + seal + gap + tw + padR, h = 68 + (lines.length - 1) * lh, x = 960 - w / 2, y = top ? 44 - slide * 18 : 1080 - 52 - h + slide * 18;
  g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 18; g.shadowOffsetY = 4;
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(48,22,12,.93)'); gr.addColorStop(.5, 'rgba(32,14,8,.93)'); gr.addColorStop(1, 'rgba(22,10,6,.93)');
  g.fillStyle = gr; g.beginPath(); g.roundRect(x, y, w, h, 6); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(176,134,64,.8)'; g.lineWidth = 1.5; g.beginPath(); g.roundRect(x + 6, y + 6, w - 12, h - 12, 3); g.stroke();
  const sx = x + padL, sy = y + (h - seal) / 2;
  g.fillStyle = '#b3261b'; g.beginPath(); g.arc(sx + seal / 2, sy + seal / 2, seal / 2, 0, 7); g.fill();
  g.fillStyle = '#f6dcc0'; g.beginPath(); diyaPath(g, sx + seal / 2 - 6, sy + seal / 2 + 5, .25); g.fill(); g.beginPath(); flamePath(g, sx + seal / 2 + 8, sy + seal / 2 + 2, .34); g.fill();
  g.fillStyle = '#f3e2bf'; g.textAlign = 'left'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, sx + seal + gap, y + 34 + i * lh + 1));
  g.restore();
  return [x, y, x + w, y + h];
}
// ---- blurred audience heads (viewport coords)
export function drawAudience(g, a = 1, t = 0) {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.fillStyle = '#080404'; g.filter = 'blur(4px)';
  const heads = [[230, 1020, 100, 1], [560, 1050, 112, 0], [900, 1064, 92, 2], [1330, 1040, 108, 0], [1660, 1056, 98, 1]];
  heads.forEach(([x, y, r, kind], i) => {
    const bob = Math.sin(t * 1.3 + i * 2) * 3;
    g.beginPath(); g.ellipse(x, y + bob, r * .78, r, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(x, y + r * 1.25 + bob, r * 1.8, r * .9, 0, 0, 7); g.fill();
    if (kind === 1) { g.beginPath(); g.arc(x - r * .5, y - r * .2 + bob, r * .34, 0, 7); g.fill(); }             // a bun
    if (kind === 2) { g.beginPath(); g.ellipse(x, y - r * .7 + bob, r * .95, r * .55, 0, 0, 7); g.fill(); }        // a turban
  });
  g.restore();
}
