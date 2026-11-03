// Five Lamps — Why Diwali Is Celebrated. A shadow puppet film for Narratude.
import { makeGL } from './gl.js';
import { canvas, drawPiece } from './carve.js';
import { clamp, lerp, seg, ss, eio, eo, ei, back, vnoise, hash } from '/core/lib.js';
import { drawFig, rodsFor, mul, T as Tm, R, S, ap, DYE, KINGS, propPiece, handAt, toWorld } from './fig.js';
import * as PR from './props.js';
import { drawFrame, drawRail, flame as railFlameFx, smokeWisp, buildStage, drawChannel, drawSub, drawAudience, RAIL_X, RAIL_Y, railFlamePos } from './stage.js';
import { silhouette, pinchHand } from './backstage.js';
import { T, DUR, ACT, STORY, MATCH, CATCH, PEAKF, SNUFF, BEAT, SHOTS, shotAt } from './story.js';

const qs = new URLSearchParams(location.search);
const W = 1920, H = 1080;
const [trc, tr] = canvas(W, H), [frc, fr] = canvas(W, H);
const GL = makeGL(document.getElementById('gl'));
for (const f of ['500', '600', '700']) await document.fonts.load(`${f} 40px "Cormorant Garamond"`);
await document.fonts.load('italic 600 40px "Cormorant Garamond"');
let LINES = [], DURS = {};
try { LINES = await (await fetch('lines.json')).json(); } catch (e) { }
try { const r = await fetch('voices/dur.json'); if (r.ok) DURS = await r.json(); } catch (e) { }
const STG = buildStage();
const E = (t, a, b) => ss(seg(t, a, b));
const camM = ([cx, cy, z]) => [z, 0, 0, z, 960 - cx * z, 540 - cy * z];

// ================= helpers =================
function put(g, C, pc, x, y, s = 1, rot = 0, o = {}) {
  const M = mul(C, mul(Tm(x, y), mul(R(rot), S(s * (o.fx || 1), s * (o.fy || 1)))));
  g.save(); g.globalCompositeOperation = 'multiply'; if (o.a != null) g.globalAlpha = clamp(o.a); if (o.blur > .3) g.filter = `blur(${o.blur}px)`;
  if (o.clip) { g.setTransform(C[0], 0, 0, C[3], C[4], C[5]); g.beginPath(); g.rect(...o.clip); g.clip(); }
  g.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); drawPiece(g, pc); g.restore();
}
// press-on (arrive large and blurred, snap sharp) and lift-off (grow, blur, fade)
function pl(t, tin, tout = 1e9, din = .5, dout = .9) {
  if (t < tin || t > tout + dout) return null;
  const u = eo(seg(t, tin, tin + din)), v = seg(t, tout, tout + dout);
  return { k: (1 + 1.3 * (1 - u)) * (1 + .8 * v), blur: 30 * (1 - u) + 30 * v, a: (.35 + .65 * u) * (1 - ei(v)), dy: -40 * v };
}
const trem = (t, sd, amp = 1) => ({ dx: (vnoise(t * 2.1 + sd * 7) - .5) * 3 * amp, dy: (vnoise(t * 2.7 + sd * 3 + 9) - .5) * 2.4 * amp, dr: (vnoise(t * 1.7 + sd + 4) - .5) * .018 * amp });
function fig(C, name, pose, t, sd = 0, o = {}) {
  const tm = trem(t, sd, o.tens || 1), k = Math.hypot(C[0], C[1]);
  const p = { ...pose, x: pose.x + tm.dx, y: pose.y + tm.dy, rot: (pose.rot || 0) + tm.dr };
  const st = o.st;
  if (st) { p.s = (p.s || 1) * st.k; p.y += st.dy; }
  const r = drawFig(tr, C, name, p, { alpha: st ? st.a : null, blur: st ? st.blur * k : 0, rivets: !st || st.blur < 4 });
  if (o.rods !== false && (!st || st.a > .5)) rodsFor(tr, r, k * (p.s || 1), .45, (p.f || 1));
  return r;
}
const walk = (t, t0, sp = 9) => { const ph = (t - t0) * sp; return { legF: -.05 + .3 * Math.sin(ph), legB: .07 - .3 * Math.sin(ph), aF: [-.2 - .2 * Math.sin(ph), -.5], aB: [.15 + .2 * Math.sin(ph), -.25], low: .04 * Math.sin(ph), bob: -Math.abs(Math.sin(ph)) * 6 }; };
const lerpP = (A, B, u) => { const o = { ...A }; for (const k in B) { const a = A[k], b = B[k]; if (typeof a === 'number' && typeof b === 'number') o[k] = lerp(a, b, u); else if (Array.isArray(a) && Array.isArray(b)) o[k] = a.map((v, i) => lerp(v, b[i], u)); else o[k] = u < .5 ? (a ?? b) : b; } return o; };
const WAIST = s => PR.groundY(960) - 268 * s;        // waist height for a figure standing on the ground strip

// ================= lamps =================
const LP = [[960, 330], [600, 380], [1320, 360], [360, 440], [1580, 440], [960, 250]];
function flare(t, t0) { const u = t - t0; if (u < 0) return 0; return u < .45 ? lerp(.1, 1, eo(u / .45)) + .45 * Math.sin(u / .45 * Math.PI) : 1; }
function snuff(t, t0) { if (t < t0) return 1; const u = (t - t0) / .35; return u < 1 ? (1 - u) * (.7 + .3 * Math.sin(u * 40)) : 0; }
function lampLevel(k, t) {               // k = 0 pilot, 1..5 act lamps
  const fl = 1 + .06 * (vnoise(t * 7 + k * 13) - .5) * 2 + .03 * Math.sin(t * 23 + k);
  let I;
  if (k === 0) {
    if (t < T.pilot) return 0;
    I = lerp(1.0, .45, E(t, 12.6, 13.6)) * E(t, T.pilot, T.pilot + 1.0);
    if (t >= T.silence) I = t < PEAKF[0] ? 0 : .45 * flare(t, PEAKF[0]);
    if (t >= T.close) I = lerp(.45, .6, E(t, 159.6, 161));
    if (t > T.fade[0]) I *= 1 - E(t, T.fade[0], T.fade[1]);
  } else {
    const i = k - 1;
    I = flare(t, CATCH[i]);
    if (t >= T.silence) I = t < PEAKF[i] ? 0 : flare(t, PEAKF[i]) * snuff(t, SNUFF[i]);
  }
  return Math.max(0, I * fl);
}
const LAMP_I = .58;   // one lamp's strength on the cloth; exposure counts lamps (1.75/√n), so brightness grows as √n
const lampsAt = (t, dx = 0) => LP.map(([x, y], k) => [x + dx, y, lampLevel(k, t) * LAMP_I, k ? .55 : .8]);
function railLit(t) {
  return [0, 1, 2, 3, 4].map(i => {
    let a = t < CATCH[i] ? 0 : Math.min(1.25, flare(t, CATCH[i]));
    if (t >= T.silence) a = t < PEAKF[i] ? 0 : Math.min(1.25, flare(t, PEAKF[i])) * snuff(t, SNUFF[i]);
    return a;
  });
}
const railSmoke = t => [0, 1, 2, 3, 4].map(i => t >= SNUFF[i] ? t - SNUFF[i] : (t >= T.silence && t < PEAKF[i] ? t - T.silence : 0));

// ================= subtitles =================
const SUBS = LINES.map((v, i) => { const d = DURS[v.id] || 2.5, nxt = LINES[i + 1]; let t1 = v.t + Math.max(1.8, d + .7); if (nxt) t1 = Math.min(t1, nxt.t - .25); return { t0: v.t, t1: +t1.toFixed(3), text: v.sub || v.text, id: v.id }; });
window.SUBS = SUBS;

