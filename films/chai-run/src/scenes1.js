// Scenes 1/14 (finish), 2 (rewind → kettle), 4 (stairway), 7 (trip + shatter)
import { W, H, rgba, mix, TAU, rng, cel, poly, path, line, airbrush, canvas } from './cel.js';
import { pal } from './pal.js';
import { runPose, glass, tray } from './body.js';
import { fig, plate, loopPlate, impact, flash, step12, layer, dust, lightBand } from './common.js';
import { speedLines, flare, lamp } from './fx.js';
import { osd } from './hud.js';
import { HIT } from './timeline.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ss = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

// ——— finish line (shared framing for s1 and s14) ——— T = local finish time (s), mode 'open' | 'end'
export function finish(S, T, mode) {
  const { g, e, A } = S, tc = step12(T);
  const ox = 280 + T * 170;
  plate(g, e, A.track, ox, 0);
  const NEAR = 1990, FAR = 1720, postX = 1330 - ox;
  // far post + tape
  const tapeY0 = FAR - 520, tapeY1 = NEAR - 640;
  g.fillStyle = '#f2ece0'; g.fillRect(postX + 70, FAR - 560, 14, 560);
  const broken = mode === 'end' && T > 1.95;
  // rival (far lane): straining, in sneakers
  const T2 = Math.min(T, 2), ex = Math.max(0, T - 1.6), rx = 560 - ss(T2 / 2.0) * 190 - ex * ex * 60, rp = runPose(tc * .5 + .3, { speed: .95 });
  // chhotu (near lane), barefoot, overtaking
  const cx = 200 + ss(T2 / 2.0) * 470 + ex * ex * 140;   // s14 = s1 exactly until the tape
  const cp = runPose(tc * .55, { speed: 1.05, lean: .42 });
  const r = fig(g, e, 'chhotu', 'sun', cp, { view: 'side', expr: mode === 'end' && T > 2.5 ? 'grin' : 'focus', ph: tc, skinRim: '#ffd890', smear: false, ghostPoses: [runPose(tc * .55 - .06), runPose(tc * .55 - .03)] }, cx, FAR, .8);
  // rival in the near lane (foreground, cut by the frame bottom), falling behind
  fig(g, e, 'kidA', 'sun', rp, { view: 'side', expr: 'hurt', shoe: true, ph: tc }, rx, NEAR, .95);
  // tape (unbroken: a line between post tops; broken: two fluttering ends)
  g.save(); g.lineCap = 'round';
  if (!broken) { g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.beginPath(); g.moveTo(postX + 77, tapeY0); g.quadraticCurveTo(postX + 20, (tapeY0 + tapeY1) / 2 + 20, postX - 40, tapeY1); g.stroke(); }
  else {
    const k = T - 1.95;
    for (const [x0, y0, dir] of [[postX + 77, tapeY0, 1], [postX - 40, tapeY1, -1]]) {
      g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, y0);
      for (let i = 1; i <= 8; i++) { const u = i / 8; g.lineTo(x0 - dir * u * (120 + k * 200) * .5 - u * k * 260, y0 + Math.sin(u * 6 + T * 9) * 18 * u + u * 40); }
      g.stroke();
    }
  }
  g.restore();
  // near post (foreground, cut by frame bottom)
  g.fillStyle = '#f6f0e4'; g.fillRect(postX - 56, NEAR - 600, 22, 800); g.fillStyle = '#c8303a'; for (let k = 0; k < 6; k++) g.fillRect(postX - 56, NEAR - 600 + k * 130, 22, 40);
  // sun flare behind
  flare(e, 1820 - ox, A.track.hy - 90, .8, '#ffb060', { ghosts: false, streak: 700 });
  // slow-motion speed lines (very light)
  speedLines(g, Math.floor(T * 12), { type: 'h', n: 26, col: '#fff4dc', a: .35, hmax: 4 });
  return r;
}
export function s1(S) {
  const { lt } = S, T = Math.min(lt, 2.0);
  finish(S, T, 'open');
  if (lt >= 2.0) { flash(S.g, lt < 2.0 + 1 / 24 + 1e-6 ? .9 : 0); return { fade: .32, contrast: .35, sat: .78, tint: [1.04, .96, .9] }; }
  return {};
}
export function s14(S) {
  finish(S, S.lt, 'end');
  return {};
}

