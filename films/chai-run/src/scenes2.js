// Scenes 8 (coach + stopwatch), 11 (start line + stabs), 12 (breath + pistol), 13 (race), 15 (chai at sunrise)
import { W, H, rgba, mix, TAU, rng, cel, poly, path, line, airbrush, canvas, vgrad, LWK } from './cel.js';
import { pal } from './pal.js';
import { head } from './head.js';
import { runPose, standPose, crouchPose, glass, stopwatch } from './body.js';
import { fig, plate, loopPlate, impact, flash, step12, step8, layer, dust, lightBand } from './common.js';
import { speedLines, flare } from './fx.js';
import { HIT } from './timeline.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ss = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;

// ——— big inserts ———
function bigWatch(g, e, x, y, s, o = {}) {
  const C = pal('coach', 'sun');
  g.save(); g.translate(x, y); g.scale(s, s); LWK.k = .6;
  stopwatch(g, C, 0, 0, 100, { hand: -Math.PI / 2 });
  // ticks + minute subdial reading 2
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU - Math.PI / 2, r0 = i % 5 ? 66 : 60; g.strokeStyle = '#2a2838'; g.lineWidth = i % 5 ? 1 : 2.2; g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * 72, Math.sin(a) * 72); g.stroke(); }
  const sd = new Path2D(); sd.arc(0, 30, 18, 0, TAU); g.fillStyle = '#ece6d6'; g.fill(sd); g.strokeStyle = '#2a2838'; g.lineWidth = 1.2; g.stroke(sd);
  const ma = (o.min ?? 2) / 15 * TAU - Math.PI / 2; line(g, [[0, 30], [Math.cos(ma) * 14, 30 + Math.sin(ma) * 14]], '#2a2838', 2.2);
  const sa = (o.sec ?? 0) / 60 * TAU - Math.PI / 2; line(g, [[-Math.cos(sa) * 12, -Math.sin(sa) * 12], [Math.cos(sa) * 66, Math.sin(sa) * 66]], '#c02020', 2.6);
  g.fillStyle = '#c02020'; g.beginPath(); g.arc(0, 0, 4, 0, TAU); g.fill();
  g.font = '700 11px "Barlow SC"'; g.fillStyle = '#2a2838'; g.textAlign = 'center'; g.fillText('MIN', 0, 56);
  LWK.k = 1; g.restore();
  if (o.hl != null) { e.save(); e.translate(x, y); e.scale(s, s); e.globalCompositeOperation = 'lighter'; const gx = -120 + o.hl * 240; const gr = e.createLinearGradient(gx - 30, 0, gx + 30, 0); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(.5, 'rgba(255,240,200,.5)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); e.fillStyle = gr; e.beginPath(); e.arc(0, 0, 100, 0, TAU); e.fill(); e.restore(); }
}
function sneakerECU(g, C, x, y, s, k) {
  const sh = C.shoe;
  g.save(); g.translate(x, y); g.scale(s, s);
  // sock + shin from above
  cel(g, [[-60, -260], [40, -260], [48, -90], [-70, -90]], { f: C.skin.f, s: C.skin.s, so: [-10, 0], l: C.skin.l, lw: 2 });
  cel(g, [[-74, -120], [52, -120], [56, -70], [-80, -70]], { f: '#ffffff', s: '#c8ccd8', so: [0, 6], l: '#606880', lw: 2 });
  cel(g, [[-110, -70], [40, -84], [120, -60], [230, -20], [250, 20, 1], [-120, 22, 1]], { f: sh.f, s: sh.s, so: [0, -14], h: sh.h, ho: [0, 6], l: sh.l, lw: 2.4 });
  cel(g, [[-124, 8], [254, 8], [256, 40, 1], [-126, 42, 1]], { f: C.shoeSole, l: sh.l, lw: 2 });
  cel(g, [[-60, 0], [30, -50], [120, -30], [40, -6]], { f: C.swoosh, l: sh.l, lw: 1.6 });   // generic lightning stripe
  for (let i = 0; i < 5; i++) line(g, [[-10 + i * 22, -78 + i * 6], [10 + i * 22, -64 + i * 6]], '#ffffff', 5);
  g.fillStyle = rgba('#ffffff', .9); g.fillRect(-90, -50, 140, 6);
  g.restore();
}
function footECU(g, C, x, y, s, k) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const SK = C.skin, curl = [0, 3, 6, 4][k % 4];
  cel(g, [[-70, -300], [30, -300], [40, -110], [-90, -100]], { f: SK.f, s: SK.s, so: [-12, 0], h: SK.h, l: SK.l, lw: 2 });   // shin
  cel(g, [[-120, -40], [-100, -110], [-20, -120], [60, -80], [160, -50], [222, -36 + curl], [236, -4 + curl, 1], [200, 14], [40, 16], [-110, 14, 1]], { f: SK.f, s: SK.s, so: [0, -16], h: SK.h, ho: [0, 6], l: SK.l, lw: 2.2,
    clipFn: gg => { gg.fillStyle = mix(SK.s, '#6a4040', .3); gg.fillRect(-140, 6, 400, 20); for (let i = 0; i < 6; i++) line(gg, [[-80 + i * 40, 10], [-60 + i * 40, -6]], mix(SK.l, SK.s, .5), 1); } });
  // toes (big toe + four), gripping
  for (let i = 0; i < 4; i++) { const tx = 200 - i * 26, ty = -2 + curl * .6 + i * 2; cel(g, [[tx - 14, ty - 26], [tx + 14, ty - 26 + i * 2], [tx + 18, ty + 8, 1], [tx - 12, ty + 10, 1]], { f: SK.f, s: SK.s, so: [0, -6], l: SK.l, lw: 1.6 }); }
  cel(g, [[208, -42 + curl], [236, -38 + curl], [244, 0 + curl, 1], [214, 8, 1]], { f: SK.f, s: SK.s, so: [0, -6], h: SK.h, l: SK.l, lw: 1.8 });
  line(g, [[-40, -70], [20, -84]], mix(SK.l, SK.f, .4), 1.4);   // tendon
  g.restore();
}
// eyes ECU: head drawn huge, cropped to a band (letterbox)
function eyesECU(g, e, who, light, expr, x, y, s, o = {}) {
  const C = pal(who, light);
  layer(g, e, (lg) => { lg.save(); lg.translate(x, y); lg.scale(s, s); LWK.k = .45; head(lg, C, { who, view: 'q', expr, look: o.look, E: o.E, skinRim: o.rim, ph: o.ph, wind: o.wind ?? .3 }); LWK.k = 1; lg.restore(); });
}
function letterbox(g, h) { g.fillStyle = '#0a0410'; g.fillRect(0, 0, W, (H - h) / 2); g.fillRect(0, (H + h) / 2, W, (H - h) / 2); }
function skyBG(g, e, A, oy = 0) { plate(g, e, A.sky, 0, oy); }