// ================= plaques (cloth) =================
const TXT = [];
function plaqueAt(C, pc, x, y, st, rods = true) {
  if (!st) return;
  put(tr, C, pc, x, y + st.dy, st.k, 0, { a: st.a, blur: st.blur * C[0] });
  if (rods && st.a > .6) { const k = C[0]; const pts = [[x - pc.w * .3, y + pc.h * .42], [x + pc.w * .3, y + pc.h * .42]].map(([a, b]) => [C[0] * a + C[4], C[3] * b + C[5]]); tr.save(); tr.setTransform(1, 0, 0, 1, 0, 0); tr.globalCompositeOperation = 'multiply'; tr.filter = `blur(${2.4 * k}px)`; tr.globalAlpha = .5; tr.strokeStyle = '#2a1a10'; tr.lineWidth = 3.4; for (const p of pts) { tr.beginPath(); tr.moveTo(p[0], p[1]); tr.lineTo(p[0] - 50 * k, p[1] + 900 * k); tr.stroke(); } tr.restore(); }
}
function plaqueBox(C, pc, x, y) { return [C[0] * (x + pc.x0 + 30) + C[4], C[3] * (y + pc.y0 + 30) + C[5], C[0] * (x + pc.x0 + pc.w - 30) + C[4], C[3] * (y + pc.y0 + pc.h - 30) + C[5]]; }
const actPlaqueX = k => clamp(RAIL_X[k] + 40, 560, 1360);
function drawPlaques(t, C) {
  // title
  const ts = pl(t, T.titleIn, T.titleOut, .5, .7);
  if (ts) { plaqueAt(C, STG.title, 960, 470, ts); if (t >= T.titleSet && t < T.titleOut) TXT.push({ id: 'title', text: 'FIVE LAMPS WHY DIWALI IS CELEBRATED a shadow puppet tale', box: plaqueBox(C, STG.title, 960, 470) }); }
  for (let k = 0; k < 5; k++) {
    const st = pl(t, CATCH[k], STORY[k] + .65, .35, .8), x = actPlaqueX(k), y = 760;
    if (st) { plaqueAt(C, STG.acts[k], x, y, st); if (t >= CATCH[k] + .35 && t < STORY[k] + .65) TXT.push({ id: 'act' + k, text: ['THE FIRST LAMP HOME', 'THE SECOND LAMP FORTUNE', 'THE THIRD LAMP FREEDOM', 'THE FOURTH LAMP RELEASE', 'THE FIFTH LAMP KNOWLEDGE'][k], box: plaqueBox(C, STG.acts[k], x, y) }); }
  }
  const es = pl(t, T.endIn, 1e9, .7);
  if (es) { plaqueAt(C, STG.end, 960, 470, es); if (t >= T.endIn + .7) TXT.push({ id: 'end', text: 'HAPPY DIWALI five stories · five lamps · one light', box: plaqueBox(C, STG.end, 960, 470) }); }
}

