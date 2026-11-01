// Chai Run — 80s cel anime at sunrise, 1080×1920, 24 fps
import { canvas, W, H } from './cel.js';
import { makePost } from './post.js';
import { DUR, SCENES, sceneAt } from './timeline.js';
import { hud, texts } from './hud.js';
import { skyPlate, stairPlate, streetPlate, stallPlate, trackSidePlate } from './bg.js';
import * as S1 from './scenes1.js';
import * as S2 from './scenes2.js';
import { events } from './events.js';
const qs = new URLSearchParams(location.search);
const [sc, g] = canvas(W, H), [gc, e] = canvas(W, H), [ovc, ov] = canvas(W, H);
const post = makePost(document.getElementById('gl'));
const TEST = qs.get('test');
const testMod = TEST ? await import('./test.js') : null;
await document.fonts.load('italic 900 60px Kanit'); await document.fonts.load('italic 800 60px Kanit'); await document.fonts.load('700 40px "Barlow SC"');
const A = {
  track: trackSidePlate(2600, 1920, 21),
  stairs: stairPlate(1600, 3600, 7),
  street: streetPlate(3200, 1920, 11),
  stall: stallPlate(1080, 1920, 5),
  sky: skyPlate(1080, 3200, 1900, 700, 1700, 4),
};
const FN = { ...S1, ...S2 };
const RAW = { bloom: 0, halo: 0, soft: 0, flick: 0, lift: 0, contrast: 0, fade: 0, sat: 1, tint: [1, 1, 1], scan: 0, grille: 0, bleed: 1, rshift: 0, glow: 0, corner: 0, noiseA: 0, power: 1, track: 0, expo: 1 };
// sunrise grade: warmer tint and violet shadow lift instead of the demo's night settings
const GRADE = { tint: [1.03, .98, .94], shadowTint: [.22, .1, .2], bloom: .7, halo: .3, thr: .88, sk: .14 };
function render(t) {
  for (const x of [g, e, ov]) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H); ov.clearRect(0, 0, W, H);
  let over = {};
  if (testMod) { testMod.test(g, e, t, TEST); over = RAW; }
  else {
    const [t0, t1, id] = sceneAt(t);
    const S = { t, lt: t - t0, u: (t - t0) / (t1 - t0), g, e, A, id, osd: null };
    const fn = FN[qs.get('shot') || id];
    if (fn) over = fn(S) || {};
    if (!qs.get('nosub')) hud(ov, t);
    if (S.osd) S.osd(ov);
    if (id === 'black') over = { expo: 0, noiseA: 0 };
  }
  post.render(sc, gc, Math.round(t * 24), ovc, qs.get('raw') ? RAW : { ...GRADE, ...over });
}
window.render = render; window.DUR = DUR; window.TEXTS = texts; window.EV = events();
render(parseFloat(qs.get('t') ?? '1'));
window.READY = true;
