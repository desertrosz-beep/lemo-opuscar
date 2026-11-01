// Side-view figure rig (2.5D): pelvis → torso → head; thigh/shin/foot; upper arm/forearm/hand. Local units: head radius 80, ground y = 0, facing +x.
import { cel, path, poly, line, TAU, rgba, mix, LWK } from './cel.js';
import { head } from './head.js';
import { limb } from './limb.js';

const sin = Math.sin, cos = Math.cos;
export const DIM = {
  chhotu: { hip: 520, torso: 270, hs: 1.28, thigh: 288, shin: 276, ua: 186, fa: 168, w: 1, foot: 104 },
  coach: { hip: 590, torso: 330, hs: 1.12, thigh: 310, shin: 296, ua: 206, fa: 186, w: 1.18, foot: 116 },
  kid: { hip: 530, torso: 275, hs: 1.26, thigh: 292, shin: 280, ua: 188, fa: 170, w: 1.04, foot: 112 },
};
const at = (p, a, L) => [p[0] + sin(a) * L, p[1] + cos(a) * L];   // angle 0 = straight down, + = forward (+x)

// joint positions for a pose
export function joints(pose, D) {
  const lean = pose.lean || 0, bob = pose.bob || 0;
  const P = [pose.x || 0, -D.hip + bob + (pose.drop || 0)];
  const N = [P[0] + sin(lean) * D.torso, P[1] - cos(lean) * D.torso];
  const S = [P[0] + sin(lean) * (D.torso - 34), P[1] - cos(lean) * (D.torso - 34)];
  const legs = pose.legs.map(L => { const K = at(P, L.a1, D.thigh), A = at(K, L.a1 - L.a2, D.shin); return { K, A, fa: L.fa ?? 0 }; });
  const arms = pose.arms.map(R => { const E = at(S, R.b1, D.ua), Wr = at(E, R.b1 + R.b2, D.fa); return { E, W: Wr, ang: R.b1 + R.b2 }; });
  return { P, N, S, legs, arms, lean };
}

function foot(g, C, A, fa, D, o, far) {
  // fa: foot pitch (0 = flat, + = toes up). Bare or chappal or sneaker.
  const L = D.foot, c = cos(-fa), s = sin(-fa);
  const T = (x, y) => [A[0] + x * c - y * s, A[1] + x * s + y * c];
  const SK = far ? { ...C.skin, f: C.skin.s } : C.skin;
  if (o.shoe) {   // sneaker: chunky, shiny
    const sh = C.shoe, pts = [T(-34, -30), T(10, -40), T(62, -26), T(L + 22, -6), T(L + 24, 12, 1), T(-38, 14, 1)];
    cel(g, pts, { f: far ? sh.s : sh.f, s: sh.s, so: [0, -8], h: sh.h, ho: [0, 4], l: sh.l, lw: 2 });
    cel(g, [T(-38, 6), T(L + 24, 6), T(L + 24, 16, 1), T(-38, 18, 1)], { f: C.shoeSole, l: sh.l, lw: 1.6 });
    cel(g, [T(-6, -6), T(40, -24), T(70, -14), T(20, 2)], { f: C.swoosh, l: sh.l, lw: 1.2 });
    return;
  }
  const pts = [T(-30, -22), T(16, -30), T(56, -16), T(L - 6, -8), T(L + 8, 0, 1), T(L + 4, 10), T(-30, 12, 1)];
  cel(g, pts, { f: SK.f, s: SK.s, so: [0, -6], l: C.skin.l, lw: 1.6 });
  if (!o.chappal && !far) for (let k = 0; k < 3; k++) line(g, [T(L - 18 - k * 12, 0), T(L - 14 - k * 12, 9)], mix(C.skin.l, C.skin.f, .4), 1.1);
  if (o.chappal) {
    cel(g, [T(-36, 10), T(L + 10, 10), T(L + 12, 20, 1), T(-38, 20, 1)], { f: C.sole.f, s: C.sole.s, l: C.sole.l, lw: 1.4 });
    line(g, [T(20, -26), T(40, 2)], far ? C.chappal.s : C.chappal.f, 7);
    if (o.torn) line(g, [T(46, 4), T(54, -6)], C.chappal.s, 5);
  }
}