// ================= scenes (draw onto the transmission canvas) =================
const gY = PR.groundY;
const SC = {};
const HOLE_S = [.55, 1.1, 2.0, 3.4, 6.0];
const [hc, hg] = canvas(W, H);
const HO = [1000, 600];   // the flame's base: every ring scales about this point, so the shapes nest
function holePath(q, s) { PR.diyaPath(q, HO[0] - 92 * s, HO[1] + 8 * s, 1.5 * s); PR.flamePath(q, HO[0], HO[1], 2.2 * s); }
function holeFill(q, s) { q.beginPath(); PR.diyaPath(q, HO[0] - 92 * s, HO[1] + 8 * s, 1.5 * s); q.fill(); q.beginPath(); PR.flamePath(q, HO[0], HO[1] + 4 * s, 2.2 * s); q.fill(); }
SC.hole = (t, C) => {
  // dark hide over the whole cloth with one diya-shaped hole; the hide is cut in rings around the hole, and each ring lifts off in turn
  for (let i = 0; i < 5; i++) {
    const v = seg(t, T.rings[i], T.rings[i] + .9); if (v >= 1) continue;
    const k = 1 + .5 * v, cx = HO[0], cy = HO[1];
    const M = [C[0] * k, 0, 0, C[3] * k, C[0] * (cx - cx * k) + C[4], C[3] * (cy - cy * k - 40 * v) + C[5]];
    hg.setTransform(1, 0, 0, 1, 0, 0); hg.clearRect(0, 0, W, H); hg.globalCompositeOperation = 'source-over';
    hg.setTransform(...M); hg.fillStyle = i % 2 ? '#2e160a' : '#24110a'; if (i === 4) hg.fillRect(-3000, -3000, 8000, 8000); else holeFill(hg, HOLE_S[i + 1]);
    // carved dots just outside the inner edge
    hg.globalCompositeOperation = 'destination-out'; holeFill(hg, HOLE_S[i]);
    hg.globalCompositeOperation = 'source-over'; hg.strokeStyle = '#9a6420'; hg.lineWidth = 3 / k / C[0] * 1.4; hg.beginPath(); holePath(hg, HOLE_S[i]); hg.stroke();
    tr.save(); tr.setTransform(1, 0, 0, 1, 0, 0); tr.globalCompositeOperation = 'multiply'; tr.globalAlpha = 1 - ei(v); if (v > 0) tr.filter = `blur(${24 * v * C[0]}px)`; tr.drawImage(hc, 0, 0); tr.restore();
  }
};
SC.exile = (t, C) => {
  put(tr, C, PR.ground(0, 3600), 0, 0);
  put(tr, C, PR.gate(), 420, 908);
  [[1560, 0, .9], [2120, 1, 1.0], [2700, 0, .95], [3240, 1, 1.05]].forEach(([x, v, s]) => put(tr, C, PR.tree(v), x, 912, s));
  const u = t - 16.8, w = walk(t, 16.8, 8), s = .82, y = WAIST(s) + w.bob;
  const sad = { head: .1, rot: .03 };
  fig(C, 'lakshman', { ...w, ...sad, x: 470 + 190 * u, y, s }, t, 3);
  fig(C, 'sita', { ...w, ...sad, x: 640 + 190 * u, y, s, aF: [-.3, -.6] }, t, 2);
  fig(C, 'ram', { ...w, ...sad, x: 820 + 190 * u, y, s }, t, 1);
};
SC.abduct = (t, C) => {
  put(tr, C, PR.ground(0, 3200), 0, 0);
  put(tr, C, PR.hut(), 330, 910, 1.1);
  put(tr, C, PR.tree(1), 120, 912, .95); put(tr, C, PR.tree(0), 1750, 912, .9); put(tr, C, PR.tree(1), 2500, 912, 1.0);
  const s = .85, y = WAIST(s);
  // the golden deer, bounding, then swapped for Ravana
  const dst = pl(t, 0, T.swap, .1, .5);
  if (dst) { const hop = Math.abs(Math.sin((t - T.deer0) * 6)) * 40, dx = (t - T.deer0) * 40; put(tr, C, PR.deer(), 1180 + dx, 905 - hop + dst.dy, .95 * dst.k, -.05 * Math.cos((t - T.deer0) * 6), { a: dst.a, blur: dst.blur * C[0] }); }
  const rst = pl(t, T.swap + .05, T.ravOut, .5, .6);
  let sita = { x: 700, y, s, f: 1, aF: [-.3, -.5], aB: [.1, -.2], head: -.05 };
  if (rst) {
    let rx, f = -1, pose = { aF: [-.5, -.9], aB: [.3, -.1] };
    if (t < T.grab) { rx = lerp(1250, 900, E(t, T.swap + .6, T.grab)); const w = walk(t, T.swap, 7); pose = { ...pose, legF: w.legF, legB: w.legB, aF: [lerp(-.5, -1.3, E(t, T.grab - .5, T.grab)), lerp(-.9, -1.4, E(t, T.grab - .5, T.grab))] }; }
    else if (t < T.flip) { rx = 900; pose = { aF: [-1.2, -1.0], aB: [.3, -.1] }; }
    else { const u = t - T.flip; rx = 900 + 560 * u + 300 * u * u; f = 1; const w = walk(t, T.flip, 12); pose = { ...pose, legF: w.legF * 1.4, legB: w.legB * 1.4, aF: [-1.0, -.6], rot: .12 }; }
    const R0 = fig(C, 'ravana', { ...pose, x: rx, y: WAIST(.9), s: .9, f }, t, 4, { st: rst, tens: 1.6 });
    if (t >= T.grab) {      // Sita is carried on Ravana's arm, struggling
      const hw = R0.hand, inv = [(hw[0] - C[4]) / C[0], (hw[1] - C[5]) / C[3]];
      sita = { x: inv[0] + (f > 0 ? 10 : -30), y: inv[1] - 40 + Math.sin(t * 9) * 4, s, f: f > 0 ? -1 : 1, rot: (f > 0 ? .5 : -.45) + Math.sin(t * 7) * .05, aF: [-2.2 + Math.sin(t * 8) * .3, -2.6], aB: [-.6, -1.2], head: -.2 };
      fig(C, 'sita', sita, t, 2, { tens: 2, st: rst, rods: false });
    }
  }
  if (t < T.grab) fig(C, 'sita', { ...sita, head: t > T.swap + .4 ? .15 : -.05, aF: t > T.swap + .4 ? [-1.6, -2.4] : sita.aF }, t, 2, { tens: t > T.swap + .4 ? 2 : 1 });
};
SC.bridge = (t, C) => {
  const sea = i => { const off = Math.sin(t * .9 + i * 2) * 30 + (Math.floor(t * 12) % 2) * 3 * (i % 2 ? 1 : -1); put(tr, C, PR.seaStrip(i), off, 880 + i * 36); };
  put(tr, C, PR.lanka(), 1760, 880, .75);
  const bs = pl(t, T.bridgeOn, 1e9, .55);
  if (bs) put(tr, C, PR.bridge(), 200 - 700 * (bs.k - 1), 850 + bs.dy, bs.k, 0, { a: bs.a, blur: bs.blur * C[0] });
  sea(0);
  // Ram leads across; the monkey army follows; Hanuman leaps for Lanka
  const s = .66, y = 850 - 268 * s;
  if (t > T.bridgeOn + .4) { const u = t - (T.bridgeOn + .4), w = walk(t, 29, 8); fig(C, 'ram', { ...w, x: 300 + 150 * u, y: y + w.bob, s, head: -.06, aB: [-.4, -.5] }, t, 1); }
  const mx = lerp(-1100, 700, seg(t, T.monk[0], T.monk[1] + 1.2));
  put(tr, C, PR.monkeys(), mx, 850 + Math.abs(Math.sin(t * 9)) * -6, .7);
  const lu = seg(t, T.leap[0], T.leap[1]);
  let hx, hy, hp = {};
  if (t < T.leap[0]) { const u = t - 29.8, w = walk(t, 29.8, 9); hx = 160 + 180 * Math.max(0, u); hy = y + w.bob; hp = { ...w, aF: [-1.2, -2.6], pF: .3 }; }
  else { const crouch = 1 - E(t, T.leap[0], T.leap[0] + .25); hx = lerp(160 + 180 * (T.leap[0] - 29.8), 1500, ss(lu)); hy = lerp(y + 30 * crouch, y - 260, ss(lu)) - Math.sin(lu * Math.PI) * 520; hp = { rot: lerp(.2, -.35, E(t, T.leap[0], T.leap[0] + .3)), legF: -.9, legB: .7, aF: [-2.7, -3.0], aB: [.9, .4], pF: .2 }; }
  if (t > 29.8) fig(C, 'hanuman', { ...hp, x: hx, y: hy, s: s * 1.05 }, t, 5, { tens: 1.4 });
  sea(1); sea(2);
};
SC.battle = (t, C) => {
  put(tr, C, PR.ground(), 0, 0);
  const fr12 = Math.floor(t * 12);
  [[260, .95], [700, .8], [1220, .85], [1680, 1.0]].forEach(([x, s], i) => { const j = Math.sin(fr12 * 2.3 + i * 1.7); put(tr, C, PR.firePiece((fr12 + i) % 3), x + 3 * Math.sin(fr12 * 1.9 + i), gY(x) + 6, s * (1 + .05 * j), .07 * j); });
  const s = 1.0, y = WAIST(s);
  // Ram: draw, loose, hold
  const drawU = E(t, T.draw[0], T.draw[1]), rest = { aF: [-.2, -.5], aB: [-.6, -.9], pB: .9 };
  const drawn = { aF: [1.25, -1.75], aB: [-1.5, -1.55], pB: 1.55, head: -.04, rot: -.04 };
  let rp = t < T.loose ? lerpP(rest, drawn, drawU) : lerpP(drawn, { ...drawn, aF: [1.0, -1.2] }, eo(seg(t, T.loose, T.loose + .12)));
  if (t > 38.3) rp = lerpP(rp, { aF: [-.3, -.6], aB: [-.9, -1.2], pB: 1.2, head: -.12, rot: -.02 }, E(t, 38.3, 39.0));
  const RR = fig(C, 'ram', { ...rp, x: 600, y, s, legF: -.28, legB: .22 }, t, 1, { tens: t > T.draw[0] && t < T.loose ? 1.8 : 1 });
  if (t > T.draw[0] && t < T.loose) {   // arrow on the string
    const a = RR.hand, b = RR.handB; const inv = p => [(p[0] - C[4]) / C[0], (p[1] - C[5]) / C[3]], A = inv(a), B = inv(b), ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
    put(tr, C, PR.arrowPiece(), B[0] + 40 * Math.cos(ang), B[1] + 40 * Math.sin(ang), s, ang);
  }
  if (t >= T.loose && t < T.hit) { const u = seg(t, T.loose, T.hit); for (let gh = 0; gh < 4; gh++) { const uu = clamp(u - gh * .07); put(tr, C, PR.arrowPiece(), lerp(820, 1240, uu), lerp(462, 470, uu) - Math.sin(uu * Math.PI) * 14, s, 0, { a: gh ? .3 / gh : 1 }); } }
  // Ravana: advance, menace, struck → freeze → lift off on the bell
  const st = pl(t, 0, T.bell1, .1, 1.0);
  if (st) {
    const adv = E(t, 34.4, 35.6), struck = t >= T.hit;
    let p = { x: lerp(1450, 1320, adv), y: WAIST(1.05), s: 1.05, f: -1, aF: [-1.1 - .2 * Math.sin(t * 4), -1.6], aB: [.5, .1], legF: -.25, legB: .2, rot: -.04 };
    if (struck) { const j = seg(t, T.hit, T.hit + .14); p = { ...p, x: p.x + Math.sin(j * 30) * 8 * (1 - j) + 14, rot: .14, head: .18, aF: [-2.2, -2.8], aB: [-.8, -1.6] }; }
    fig(C, 'ravana', p, t, 4, { st, tens: struck ? .3 : 1.6 });
  }
};
const RET_BASE = 440;
SC.ret = (t, C) => {
  // the city is a backdrop sheet hung high (its base at y=440); the family stands on the front ground strip below it, clear of the palace base
  const SK = .66, sx = x => 960 + SK * (x - 960), sy = y => RET_BASE + SK * (y - 912);
  put(tr, C, PR.skyline(), sx(0), sy(0), SK); put(tr, C, PR.gate(), 960, sy(908), SK * .9); put(tr, C, PR.ground(), 0, 0);
  // window covers lift off one per beat, outward from the gate
  const order = PR.WINDOWS.map((w, i) => [i, Math.abs(w[0] - 960), -w[1]]).sort((a, b) => a[1] - b[1] || a[2] - b[2]);
  order.forEach(([i], n) => { const w = PR.WINDOWS[i], tt = T.win0 + Math.floor(n / 2) * BEAT, st = pl(t, -1, tt, .1, .5); if (st) put(tr, C, PR.windowCover(), sx(w[0]), sy(w[1]) + st.dy, SK * st.k, 0, { a: st.a, blur: st.blur * C[0] }); });
  // the family arrives at the gate and stops
  const s = .58, y = WAIST(s), u = seg(t, T.ret, T.arrive), go = t < T.arrive;
  const w = go ? walk(t, T.ret, 8) : { legF: -.06, legB: .08, aF: [-.15, -.35], aB: [.12, -.2], low: 0, bob: 0 };
  const fx = x0 => lerp(x0 - 760, x0, eo(u) * .2 + u * .8);
  fig(C, 'hanuman', { ...w, x: fx(500), y: y + w.bob, s: s * 1.02, aF: [-.5, -1.1], pF: -.6 }, t, 5);
  fig(C, 'lakshman', { ...w, x: fx(680), y: y + w.bob, s }, t, 3);
  fig(C, 'sita', { ...w, x: fx(830), y: y + w.bob, s }, t, 2);
  const up = E(t, 45.6, 46.6) * .14;
  fig(C, 'ram', { ...w, x: fx(980), y: y + w.bob, s, head: -up, aF: go ? w.aF : lerpP({ a: [-.15, -.35] }, { a: [-1.9, -2.3] }, E(t, 49.4, 50.3)).a, hF: 'open' }, t, 1);
};
SC.churn = (t, C) => {
  const tug = Math.sin((t - T.tug0) / (2 * BEAT) * Math.PI);      // + devas pull, − asuras pull
  put(tr, C, PR.mandara(), 960, 905, 1.0, .02 * tug);
  // rope across, coils around the mountain
  const off = 26 * tug;
  for (let x = -420; x < 760; x += 400) put(tr, C, PR.ropeSeg(), x - off * 0 + off, 700);
  for (let x = 1160; x < 2200; x += 400) put(tr, C, PR.ropeSeg(), x + off, 700);
  [[780, .7], [660, .6], [540, .5]].forEach(([y, s], i) => put(tr, C, PR.coil(i), 960 + off * (i % 2 ? -1 : 1) * .6, y + Math.sin(t * 2 + i) * 4, s * 1.4));
  put(tr, C, PR.serpentHead(), 1840 + off, 760, 1.0, 0, { fx: 1 });
  const s = .74, y = WAIST(s) - 30;
  [190, 330, 470].forEach((x, i) => fig(C, 'deva', { x: x + off, y, s, f: 1, rot: -.22 - .08 * tug, aF: [-1.35, -1.45], aB: [-1.25, -1.35], legF: -.42, legB: .3, head: -.05 }, t, 11 + i, { rods: false }));
  [1450, 1590, 1730].forEach((x, i) => fig(C, 'asura', { x: x + off, y, s, f: -1, rot: -.22 + .08 * tug, aF: [-1.35, -1.45], aB: [-1.25, -1.35], legF: -.42, legB: .3 }, t, 14 + i, { rods: false }));
  for (let i = 0; i < 3; i++) { const o2 = Math.sin(t * .9 + i * 2) * 30 + (Math.floor(t * 12) % 2) * 3 * (i % 2 ? 1 : -1); put(tr, C, PR.seaStrip(i), o2, 905 + i * 34); }
};
SC.rise = (t, C) => {
  put(tr, C, PR.mandara(), 960, 905, 1.0, 0, { a: .35 });
  const u = eo(seg(t, T.rise[0], T.rise[1])), ly = lerp(1260, 870, u);
  put(tr, C, PR.bigLotus(), 960, ly, .9);
  const s = .72;
  fig(C, 'lakshmi', { x: 960, y: ly - 268 * s - 12, s, aF: [lerp(-.3, -1.2, E(t, 66.2, 66.9)), lerp(-.6, -2.0, E(t, 66.2, 66.9))], aB: [lerp(.1, -1.0, E(t, 66.6, 67.3)), lerp(-.2, -1.5, E(t, 66.6, 67.3))], hF: 'open', head: -.06 }, t, 6);
  // coins rain, tumbling on twos
  if (t > T.coins[0]) for (let i = 0; i < 22; i++) { const t0 = T.coins[0] + hash(i) * 2.4, u2 = t - t0; if (u2 < 0) continue; const x = 520 + hash(i + 40) * 880, y = -40 + u2 * 260 + u2 * u2 * 60; if (y > 980) continue; const rr = Math.floor(t * 12) * .6 + i; put(tr, C, PR.coinP(), x + Math.sin(u2 * 3 + i) * 20, y, 1.1, rr, { fx: Math.cos(rr) }); }
  for (let i = 0; i < 3; i++) { const lift = i === 0 ? seg(t, T.seaLift, T.seaLift + 1.0) : 0; if (lift >= 1) continue; const o2 = Math.sin(t * .9 + i * 2) * 30; put(tr, C, PR.seaStrip(i), o2, 905 + i * 34 - 60 * lift, 1 + .6 * lift, 0, { a: 1 - ei(lift), blur: 30 * lift * C[0] }); }
};
SC.homes = (t, C) => {
  put(tr, C, PR.ground(), 0, 0);
  put(tr, C, PR.tree(0), 180, 912, .8); put(tr, C, PR.tree(1), 1760, 912, .85);
  const op = E(t, T.doors[0], T.doors[1]);
  put(tr, C, PR.doorLeaf(-1), 880 - 150 * op, 905 - 250 * .95, .95); put(tr, C, PR.doorLeaf(1), 960 + 150 * op, 905 - 250 * .95, .95);
  put(tr, C, PR.house(), 960, 908, .95);
  const rs = pl(t, T.rangoli, 1e9, .5); if (rs) put(tr, C, PR.rangoli(), 960, 958, 1.05 * rs.k, 0, { a: rs.a, blur: rs.blur * C[0] });
  const s = .66, u = seg(t, T.woman[0], T.woman[1]), bend = E(t, T.place - .5, T.place) * (1 - E(t, T.place + .5, T.place + 1.2));
  if (t > T.woman[0]) { const w = u < 1 ? walk(t, T.woman[0], 8) : { legF: -.06, legB: .08, low: 0, bob: 0 }; fig(C, 'woman', { ...w, x: lerp(300, 720, u), y: WAIST(s) + w.bob + bend * 20, s, rot: .32 * bend, head: .2 * bend, aF: [lerp(-.3, -.9, bend), lerp(-.6, -1.0, bend)], aB: [.1, -.2] }, t, 13); }
  const ds = pl(t, T.place, 1e9, .4);
  if (ds) put(tr, C, PR.diya(.9), 848, 900, ds.k, 0, { a: ds.a, blur: ds.blur * C[0] });
};
SC.fort = (t, C, shot) => {
  put(tr, C, PR.ground(0, 1920, '#5a3a2a'), 0, 0);
  const barsSt = pl(t, -1, T.barsOff, .1, .9);
  const s = .95, wx = 960, wy = 905, cell = [wx - 300 * s, wy - 300 * s, 600 * s, 260 * s];
  // captives behind the bars (inside the cell until the bars lift, then they stream out)
  const st = seg(t, T.stream[0], T.stream[1]);
  [[0, -1], [1, 1]].forEach(([v, dir], i) => {
    const x0 = wx - 270 * s + i * 290 * s, base = wy - 40 * s;
    if (st <= 0) put(tr, C, PR.captives(v), x0, base + Math.sin(t * 2 + i) * 3, .52 * s, 0, { clip: cell });
    else { const dx = dir * 900 * ei(st) + dir * 300 * st, dy = 180 * E(st, 0, .35); put(tr, C, PR.captives(v), x0 + dx, base + dy, (.52 + .2 * E(st, 0, .4)) * s, 0, { clip: st < .3 ? null : null }); }
  });
  put(tr, C, PR.fortress(), wx, wy, s);
  if (barsSt) put(tr, C, PR.bars(), wx, wy + barsSt.dy * 3 - 220 * seg(t, T.barsOff, T.barsOff + .9), s * barsSt.k, 0, { a: barsSt.a, blur: barsSt.blur * C[0] });
};
SC.fortScene = (t, C) => {
  SC.fort(t, C);
  const nst = pl(t, 0, T.bell2, .1, 1.0);
  if (nst) {
    let p = { x: 1500, y: WAIST(1.0), s: 1.0, f: -1, aF: [-2.4 + .1 * Math.sin(t * 3), -2.8], aB: [.4, 0], legF: -.2, legB: .2, pF: .4 };
    if (t >= T.chHit) { const j = seg(t, T.chHit, T.chHit + .12); p = { ...p, x: p.x + 16 * Math.sin(j * 28) * (1 - j), rot: .16, head: .2, aF: [-1.0, -.4] }; }
    fig(C, 'naraka', p, t, 9, { st: nst, tens: t > T.chHit ? .2 : 1.4 });
  }
};
SC.strike = (t, C) => {
  SC.fortScene(t, C);
  const u = eo(seg(t, T.chariot[0], T.chariot[1])), cx = lerp(-500, 560, u), cy = 560 + Math.sin(t * 2.2) * 10;
  put(tr, C, PR.chariot(), cx, cy, .9, .02 * Math.sin(t * 1.7));
  put(tr, C, PR.wheel(), cx - 60, cy - 10, .9, t * 4);
  const s = .62, y = cy - 135 - 268 * s * .2;
  fig(C, 'satya', { x: cx - 150, y: y - 30, s, aF: [1.25, -1.75], aB: [-1.5, -1.55], pB: 1.55, low: 0 }, t, 8, { rods: false });
  const raise = E(t, T.chakraUp - .4, T.chakraUp), thr = E(t, T.throw - .1, T.throw + .12);
  const kp = { x: cx + 40, y: y - 40, s, aF: [lerp(lerp(-.4, -2.6, raise), -1.4, thr), lerp(lerp(-.7, -3.0, raise), -1.5, thr)], aB: [.1, -.3] };
  const K = fig(C, 'krishna', kp, t, 7, { rods: false, propF: false });
  // the chakra: spins in the hand, flies to Naraka, returns
  const hand = [(K.hand[0] - C[4]) / C[0], (K.hand[1] - C[5]) / C[3]], tgt = [1450, WAIST(1) - 70];
  let c = hand, sc = s * 1.3;
  if (t > T.throw && t < T.back[1]) { const a = seg(t, T.throw, T.chHit), b = seg(t, T.back[0], T.back[1]); c = t < T.back[0] ? [lerp(hand[0], tgt[0], ei(a) * .4 + a * .6), lerp(hand[1], tgt[1], a) - Math.sin(a * Math.PI) * 60] : [lerp(tgt[0], hand[0], eo(b)), lerp(tgt[1], hand[1], b) - Math.sin(b * Math.PI) * 80]; sc = s * 1.6; }
  const fr12 = Math.floor(t * 12);
  for (let gh = 0; gh < (t > T.throw && t < T.back[1] ? 3 : 1); gh++) put(tr, C, propPiece('chakra'), c[0] - gh * 30 * Math.sign(tgt[0] - hand[0]), c[1], sc, fr12 * .9 * (t > T.chakraUp - .4 ? 1 : .2), { a: gh ? .3 / gh : 1 });
};
SC.freed = (t, C) => {
  SC.fort(t, C);
  put(tr, C, PR.chariot(), 300, 360 + Math.sin(t * 2.2) * 8, .62); put(tr, C, PR.wheel(), 263, 354, .62, t * 2);
};
SC.gwalior = (t, C) => {
  put(tr, C, PR.ground(), 0, 0); put(tr, C, PR.gwalior(), 960, 908, .95);
  fig(C, 'guru', { x: 960, y: WAIST(.55), s: .55, aF: [-.1, -.2], aB: [.1, -.1] }, t, 10);
};
// ---- TAILS: a procession out of the Gwalior gate. Guru Hargobind ji (back view) leads; 26 pairs of kings follow, each king holding one cord
const TAILS0 = 107.6, TV = 260, TGATE = 700, TGND = -70;                // walk speed px/s, gate x, ground strip raised 70 px (placard stays clear)
const TPAIR = .214, TFIRST = 108.15;                                       // a pair emerges every 0.214 s: all 26 out by 113.5
const tGX = t => TGATE + TV * (t - 107.75);                                // Guru under the arch at 107.75 (gate creak 107.8)
const tFeet = s => 905 + TGND - 268 * s;
const TZ = 1.25;
function tailsCamX(t) { const d = tGX(t) - 312 - TGATE; return TGATE + (d + Math.sqrt(d * d + 90 * 90)) / 2 - 45; }
function tailsLayout(t) {
  const sG = .55, gph = (t - TAILS0) * 6.2;
  const guru = { x: tGX(t), y: tFeet(sG) - Math.abs(Math.sin(gph)) * 3, s: sG, f: 1, legF: -.05 + .2 * Math.sin(gph), legB: .07 - .2 * Math.sin(gph), aF: [-.1 + .06 * Math.sin(gph), -.3], aB: [.12 - .06 * Math.sin(gph), -.2], low: .03 * Math.sin(gph) };
  const kings = [];
  const knot = toWorld(guru, -44, 236);              // one carved gold knot on the back hem: every cord starts here
  for (let j = 0; j < 26; j++) for (let r = 0; r < 2; r++) {
    const e = TFIRST + j * TPAIR; if (t < e) continue;
    const h1 = hash(j * 5 + r * 11), h2 = hash(j * 7 + r * 3 + 1);
    const s = r ? .44 * .7 : .44, kp = (t - e) * (5.8 + .8 * h1) + h2 * 6.28, trm = trem(t, 60 + j * 2 + r, 1.4);
    // front rank holds its cord at chest height, back rank at shoulder height; every arm a little different
    const aF = r ? [-1.62 + (h1 - .5) * .2, -1.72 + (h2 - .5) * .2] : [-1.28 + (h1 - .5) * .2, -1.42 + (h2 - .5) * .24];
    const pose = { x: TGATE + TV * (t - e) - (r ? 30 : 0), y: (r ? 905 + TGND - 22 : 905 + TGND) - 268 * s - Math.abs(Math.sin(kp)) * 3 + (h1 - .5) * 6,
      s, f: 1, legF: -.05 + .24 * Math.sin(kp), legB: .07 - .24 * Math.sin(kp), aB: [.15 + .1 * Math.sin(kp), -.25], low: .03 * Math.sin(kp),
      aF: [aF[0] + trm.dr * 4 + .04 * Math.sin(kp), aF[1] + trm.dr * 6 + .05 * Math.sin(kp)], head: -.06 + (h2 - .5) * .08 };
    kings.push({ r, j, s, pose, at: knot, hand: handAt(pose), name: 'raja' + ((j + (r ? 2 : 0)) % 4), kp });
  }
  guru.knot = knot;
  return { guru, kings };
}
SC.tails = (t, C) => {
  put(tr, C, PR.ground(-400, 4200), 0, TGND);
  put(tr, C, PR.gwalior(), TGATE, 905 + TGND + 3, 1.25, 0, { clip: [TGATE - 330, -100, 660, 1200], a: .62 });      // the gate and its two towers, on the ground strip
  const { guru, kings } = tailsLayout(t);
  const clipX = TGATE - 110;          // kings still inside the gate are not drawn yet; they emerge through the arch
  const kin = k => { tr.save(); tr.setTransform(1, 0, 0, 1, 0, 0); tr.beginPath(); tr.rect(C[0] * clipX + C[4], 0, 4000, H); tr.clip(); drawFig(tr, C, k.name, k.pose, { alpha: k.r ? .62 : 1, rivets: !k.r }); tr.restore(); };
  for (const k of kings) if (k.r) kin(k);
  for (const k of kings) if (!k.r) kin(k);
  fig(C, 'guru', guru, t, 10);
  // 52 separate ink cords, 2 px: straight rays from the one knot with a gentle sag that sways with the walk; back rank at 60 %
  tr.save(); tr.globalCompositeOperation = 'multiply'; tr.setTransform(C[0], 0, 0, C[3], C[4], C[5]); tr.lineCap = 'round';
  for (const k of kings.slice().sort((a, b) => b.r - a.r)) {
    const [x0, y0] = k.at, [x1, y1] = k.hand; if (x1 < clipX) continue;
    const L = Math.hypot(x1 - x0, y1 - y0), sag = L * .015 * (1 + .25 * Math.sin(k.kp));
    tr.strokeStyle = DYE.ink; tr.lineWidth = 2; tr.globalAlpha = k.r ? .6 : 1;
    tr.beginPath(); tr.moveTo(x0, y0); tr.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag, x1, y1); tr.stroke();
  }
  tr.globalAlpha = 1;
  if (guru.knot) { const [kx, ky] = guru.knot; tr.fillStyle = DYE.turmeric; tr.beginPath(); tr.arc(kx, ky, 7, 0, 7); tr.fill(); tr.strokeStyle = DYE.ink; tr.lineWidth = 1.6; tr.stroke(); tr.fillStyle = '#3a1a08'; tr.beginPath(); tr.arc(kx, ky, 2.4, 0, 7); tr.fill(); tr.lineWidth = 1; tr.beginPath(); tr.moveTo(kx - 5, ky - 3); tr.lineTo(kx + 5, ky + 3); tr.stroke(); }
  tr.restore();
};
SC.temple = (t, C) => {
  const by = 640, s = .95;
  put(tr, C, PR.waterStrip(), 960, by, 1);
  put(tr, C, PR.temple(), 960, by + 2, s, 0, { fy: -1, a: .42 });          // reflection
  put(tr, C, PR.temple(), 960, by, s);
  const fr12 = Math.floor(t * 6);
  for (let k = 0; k < 9; k++) { const y = by + 30 + k * 26; tr.save(); tr.globalCompositeOperation = 'multiply'; tr.setTransform(C[0], 0, 0, C[3], C[4], C[5]); tr.strokeStyle = 'rgba(28,79,116,.35)'; tr.lineWidth = 4; tr.beginPath(); for (let x = 420; x < 1500; x += 40) { const xx = x + ((fr12 + k) % 2) * 20; tr.moveTo(xx, y); tr.quadraticCurveTo(xx + 10, y - 4, xx + 20, y); } tr.stroke(); tr.restore(); }
};
SC.teacher = (t, C) => {
  put(tr, C, PR.ground(0, 1920, '#6a4a2a'), 0, 0);
  let lv = 0; T.levels.forEach((x, i) => { if (t >= x) lv = i + 1; });
  const st = pl(t, -1, T.gone, .1, 1.4);
  if (st) put(tr, C, PR.teacher(lv), 960, 900 + st.dy, .95 * st.k, 0, { a: st.a, blur: st.blur * C[0] });
  // then many small lamps, pressed on one after another
  const n = 27;
  for (let i = 0; i < n; i++) { const r = Math.floor(i / 9), c = i % 9, t0 = T.lamps[0] + (r * 9 + (c % 2 ? 8 - c : c)) / n * (T.lamps[1] - T.lamps[0]); const ds = pl(t, t0, 1e9, .4); if (!ds) continue; const x = 960 + (c - 4) * 170 + (r % 2) * 50, y = [935, 800, 660][r]; put(tr, C, PR.diya(1.2 - r * .2), x, y, ds.k, 0, { a: ds.a, blur: ds.blur * C[0] }); }
};
SC.peak = (t, C) => {
  put(tr, C, PR.ground(), 0, 0);
  const xs = [270, 640, 1000, 1360, 1690], tin = i => T.heroes + i * BEAT;
  let st;
  if ((st = pl(t, tin(0)))) fig(C, 'ram', { x: xs[0], y: WAIST(.82) + st.dy, s: .82, aB: [-.9, -1.2], pB: 1.2, head: -.1, hF: 'open' }, t, 1, { st });
  if ((st = pl(t, tin(1)))) { put(tr, C, PR.bigLotus(), xs[1], 905, .6 * st.k, 0, { a: st.a, blur: st.blur * C[0] }); fig(C, 'lakshmi', { x: xs[1], y: 905 - 66 - 268 * .7 + st.dy, s: .7, aF: [-1.2, -2.0], hF: 'open' }, t, 6, { st }); }
  if ((st = pl(t, tin(2)))) fig(C, 'krishna', { x: xs[2], y: WAIST(.82) + st.dy, s: .82, aF: [-2.5, -2.9] }, t, 7, { st });
  if ((st = pl(t, tin(3)))) {
    const G = xs[3] + 60, sG = .74, gp = { x: G, y: WAIST(sG), s: sG };
    fig(C, 'guru', gp, t, 10, { st });
    // no tails in the line-up: the procession shot already told that story
  }
  if ((st = pl(t, tin(4)))) put(tr, C, PR.teacher(4), xs[4], 905 + st.dy, .52 * st.k, 0, { a: st.a, blur: st.blur * C[0] });
};
SC.close = (t, C) => { };

