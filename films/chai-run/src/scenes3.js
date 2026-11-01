// Scenes 3 (tray, out the door), 5 (bus + newspaper man), 6 (sneaker kids + poster), 9 (poster on the stall), 10 (montage)
import { W, H, rgba, mix, TAU, rng, cel, poly, path, line, airbrush, canvas, vgrad, LWK } from './cel.js';
import { pal } from './pal.js';
import { head } from './head.js';
import { runPose, standPose, tray, glass, stopwatch } from './body.js';
import { fig, plate, loopPlate, impact, flash, step12, step8, layer, dust, lightBand } from './common.js';
import { speedLines, flare } from './fx.js';
import { osd } from './hud.js';
import { poster, bus } from './bg.js';
import { s4 } from './scenes1.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ss = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;
const TRAY_ARM = { b1: 2.05, b2: 1.05 };

// ——— s3: grab the tray, bolt out the door ———
export function s3(S) {
  const { g, e, t, lt, A } = S, tc = step12(t);
  const C = pal('chhotu', 'interior');
  if (t < 6.45) {
    const z = 1.06 + ss((t - 5.4) / 1.0) * .25;
    plate(g, e, A.stall, 40, 0, z);
    const ant = ss((t - 4.55) / .3), grab = ss((t - 4.9) / .35), go = t > 5.45;
    let pose;
    if (!go) {
      pose = standPose({ lean: .12 + ant * .2 - grab * .2, arms: [{ b1: lerp(.3, 1.15, ant), b2: lerp(.3, .25, ant) }, { b1: -.1, b2: .3 }] });
      if (grab > 0) pose.arms[0] = { b1: lerp(1.15, TRAY_ARM.b1, grab), b2: lerp(.25, TRAY_ARM.b2, grab) };
      pose.drop = ant * 40 * (1 - grab);
    } else pose = runPose((tc * 2) % 1, { speed: .8, lean: .35, trayArm: true });
    const x = go ? 330 + (t - 5.45) * 520 : 330;
    const r = fig(g, e, 'chhotu', 'interior', pose, { view: 'side', expr: grab > .5 ? 'focus' : 'stare', chappal: true, tray: grab > .02 ? { n: 12 } : null, ph: tc }, x, 2000, .95);
    if (grab <= .02) layer(g, e, (lg, le) => tray(lg, le, C, 720, 1262, 12));
    S.osd = c => osd(c, null, '12/12', { icon: true, w: 300 });
    return {};
  }
  // out of the door into the gold street
  const lx = t - 6.45;
  loopPlate(g, e, A.street, 200 + lx * 900, 0);
  g.fillStyle = '#2a1a22'; g.fillRect(-80 - lx * 900, 700, 360, 1220); g.fillStyle = '#3a6ad0'; g.fillRect(-120 - lx * 900, 640, 440, 70);
  fig(g, e, 'chhotu', 'sun', runPose((tc * 2.2) % 1, { speed: 1, lean: .42, trayArm: true }), { view: 'side', expr: 'focus', chappal: true, tray: { n: 12 }, ph: tc, skinRim: '#ffd890' }, 300 + ss(lx / .6) * 200, A.street.ground + 320, .78);
  speedLines(g, Math.floor(tc * 12), { type: 'h', n: 40, col: '#fff4dc', a: .5, hmax: 5 });
  flash(g, .85 - lx * 6, '#fff2c8');
  S.osd = c => osd(c, null, '12/12', { icon: true, w: 300 });
  return {};
}