// ——— scene 2: tape rewind (the freeze runs backwards), then the kettle at 5 AM ———
export function kettle(g, e, C, x, y, s, k) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const sh = [0, 3, -2, 2][k % 4];
  const AL = { f: '#c6c8d4', s: '#7c7a92', h: '#ffffff', l: '#2a2838' };
  cel(g, [[-170, 0], [-182, -40], [-160, -130], [-100, -180], [100, -180], [160, -130], [182, -40], [170, 0]], { f: AL.f, s: AL.s, so: [-30, -10], h: AL.h, ho: [12, 8], l: AL.l, lw: 4 });
  cel(g, [[140, -120], [250, -230], [290, -300, 1], [304, -290, 1], [270, -210], [176, -70]], { f: AL.f, s: AL.s, so: [-10, 4], l: AL.l, lw: 4 });   // spout
  cel(g, [[-110, -176 + sh], [-90, -204 + sh], [90, -204 + sh], [110, -176 + sh]], { f: AL.f, s: AL.s, so: [0, 8], h: AL.h, l: AL.l, lw: 4 });  // lid
  cel(g, [[-24, -204 + sh], [-18, -232 + sh], [18, -232 + sh], [24, -204 + sh]], { f: '#2a2234', l: AL.l, lw: 3 });
  g.strokeStyle = '#2a2234'; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(-130, -170); g.bezierCurveTo(-120, -330, 120, -330, 130, -170); g.stroke();
  g.strokeStyle = '#5a5068'; g.lineWidth = 6; g.beginPath(); g.moveTo(-120, -190); g.bezierCurveTo(-110, -320, 110, -320, 120, -190); g.stroke();
  g.fillStyle = rgba('#ffffff', .75); g.fillRect(90, -150, 22, 120); g.fillStyle = rgba('#ffd090', .6); g.fillRect(140, -120, 12, 100);
  g.fillStyle = rgba('#3a2a3a', .5); g.fillRect(-170, -22, 340, 10);   // soot band
  g.restore();
  if (e) { e.save(); e.translate(x, y); e.scale(s, s); for (let i = 0; i < 5; i++) { e.fillStyle = rgba(i % 2 ? '#4a8aff' : '#8ac8ff', .8); e.beginPath(); e.ellipse(-120 + i * 60, 18, 22, 30 + (k + i) % 3 * 8, 0, 0, TAU); e.fill(); } e.restore(); }
  g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#5a9aff' : '#bfe4ff'; g.beginPath(); g.ellipse(-120 + i * 60, 18, 14, 22 + (k + i) % 3 * 6, 0, 0, TAU); g.fill(); } g.restore();
}
function steam(g, e, x, y, s, t, n = 12) {   // puffs travelling up-right from the spout tip, 12 fps
  const tc = step12(t);
  for (let i = 0; i < n; i++) {
    const a = ((tc * 1.6 + i / n) % 1), px = x - a * 300 * s + Math.sin(a * 6 + i) * 40 * s * a, py = y - a * 560 * s, r = (16 + a * 90) * s;
    const al = (1 - a) * .85;
    g.fillStyle = rgba('#fff4e6', al); g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
    g.fillStyle = rgba('#ffd8a0', al * .6); g.beginPath(); g.arc(px + r * .3, py + r * .2, r * .7, 0, TAU); g.fill();
    e.fillStyle = rgba('#ffb060', al * .45); e.beginPath(); e.arc(px, py, r * 1.2, 0, TAU); e.fill();
  }
}
export function s2(S) {
  const { g, e, lt, t } = S;
  const REW = .54;
  if (lt < REW) {   // rewind: freeze frame plays backwards fast
    const T = 2.0 * (1 - lt / REW);
    finish(S, T, 'open');
    S.osd = c => { c.save(); c.font = 'italic 900 84px Kanit'; c.fillStyle = '#ffffff'; c.strokeStyle = '#1a0a24'; c.lineWidth = 10; c.strokeText('◀◀ REW', 60, 300); c.fillText('◀◀ REW', 60, 300); c.restore(); };
    return { track: .9 + .1 * Math.sin(lt * 40), fade: .2 };
  }
  const k = Math.floor(t * 12);
  plate(g, e, S.A.stall, 0, 0, 1 + (lt - REW) * .03);
  const PC = pal('chhotu', 'interior');
  layer(g, e, (lg, le) => kettle(lg, le, PC, 400, 1380, 1.7, k));
  steam(g, e, 400 + 510, 1380 - 500, 1.2, t);
  lightBand(S.g.canvas, (lt - REW) / 1.4, '#ffe0a0', .12, 180);
  S.osd = c => { c.save(); c.font = '700 64px "Barlow SC"'; c.fillStyle = '#fff6e0'; c.strokeStyle = '#1a0a24'; c.lineWidth = 8; c.strokeText('AM 5:00', 60, 300); c.fillText('AM 5:00', 60, 300); c.restore(); };
  return { track: lt < REW + 3 / 24 ? 1 - (lt - REW) * 8 : 0 };
}

