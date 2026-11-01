// Shared shot helpers: figure layers with emissive stamping, plates, impact frames, flashes
import { canvas, W, H, rgba, mix, TAU, rng } from './cel.js';
import { figure } from './body.js';
import { pal } from './pal.js';
import { speedLines } from './fx.js';

const [lc, lg] = canvas(W, H), [le, lge] = canvas(W, H);
export const step12 = t => Math.floor(t * 12 + 1e-6) / 12;   // characters on twos
export const step8 = t => Math.floor(t * 8 + 1e-6) / 8;

// draw a figure through a layer: cel on g, black silhouette stamped on e, then its own emissive (glass glow) on top
export function fig(g, e, who, light, pose, o, x, y, s, flip = false) {
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, W, H); lge.setTransform(1, 0, 0, 1, 0, 0); lge.clearRect(0, 0, W, H);
  lg.save(); lg.translate(x, y); lg.scale(flip ? -s : s, s); lge.save(); lge.translate(x, y); lge.scale(flip ? -s : s, s);
  const C = o.C || pal(who, light);
  const r = figure(lg, lge, C, pose, { who, ...o });
  lg.restore(); lge.restore();
  if (o.alpha != null) g.globalAlpha = o.alpha;
  g.drawImage(lc, 0, 0); g.globalAlpha = 1;
  stamp(e, lc); e.save(); e.globalCompositeOperation = 'lighter'; e.drawImage(le, 0, 0); e.restore();
  const hx = r.hand[0] * (flip ? -s : s) + x, hy = r.hand[1] * s + y;
  return { ...r, sx: hx, sy: hy, layer: lc };
}
const [sc2, sg2] = canvas(W, H);
export function stamp(e, src) {   // black silhouette onto the emissive plate
  sg2.setTransform(1, 0, 0, 1, 0, 0); sg2.globalCompositeOperation = 'source-over'; sg2.clearRect(0, 0, W, H); sg2.drawImage(src, 0, 0);
  sg2.globalCompositeOperation = 'source-in'; sg2.fillStyle = '#000'; sg2.fillRect(0, 0, W, H); sg2.globalCompositeOperation = 'source-over';
  e.drawImage(sc2, 0, 0);
}
// draw an arbitrary drawing function into a layer and stamp it
export function layer(g, e, fn, o = {}) {
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, W, H); lge.setTransform(1, 0, 0, 1, 0, 0); lge.clearRect(0, 0, W, H);
  fn(lg, lge);
  if (o.alpha != null) g.globalAlpha = o.alpha; g.drawImage(lc, 0, 0); g.globalAlpha = 1;
  if (o.stamp !== false) stamp(e, lc);
  e.save(); e.globalCompositeOperation = 'lighter'; e.drawImage(le, 0, 0); e.restore();
  return lc;
}
// plate with its emissive pair, camera offset (ox, oy) in plate pixels, zoom z about the frame centre
export function plate(g, e, P, ox, oy, z = 1) {
  for (const [ctx, img] of [[g, P.c], [e, P.e]]) {
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(img, -ox, -oy); ctx.restore();
  }
}
// looping horizontal plate
export function loopPlate(g, e, P, ox, oy = 0) {
  const w = P.c.width, x = ((ox % w) + w) % w;
  for (const [ctx, img] of [[g, P.c], [e, P.e]]) { ctx.drawImage(img, -x, -oy); ctx.drawImage(img, w - x, -oy); }
}
// impact frame (2 frames): monochrome / inverted silhouette over radial lines
export function impact(g, e, sil, cx, cy, k, o = {}) {
  const bg = k % 2 ? '#fff4dc' : '#2a0e2e', fg = k % 2 ? '#2a0e2e' : '#ffcf6a';
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  speedLines(g, k + 7, { type: 'radial', cx, cy, n: 140, col: fg, a: .9, r0: 120, wmul: 1.4 });
  if (sil) { const [c2, g2] = canvas(W, H); g2.drawImage(sil, 0, 0); g2.globalCompositeOperation = 'source-in'; g2.fillStyle = fg; g2.fillRect(0, 0, W, H); g.drawImage(c2, 0, 0); }
  e.fillStyle = k % 2 ? '#806040' : '#000'; e.fillRect(0, 0, W, H);
}
export function flash(g, a, col = '#ffffff') { if (a <= 0) return; g.fillStyle = rgba(col, Math.min(1, a)); g.fillRect(0, 0, W, H); }
// light band sweeping across a held cel (source-atop on the layer)
export function lightBand(cvs, u, col = '#ffe0a0', a = .35, wdt = 220) {
  const g = cvs.getContext('2d'); g.save(); g.globalCompositeOperation = 'source-atop';
  const x = -400 + u * (W + 800), gr = g.createLinearGradient(x - wdt, 0, x + wdt, 0);
  gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(.5, rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.setTransform(1, -.35, 0, 1, 0, 0); g.fillRect(x - wdt, -400, wdt * 2, H + 800); g.restore();
}
// dust kicked from feet
export function dust(g, x, y, k, n = 6, col = '#e8c8a8') {
  const R = rng(k * 17 + 3);
  for (let i = 0; i < n; i++) { const r = 8 + R() * 18; g.fillStyle = rgba(col, .45 * R() + .2); g.beginPath(); g.arc(x - R() * 60, y - R() * 26, r, 0, TAU); g.fill(); }
}