// ——— s8: the coach saw it ———
export function s8(S) {
  const { g, e, t, lt, A } = S;
  const CLICK = 18.5;
  if (t < 19.4) {   // bust at the top of the stairs, the sun behind him; thumb clicks
    plate(g, e, A.stairs, 300, 120);
    const C = pal('coach', 'sun');
    const press = t >= CLICK && t < CLICK + .12 ? 6 : 0;
    const L = layer(g, e, (lg, le) => {
      lg.save(); lg.translate(470, 1180); lg.scale(2.5, 2.5);
      // shoulders + jacket
      cel(lg, [[-200, 420], [-190, 250], [-140, 186], [-50, 160], [60, 160], [140, 188], [190, 250], [200, 420]], { f: C.jacket.f, s: C.jacket.s, so: [-30, -10], h: C.jacket.h, ho: [10, 6], l: C.jacket.l, lw: 2.4,
        clipFn: gg => { gg.fillStyle = C.stripe.f; gg.fill(poly([[-182, 250], [-164, 220], [-140, 420], [-162, 420]])); gg.fill(poly([[164, 220], [182, 250], [162, 420], [140, 420]])); } });
      cel(lg, [[-60, 170], [-40, 132], [40, 132], [60, 170], [30, 190], [-30, 190]], { f: C.jacket.f, s: C.jacket.s, so: [-6, -8], l: C.jacket.l, lw: 2 });
      line(lg, [[0, 186], [4, 420]], '#d8dce8', 3);
      line(lg, [[-30, 150], [-10, 260]], C.cord.f, 3); line(lg, [[30, 150], [10, 260]], C.cord.f, 3);
      head(lg, C, { who: 'coach', view: 'q', expr: t < CLICK + .25 ? 'calm' : 'stare', skinRim: '#ffd890', look: [.6, .5] });
      // hand holding the stopwatch up, thumb on the crown
      const hx = 120, hy = 300 + press;
      stopwatch(lg, C, hx, hy - 40, 34);
      cel(lg, [[hx - 50, hy - 20], [hx + 40, hy - 16], [hx + 50, hy + 40], [hx - 40, hy + 50]], { f: C.skin.f, s: C.skin.s, so: [-6, -6], l: C.skin.l, lw: 1.8 });
      cel(lg, [[hx - 6, hy - 92 + press], [hx + 12, hy - 92 + press], [hx + 14, hy - 60], [hx - 8, hy - 60]], { f: C.skin.f, s: C.skin.s, l: C.skin.l, lw: 1.6 });   // thumb
      cel(lg, [[hx - 70, hy + 40], [hx + 60, hy + 30], [hx + 80, hy + 200], [hx - 90, hy + 220]], { f: C.jacket.f, s: C.jacket.s, so: [-10, 0], l: C.jacket.l, lw: 2 });   // sleeve
      lg.restore();
    });
    lightBand(L, (t - 18.25) / 1.3, '#ffe0a0', .25);
    g.drawImage(L, 0, 0);
    if (t >= CLICK && t < CLICK + .1) { g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.beginPath(); g.arc(470 + 120 * 2.5, 1180 + 160 * 2.5, 60 + (t - CLICK) * 900, 0, TAU); g.stroke(); }
    flare(e, 760, 520, .6, '#ffc070', { ghosts: false, streak: 500 });
    return {};
  }
  if (t < 20.5) {   // ECU on the eyes: calm → wide, three drawings at 8 fps
    skyBG(g, e, A, 600);
    const k = step8(t - 19.75), open = k <= 0 ? 0 : Math.min(1, k * 2.7);
    eyesECU(g, e, 'coach', 'sun', 'wide', 560, 795, 7.5, { E: { open: lerp(.6, 1.15, open), lid: lerp(.4, -.3, open), iris: lerp(.85, .62, open), brow: [lerp(2, -9, open), lerp(1, -8, open), lerp(1, 5, open)] } });
    letterbox(g, 560);
    return {};
  }
  // insert: the stopwatch says 2:00
  skyBG(g, e, A, 400);
  airbrush(g, 300, 600, 220, 220, '#ffe0a0', .35); airbrush(g, 820, 1300, 300, 300, '#ff9ac0', .25);
  layer(g, e, (lg, le) => bigWatch(lg, le, 520, 1160, 3.5 + (t - 20.5) * .2, { min: 2, sec: 0, hl: (t - 20.5) / 1.4 }));
  return {};
}