// ——— scene 4: up the long stairway, 0 → 300 ———
export function s4(S) {
  const { g, e, lt, A } = S, P = A.stairs, st = P.stair, tc = step12(lt);
  const D = 3.5, u = .03 + .9 * (lt / D);
  const fx = st.x0 + (st.x1 - st.x0) * u + 10, fy = st.y0 + (st.y1 - st.y0) * u - 20;
  const ox = clamp(fx - 560, 0, P.c.width - W), oy = clamp(fy - 1280, 0, P.c.height - H);
  plate(g, e, P, ox, oy);
  const cyc = (lt + .05) * 2;   // 2 cycles / s → 4 steps / s (8th notes)
  const pose = runPose(step12(cyc / 2) * 2 % 1, { speed: .9, lean: .45, trayArm: true });
  pose.bob *= .35;
  fig(g, e, 'chhotu', 'sun', pose, { view: 'side', expr: 'focus', chappal: true, tray: { n: 12 }, ph: tc, skinRim: '#ffd890' }, fx - ox, fy - oy, .6);
  const n = Math.min(300, Math.round(300 * clamp(lt / (D - .2), 0, 1)));
  S.osd = c => osd(c, 'SEEDHIYAAN', String(n).padStart(3, '0') + ' / 300', { bar: n / 300, w: 470 });
  return {};
}