function leg(g, C, J, L, D, o, far) {
  const SK = far ? { ...C.skin, f: C.skin.s, h: C.skin.s } : C.skin;
  const W = D.w, Pp = J.P;
  if (o.smear && L.ghost) {   // smear: stretched multiples of the swinging shin + foot
    g.save(); g.globalAlpha = .38;
    for (const gh of L.ghost) cel(g, limb(gh.K, gh.A, 56 * W, 40 * W), { f: SK.f });
    g.restore();
  }
  cel(g, limb(L.K, L.A, 60 * W, 38 * W), { f: SK.f, s: SK.s, so: [-8, -4], h: SK.h, l: C.skin.l, lw: 1.8 });
  foot(g, C, L.A, L.fa, D, o, far);
  cel(g, limb(Pp, L.K, 80 * W, 62 * W), { f: SK.f, s: SK.s, so: [-10, -4], h: SK.h, l: C.skin.l, lw: 1.8 });
  // shorts / trousers over the thigh
  const SH = C.shorts || C.pants, long = !!C.pants && !C.shorts;
  const end = long ? L.A : [Pp[0] + (L.K[0] - Pp[0]) * .62, Pp[1] + (L.K[1] - Pp[1]) * .62];
  if (long) cel(g, limb(L.K, L.A, 70 * W, 56 * W), { f: far ? SH.s : SH.f, s: SH.s, so: [-8, -4], l: SH.l, lw: 1.8 });
  cel(g, limb(Pp, long ? L.K : end, 98 * W, (long ? 74 : 92) * W), { f: far ? SH.s : SH.f, s: SH.s, so: [-10, -6], h: SH.h, l: SH.l, lw: 1.8 });
}

function arm(g, C, J, R, D, o, far, top) {
  const SK = far ? { ...C.skin, f: C.skin.s, h: C.skin.s } : C.skin, W = D.w;
  const S = J.S, SL = C.jacket || C.top || C.tee;
  if (o.smear && R.ghost && !top) { g.save(); g.globalAlpha = .35; for (const gh of R.ghost) cel(g, limb(gh.E, gh.W, 40 * W, 34 * W), { f: SK.f }); g.restore(); }
  const longSleeve = !!C.jacket;
  cel(g, limb(R.E, R.W, (longSleeve ? 50 : 40) * W, (longSleeve ? 44 : 32) * W), longSleeve ? { f: far ? SL.s : SL.f, s: SL.s, so: [-6, -6], h: SL.h, l: SL.l, lw: 1.8 } : { f: SK.f, s: SK.s, so: [-6, -6], h: SK.h, l: C.skin.l, lw: 1.6 });
  // hand: a mitten + thumb (fist or open palm)
  const a = R.ang, hx = R.W[0] + sin(a) * 26, hy = R.W[1] + cos(a) * 26;
  const hp = new Path2D(); hp.ellipse(hx, hy, 26 * W, 30 * W, -a, 0, TAU);
  cel(g, hp, { f: SK.f, s: SK.s, so: [-4, -4], l: C.skin.l, lw: 1.6 });
  cel(g, limb(S, R.E, 52 * W, 44 * W), { f: SK.f, s: SK.s, so: [-6, -6], h: SK.h, l: C.skin.l, lw: 1.6 });
  // sleeve
  const se = longSleeve ? R.E : [S[0] + (R.E[0] - S[0]) * .5, S[1] + (R.E[1] - S[1]) * .5];
  cel(g, limb(S, se, 70 * W, (longSleeve ? 54 : 62) * W), { f: far ? SL.s : SL.f, s: SL.s, so: [-8, -6], h: SL.h, l: SL.l, lw: 1.8 });
  if (C.stripe) { line(g, [[S[0] + 6, S[1] - 20], [R.E[0] + 6, R.E[1]], [R.W[0] + 6, R.W[1]]], C.stripe.f, 7); }
  return [hx, hy];
}

function torso(g, C, J, D, o) {
  const P = J.P, l = J.lean, W = D.w, len = D.torso;
  const ux = sin(l), uy = -cos(l), vx = cos(l), vy = sin(l);
  const T = (u, v) => [P[0] + ux * u + vx * v * W, P[1] + uy * u + vy * v * W];
  const top = C.jacket || C.top || C.tee;
  const shape = [T(-46, -54), T(-40, 58), T(len * .45, 64), T(len - 40, 76), T(len - 4, 62), T(len + 8, 20), T(len + 6, -40), T(len - 24, -74), T(len * .5, -62), T(40, -54)];
  cel(g, shape, { f: top.f, s: top.s, so: [-14 * vx, -14 * vy], h: top.h, ho: [5, 5], l: top.l, lw: 2,
    clipFn: gg => {
      if (C.wear) { gg.fillStyle = rgba(C.wear, .55); gg.fill(path([T(len * .5, 10), T(len * .6, 44), T(len * .38, 40)])); gg.fill(path([T(90, -30), T(120, -6), T(70, -10)])); }
      if (C.trim) { gg.fillStyle = C.trim.f; gg.fill(poly([T(-46, -60), T(-46, 70), T(-24, 70), T(-24, -60)])); }
      if (C.jacket) { line(gg, [T(-46, 52), T(len, 40)], C.jacket.l, 1.6); gg.fillStyle = C.stripe.f; gg.fill(poly([T(-46, 60), T(-20, 60), T(-20, -60), T(-46, -60)])); }
    } });
  // collar
  if (C.jacket) cel(g, [T(len - 16, -20), T(len + 30, -14), T(len + 34, 34), T(len - 10, 44)], { f: C.jacket.f, s: C.jacket.s, so: [-4, 4], l: C.jacket.l, lw: 1.8 });
  else line(g, [T(len - 6, 0), T(len - 22, 30), T(len - 4, 56)], top.l, 1.8);
}