// ——— s11: start line; brass stabs → sneakers, sneakers, bare feet ———
export function s11(S) {
  const { g, e, t, lt, A } = S, tc = step12(t);
  if (t < HIT.stab1) {   // wide: four lanes, Chhotu last in line, nearest
    plate(g, e, A.track, 900, 0, 1 + lt * .04);
    g.fillStyle = '#f6efe4'; g.fill(poly([[700, 1440], [716, 1440], [740, 1920], [712, 1920]]));
    const lanes = [['kidB', 1500, .46, 820], ['kidA', 1590, .52, 640], ['kidB', 1690, .58, 450], ['chhotu', 1830, .66, 230]];
    lanes.forEach(([who, y, s, lx], i) => fig(g, e, who, 'sun', standPose({ lean: .12, arms: [{ b1: .3, b2: .9 }, { b1: -.2, b2: .5 }] }), { view: 'side', expr: who === 'chhotu' ? 'focus' : 'smirk', shoe: who !== 'chhotu', ph: tc, C: i === 2 ? { ...pal('kidB', 'sun'), top: { f: '#ff6a9a', s: '#c03a6a', h: '#ffb0c8', l: '#4e1028' } } : null }, lx, y, s));
    return {};
  }
  vgrad(g, 0, 0, W, H, [[0, '#d05a3a'], [.7, '#a03a32'], [1, '#6a2228']]);
  g.fillStyle = '#f6efe4'; g.fillRect(0, 1250, W, 40);   // the start line
  speedLines(g, Math.floor(tc * 12), { type: 'h', n: 16, col: '#ffd0a0', a: .25, hmax: 3 });
  const push = 1 + (t - (t < HIT.stab2 ? HIT.stab1 : t < HIT.stab3 ? HIT.stab2 : HIT.stab3)) * .05;
  if (t < HIT.stab2) layer(g, e, lg => sneakerECU(lg, pal('kidA', 'sun'), 380, 1240, 2.6 * push, Math.floor(tc * 12)));
  else if (t < HIT.stab3) layer(g, e, lg => sneakerECU(lg, pal('kidB', 'sun'), 400, 1240, 2.6 * push, Math.floor(tc * 12)));
  else { layer(g, e, lg => footECU(lg, pal('chhotu', 'sun'), 380, 1250, 2.6 * push, Math.floor(tc * 8))); dust(g, 360, 1260, Math.floor(tc * 12), 8); }
  // glint sweep on each stab
  const st = t < HIT.stab2 ? HIT.stab1 : t < HIT.stab3 ? HIT.stab2 : HIT.stab3;
  flash(g, .7 - (t - st) * 6);
  return {};
}