// ================= the storyteller's hand with a match (front layer) =================
// t0 = when the hand enters; strike at t0+.4, touches the wick at t0+1.0, leaves; target = wick tip (viewport)
function matchHand(t, t0, tgt, sc, opt = {}) {
  const u = t - t0; if (u < 0 || u > 2.4) return null;
  const rest = [tgt[0] + 240 * sc, tgt[1] + 120 * sc], strike = [tgt[0] + 150 * sc, tgt[1] + 70 * sc], touch = [tgt[0] + 26 * sc, tgt[1] - 6 * sc];
  let p;
  if (u < .3) p = [lerp(rest[0] + 500 * sc, rest[0], eo(u / .3)), lerp(rest[1] + 300 * sc, rest[1], eo(u / .3))];
  else if (u < .45) p = [lerp(rest[0], strike[0], ei(seg(u, .3, .45))), lerp(rest[1], strike[1], ei(seg(u, .3, .45)))];
  else if (u < 1.0) p = [lerp(strike[0], touch[0], eio(seg(u, .5, .95))), lerp(strike[1], touch[1], eio(seg(u, .5, .95)))];
  else if (u < 1.25) p = touch;
  else p = [lerp(touch[0], rest[0] + 700 * sc, ei(seg(u, 1.25, 2.3))), lerp(touch[1], rest[1] + 400 * sc, ei(seg(u, 1.25, 2.3)))];
  const lit = u >= .4 && u < 1.7 ? (u < .5 ? 1.6 : 1) * (1 - seg(u, 1.5, 1.7)) : 0;
  const hs = 1.1 * sc, ang = -.55;
  const M = [hs * Math.cos(ang), hs * Math.sin(ang), -hs * Math.sin(ang), hs * Math.cos(ang), p[0] + 60 * sc, p[1] + 150 * sc];
  let tip = null;
  silhouette(fr, g => {
    const h = pinchHand(g, M, .2);
    const a = h.gripA, dir = [p[0] - a[0], p[1] - a[1]], L = Math.hypot(...dir) || 1;
    tip = [a[0] + dir[0] / L * 70 * sc, a[1] + dir[1] / L * 70 * sc];
    g.lineWidth = 5 * sc; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(tip[0], tip[1]); g.stroke();
    g.beginPath(); g.arc(tip[0], tip[1], 6 * sc, 0, 7); g.fill();
  }, { dir: [-.7, -.7], k: 5 * sc, rimA: .4 + .55 * lit, rim: '#ffb766' });
  if (lit > 0 && tip) railFlameFx(fr, tip[0], tip[1] + 4 * sc, .9 * sc * Math.min(1.4, lit), t, Math.min(1, lit), 9);
  return { p, lit };
}