// stopwatch on a cord (coach)
export function stopwatch(g, C, x, y, r = 34, o = {}) {
  const c = new Path2D(); c.arc(x, y, r, 0, TAU);
  cel(g, poly([[x - 6, y - r - 14], [x + 6, y - r - 14], [x + 6, y - r + 2], [x - 6, y - r + 2]]), { f: C.steel.f, l: C.steel.l, lw: 1.4 });
  cel(g, c, { f: C.steel.f, s: C.steel.s, so: [-6, -6], h: C.steel.h, ho: [4, 4], l: C.steel.l, lw: 2 });
  const f = new Path2D(); f.arc(x, y, r * .74, 0, TAU); cel(g, f, { f: '#f4f0e4', l: C.steel.l, lw: 1.2 });
  const a = o.hand ?? -1.2; line(g, [[x, y], [x + cos(a) * r * .62, y + sin(a) * r * .62]], '#c02020', 2.4);
}

// chai glass (small tapered tumbler): base centre (x,y), height h
export function glass(g, e, C, x, y, h = 60, o = {}) {
  const w0 = h * .32, w1 = h * .4, lvl = o.level ?? .78;
  const G = poly([[x - w0, y], [x + w0, y], [x + w1, y - h], [x - w1, y - h]]);
  cel(g, G, { f: rgba(C.glass.f, .55), l: C.glass.l, lw: 1.4 });
  if (lvl > 0) {
    const ty = y - h * lvl, tw = w0 + (w1 - w0) * lvl;
    cel(g, poly([[x - w0 + 2, y - 2], [x + w0 - 2, y - 2], [x + tw - 2, ty], [x - tw + 2, ty]]), { f: C.chai.f, s: C.chai.s, sh: [[[x + w0 * .2, y], [x + w0, y], [x + tw, ty], [x + tw * .3, ty]]] });
    g.fillStyle = C.chai.h; g.beginPath(); g.ellipse(x, ty, tw - 2, h * .06, 0, 0, TAU); g.fill();
    if (e) { e.fillStyle = rgba('#ff9a30', o.glow ?? .55); e.beginPath(); e.ellipse(x, y - h * lvl * .5, w1 * 1.3, h * .55, 0, 0, TAU); e.fill(); }
  }
  g.fillStyle = rgba('#ffffff', .75); g.fill(poly([[x - w0 * .55, y - h * .1], [x - w0 * .3, y - h * .1], [x - w1 * .45, y - h * .9], [x - w1 * .72, y - h * .9]]));
  g.strokeStyle = C.glass.l; g.lineWidth = 1.2 * LWK.k; g.beginPath(); g.ellipse(x, y - h, w1, h * .07, 0, 0, TAU); g.stroke();
}

// steel tray with n glasses (3 rows × 4), seen slightly from above; (x,y) = tray centre
export function tray(g, e, C, x, y, n = 12, o = {}) {
  const rx = 150, ry = 34;
  const T = new Path2D(); T.ellipse(x, y, rx, ry, 0, 0, TAU);
  cel(g, poly([[x - rx, y], [x + rx, y], [x + rx - 4, y + 10], [x - rx + 4, y + 10]]), { f: C.steel.s, l: C.steel.l, lw: 1.6 });
  const B = new Path2D(); B.ellipse(x, y + 10, rx - 3, ry - 2, 0, 0, Math.PI); cel(g, B, { f: C.steel.s, l: C.steel.l, lw: 1.6 });
  cel(g, T, { f: C.steel.f, s: C.steel.s, so: [0, 8], h: C.steel.h, l: C.steel.l, lw: 2 });
  g.strokeStyle = rgba('#ffffff', .8); g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, rx - 14, ry - 8, 0, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  let k = 0;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    if (k++ >= n) continue;
    const gx = x - 96 + c * 64 + (r - 1) * 6, gy = y - 18 + r * 16;
    glass(g, e, C, gx, gy, 56, o);
  }
}