// ——— s12: near silence, the crouch, the pistol ———
export function s12(S) {
  const { g, e, t, lt, A } = S, tc = step12(t);
  const z = 1.12 + lt * .05;
  plate(g, e, A.track, 1100, 0, z);
  g.fillStyle = '#f6efe4'; g.fill(poly([[700, 1500], [726, 1500], [790, 1920], [752, 1920]]));   // start line
  const br = Math.sin(lt * Math.PI * 1.6) * 10;
  const p = crouchPose(); p.bob = br;
  fig(g, e, 'chhotu', 'sun', p, { view: 'side', expr: lt > 1.4 ? 'focus' : 'breath', ph: step8(t), skinRim: '#ffd890' }, 470, 1840, .95);
  // the starter's arm from the left edge, a starter revolver seen side-on against the violet sky; muzzle flash on the pistol beat
  layer(g, e, (lg, le) => { const C = pal('coach', 'sun');
    const PX = 230, PY = 520;                      // the fist
    lg.save(); lg.translate(PX, PY); lg.rotate(.5);
    cel(lg, [[-50, 40], [50, 40], [60, 900], [-60, 900]], { f: '#f4f2ee', s: '#b8b4c4', so: [-12, 0], l: '#444058', lw: 3 });          // white sleeve
    cel(lg, [[-58, 40], [58, 40], [58, 78], [-58, 78]], { f: '#c8303a', l: '#4e1018', lw: 2.4 });
    lg.restore();
    lg.save(); lg.translate(PX, PY); lg.rotate(-1.25); lg.scale(1.5, 1.5);   // gun frame: barrel along +x (rotated to point up-right)
    const M = { f: '#2a2834', s: '#14121a', h: '#9a9ab4', l: '#060608' };
    cel(lg, [[-30, 0], [10, 0], [26, 70], [-6, 84], [-30, 60]], { f: '#6a4430', s: '#40281a', so: [-6, 0], l: '#1a0e08', lw: 2.4 });      // angled wooden grip
    const tg = new Path2D(); tg.arc(30, 12, 18, 0, Math.PI); lg.strokeStyle = M.l; lg.lineWidth = 6; lg.stroke(tg);                    // trigger guard
    line(lg, [[28, 4], [24, 22]], M.l, 4);                                                                                                // trigger
    cel(lg, [[-34, -30], [60, -30], [60, 6], [-34, 6]], { f: M.f, s: M.s, so: [0, -8], h: M.h, ho: [0, 4], l: M.l, lw: 2.6 });            // frame
    const cyl = new Path2D(); cyl.roundRect(-4, -40, 62, 52, 12); cel(lg, cyl, { f: '#3a3846', s: M.s, so: [0, -10], h: M.h, ho: [0, 5], l: M.l, lw: 2.6 });   // cylinder
    for (const x of [14, 30, 46]) line(lg, [[x, -36], [x, 8]], '#14121a', 2);
    cel(lg, [[58, -28], [190, -28], [190, -6], [58, -6]], { f: M.f, s: M.s, so: [0, -5], h: M.h, hi: [[[62, -26], [186, -26], [186, -21], [62, -21]]], l: M.l, lw: 2.6 });   // barrel
    cel(lg, [[180, -34], [190, -34], [190, -28], [180, -28]], { f: M.f, l: M.l, lw: 1.6 });                                              // front sight
    cel(lg, [[-34, -30], [-52, -48], [-44, -58], [-24, -36]], { f: M.f, l: M.l, lw: 2 });                                                // hammer
    const fist = new Path2D(); fist.ellipse(-10, 40, 40, 46, .3, 0, TAU); cel(lg, fist, { f: C.skin.f, s: C.skin.s, so: [-8, -4], l: C.skin.l, lw: 2.4 });
    for (const y of [24, 42, 60]) line(lg, [[14, y], [30, y + 4]], C.skin.l, 1.8);
    lg.restore();
    if (t >= HIT.pistol - 1 / 24) {   // muzzle flash at the barrel tip
      const a = -1.25, mx = PX + Math.cos(a) * 1.5 * 205 - Math.sin(a) * 1.5 * -17, my = PY + Math.sin(a) * 1.5 * 205 + Math.cos(a) * 1.5 * -17;
      lg.fillStyle = '#fff6d0'; lg.beginPath(); for (let k = 0; k < 16; k++) { const aa = k / 16 * TAU, r = k % 2 ? 46 : 170; lg.lineTo(mx + Math.cos(aa) * r, my + Math.sin(aa) * r); } lg.fill();
      lg.fillStyle = '#ffb040'; lg.beginPath(); lg.arc(mx, my, 50, 0, TAU); lg.fill();
      const gr = le.createRadialGradient(mx, my, 0, mx, my, 340); gr.addColorStop(0, '#fff2c0'); gr.addColorStop(.3, 'rgba(255,170,60,.8)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); le.fillStyle = gr; le.beginPath(); le.arc(mx, my, 340, 0, TAU); le.fill();
    }
  });
  return { sat: .92 };
}
// ——— s13: the race ———
function raceSide(S, lt, o) {
  const { g, e, A, t } = S, tc = step12(t);
  const spd = o.speed ?? 1600;
  loopPlate(g, e, A.track, 300 + lt * spd, 0);
  if (o.stairs) { const a = (Math.floor(t * 4) % 2 ? .38 : .22) * o.stairs; g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'screen'; g.drawImage(A.stairs.c, -200, -1200 + (lt * 600) % 600); g.restore(); }
  for (const [who, x0, v, y, s] of o.rivals || []) {
    const x = x0 - lt * v;
    if (x < -300 || x > W + 300) continue;
    fig(g, e, who, 'sun', runPose((tc * 2.2 + x0 * .01) % 1, { speed: .95 }), { view: 'side', expr: 'hurt', shoe: true, ph: tc }, x, y, s);
  }
  const p = o.pose || runPose((tc * 2.4) % 1, { speed: 1.1, lean: .45 });
  const r = fig(g, e, 'chhotu', 'sun', p, { view: 'side', expr: 'focus', ph: tc, smear: o.smear ?? true, skinRim: '#ffd890', ghostPoses: [runPose((tc * 2.4 - .08) % 1, { speed: 1.1, lean: .45 }), runPose((tc * 2.4 - .04) % 1, { speed: 1.1, lean: .45 })] }, o.x ?? 460, 1800, o.s ?? .8);
  speedLines(g, Math.floor(tc * 12), { type: 'h', n: 60, col: '#fff4dc', a: .6, hmax: 6 });
  return r;
}
export function s13(S) {
  const { g, e, t, lt, A } = S, tc = step12(t);
  const P0 = HIT.pistol;
  if (t < 43.9) {
    if (t < P0 + 2 / 24 + .02) {   // pistol impact frame (2 frames)
      const [c2, g2] = canvas(W, H); fig(g2, e, 'chhotu', 'sun', crouchPose(), { view: 'side', expr: 'focus' }, 430, 1800, .9);
      impact(g, e, c2, 560, 1100, Math.floor((t - P0) * 24));
      g.save(); g.translate(355, 225); g.fillStyle = Math.floor((t - P0) * 24) % 2 ? '#2a0e2e' : '#ffcf6a'; g.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, r = k % 2 ? 50 : 190; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); g.restore();
      return { bloom: .3 };
    }
    const k = ss((t - 42.0) / .45);
    const run = runPose((tc * 2.4) % 1, { speed: 1.1, lean: .45 }), cr = crouchPose();
    const pose = k >= 1 ? run : { ...run, lean: lerp(cr.lean, run.lean, k), drop: lerp(cr.drop, 0, k) };
    raceSide(S, t - 42.0, { pose, rivals: [['kidA', 760, 200, 1600, .62], ['kidB', 920, 150, 1520, .55]], x: 380 + k * 80, smear: k > .5 });
    speedLines(g, Math.floor(tc * 12), { type: 'radial', cx: 560, cy: 1200, n: 70, col: '#ffffff', a: .45 * (1 - k * .6) });
    return {};
  }
  if (t < 45.9) { raceSide(S, t - 43.9, { rivals: [['kidB', 900, 700, 1600, .62], ['kidA', 1300, 520, 1520, .55]] }); return {}; }
  if (t < 47.9) {   // ECU eyes + radial lines + stair flash
    g.fillStyle = '#ff8a3c'; g.fillRect(0, 0, W, H);
    speedLines(g, Math.floor(tc * 12), { type: 'radial', cx: 700, cy: 960, n: 160, col: '#fff4dc', a: .8, r0: 200 });
    if (Math.floor(t * 4) % 2) { g.save(); g.globalAlpha = .35; g.globalCompositeOperation = 'multiply'; g.drawImage(A.stairs.c, -300, -1600); g.restore(); }
    eyesECU(g, e, 'chhotu', 'sun', 'focus', 520, 940, 7.2, { rim: '#ffd890', ph: tc, wind: 1 });
    letterbox(g, 620);
    return {};
  }
  if (t < 49.9) { raceSide(S, t - 47.9, { stairs: 1, rivals: [['kidA', 1100, 820, 1600, .62], ['kidB', 1500, 700, 1540, .56], ['kidA', 1900, 640, 1480, .5]] }); return {}; }
  // the crowd rises
  const rise = ss((t - 49.9) / .8) * 60 + [0, 6, -4, 3][Math.floor(tc * 12) % 4];
  plate(g, e, A.track, 760, 240 - rise, 2.0 + (t - 49.9) * .1);
  const R = rng(40), dr = Math.floor(tc * 12) % 3;
  for (let i = 0; i < 46; i++) {   // arms thrown up, a 3-drawing cycle
    const x = R() * W, y = 420 + R() * 900 - rise, ph = R() * 3, up = ((dr + Math.floor(ph)) % 3) / 2, len = 110 + R() * 60, sk = mix('#c88458', '#7a4a3a', R());
    const tipx = x + (R() - .5) * 50, tipy = y - len * (.5 + up * .5);
    g.strokeStyle = mix('#ff6a9a', '#3fc4b4', R()); g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y + 30); g.lineTo(x + (tipx - x) * .4, y - len * .2); g.stroke();
    g.strokeStyle = sk; g.lineWidth = 18; g.beginPath(); g.moveTo(x + (tipx - x) * .4, y - len * .2); g.lineTo(tipx, tipy); g.stroke();
    g.fillStyle = sk; g.beginPath(); g.arc(tipx, tipy - 6, 16, 0, TAU); g.fill(); g.strokeStyle = '#3a1a1a'; g.lineWidth = 2; g.stroke();
  }
  return { expo: 1.05 };
}