// newspaper man on a plastic stool, newspaper open in front of his face
function newsMan(g, e, x, y, s, k, handOut) {
  layer(g, e, (lg) => {
    lg.save(); lg.translate(x, y); lg.scale(s, s);
    const C = pal('coach', 'sun');
    cel(lg, poly([[-90, 0], [-70, -200], [90, -200], [110, 0], [80, 0], [60, -160], [-40, -160], [-60, 0]]), { f: '#3aa86a', s: '#24784a', l: '#0e3a20', lw: 3 });   // stool
    cel(lg, [[-80, -200], [60, -210], [70, -380], [-90, -380]], { f: '#e8e2d4', s: '#b0a898', l: '#4a4438', lw: 3 });   // kurta
    for (const lx of [-60, 30]) cel(lg, [[lx, -210], [lx + 40, -210], [lx + 60, -20], [lx + 20, -20]], { f: '#e8e2d4', s: '#b0a898', l: '#4a4438', lw: 2.4 });
    // newspaper
    const sw = Math.sin(k * 1.7) * 2;
    cel(lg, poly([[-150, -640 + sw], [190, -650 + sw], [196, -330], [-156, -320]]), { f: '#f2ecde', s: '#cfc6b2', sh: [[[18, -650], [26, -650], [24, -330], [16, -330]]], l: '#4a4438', lw: 3 });
    lg.fillStyle = '#2a2430'; lg.font = 'italic 900 44px Kanit'; lg.textAlign = 'left'; lg.fillText('SAMACHAR', -130, -590 + sw);
    for (let i = 0; i < 9; i++) { lg.fillStyle = 'rgba(42,36,48,.55)'; lg.fillRect(-130, -560 + i * 24 + sw, 130, 8); lg.fillRect(40, -560 + i * 24 + sw, 130, 8); }
    lg.fillStyle = 'rgba(42,36,48,.4)'; lg.fillRect(40, -610 + sw, 130, 40);
    for (const hx of [-160, 196]) { const p = new Path2D(); p.ellipse(hx, -480, 22, 30, 0, 0, TAU); cel(lg, p, { f: C.skin.f, s: C.skin.s, l: C.skin.l, lw: 2 }); }
    if (handOut) { cel(lg, [[190, -360], [300, -340], [300, -300], [190, -320]], { f: '#e8e2d4', l: '#4a4438', lw: 2 }); const p = new Path2D(); p.ellipse(320, -322, 30, 24, 0, 0, TAU); cel(lg, p, { f: C.skin.f, s: C.skin.s, l: C.skin.l, lw: 2 }); }
    lg.restore();
  });
}
// ——— s5: dodge the bus, chai to a man who never looks up ———
export function s5(S) {
  const { g, e, t, A } = S, tc = step12(t);
  if (t < 12.9) {
    loopPlate(g, e, A.street, 900 + (t - 11.458) * 420, 0);
    const gr = A.street.ground + 330, dodge = ss((t - 11.75) / .2) * (1 - ss((t - 12.35) / .3));
    const pose = runPose((tc * 2) % 1, { speed: .9, lean: .4 - dodge * .7, trayArm: true });
    pose.drop = -dodge * 60;
    fig(g, e, 'chhotu', 'sun', pose, { view: 'side', expr: dodge > .3 ? 'hurt' : 'focus', chappal: true, tray: { n: 12 }, ph: tc }, 420 - dodge * 120, gr, .72);
    const bx = W + 200 - (t - 11.5) * 3200;   // bus in the foreground lane, coming at him
    bus(g, e, bx, 1990, 1500, -(t - 11.5) * 20);
    speedLines(g, Math.floor(tc * 12), { type: 'h', n: 30, col: '#fff4dc', a: .4 * dodge + .2, hmax: 5 });
    S.osd = c => osd(c, null, '12/12', { icon: true, w: 300 });
    return {};
  }
  loopPlate(g, e, A.street, 1600, 0);
  const lx = t - 12.9, gr = A.street.ground + 340;
  const give = ss((lx - .1) / .4), take = lx > .55;
  newsMan(g, e, 300, gr, 1.05, Math.floor(tc * 12), true);
  const pose = standPose({ lean: .18 * give, arms: [take ? { b1: .5, b2: .3 } : { b1: lerp(.4, 1.3, give), b2: lerp(.4, .2, give) }, TRAY_ARM] });
  const r = fig(g, e, 'chhotu', 'sun', pose, { view: 'side', expr: lx > .7 ? 'smirk' : 'neutral', chappal: true, ph: tc }, 880, gr + 10, .78, true);
  layer(g, e, (lg, le) => { tray(lg, le, pal('chhotu', 'sun'), 880 - 70, r.sy - 400, 11); });
  const gx = take ? 300 + 320 * 1.05 : r.sx, gy = take ? gr - 322 * 1.05 : r.sy;
  layer(g, e, (lg, le) => glass(lg, le, pal('chhotu', 'sun'), gx, gy - 6, 52));
  S.osd = c => osd(c, null, (take ? 11 : 12) + '/12', { icon: true, w: 300 });
  return {};
}

