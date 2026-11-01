// On-tape type: chrome-gradient Hinglish captions (heavy italic, plum outline, saffron glow), sports-OSD counters. Drawn to the subtitle layer, composited inside the CRT pass.
import { W, H, rgba, TAU, poly, cel } from './cel.js';
import { CAPS } from './timeline.js';
export const CX = 500;   // caption centre: right ~140 px kept free for the Shorts UI; nothing below y = 1536

function chrome(c, y0, y1) {
  const gr = c.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, '#6a5ae0'); gr.addColorStop(.36, '#d8e6ff'); gr.addColorStop(.48, '#ffffff'); gr.addColorStop(.52, '#7a3c8e');
  gr.addColorStop(.7, '#ff6a9a'); gr.addColorStop(1, '#ffd23c');
  return gr;
}
export function capLayout(c, text, size = 112) {
  const lines = text.split('\n');
  c.font = `italic 900 ${size}px Kanit`;
  const maxW = Math.max(...lines.map(l => c.measureText(l).width));
  const s = Math.min(size, size * 860 / maxW);
  return { lines, s, lh: s * 1.06, w: Math.min(860, maxW * s / size) };
}
export function caption(c, text, y, age, o = {}) {
  if (age < 0) return;
  const step = Math.floor(age * 12);                 // flick on at 12 fps
  const a = step === 0 ? .35 : step === 1 ? .75 : 1;
  const { lines, s, lh } = capLayout(c, text, o.size || 112);
  c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.font = `italic 900 ${s}px Kanit`;
  lines.forEach((L, i) => {
    const yy = y + (i - (lines.length - 1) / 2) * lh;
    // outer saffron glow + thick plum outline
    c.shadowColor = rgba('#ff8a2a', .9); c.shadowBlur = 26; c.strokeStyle = '#ff7a2a'; c.lineWidth = s * .26; c.strokeText(L, CX, yy);
    c.shadowBlur = 0; c.shadowColor = 'transparent';
    c.strokeStyle = '#2a0e2e'; c.lineWidth = s * .17; c.strokeText(L, CX, yy);
    c.fillStyle = chrome(c, yy - s * .42, yy + s * .42); c.fillText(L, CX, yy);
    // light sweep across the letters
    const sw = (age - .15) / .55;
    if (sw > 0 && sw < 1) {
      c.save(); c.globalCompositeOperation = 'source-atop';
      const x = CX - 500 + sw * 1000, gr = c.createLinearGradient(x - 60, 0, x + 60, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gr; c.fillRect(x - 60, yy - s * .6, 120, s * 1.2); c.restore();
    }
  });
  // star glint on the last letter
  if (age > .35 && age < .9) { const k = 1 - Math.abs((age - .62) / .27); const last = lines[lines.length - 1], ww = c.measureText(last).width; star(c, CX + ww / 2 - s * .1, y + (lines.length - 1) / 2 * lh - s * .35, 40 * k); }
  c.restore();
}
function star(c, x, y, r) {
  if (r <= 0) return;
  c.save(); c.fillStyle = '#ffffff'; c.shadowColor = '#fff2c0'; c.shadowBlur = 16;
  c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r * .12, y - r * .12); c.lineTo(x + r, y); c.lineTo(x + r * .12, y + r * .12); c.lineTo(x, y + r); c.lineTo(x - r * .12, y + r * .12); c.lineTo(x - r, y); c.lineTo(x - r * .12, y - r * .12); c.closePath(); c.fill(); c.restore();
}
// drawn chai-glass icon (instead of the emoji, which has no place on tape)
export function glassIcon(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#ffd27a'; c.strokeStyle = '#2a0e2e'; c.lineWidth = 4; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-16, 22); c.lineTo(16, 22); c.lineTo(21, -22); c.lineTo(-21, -22); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#c8803a'; c.beginPath(); c.moveTo(-15, 20); c.lineTo(15, 20); c.lineTo(19, -10); c.lineTo(-19, -10); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(-14, -18, 5, 34);
  for (let k = 0; k < 3; k++) { c.strokeStyle = 'rgba(255,240,220,.85)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-8 + k * 8, -30); c.bezierCurveTo(-14 + k * 8, -40, -2 + k * 8, -46, -8 + k * 8, -58); c.stroke(); }
  c.restore();
}
// sports-broadcast OSD box (top-left, under the Shorts top bar)
export function osd(c, label, value, o = {}) {
  const x = o.x ?? 56, y = o.y ?? 210, w = o.w ?? 380, h = 108;
  c.save();
  c.fillStyle = rgba('#1a0a24', .72); c.beginPath(); c.roundRect(x, y, w, h, 14); c.fill();
  c.strokeStyle = o.flash ? '#ff3c3c' : '#ffb040'; c.lineWidth = 4; c.stroke();
  c.fillStyle = o.flash ? '#ff3c3c' : '#ffb040'; c.fillRect(x, y + h - 10, w * (o.bar ?? 1), 10);
  let tx = x + 24;
  if (o.icon) { glassIcon(c, x + 52, y + h / 2 + 6, 1.2); tx = x + 96; }
  c.textBaseline = 'middle'; c.textAlign = 'left';
  if (label) { c.font = '700 30px "Barlow SC"'; c.fillStyle = '#ffd8a0'; c.fillText(label, tx, y + 30); }
  c.font = 'italic 900 64px Kanit'; c.fillStyle = o.flash ? '#ff5a4a' : '#fff6e0'; c.strokeStyle = '#2a0e2e'; c.lineWidth = 8; c.lineJoin = 'round';
  const vy = label ? y + 70 : y + h / 2;
  c.strokeText(value, tx, vy); c.fillText(value, tx, vy);
  c.restore();
}
export function downArrow(c, x, y, t) {
  const b = [0, 10, 18, 10][Math.floor(t * 8) % 4];
  c.save(); c.translate(x, y + b); c.lineJoin = 'round';
  const P = new Path2D(); P.moveTo(-30, -70); P.lineTo(30, -70); P.lineTo(30, -10); P.lineTo(62, -10); P.lineTo(0, 56); P.lineTo(-62, -10); P.lineTo(-30, -10); P.closePath();
  c.shadowColor = rgba('#ff8a2a', .9); c.shadowBlur = 22; c.strokeStyle = '#ff7a2a'; c.lineWidth = 26; c.stroke(P); c.shadowBlur = 0;
  c.strokeStyle = '#2a0e2e'; c.lineWidth = 16; c.stroke(P);
  c.fillStyle = chrome(c, -70, 56); c.fill(P); c.restore();
}
export function hud(c, t) {
  c.clearRect(0, 0, W, H);
  for (const [a, b, text, y] of CAPS) if (t >= a && t < b) caption(c, text, y, t - a);
  if (t >= 56.3 && t < 1403 / 24) downArrow(c, CX, 1458, t);
}
export function texts(t) {   // for readcheck
  const out = [];
  CAPS.forEach(([a, b, text, y], i) => { if (t >= a && t < b) out.push({ id: 'cap' + i, text: text.replace('\n', ' '), x0: CX - 430, y0: y - 120, x1: CX + 430, y1: y + 120 }); });
  return out;
}