// whole figure; who: chhotu | coach | kidA | kidB; o: { light, expr, view, tray, smear, chappal, torn, shoe, ph, headTilt }
export function figure(g, e, C, pose, o = {}) {
  const D = DIM[o.who === 'coach' ? 'coach' : o.who?.startsWith('kid') ? 'kid' : 'chhotu'];
  const J = joints(pose, D);
  const smears = o.smear ? ghosts(pose, D, o.ghostPoses) : null;
  const legs = J.legs.map((L, i) => ({ ...L, ghost: smears?.legs[i] })), arms = J.arms.map((R, i) => ({ ...R, ghost: smears?.arms[i] }));
  const farLeg = pose.farLeg ?? 1, nearLeg = 1 - farLeg;
  arm(g, C, J, arms[1], D, o, true);
  leg(g, C, J, legs[farLeg], D, o, true);
  torso(g, C, J, D, o);
  leg(g, C, J, legs[nearLeg], D, o, false);
  // head: neck base at J.N
  const hl = J.lean * .55 + (pose.headTilt || 0);
  g.save(); g.translate(J.N[0] + sin(hl) * 20, J.N[1] - 104 * D.hs); g.rotate(hl * .6); g.scale(D.hs, D.hs);
  head(g, C, { who: o.who, view: o.view || 'side', expr: o.expr || 'determined', ph: o.ph, light: o.headLight, look: o.look, skinRim: o.skinRim, rim: o.rim, wind: o.wind ?? .6, blush: o.blush });
  g.restore();
  if (o.who === 'coach' && o.watch !== false) {   // cord + stopwatch on the chest
    const cx = J.S[0] + 46, cy = J.S[1] + 120;
    line(g, [[J.N[0] - 20, J.N[1] + 10], [cx - 4, cy - 36]], C.cord.f, 3); line(g, [[J.N[0] + 34, J.N[1] + 6], [cx + 4, cy - 36]], C.cord.f, 3);
    if (!o.watchInHand) stopwatch(g, C, cx, cy, 30);
  }
  const hand = arm(g, C, J, arms[0], D, o, false, !!o.tray);
  if (o.tray) tray(g, e, C, hand[0] + 20, hand[1] - 30, o.tray.n ?? 12, o.tray);
  return { J, hand };
}

// smear multiples from the previous phases of a cycle
function ghosts(pose, D, gp) {
  if (!gp) return null;
  const out = { legs: [[], []], arms: [[], []] };
  for (const q of gp) { const J = joints(q, D); J.legs.forEach((L, i) => out.legs[i].push(L)); J.arms.forEach((R, i) => out.arms[i].push(R)); }
  return out;
}

// —— poses ——
export function runPose(p, o = {}) {   // sprint cycle, p ∈ [0,1): near leg forward at p = .25
  const s = o.speed ?? 1, A = (q) => {
    const w = TAU * q, a1 = .18 + .82 * s * sin(w), swing = cos(w);   // thigh; swing>0 = thigh moving forward (recovery)
    const a2 = .25 + (swing > 0 ? 1.55 * s * Math.pow(swing, .7) : .15 + .45 * s * Math.pow(-swing, 2)) ;
    const fa = swing > 0 ? -.5 : (sin(w) > .3 ? .35 : 0);
    return { a1, a2, fa };
  };
  const arm = (q) => { const w = TAU * q; return { b1: -.85 * s * sin(w) + .1, b2: 1.55 + .2 * sin(w) }; };
  const bob = -Math.abs(sin(TAU * p)) * 26 * s + 10;
  return { lean: o.lean ?? .3 * s + .04, bob, drop: o.drop || 0, legs: [A(p), A(p + .5)], arms: o.trayArm ? [{ b1: 2.05, b2: 1.05 }, arm(p)] : [arm(p + .5), arm(p)], farLeg: sin(TAU * p) > 0 ? 1 : 0 };
}
export function standPose(o = {}) {
  return { lean: o.lean ?? .02, bob: 0, legs: [{ a1: .08, a2: .04, fa: 0 }, { a1: -.06, a2: .02, fa: 0 }], arms: o.arms || [{ b1: .12, b2: .2 }, { b1: -.05, b2: .25 }], headTilt: o.headTilt || 0, farLeg: 1 };
}
export function crouchPose(o = {}) {   // sprint start crouch (standing start lean)
  return { lean: .7, drop: 150, bob: 0, legs: [{ a1: .9, a2: 1.6, fa: 0 }, { a1: -.4, a2: .5, fa: .2 }], arms: [{ b1: -.5, b2: .8 }, { b1: .8, b2: .9 }], farLeg: 1, headTilt: -.25 };
}