// ——— s6: shiny sneakers laughing at his chappals; DISTRICT MEET poster behind them ———
export function s6(S) {
  const { g, e, t, A } = S, tc = step12(t);
  if (t < 15.4) {
    const z = 1.02 + (t - 13.917) * .03;
    plate(g, e, A.front, 0, 260, z);
    g.fillStyle = '#e8c8a8'; g.fillRect(0, 0, W, 0);
    layer(g, e, lg => poster(lg, 380, 560, 300, { tape: true, rot: -.03 }));
    const bounce = [0, -10, 0, -6][Math.floor(tc * 12) % 4];
    const pointA = standPose({ lean: .1, arms: [{ b1: .95, b2: .1 }, { b1: -.3, b2: 1.8 }] }), pointB = standPose({ lean: -.08, arms: [{ b1: .3, b2: 2.2 }, { b1: .8, b2: .2 }] });
    pointA.bob = bounce; pointB.bob = -bounce;
    fig(g, e, 'kidA', 'sun', pointA, { view: 'q', expr: 'laugh', shoe: true, ph: tc }, 280, 1990, 1.08, true);
    fig(g, e, 'kidB', 'sun', pointB, { view: 'q', expr: 'smirk', shoe: true, ph: tc }, 830, 2020, 1.08, true);
    return {};
  }
  // insert: his torn chappals; toes curl
  vgrad(g, 0, 0, W, H, [[0, '#c89a8a'], [1, '#8a6070']]);
  g.fillStyle = 'rgba(58,30,78,.35)'; g.fill(poly([[0, 900], [W, 700], [W, 1100], [0, 1500]]));   // the kids' long shadows over him
  const pose = standPose({ lean: .05 });
  fig(g, e, 'chhotu', 'shade', pose, { view: 'side', expr: 'stare', chappal: true, torn: true, ph: tc }, 470, 1250, 3.6);
  return { sat: .9 };
}

// ——— s9: the coach tapes the poster on the stall; Chhotu stares ———
export function s9(S) {
  const { g, e, t, A } = S, tc = step12(t);
  const F = A.front;
  if (t < 23.9) {
    plate(g, e, F, 0, 200, 1.1);
    const slap = t >= 22.4, tapeOn = t >= 22.6;
    const sq = slap && t < 22.5 ? 1.06 : 1;
    if (slap) layer(g, e, lg => { lg.save(); lg.translate(250, 560); lg.scale(sq, 1 / sq); poster(lg, -150, -210, 300, { tape: tapeOn }); lg.restore(); });
    const reach = ss((t - 21.95) / .4);
    const pose = standPose({ lean: .05, arms: [{ b1: lerp(.4, 2.2, reach), b2: lerp(1.0, .3, reach) }, { b1: -.05, b2: .25 }] });
    const r = fig(g, e, 'coach', 'sun', pose, { view: 'q', expr: 'calm', ph: tc }, 760, 2040, .95, true);
    if (!slap) layer(g, e, lg => poster(lg, r.sx - 160, r.sy - 120, 300, { rot: .08 }));
    return {};
  }
  // Chhotu stares at the poster: slow push to his eyes
  const lx = t - 23.9, z = 1 + lx * .1;
  plate(g, e, F, 0, 200, 1.3);
  g.save(); g.translate(W / 2, 900); g.scale(z, z); g.translate(-W / 2, -900);
  layer(g, e, lg => poster(lg, 60, 380, 340, { tape: true }));
  const L = layer(g, e, (lg) => { lg.save(); lg.translate(700, 1060); lg.scale(-3.0, 3.0); const C = pal('chhotu', 'sun');
    cel(lg, [[-170, 420], [-160, 200], [-120, 146], [-50, 126], [50, 126], [120, 146], [160, 200], [170, 420]], { f: C.tee.f, s: C.tee.s, so: [-24, -8], h: C.tee.h, l: C.tee.l, lw: 2.4 });
    head(lg, C, { who: 'chhotu', view: 'q', expr: 'stare', look: [.7, -.2], ph: tc, skinRim: '#ffd890' }); lg.restore(); });
  lightBand(L, lx / 1.5, '#ffe0a0', .25);
  g.restore();
  return {};
}