// ——— s15: the glass of chai at sunrise ———
export function s15(S) {
  const { g, e, t, lt, A } = S, tc = step12(t);
  const HAND = 55.25;
  if (t < 55.9) {   // two-shot: coach (left) hands him a glass
    plate(g, e, A.track, 1100, 0, 1.25);
    const k = ss((t - 54.6) / .6);
    const cr = fig(g, e, 'coach', 'sun', standPose({ arms: [{ b1: lerp(.6, 1.35, k), b2: lerp(1.2, .25, k) }, { b1: -.05, b2: .25 }] }), { view: 'q', expr: 'smile', ph: tc }, 230, 1980, .95);
    const ck = ss((t - 54.9) / .5);
    const ch = fig(g, e, 'chhotu', 'sun', standPose({ lean: .1, arms: [{ b1: lerp(.2, 1.2, ck), b2: lerp(.3, .4, ck) }, { b1: -.1, b2: .3 }] }), { view: 'q', expr: 'grin', ph: tc, look: [-.4, 0] }, 830, 2010, .95, true);
    const u = ss((t - HAND) / .3), gx = lerp(cr.sx + 20, ch.sx - 20, u), gy = lerp(cr.sy - 30, ch.sy - 30, u);
    layer(g, e, (lg, le) => glass(lg, le, pal('chhotu', 'sun'), gx, gy + 30, 70, { glow: .9 }));
    return {};
  }
  // low angle, backlit, glass raised to the sun; slow crane up
  const lt2 = t - 55.9;
  plate(g, e, A.sky, 0, 1230 - lt2 * 50);
  const C = pal('chhotu', 'shade');
  const lift = ss(lt2 / .6);
  const pose = standPose({ lean: -.05, arms: [{ b1: lerp(1.2, 2.45, lift), b2: lerp(.4, .25, lift) }, { b1: -.1, b2: .3 }], headTilt: -.15 });
  const r = fig(g, e, 'chhotu', 'shade', pose, { view: 'q', expr: 'grin', ph: tc, rim: { c: '#ffb050', d: [-6, 6] }, skinRim: '#ffc070', look: [.2, -.6], C }, 380, 2000 + lt2 * 24, 1.3);
  // the glass: dark rim against the sun, amber chai catching the light; glow kept small so it stays readable
  layer(g, e, (lg, le) => { glass(lg, le, { ...pal('chhotu', 'sun'), glass: { f: '#f8fbff', s: '#a8b4c4', h: '#ffffff', l: '#2a2040' } }, r.sx + 14, r.sy + 18, 118, { glow: .18 }); });
  flare(e, 700, 1700 - (1230 - lt2 * 50), .5, '#ffc070', { streak: 700, ghosts: false });
  return { bloom: .5, halo: .22, thr: .95 };
}
export function black(S) { S.g.fillStyle = '#000'; S.g.fillRect(0, 0, W, H); return { expo: 0 }; }