// ================= camera per shot =================
function railCam(k) { return [RAIL_X[k] + 40, 960, 1.45]; }
function crash(t, c) { const u = t - c; if (u < 0) return 0; return u < 4 / 24 ? 1 : Math.exp(-(u - 4 / 24) * 5); }
function camAt(t, shot) {
  const [t0, t1, name, k] = shot, u = (t - t0) / (t1 - t0);
  switch (name) {
    case 'hole': return t < 8.2 ? [960, lerp(540, 600, E(t, 6, 8.2)), lerp(2.4, .9, eio(seg(t, .8, 8.2)))] : [960, lerp(600, 610, seg(t, 8.2, 13)), lerp(.9, .86, seg(t, 8.2, 13))];
    case 'act': {
      const from = k === 0 ? [960, 610, .86] : [960, 540, 1.0], to = railCam(k);
      let c = [0, 1, 2].map(i => lerp(from[i], to[i], eio(seg(t, t0, t0 + .5))));
      if (k === 4) c = [lerp(to[0], to[0] - 20, seg(t, t0 + .5, t1)), to[1], lerp(to[2], 1.6, eio(seg(t, t0 + .5, t1 - .8)))];
      else { const cz = crash(t, CATCH[k]); c[2] *= 1 + .3 * cz; c[1] -= 30 * cz; }
      const r = eio(seg(t, t1 - .8, t1)); return [lerp(c[0], 960, r), lerp(c[1], 540, r), lerp(c[2], 1.0, r)];
    }
    case 'exile': { const m = 960 + 190 * (t - 16.8) * ss(seg(t, 16.8, 17.6)) + 190 * Math.max(0, t - 17.6) * 0 ; return [lerp(960, 2180, seg(t, 16.8, 23.2) * .9 + ss(seg(t, 16.8, 23.2)) * .1), 560, 1.0]; }
    case 'abduct': { const wp = ei(seg(t, T.whip[0], T.whip[1])); return [lerp(940, 2200, wp) + (t > T.whip[1] ? 300 * (t - T.whip[1]) : 0), 600, 1.15]; }
    case 'bridge': { const l = ss(seg(t, T.leap[0], T.leap[1] + .3)); return [lerp(900, 1320, l), lerp(620, 250, l), lerp(1.05, 1.25, l)]; }
    case 'battle': { const p = E(t, 34.4, 37.0), sh = t < T.bell1 ? E(t, 34.4, 36.6) : 1 - E(t, T.bell1, 38.6); return [lerp(960, 980, p) + (vnoise(t * 6) - .5) * 14 * sh, 560 + (vnoise(t * 6 + 9) - .5) * 10 * sh, lerp(1.2, 1.38, p) - .2 * E(t, 37.6, 39.4)]; }
    case 'return': return [960, 540, 1.0];
    case 'churn': return [960, lerp(130, 560, eio(seg(t, 56.0, 60.4))), lerp(1.2, 1.0, eio(seg(t, 56.0, 60.4))) + .06 * E(t, 60.4, 64.2)];
    case 'rise': return [960, lerp(560, 500, eio(u)), lerp(1.0, 1.2, eio(u))];
    case 'homes': return [lerp(900, 960, eio(u)), 600, lerp(1.08, 1.2, eio(u))];
    case 'fort': return [960, lerp(540, 600, eio(u)), lerp(1.0, 1.32, eio(u))];
    case 'strike': { const wp = ss(seg(t, T.throw, T.throw + .3)), bk = ss(seg(t, 90.8, 91.8)); return [lerp(lerp(700, 900, E(t, 86, 88.4)), 1250, wp * (1 - bk)) + 0, 560, 1.15]; }
    case 'freed': return [960, lerp(600, 540, eio(u)), lerp(1.3, .9, eio(seg(t, 92.4, 96.4)))];
    case 'gwalior': return [960, lerp(560, 640, eio(u)), lerp(1.0, 1.32, eio(u))];
    case 'tails': return [tailsCamX(t), 610, TZ];
    case 'temple': return [960, lerp(380, 760, eio(seg(t, 115.6, 121.4))), lerp(1.05, 1.15, u)];
    case 'teacher': return [960, lerp(500, 520, u), lerp(1.0, 1.12, eio(seg(t, 125.8, 134)))];
    case 'silence': return [960, 1000, 1.2];
    case 'peak': { const rise = eio(seg(t, T.peakRise[0], T.peakRise[1])), pb = eio(seg(t, T.pullBack[0], T.pullBack[1])); const a = [960, lerp(1000, 540, rise), lerp(1.2, 1.0, rise)]; return [960, lerp(a[1], 600, pb), lerp(a[2], .72, pb)]; }
    case 'close': { const pb = eio(seg(t, 153.8, 157.4)), pi = eio(seg(t, 160.0, 162.8)); return [960, lerp(lerp(600, 760, pb), 860, pi), lerp(lerp(.72, .44, pb), .6, pi)]; }
  }
  return [960, 540, 1];
}
const WIDE = { exile: [0, 0, 3600, 1080], abduct: [0, 0, 3200, 1080], bridge: [0, -600, 1920, 1080], churn: [0, -400, 1920, 1080], tails: [-400, 0, 4200, 1080], temple: [0, -200, 1920, 1500] };
const FRAMED = new Set(['hole', 'act', 'silence', 'peak', 'close', 'freed']);
function clampCam(c, name) {
  const r = WIDE[name] || [0, 0, 1920, 1080];
  if (FRAMED.has(name) || c[2] < 1) return c;
  return [clamp(c[0], r[0] + 960 / c[2], r[2] - 960 / c[2]), clamp(c[1], r[1] + 540 / c[2], r[3] - 540 / c[2]), c[2]];
}
// transitions between stories inside an act: a blurred foreground pillar wipes across (viewport coords)
const WIPES = [23.2, 28.6, 34.4, 39.6, 64.2, 69.2, 86.0, 92.2, 107.6, 114.6];
function drawPillar(g, x) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'blur(16px)';
  const w = 1300, gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  gr.addColorStop(0, 'rgba(12,4,3,0)'); gr.addColorStop(.08, '#120604'); gr.addColorStop(.45, '#3a1609'); gr.addColorStop(.55, '#2a0f07'); gr.addColorStop(.92, '#0e0503'); gr.addColorStop(1, 'rgba(12,4,3,0)');
  g.fillStyle = gr; g.fillRect(x - w / 2, -40, w, 1160);
  g.restore();
}
function wipeX(t) { for (const c of WIPES) { if (t > c - .35 && t < c + .35) return lerp(2700, -800, (t - c + .35) / .7); } return null; }