// ——— s10: training montage, four cuts on the bars ———
export function s10(S) {
  const { g, e, t, A } = S, tc = step12(t);
  if (t < 27.4) {   // racing the bus
    const lx = t - 25.417;
    loopPlate(g, e, A.street, 300 + lx * 1500, 0);
    bus(g, e, 60 + Math.sin(lx * 2) * 30, A.street.ground + 200, 1100, -lx * 30);
    fig(g, e, 'chhotu', 'sun', runPose((tc * 2.4) % 1, { speed: 1.1, lean: .45, trayArm: true }), { view: 'side', expr: 'focus', chappal: true, tray: { n: 12 }, ph: tc, smear: true, ghostPoses: [runPose((tc * 2.4 - .07) % 1, { speed: 1.1, lean: .45, trayArm: true })] }, 640, A.street.ground + 360, .74);
    speedLines(g, Math.floor(tc * 12), { type: 'h', n: 60, col: '#fff4dc', a: .6, hmax: 6 });
    flash(g, .7 - lx * 5);
    return {};
  }
  if (t < 29.4) {   // the tray, faster and dead level
    const lx = t - 27.4;
    loopPlate(g, e, A.street, lx * 2600, 0);
    speedLines(g, Math.floor(tc * 12), { type: 'h', n: 80, col: '#fff4dc', a: .7, hmax: 8 });
    const pose = runPose((tc * 2.8) % 1, { speed: 1.15, lean: .45, trayArm: true }); pose.bob *= .2;
    fig(g, e, 'chhotu', 'sun', pose, { view: 'side', expr: 'focus', chappal: true, tray: { n: 12 }, ph: tc, smear: true, ghostPoses: [runPose((tc * 2.8 - .06) % 1, { speed: 1.15, lean: .45, trayArm: true })] }, 380, 2350, 1.55);
    flash(g, .7 - lx * 5);
    S.osd = c => osd(c, null, '12/12', { icon: true, w: 300 });
    return {};
  }
  if (t < 31.4) {   // the stairs again, faster
    const fake = { ...S, lt: (t - 29.4) * 1.75 };
    g.save(); e.save(); g.translate(W / 2, H / 2); g.scale(1.25, 1.25); g.translate(-W / 2, -H / 2); e.translate(W / 2, H / 2); e.scale(1.25, 1.25); e.translate(-W / 2, -H / 2);
    s4(fake); g.restore(); e.restore(); S.osd = null;
    speedLines(g, Math.floor(tc * 12), { type: 'radial', cx: 700, cy: 600, n: 80, col: '#fff4dc', a: .45 });
    flash(g, .7 - (t - 29.4) * 5);
    return {};
  }
  // the stair counter spinning, the stopwatch time falling
  const lx = t - 31.4;
  plate(g, e, A.stairs, 300, (2200 - lx * 1800 + 3000) % 1800 + 200);
  g.fillStyle = 'rgba(40,10,50,.45)'; g.fillRect(0, 0, W, H);
  speedLines(g, Math.floor(tc * 12), { type: 'radial', cx: 540, cy: 900, n: 120, col: '#ffcf8a', a: .5 });
  const n = Math.floor((lx * 900)) % 301, laps = 1 + Math.floor(lx * 3);
  const secs = Math.max(88, 120 - Math.floor(lx * 13)), mm = Math.floor(secs / 60), sc = String(secs % 60).padStart(2, '0');
  S.osd = c => {
    c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.font = 'italic 900 300px Kanit'; c.strokeStyle = '#2a0e2e'; c.lineWidth = 26; const s = String(n).padStart(3, '0');
    c.strokeText(s, 500, 860); const gr = c.createLinearGradient(0, 720, 0, 1000); gr.addColorStop(0, '#fff6d0'); gr.addColorStop(.5, '#ffd27a'); gr.addColorStop(1, '#ff7a3c'); c.fillStyle = gr; c.fillText(s, 500, 860);
    c.font = '700 64px "Barlow SC"'; c.fillStyle = '#fff6e0'; c.strokeStyle = '#2a0e2e'; c.lineWidth = 10; c.strokeText('SEEDHIYAAN  ×' + laps, 500, 1060); c.fillText('SEEDHIYAAN  ×' + laps, 500, 1060);
    c.font = 'italic 900 120px Kanit'; c.strokeText(mm + ':' + sc, 500, 1260); c.fillStyle = '#8ff4ff'; c.fillText(mm + ':' + sc, 500, 1260);
    c.restore();
  };
  layer(g, e, lg => { lg.save(); lg.translate(500, 1410); lg.scale(1.4, 1.4); stopwatch(lg, pal('coach', 'sun'), 0, 0, 60, { hand: lx * 20 }); lg.restore(); });
  flash(g, .7 - lx * 5);
  return {};
}