// ——— scene 7: the strap snaps, he trips, 12 glasses fly and shatter at 17.90 ———
export function s7(S) {
  const { g, e, t, lt, A } = S;
  const SNAP = 16.9, TRIP = 17.15, IMP = HIT.drop;
  // slow motion after the trip: local time slows to .3×
  const tau = t < TRIP ? t : TRIP + (Math.min(t, IMP) - TRIP) * .3;
  const ground = A.street.ground + 300, ox = 600 + tau * 380;
  const z = 1 + ss((t - TRIP) / .7) * .12;
  g.save(); e.save(); g.translate(W / 2, H * .62); g.scale(z, z); g.translate(-W / 2, -H * .62); e.translate(W / 2, H * .62); e.scale(z, z); e.translate(-W / 2, -H * .62);
  loopPlate(g, e, A.street, ox, 0);
  const tc = step12(tau);
  const px = 460;
  let pose, trayOn = true;
  if (t < SNAP) pose = runPose((tc * 2) % 1, { speed: .9, lean: .4, trayArm: true });
  else {
    const k = ss((tau - SNAP) / .45);
    pose = runPose(.35, { speed: .9, lean: .4 + k * .75, trayArm: true });
    const k2 = t >= HIT.drop ? 1 : 0; pose.drop = k * 140 + k2 * 200; pose.lean += k2 * .25; pose.legs[1].a1 -= k * .8; pose.legs[0].a2 += k * .4 + k2 * .8; pose.arms[1].b1 = .4 + k * 1.6;
    if (tau > TRIP) { trayOn = false; pose.arms[0] = { b1: 1.6, b2: .2 }; }
  }
  const r = fig(g, e, 'chhotu', 'sun', pose, { view: 'side', expr: t < SNAP ? 'focus' : 'hurt', chappal: true, torn: t >= SNAP, tray: trayOn ? { n: 11 } : null, ph: tc }, px, ground, .62);
  // the flying chappal
  if (t >= SNAP) { const k = (tau - SNAP); const cx = px + 40 - k * 260, cy = ground - 30 - k * 420 + k * k * 600; g.save(); g.translate(cx, cy); g.rotate(k * 9); g.fillStyle = '#8a8478'; g.fillRect(-40, -8, 80, 16); g.strokeStyle = '#3a6ad0'; g.lineWidth = 7; g.beginPath(); g.moveTo(-6, -8); g.lineTo(12, -30); g.stroke(); g.restore(); }
  // glasses in flight (ballistic in slow-mo time)
  const C = pal('chhotu', 'sun'), R = rng(77);
  const tx0 = r.sx + 30, ty0 = r.sy - 40;
  if (!trayOn && t < IMP) {
    const k = tau - TRIP;
    layer(g, e, (lg, le) => {
      for (let i = 0; i < 11; i++) {
        const vx = 300 + R() * 700, vy = -600 - R() * 700, sp = (R() - .5) * 14;
        const x = tx0 - 90 + (i % 4) * 60 + vx * k, y = ty0 + vy * k + 2000 * k * k;
        lg.save(); lg.translate(x, y); lg.rotate(sp * k); glass(lg, le, C, 0, 0, 54, { level: .7, glow: .7 }); lg.restore();
        for (let d = 0; d < 3; d++) { lg.fillStyle = C.chai.f; lg.beginPath(); lg.arc(x - 20 + d * 14 - vx * .05, y - 50 - d * 16, 6 - d, 0, TAU); lg.fill(); }
      }
      lg.save(); lg.translate(tx0 + 200 * k, ty0 - 240 * k + 900 * k * k); lg.rotate(k * 3); tray(lg, null, C, 0, 0, 0); lg.restore();
    });
  }
  g.restore(); e.restore();
  if (t >= IMP && t < IMP + 2 / 24) { impact(g, e, r.layer, W * .62, ground - 200, Math.floor((t - IMP) * 24)); return { bloom: .4 }; }
  if (t >= IMP) {   // shards burst + chai splash
    const k = t - IMP, R2 = rng(91);
    for (let i = 0; i < 90; i++) {
      const a = -Math.PI * (.05 + R2() * .9), v = 400 + R2() * 1300, x = 640 + Math.cos(a) * v * k, y = ground - 40 + Math.sin(a) * v * k + 2600 * k * k;
      g.save(); g.translate(x, Math.min(y, ground + 40)); g.rotate(R2() * 6 + k * 10);
      g.fillStyle = rgba('#f4fbff', .9); g.beginPath(); g.moveTo(0, -10 - R2() * 14); g.lineTo(8, 6); g.lineTo(-7, 4); g.closePath(); g.fill(); g.strokeStyle = '#4a5468'; g.lineWidth = 1; g.stroke(); g.restore();
      if (i % 3 === 0) { e.fillStyle = rgba('#fff0c0', .6); e.beginPath(); e.arc(x, Math.min(y, ground + 40), 6, 0, TAU); e.fill(); }
    }
    g.fillStyle = rgba('#c8803a', .8); g.beginPath(); g.ellipse(640, ground + 40, 120 + k * 900, 18 + k * 60, 0, 0, TAU); g.fill();
    flash(g, .5 - k * 2);
  }
  const n = t < IMP ? 11 : 0;   // one glass went to the newspaper man
  S.osd = c => osd(c, null, n + '/12', { icon: true, flash: t >= IMP, w: 300 });
  return t >= IMP ? { expo: 1.1 } : {};
}