// ================= render =================
const sceneFn = { exile: SC.exile, abduct: SC.abduct, bridge: SC.bridge, battle: SC.battle, return: SC.ret, churn: SC.churn, rise: SC.rise, homes: SC.homes, fort: SC.fortScene, strike: SC.strike, freed: SC.freed, gwalior: SC.gwalior, tails: SC.tails, temple: SC.temple, teacher: SC.teacher, peak: SC.peak };
function render(t) {
  TXT.length = 0;
  tr.setTransform(1, 0, 0, 1, 0, 0); tr.globalAlpha = 1; tr.filter = 'none'; tr.globalCompositeOperation = 'source-over'; tr.fillStyle = '#fff'; tr.fillRect(0, 0, W, H);
  fr.setTransform(1, 0, 0, 1, 0, 0); fr.clearRect(0, 0, W, H); fr.globalAlpha = 1; fr.filter = 'none';
  const shot = shotAt(t), name = shot[2];
  const cam = clampCam(camAt(t, shot), name), C = camM(cam);
  // cloth content
  if (name === 'hole') SC.hole(t, C);
  else if (name === 'act') {
    const k = shot[3], prev = SHOTS[SHOTS.indexOf(shot) - 1];
    if (t < shot[0] + .5 && prev && sceneFn[prev[2]]) sceneFn[prev[2]](prev[1] - .01, C);
    if (t > STORY[k] - .85) sceneFn[SHOTS[SHOTS.indexOf(shot) + 1][2]](STORY[k], C);
  } else if (sceneFn[name]) sceneFn[name](t, C);
  // the next story's set is already on the cloth while the act plaque lifts off
  drawPlaques(t, C);
  // lamps
  const lamps = lampsAt(t, (WIDE[name] && name !== 'bridge' && name !== 'temple' && name !== 'churn') ? cam[0] - 960 : 0);
  const n = lamps.reduce((a, l) => a + l[2], 0) / LAMP_I;
  let expo = 1.75 / Math.sqrt(Math.max(1, n));
  const bleach = name === 'peak' ? E(t, PEAKF[4], PEAKF[4] + 1.2) : name === 'close' ? 1 - E(t, 157.6, 160.4) : 0;
  expo *= 1 + .3 * bleach;
  // front layer: frame, rail, hands, audience
  const z = cam[2];
  if (FRAMED.has(name) || (z < .98 && !WIDE[name])) {
    drawFrame(fr, C, clamp(n, 0, 3) / 1.5);
    const lit = railLit(t), sm = railSmoke(t);
    drawRail(fr, C, t, lit, sm, 1);
    if (name === 'silence' || (name === 'peak' && t < PEAKF[0] + .3)) { fr.save(); fr.setTransform(1, 0, 0, 1, 0, 0); fr.fillStyle = `rgba(0,0,0,${name === 'silence' ? .72 : .72 * (1 - seg(t, PEAKF[0], PEAKF[0] + .3))})`; fr.fillRect(0, 0, W, H); fr.restore(); }
    for (let i = 0; i < 5; i++) { if (Math.abs(t - CATCH[i] - .2) < 1.6) matchHand(t, CATCH[i] - 1.0, railFlamePos(C, i), z); }
    if (name === 'silence' || name === 'peak') matchHand(t, T.match2 - .4, railFlamePos(C, 0), z);
    if (name === 'close') drawViewerDiya(t, C);
    if (name === 'peak' || name === 'close') drawAudience(fr, (name === 'peak' ? E(t, 150.5, 153.4) : 1 - E(t, 157.8, 159.6)) * .95, t);
  }
  const wx = wipeX(t); if (wx != null) drawPillar(fr, wx);
  drawChannel(fr, .35); TXT.push({ id: 'channel', text: 'NARRATUDE', box: [1920 - 330 - 34 + 30, 30 + 14, 1920 - 34 - 30, 30 + 60] });
  drawSubs(t);
  const rect = WIDE[name] || [0, 0, 1920, 1080];
  const black = name === 'silence' ? 1 : 0;
  const fade = (t < .5 ? 1 - seg(t, 0, .5) : 0);
  const o = { lamps, cam, rect, expo, sigB: 620, sigC: 110, amb: .2, time: t, vign: .45, sat: 1.1, contrast: .15, bloom: .3 + .25 * bleach + (t < 9 ? .15 : 0), tint: [1 + .03 * bleach, 1, 1 - .1 * bleach], fade, fadeCol: [0, 0, 0], haze: name === 'battle' ? 2.6 : 0 };
  GL.render(trc, frc, o);
}
// the viewer's diya: placed on the stage lip, lit by the storyteller's match
function drawViewerDiya(t, C) {
  const x = 960 - 30, y = RAIL_Y + 170, k = C[0];
  const pin = eo(seg(t, T.viewer[0], T.viewer[0] + .6));
  if (pin <= 0) return;
  const vx = C[0] * x + C[4], vy = C[3] * (y + (1 - pin) * 260) + C[5];
  fr.save(); fr.setTransform(C[0] * 1.35, 0, 0, C[3] * 1.35, vx, vy);
  fr.fillStyle = '#6a2e12'; fr.beginPath(); PR.diyaPath(fr, 0, 0, 1); fr.fill(); fr.fillStyle = '#2a1206'; fr.beginPath(); fr.ellipse(2, 3, 34, 4, 0, 0, 7); fr.fill();
  fr.strokeStyle = '#a0521e'; fr.lineWidth = 2; fr.beginPath(); fr.moveTo(-40, 4); fr.quadraticCurveTo(0, 9, 46, 2); fr.stroke();
  fr.restore();
  const wick = [vx + 58 * C[0] * 1.35, vy - 8 * C[3] * 1.35];
  if (t >= T.vcatch) railFlameFx(fr, wick[0], wick[1], 1.3 * k * 1.35, t, Math.min(1.2, flare(t, T.vcatch)) * (1 - E(t, T.fade[0] + .4, T.fade[1])), 21);
  matchHand(t, T.vcatch - 1.0, wick, k * 1.35);
}
function drawSubs(t) {
  if (qs.get('nosub')) return;
  for (const s of SUBS) if (t >= s.t0 && t < s.t1) { const a = Math.min(E(t, s.t0, s.t0 + .2), 1 - E(t, s.t1 - .25, s.t1)); drawSub(fr, s.text, a, 1 - eo(seg(t, s.t0, s.t0 + .22))); }
}
window.TEXTS = t => { render(t); return TXT.map(x => ({ id: x.id, text: x.text, x0: x.box[0], y0: x.box[1], x1: x.box[2], y1: x.box[3] })); };

// ================= sound / music events =================
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +(+t).toFixed(3), ...o });
  add('clap', T.clap); add('pilot', T.pilot);
  T.rings.forEach((r, i) => add('liftoff', r, { v: .5 + i * .1 }));
  add('rodtap', T.titleSet); add('liftoff', T.titleOut);
  for (let k = 0; k < 5; k++) {
    add('match', MATCH[k], { k }); add('catch', CATCH[k], { k, quiet: k === 4 ? 1 : 0 }); add('rodtap', CATCH[k] + .35, { v: .5 }); add('liftoff', STORY[k] + .65, { v: .6 });
  }
  for (let i = 0; i < 18; i++) add('step', 16.9 + i * .34, { v: .4 + .2 * (i % 2) });
  add('wind', 16.8, { d: 6.4 });
  add('deerhop', 23.3); add('deerhop', 23.8, { v: .7 }); add('deerhop', 24.3, { v: .6 });
  add('swap', T.swap); add('thwack', T.grab); add('cloth', T.grab + .1); add('whip', T.whip[0]); add('liftoff', T.ravOut);
  add('sea', 28.6, { d: 6.0 }); add('press', T.bridgeOn); for (let i = 0; i < 10; i++) add('stone', T.bridgeOn + .1 + i * .09, { v: .3 + .05 * i });
  add('crowd', T.monk[0], { d: 3.4 }); add('whoosh', T.leap[0], { d: 1.4 });
  add('creak', T.draw[0], { d: T.draw[1] - T.draw[0] }); add('twang', T.loose); add('arrow', T.loose, { d: T.hit - T.loose }); add('thwack', T.hit); add('bell', T.bell1, { big: 1 }); add('liftoff', T.bell1);
  add('fire', 34.4, { d: 4.6 });
  for (let i = 0; i < 12; i++) add('tick', T.win0 + i * BEAT, { i });
  for (let i = 0; i < 10; i++) add('step', 39.7 + i * .38, { v: .35 });
  add('sea', 56.0, { d: 8.2 }); for (let i = 0; i < 6; i++) add('creak', T.tug0 + i * 2 * BEAT, { d: .6, v: .5 });
  add('liftoff', T.seaLift); add('rise', T.rise[0], { d: 1.8 }); for (let i = 0; i < 22; i++) add('coin', T.coins[0] + hash(i) * 2.4 + 1.5 + hash(i + 7) * .5, { v: .3 + .3 * hash(i + 3) });
  add('door', T.doors[0], { d: 1.0 }); add('press', T.rangoli, { v: .6 }); add('sand', T.rangoli + .1); for (let i = 0; i < 5; i++) add('step', T.woman[0] + .2 + i * .36, { v: .3 }); add('press', T.place, { v: .5 });
  add('heart', T.heart[0], { d: T.heart[1] - T.heart[0] + 1.2 }); add('rattle', 82.4); add('rattle', 84.6, { v: .6 });
  add('wheel', T.chariot[0], { d: 5.0 }); add('whirr', T.chakraUp - .4, { d: T.back[1] - T.chakraUp + .4 }); add('whip', T.throw); add('thwack', T.chHit); add('bell', T.bell2, { big: 1 }); add('liftoff', T.bell2);
  add('liftoff', T.barsOff); add('rattle', T.barsOff, { v: 1 }); add('crowd', T.stream[0], { d: 4.2, v: .5 });
  add('gate', 101.4, { d: 1.6 });
  for (let j = 0; j < 26; j++) add('pluck', TFIRST + j * TPAIR, { j });
  add('gate', 107.8, { d: 1.2 });
  for (let i = 0; i < 36; i++) add('step', 107.7 + i * .19, { v: .18 + .12 * hash(i) + .1 * Math.min(1, i / 20) });
  add('water', 114.6, { d: 7.4 });
  T.levels.forEach((x, i) => add('ting', x, { i })); add('liftoff', T.gone, { v: .4 });
  for (let i = 0; i < 27; i++) add('tinyflare', T.lamps[0] + i / 27 * (T.lamps[1] - T.lamps[0]), { i });
  add('hardcut', T.silence); add('match', T.match2, { k: 0, solo: 1 });
  PEAKF.forEach((p, i) => { add('catch', p, { k: i, peak: 1 }); });
  for (let i = 0; i < 5; i++) add('press', T.heroes + i * BEAT, { v: .5 });
  add('room', T.close, { d: 14 }); add('match', T.vcatch - .6, { k: 2 }); add('catch', T.vcatch, { k: 2, quiet: 1 });
  SNUFF.forEach((s, i) => add('snuff', s, { i })); add('press', T.endIn, { v: .5 }); add('clap', T.clap2);
  WIPES.forEach(w => add('swish', w - .2, { v: .4 }));
  for (const v of LINES) add('vo', v.t, { id: v.id });
  return ev.sort((a, b) => a.t - b.t);
}
window.EV = events(); window.T = T;
window.DUR = DUR;
if (qs.get('test')) { const tm = await import('./test.js'); window.render = t => { fr.clearRect(0, 0, W, H); const o = tm.modelSheet(tr, fr, qs.get('v') || 'a'); GL.render(trc, frc, o); }; }
else window.render = render;
const SEG = qs.get('seg'); if (SEG) { const [a, b] = SEG.split(':').map(Number); const r0 = window.render; window.render = t => r0(t + a); window.DUR = b - a; const tx = window.TEXTS; window.TEXTS = t => tx(t + a); }
window.render(parseFloat(qs.get('t') ?? '30'));
window.READY = true;
