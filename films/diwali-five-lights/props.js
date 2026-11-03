// Carved hide scenery for "Five Lamps". Every set piece is one sprite (piece) of translucent dyed hide, cut with the style's
// vocabulary (lattice, coin holes, crescent rows, cloud scrolls, tapered slits); holes glow, overlaps darken.
import { piece, fill, cut, cutLine, ink, within, smooth, poly, cloud, beads, beadLine, plum, lattice, coin, strata, waves, flameTongue, scalesOpen, cutTaper } from './carve.js';
import { DYE } from './fig.js';
import { mulberry } from '/core/lib.js';

const C = new Map();
const memo = (k, f) => { if (!C.has(k)) C.set(k, f()); return C.get(k); };
export const groundY = x => 905 + 8 * Math.sin(x / 260) + 5 * Math.sin(x / 97 + 1);
const GB = 975;
const SAND = '#b8502c', SAND2 = '#c9733a', GOLD = DYE.turmeric;

// ---- shapes reused
export function diyaPath(q, x, y, s) {   // clay lamp in profile: bowl with a spout to the right; (x,y) = bowl rim centre
  q.moveTo(x - 46 * s, y); q.quadraticCurveTo(x - 40 * s, y + 26 * s, x - 4 * s, y + 28 * s); q.quadraticCurveTo(x + 34 * s, y + 26 * s, x + 50 * s, y + 6 * s);
  q.lineTo(x + 66 * s, y - 6 * s); q.lineTo(x + 50 * s, y - 4 * s); q.quadraticCurveTo(x, y + 4 * s, x - 46 * s, y); q.closePath();
}
export function flamePath(q, x, y, s) {   // flame tongue standing on (x,y)
  q.moveTo(x - 9 * s, y); q.bezierCurveTo(x - 16 * s, y - 16 * s, x - 6 * s, y - 34 * s, x + 2 * s, y - 52 * s);
  q.bezierCurveTo(x + 10 * s, y - 34 * s, x + 16 * s, y - 16 * s, x + 9 * s, y); q.closePath();
}
function arch(q, x, y, w, h) { q.moveTo(x - w / 2, y); q.lineTo(x - w / 2, y - h + w * .55); q.quadraticCurveTo(x - w / 2, y - h, x, y - h - w * .25); q.quadraticCurveTo(x + w / 2, y - h, x + w / 2, y - h + w * .55); q.lineTo(x + w / 2, y); q.closePath(); }
function dome(q, x, y, w, h) { q.moveTo(x - w / 2, y); q.bezierCurveTo(x - w * .75, y - h * .5, x - w * .15, y - h * .8, x, y - h); q.bezierCurveTo(x + w * .15, y - h * .8, x + w * .75, y - h * .5, x + w / 2, y); q.closePath(); }
function chhatri(g, x, y, w, col) {    // small domed kiosk on four posts
  const d = q => dome(q, x, y - w * .5, w, w * .8); fill(g, col || GOLD, d); within(g, d, () => beadLine(g, x - w * .4, y - w * .62, x + w * .4, y - w * .62, 1.6, 6)); ink(g, 1.6, d);
  ink(g, 2, q => { q.moveTo(x, y - w * 1.3); q.lineTo(x, y - w * 1.45); });
  const b = q => poly(q, [[x - w * .55, y - w * .5], [x + w * .55, y - w * .5], [x + w * .5, y - w * .42], [x - w * .5, y - w * .42]]); fill(g, DYE.crimson, b);
  for (const dx of [-.42, -.14, .14, .42]) fill(g, SAND, q => q.rect(x + dx * w - 2.5, y - w * .42, 5, w * .42));
  ink(g, 1.2, q => q.rect(x - w * .5, y - w * .42, w, w * .42));
}

// ---- ground strip (lotus-petal band + bead row), any width
export function ground(x0 = 0, x1 = 1920, col = '#8a5e30') {
  return memo('ground' + x0 + '_' + x1 + col, () => piece([x0, 870, x1, GB + 4], g => {
    const top = []; for (let x = x0 - 10; x <= x1 + 10; x += 16) top.push([x, groundY(x)]);
    const gp = q => poly(q, top.concat([[x1 + 10, GB], [x0 - 10, GB]]));
    fill(g, col, gp);
    within(g, gp, () => {
      g.fillStyle = DYE.brown; g.fillRect(x0 - 10, GB - 24, x1 - x0 + 20, 30);
      for (let x = x0 + 14; x < x1; x += 30) cut(g, q => { q.moveTo(x - 9, GB - 6); q.quadraticCurveTo(x - 9, GB - 20, x, GB - 22); q.quadraticCurveTo(x + 9, GB - 20, x + 9, GB - 6); q.closePath(); });
      for (let x = x0 + 20; x < x1; x += 38) coin(g, x, GB - 38, 5);
      const r = mulberry(2);
      for (let x = x0 + 8; x < x1; x += 16 + r() * 16) { const y = groundY(x) + 3, h = 10 + r() * 12; fill(g, DYE.green, q => poly(q, [[x - 6, y + 6], [x - 3, y - h], [x, y + 2], [x + 4, y - h * .8], [x + 7, y + 6]])); }
      for (let x = x0 + 30; x < x1; x += 64) cloud(g, x, groundY(x) + 30, 6.5, x * .03, 1.6, (x / 64) % 2 ? 1 : -1);
    });
    ink(g, 2.4, q => poly(q, top, false), '#2e1a0c');
  }, { ss: 1.2, seed: 12 }));
}

// ---- Ayodhya gate (stand-alone piece, base at y=0, centred on x=0)
export function gate() {
  return memo('gate', () => piece([-260, -640, 260, 6], g => {
    const body = q => { q.rect(-230, -380, 460, 380); };
    fill(g, SAND, body);
    within(g, body, () => { for (let y = -360; y < 0; y += 24) cutLine(g, 1.4, q => { q.moveTo(-230, y); q.lineTo(230, y); }); lattice(g, -220, -360, -110, -200, 12, 2.2); lattice(g, 110, -360, 220, -200, 12, 2.2); });
    cut(g, q => arch(q, 0, 0, 170, 280));
    ink(g, 5, q => arch(q, 0, 0, 186, 290), GOLD); ink(g, 1.8, q => arch(q, 0, 0, 196, 296));
    ink(g, 2.2, body);
    for (const x of [-190, 190]) { const t = q => q.rect(x - 44, -520, 88, 520); fill(g, SAND2, t); within(g, t, () => { for (let y = -500; y < 0; y += 30) cut(g, q => arch(q, x, y + 22, 20, 18)); }); ink(g, 2, t); chhatri(g, x, -520, 96); }
    const top = q => poly(q, [[-240, -380], [240, -380], [230, -410], [-230, -410]]); fill(g, DYE.crimson, top); within(g, top, () => beadLine(g, -226, -395, 226, -395, 2.2, 8)); ink(g, 1.6, top);
    const mid = q => dome(q, 0, -410, 220, 190); fill(g, GOLD, mid); within(g, mid, () => { lattice(g, -90, -560, 90, -420, 12, 2); }); ink(g, 2, mid);
    fill(g, DYE.red, q => { q.moveTo(-6, -600); q.lineTo(6, -600); q.lineTo(0, -636); q.closePath(); });
    // toran of mango leaves across the arch
    for (let x = -90; x <= 90; x += 18) { const y = -292 + Math.abs(x) * .08; fill(g, DYE.emerald, q => { q.moveTo(x, y); q.quadraticCurveTo(x - 7, y + 14, x, y + 26); q.quadraticCurveTo(x + 7, y + 14, x, y); }); }
  }, { ss: 1.6, seed: 61 }));
}
// ---- Ayodhya skyline for the return (1920 wide). Windows: list of [x,y,w,h]; covers are separate pieces
export const WINDOWS = (() => { const out = []; const cols = [140, 250, 360, 470, 580, 690, 1230, 1340, 1450, 1560, 1670, 1780]; for (const x of cols) for (const y of (Math.abs(x - 960) < 450 ? [640, 760] : [700, 800])) out.push([x, y, 42, 64]); return out; })();
export function skyline() {
  return memo('sky', () => piece([0, 330, 1920, 912], g => {
    const blds = [[60, 600, 230, 1], [300, 560, 260, 0], [560, 610, 220, 1], [1140, 610, 220, 1], [1360, 560, 260, 0], [1620, 600, 260, 1]];
    for (const [x, y, w, d] of blds) {
      const b = q => q.rect(x, y, w, 912 - y); fill(g, d ? SAND : SAND2, b);
      within(g, b, () => { for (let yy = y + 20; yy < 912; yy += 26) cutLine(g, 1.2, q => { q.moveTo(x, yy); q.lineTo(x + w, yy); }); });
      ink(g, 2, b);
      const cap = q => poly(q, [[x - 10, y], [x + w + 10, y], [x + w, y - 18], [x, y - 18]]); fill(g, DYE.crimson, cap); within(g, cap, () => beadLine(g, x, y - 9, x + w, y - 9, 2, 8)); ink(g, 1.4, cap);
      if (d) { const dm = q => dome(q, x + w / 2, y - 18, w * .6, w * .5); fill(g, GOLD, dm); within(g, dm, () => lattice(g, x, y - 18 - w * .5, x + w, y - 18, 11, 2)); ink(g, 1.8, dm); fill(g, DYE.red, q => { q.moveTo(x + w / 2 - 5, y - 18 - w * .5); q.lineTo(x + w / 2 + 5, y - 18 - w * .5); q.lineTo(x + w / 2, y - 18 - w * .5 - 26); q.closePath(); }); }
      else { chhatri(g, x + 50, y - 18, 70); chhatri(g, x + w - 50, y - 18, 70); }
    }
    // windows: arched holes, each with a tiny clay lamp left in hide on the sill (its flame is a hole)
    for (const [x, y, w, h] of WINDOWS) {
      cut(g, q => arch(q, x, y + h / 2, w, h));
      ink(g, 3, q => arch(q, x, y + h / 2, w + 6, h + 4), GOLD);
      fill(g, DYE.brown, q => diyaPath(q, x - 4, y + h / 2 - 8, .26));
    }
  }, { ss: 1.2, seed: 62 }));
}
export function windowCover() { return memo('wcover', () => piece([-30, -46, 30, 40], g => { const c = q => arch(q, 0, 36, 50, 74); fill(g, '#3a1a10', c); within(g, c, () => { cutLine(g, 1.4, q => { q.moveTo(0, -40); q.lineTo(0, 36); }); cloud(g, -11, 8, 5, 0, 1.1); cloud(g, 11, 8, 5, 2, 1.1, -1); }); ink(g, 1.5, c); }, { seed: 63 })); }

// ---- forest
export function tree(v = 0) {
  return memo('tree' + v, () => piece([-260, -560, 260, 20], g => {
    const r = mulberry(8 + v);
    // trunk + aerial roots
    const tk = q => smooth(q, [[-34, 14], [-24, -120], [-30, -260], [-10, -300], [14, -300], [30, -250], [24, -120], [36, 14]]); fill(g, DYE.brown, tk);
    within(g, tk, () => { for (let k = 1; k < 12; k++) cutLine(g, 1.6, q => { const y = -k * 24; q.moveTo(-14, y); q.quadraticCurveTo(0, y - 8, 14, y); }); }); ink(g, 1.8, tk);
    for (const x of [-150, -100, 110, 170]) ink(g, 3, q => { q.moveTo(x, -300); q.quadraticCurveTo(x + 6, -150, x - 4, 10); }, DYE.brown);
    const lobes = []; for (let i = 0; i < 14; i++) { const a = Math.PI + i / 13 * Math.PI, rr = 1 + .12 * Math.sin(i * 2.3 + v); lobes.push([Math.cos(a) * 240 * rr, -330 + Math.sin(a) * 190 * rr]); }
    lobes.push([210, -300], [100, -270], [-100, -270], [-210, -300]);
    const cp = q => smooth(q, lobes);
    fill(g, v % 2 ? DYE.green : DYE.jade, cp);
    within(g, cp, () => {
      for (let k = 0; k < 150; k++) { const a = r() * 6.28, rad = Math.sqrt(r()) * 210, x = Math.cos(a) * rad * 1.1, y = -380 + Math.sin(a) * rad * .62, ang = r() * 6.28, L = 12 + r() * 7;
        cut(g, q => { q.moveTo(x - Math.cos(ang) * L, y - Math.sin(ang) * L); q.quadraticCurveTo(x - Math.sin(ang) * 5, y + Math.cos(ang) * 5, x + Math.cos(ang) * L, y + Math.sin(ang) * L); q.quadraticCurveTo(x + Math.sin(ang) * 5, y - Math.cos(ang) * 5, x - Math.cos(ang) * L, y - Math.sin(ang) * L); }); }
      for (let k = 0; k < 8; k++) plum(g, -180 + r() * 360, -480 + r() * 180, 4);
    });
    ink(g, 2.2, cp);
  }, { ss: 1.3, seed: 64 + v }));
}
export function hut() {
  return memo('hut', () => piece([-150, -230, 150, 10], g => {
    const wall = q => q.rect(-110, -110, 220, 116); fill(g, DYE.hide2, wall);
    within(g, wall, () => { for (let x = -104; x < 110; x += 14) cutLine(g, 2.4, q => { q.moveTo(x, -104); q.lineTo(x, 4); }); }); ink(g, 2, wall);
    cut(g, q => arch(q, 30, 6, 56, 80)); ink(g, 2, q => arch(q, 30, 6, 60, 82));
    const roof = q => smooth(q, [[-146, -100], [-60, -210], [0, -228], [60, -210], [146, -100], [0, -116]]); fill(g, '#7a5420', roof);
    within(g, roof, () => { for (let k = 0; k < 9; k++) for (let x = -140 + (k % 2) * 9; x < 140; x += 18) cutTaper(g, [[x, -110 - k * 12], [x + 3, -122 - k * 12]], 4); });
    ink(g, 2, roof);
  }, { ss: 1.6, seed: 65 }));
}
export function deer() {
  return memo('deer', () => piece([-150, -260, 160, 10], g => {
    const b = q => smooth(q, [[-110, -150], [-60, -170], [40, -168], [86, -180], [100, -230], [118, -232], [130, -206], [150, -196], [138, -182], [112, -176], [100, -140], [76, -100], [70, -4], [58, -4], [52, -96], [-20, -100], [-60, -98], [-74, -4], [-86, -4], [-92, -100], [-118, -120], [-136, -150]]);
    fill(g, DYE.deer, b);
    within(g, b, () => { const r = mulberry(5); for (let k = 0; k < 26; k++) coin(g, -100 + r() * 180, -160 + r() * 46, 5 + r() * 3); scalesOpen(g, 50, -176, 110, -130, 5); });
    ink(g, 2, b);
    const eye = q => q.arc(122, -214, 3.4, 0, 7); cut(g, eye); ink(g, 1, eye);
    for (const d of [-1, 1]) ink(g, 2.6, q => { q.moveTo(110, -232); q.quadraticCurveTo(106 + d * 10, -250, 98 + d * 18, -256); q.moveTo(104 + d * 6, -246); q.lineTo(92 + d * 6, -250); }, DYE.brown);
  }, { ss: 1.8, seed: 66 }));
}
// ---- sea strips, bridge, Lanka
export function seaStrip(i, x0 = -400, x1 = 2400) {
  return memo('sea' + i + x0, () => piece([x0, -40, x1, 120], g => {
    const top = []; for (let x = x0; x <= x1; x += 20) top.push([x, Math.sin(x / (60 + i * 14) + i) * 12]);
    const s = q => poly(q, top.concat([[x1, 120], [x0, 120]]));
    fill(g, [DYE.teal, '#1c4f74', DYE.peacock][i % 3], s);
    within(g, s, () => { for (let row = 0; row < 5; row++) for (let x = x0 + (row % 2) * 16; x < x1; x += 32) cutLine(g, 3, q => { const y = 18 + row * 20; q.moveTo(x - 12, y + 3); q.quadraticCurveTo(x, y - 7, x + 12, y + 3); }); for (let x = x0 + 30; x < x1; x += 120) cloud(g, x, 10, 9, x, 2, (x / 120) % 2 ? 1 : -1); });
    ink(g, 2, q => poly(q, top, false));
  }, { ss: 1, seed: 67 + i }));
}
export function bridge() {
  return memo('bridge', () => piece([0, -60, 1400, 50], g => {
    const r = mulberry(9);
    for (let x = 10; x < 1390; x += 46 + r() * 10) { const w = 40 + r() * 10, y = -40 + r() * 8, st = q => smooth(q, [[x, y + 12], [x + w * .3, y], [x + w * .8, y + 2], [x + w, y + 16], [x + w * .9, y + 44], [x + w * .1, y + 46]]); fill(g, '#8a7a62', st); within(g, st, () => { cutLine(g, 1.6, q => { q.moveTo(x + w * .3, y + 18); q.lineTo(x + w * .6, y + 30); }); }); ink(g, 1.6, st); }
    const deck = q => q.rect(0, 0, 1400, 18); fill(g, DYE.brown, deck); within(g, deck, () => { for (let x = 10; x < 1400; x += 22) coin(g, x, 9, 5); }); ink(g, 1.6, deck);
  }, { ss: 1.4, seed: 69 }));
}
export function lanka() {
  return memo('lanka', () => piece([-220, -420, 220, 6], g => {
    const w = q => poly(q, [[-200, 0], [-200, -180], [-160, -260], [-120, -180], [-80, -320], [-40, -200], [0, -400], [40, -200], [80, -320], [120, -180], [160, -260], [200, -180], [200, 0]]);
    fill(g, '#c98a26', w); within(g, w, () => { for (let x = -180; x < 200; x += 40) cut(g, q => arch(q, x, -20, 18, 40)); lattice(g, -200, -170, 200, -60, 14, 2.4); }); ink(g, 2, w);
  }, { ss: 1.4, seed: 70 }));
}
export function monkeys() {
  return memo('monkeys', () => piece([0, -260, 1000, 10], g => {
    const r = mulberry(11);
    for (let i = 0; i < 9; i++) {
      const x = 50 + i * 105 + r() * 20, h = 170 + r() * 50, y = 0;
      const m = q => smooth(q, [[x - 30, y], [x - 34, y - h * .5], [x - 22, y - h * .78], [x - 6, y - h], [x + 20, y - h * .98], [x + 34, y - h * .84], [x + 26, y - h * .72], [x + 30, y - h * .5], [x + 50, y - h * .62], [x + 58, y - h * .56], [x + 32, y - h * .36], [x + 26, y]]);
      fill(g, i % 2 ? '#a0521e' : '#8a4a1a', m);
      within(g, m, () => { for (let k = 0; k < 10; k++) cutLine(g, 1.3, q => { const yy = y - h * .1 - k * h * .06; q.moveTo(x - 20, yy); q.lineTo(x - 14, yy - 6); q.moveTo(x, yy); q.lineTo(x + 6, yy - 6); }); cut(g, q => q.arc(x + 18, y - h * .88, 4, 0, 7)); cut(g, q => smooth(q, [[x + 20, y - h * .8], [x + 34, y - h * .8], [x + 30, y - h * .74], [x + 20, y - h * .74]])); });
      ink(g, 1.8, m);
      ink(g, 3, q => { q.moveTo(x - 30, y - h * .3); q.quadraticCurveTo(x - 70, y - h * .5, x - 56, y - h * .9); }, '#6a3414');
    }
  }, { ss: 1.4, seed: 71 }));
}
// ---- fire (flame-tongue pieces, swapped at 12 fps)
export function firePiece(v) {
  return memo('fire' + v, () => piece([-80, -200, 80, 10], g => {
    const r = mulberry(20 + v);
    const Tt = [[-36, 110, 44, 1], [36, 118, 44, -1], [-12, 160, 50, -1], [14, 146, 48, 1]].map(([x, h, w, d]) => [x + (r() - .5) * 6, h * (.9 + r() * .2), w, d]);
    const at = (x, fn) => q => { const P = { moveTo: (a, b) => q.moveTo(a + x, b), bezierCurveTo: (a1, b1, a2, b2, a3, b3) => q.bezierCurveTo(a1 + x, b1, a2 + x, b2, a3 + x, b3), closePath: () => q.closePath() }; fn(P); };
    for (const [x, h, w, d] of Tt) fill(g, DYE.red, at(x, P => flameTongue(P, h, w, d)));
    for (const [x, h, w, d] of Tt) fill(g, DYE.orange, at(x + d * 2, P => flameTongue(P, h * .72, w * .62, d)));
    for (const [x, h, w, d] of Tt) fill(g, DYE.yellow, at(x + d * 3, P => flameTongue(P, h * .42, w * .34, d)));
    for (const [x, h, w, d] of Tt) { cutLine(g, 1.8, q => { q.moveTo(x - w * .2, -8); q.bezierCurveTo(x - w * .3, -h * .35, x + d * w * .05, -h * .55, x + d * w * .2, -h * .7); }); cloud(g, x + d * w * .45, -h * .84, 4.2, d > 0 ? 0 : 3, 1.3, d); }
    for (const [x, h, w, d] of Tt) ink(g, 1.7, at(x, P => flameTongue(P, h, w, d)));
  }, { seed: 20 + v }));
}
export function arrowPiece() { return memo('arrow', () => piece([-180, -10, 20, 10], g => { ink(g, 3.4, q => { q.moveTo(-170, 0); q.lineTo(0, 0); }, '#4a2612'); fill(g, DYE.ink, q => poly(q, [[16, 0], [-4, -7], [-4, 7]])); fill(g, DYE.red, q => poly(q, [[-170, 0], [-146, -8], [-140, 0], [-146, 8]])); }, { seed: 72 })); }

// ---- churning: Mandara, serpent, tortoise shell
export function mandara() {
  return memo('mandara', () => piece([-280, -760, 280, 10], g => {
    const m = q => smooth(q, [[-260, 0], [-200, -220], [-130, -480], [-60, -680], [0, -740], [60, -680], [130, -480], [200, -220], [260, 0]]);
    fill(g, '#5f7a44', m);
    within(g, m, () => { strata(g, -280, 280, x => -740 + Math.abs(x) * 2.6, 36, 20, 2.4); const r = mulberry(4); for (let k = 0; k < 14; k++) plum(g, -150 + r() * 300, -560 + r() * 500, 4); cloud(g, -20, -640, 12, 0, 2.2); cloud(g, 24, -600, 9, 2, 2, -1); });
    ink(g, 2.4, m);
  }, { ss: 1.3, seed: 73 }));
}
// serpent rope: a scaly ribbon along a polyline (drawn per frame from a cached tile); coils across the mountain are three pieces
export function coil(i) {
  return memo('coil' + i, () => piece([-300, -50, 300, 50], g => {
    const b = q => { q.moveTo(-290, 20); q.quadraticCurveTo(0, -40, 290, -20); q.lineTo(290, 16); q.quadraticCurveTo(0, -4, -290, 44); q.closePath(); };
    fill(g, DYE.emerald, b); within(g, b, () => scalesOpen(g, -300, -50, 300, 50, 7)); ink(g, 2, b);
  }, { ss: 1.3, seed: 74 + i }));
}
export function ropeSeg() { return memo('rope', () => piece([0, -20, 400, 20], g => { const b = q => q.rect(0, -14, 400, 28); fill(g, DYE.emerald, b); within(g, b, () => scalesOpen(g, -10, -20, 410, 20, 7)); ink(g, 2, q => { q.moveTo(0, -14); q.lineTo(400, -14); q.moveTo(0, 14); q.lineTo(400, 14); }); }, { ss: 1.2, seed: 77 })); }
export function serpentHead() {
  return memo('shead', () => piece([-120, -170, 60, 30], g => {
    const hood = q => smooth(q, [[0, 20], [-30, -40], [-70, -110], [-50, -160], [0, -150], [40, -110], [30, -40]]);
    fill(g, DYE.emerald, hood); within(g, hood, () => { scalesOpen(g, -80, -170, 50, 10, 7); for (const [x, y] of [[-24, -110], [10, -100]]) { cut(g, q => q.arc(x, y, 9, 0, 7)); fill(g, DYE.turmeric, q => q.arc(x, y, 5, 0, 7)); } }); ink(g, 2.2, hood);
    const h = q => smooth(q, [[-4, -150], [30, -168], [56, -160], [50, -146], [20, -140]]); fill(g, '#1a5a34', h); cut(g, q => q.arc(32, -158, 3, 0, 7)); ink(g, 1.6, h);
  }, { ss: 1.6, seed: 78 }));
}
export function bigLotus() {
  return memo('blotus', () => piece([-260, -200, 260, 30], g => {
    const pet = (a, rr, col) => { const x = Math.sin(a) * rr, y = -Math.cos(a) * rr * .55; const p = q => { q.moveTo(0, 0); q.bezierCurveTo(x * .3 - 50, y * .6, x - 26, y - 24, x * 1.05, y * 1.15 - 30); q.bezierCurveTo(x + 26, y - 24, x * .3 + 50, y * .6, 0, 0); }; fill(g, col, p); within(g, p, () => { cutLine(g, 1.6, q => { q.moveTo(x * .2, -10); q.quadraticCurveTo(x * .6, y * .5, x * .9, y - 10); }); }); ink(g, 1.8, p); };
    for (const a of [-1.5, 1.5, -1.1, 1.1]) pet(a, 230, DYE.rose);
    for (const a of [-.7, .7, -.35, .35, 0]) pet(a, 200, DYE.lotus);
    const pod = q => poly(q, [[-140, 0], [140, 0], [120, 24], [-120, 24]]); fill(g, DYE.emerald, pod); within(g, pod, () => beadLine(g, -120, 12, 120, 12, 3, 12)); ink(g, 1.8, pod);
  }, { ss: 1.4, seed: 79 }));
}
export function coinP() { return memo('coin', () => piece([-16, -16, 16, 16], g => { const c = q => q.arc(0, 0, 14, 0, 7); fill(g, GOLD, c); cut(g, q => q.rect(-4.5, -4.5, 9, 9)); beads(g, [[0, -10], [10, 0], [0, 10], [-10, 0]], 1.4); ink(g, 1.4, c); }, { seed: 80 })); }

// ---- homes
export function house() {
  return memo('house', () => piece([-330, -560, 330, 6], g => {
    const wall = q => q.rect(-300, -330, 600, 336); fill(g, '#d9a46a', wall);
    within(g, wall, () => { for (let y = -320; y < 0; y += 22) cutLine(g, 1.2, q => { q.moveTo(-300, y); q.lineTo(300, y); }); for (const x of [-210, 210]) { cut(g, q => arch(q, x, -150, 80, 110)); lattice(g, x - 40, -270, x + 40, -150, 11, 2.2); } });
    ink(g, 2.2, wall);
    cut(g, q => q.rect(-80, -250, 160, 256));  // doorway (the leaves are separate pieces)
    ink(g, 6, q => q.rect(-88, -258, 176, 264), DYE.brown); ink(g, 1.6, q => q.rect(-94, -264, 188, 270));
    for (let x = -80; x <= 80; x += 16) fill(g, DYE.emerald, q => { const y = -258; q.moveTo(x, y); q.quadraticCurveTo(x - 7, y + 14, x, y + 28); q.quadraticCurveTo(x + 7, y + 14, x, y); });
    const roof = q => poly(q, [[-340, -330], [-250, -460], [250, -460], [340, -330]]); fill(g, DYE.crimson, roof);
    within(g, roof, () => { for (let k = 0; k < 6; k++) for (let x = -340 + (k % 2) * 12; x < 340; x += 24) cut(g, q => { const y = -452 + k * 21; q.moveTo(x - 8, y); q.arc(x, y, 8, Math.PI, 0, true); q.closePath(); }); });
    ink(g, 2, roof);
    chhatri(g, 0, -460, 110);
    const step = q => q.rect(-140, -8, 280, 14); fill(g, DYE.brown, step); within(g, step, () => { for (let x = -130; x < 140; x += 20) coin(g, x, -1, 4); }); ink(g, 1.4, step);
  }, { ss: 1.4, seed: 81 }));
}
export function doorLeaf(side) {
  return memo('door' + side, () => piece([-4, -4, 84, 256], g => {
    const d = q => q.rect(0, 0, 80, 252); fill(g, DYE.brown, d);
    within(g, d, () => { for (const y of [30, 120, 210]) { cloud(g, 40, y, 14, side, 2, side); } for (let y = 8; y < 250; y += 46) beadLine(g, 10, y, 70, y, 2.2, 10); });
    ink(g, 2, d); g.beginPath(); g.arc(side > 0 ? 66 : 14, 128, 5, 0, 7); g.fillStyle = DYE.turmeric; g.fill();
  }, { seed: 82 + side }));
}
export function rangoli() {
  return memo('rangoli', () => piece([-170, -60, 170, 60], g => {
    g.save(); g.scale(1, .34);
    const ring = (r0, r1, col, n, shape) => { const R = q => { q.arc(0, 0, r1, 0, 7); q.arc(0, 0, r0, 0, 7, true); }; fill(g, col, R); within(g, R, () => { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, x = Math.cos(a) * (r0 + r1) / 2, y = Math.sin(a) * (r0 + r1) / 2; if (shape) cut(g, q => { q.ellipse(x, y, (r1 - r0) * .38, (r1 - r0) * .2, a, 0, 7); }); else cut(g, q => q.arc(x, y, (r1 - r0) * .22, 0, 7)); } }); ink(g, 2, q => q.arc(0, 0, r1, 0, 7)); };
    ring(130, 165, DYE.rose, 24, 1); ring(95, 130, DYE.turmeric, 20, 0); ring(60, 95, DYE.emerald, 16, 1); ring(30, 60, DYE.saffron, 12, 0);
    fill(g, DYE.crimson, q => q.arc(0, 0, 30, 0, 7)); plum(g, 0, 0, 12); ink(g, 2, q => q.arc(0, 0, 30, 0, 7));
    g.restore();
  }, { ss: 1.6, seed: 84 }));
}
export function diya(s = 1, col = '#a0461e') {     // clay lamp piece: bowl + flame cut as a hole (glows)
  return memo('diya' + s + col, () => piece([-50 * s, -60 * s, 70 * s, 32 * s], g => {
    const b = q => diyaPath(q, 0, 0, s); fill(g, col, b); within(g, b, () => { beadLine(g, -36 * s, 12 * s, 36 * s, 12 * s, 2 * s, 9 * s); }); ink(g, 1.6, b);
    const f = q => flamePath(q, 56 * s, -6 * s, .8 * s); fill(g, DYE.turmeric, f); cut(g, q => flamePath(q, 56 * s, -9 * s, .5 * s)); ink(g, 1.2, f);
  }, { seed: 85 }));
}
// ---- Narakasura's fortress, bars, captives
export function fortress() {
  return memo('fort', () => piece([-520, -720, 520, 6], g => {
    const w = q => poly(q, [[-500, 0], [-500, -360], [-460, -420], [-430, -360], [-380, -520], [-330, -360], [-260, -400], [-200, -360], [-140, -620], [-80, -360], [0, -700], [80, -360], [140, -620], [200, -360], [260, -400], [330, -360], [380, -520], [430, -360], [460, -420], [500, -360], [500, 0]]);
    fill(g, '#3a2048', w);
    within(g, w, () => { for (let y = -340; y < 0; y += 28) for (let x = -500 + ((y / 28) % 2 ? 0 : 20); x < 500; x += 40) cutLine(g, 1.6, q => { q.moveTo(x, y); q.lineTo(x + 34, y); }); for (const x of [-380, -140, 0, 140, 380]) cutTaper(g, [[x, -340], [x, -300]], 8); });
    ink(g, 2.4, w);
    cut(g, q => q.rect(-300, -300, 600, 260));     // the cell window (bars are a separate strip)
    ink(g, 4, q => q.rect(-306, -306, 612, 272), DYE.ink);
  }, { ss: 1.3, seed: 86 }));
}
export function bars() {
  return memo('bars', () => piece([-310, -310, 310, -30], g => {
    for (let x = -290; x <= 290; x += 42) { const b = q => q.rect(x - 6, -306, 12, 272); fill(g, '#2a1a20', b); ink(g, 1, b); }
    for (const y of [-280, -60]) { const b = q => q.rect(-306, y - 6, 612, 12); fill(g, '#2a1a20', b); within(g, b, () => { for (let x = -290; x < 300; x += 21) cut(g, q => q.arc(x, y, 2.4, 0, 7)); }); }
  }, { ss: 1.3, seed: 87 }));
}
export function captives(v = 0) {
  return memo('capt' + v, () => piece([0, -230, 560, 6], g => {
    const r = mulberry(31 + v), cols = [DYE.rose, DYE.saffron, DYE.peacock, DYE.emerald, DYE.turmeric, DYE.pink];
    for (let i = 0; i < 7; i++) {
      const x = 40 + i * 76 + r() * 10, h = 190 + r() * 26, col = cols[(i + v) % cols.length];
      const f = q => smooth(q, [[x - 30, 0], [x - 24, -h * .5], [x - 22, -h * .8], [x - 10, -h], [x + 12, -h * .98], [x + 20, -h * .84], [x + 22, -h * .5], [x + 34, 0]]);
      fill(g, col, f);
      within(g, f, () => { for (let k = 0; k < 6; k++) cutLine(g, 1.6, q => { q.moveTo(x - 20 + k * 9, -h * .5); q.lineTo(x - 24 + k * 11, -6); }); plum(g, x, -h * .66, 3); cut(g, q => q.ellipse(x + 10, -h * .86, 6, 9, 0, 0, 7)); });
      ink(g, 1.8, f);
    }
  }, { ss: 1.4, seed: 88 + v }));
}
// ---- Krishna's flying chariot with a Garuda prow; wheel separate
export function chariot() {
  return memo('char', () => piece([-300, -340, 300, 40], g => {
    const car = q => smooth(q, [[-240, -40], [-250, -140], [-200, -150], [140, -150], [190, -120], [180, -40]]);
    fill(g, DYE.crimson, car); within(g, car, () => { lattice(g, -240, -140, 180, -50, 13, 2.2); g.fillStyle = DYE.turmeric; g.fillRect(-250, -150, 450, 16); for (let x = -236; x < 190; x += 16) cut(g, q => q.arc(x, -142, 3, 0, 7)); }); ink(g, 2.2, car);
    // canopy posts + parasol
    for (const x of [-220, 120]) fill(g, DYE.brown, q => q.rect(x - 4, -320, 8, 180));
    const pr = q => smooth(q, [[-250, -300], [-50, -340], [150, -300], [140, -286], [-240, -286]]); fill(g, DYE.turmeric, pr); within(g, pr, () => beadLine(g, -230, -294, 130, -294, 3, 12)); ink(g, 1.8, pr);
    // Garuda prow: eagle head + spread wing
    const wing = q => smooth(q, [[160, -120], [220, -230], [260, -280], [250, -200], [290, -210], [250, -140], [210, -90]]); fill(g, DYE.saffron, wing);
    within(g, wing, () => { for (let k = 0; k < 8; k++) cutTaper(g, [[200 + k * 6, -110 - k * 10], [240 + k * 4, -160 - k * 12]], 5); }); ink(g, 1.8, wing);
    const hd = q => smooth(q, [[180, -60], [210, -110], [250, -120], [292, -100], [270, -88], [250, -80], [220, -40]]); fill(g, DYE.turmeric, hd);
    cut(g, q => q.arc(246, -104, 5, 0, 7)); ink(g, 1.8, hd); fill(g, DYE.red, q => poly(q, [[292, -100], [312, -92], [286, -86]]));
  }, { ss: 1.5, seed: 89 }));
}
export function wheel() { return memo('wheel', () => piece([-70, -70, 70, 70], g => { const o = q => { q.arc(0, 0, 66, 0, 7); q.arc(0, 0, 52, 0, 7, true); }; fill(g, DYE.brown, o); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; fill(g, DYE.brown, q => { q.moveTo(Math.cos(a - .08) * 14, Math.sin(a - .08) * 14); q.lineTo(Math.cos(a) * 54, Math.sin(a) * 54); q.lineTo(Math.cos(a + .08) * 14, Math.sin(a + .08) * 14); q.closePath(); }); } const h = q => q.arc(0, 0, 16, 0, 7); fill(g, DYE.turmeric, h); cut(g, q => q.arc(0, 0, 5, 0, 7)); ink(g, 1.6, h); ink(g, 1.8, q => q.arc(0, 0, 66, 0, 7)); within(g, o, () => { for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283; cut(g, q => q.arc(Math.cos(a) * 59, Math.sin(a) * 59, 2.6, 0, 7)); } }); }, { seed: 90 })); }
// ---- Gwalior fort: long rampart with round towers and an arched gate (centre at x=0)
export function gwalior() {
  return memo('gwal', () => piece([-1000, -560, 1000, 6], g => {
    const wall = q => q.rect(-980, -330, 1960, 336); fill(g, SAND2, wall);
    within(g, wall, () => { for (let y = -310; y < 0; y += 30) cutLine(g, 1.3, q => { q.moveTo(-980, y); q.lineTo(980, y); }); g.fillStyle = DYE.peacock; g.fillRect(-980, -300, 1960, 40); for (let x = -960; x < 980; x += 46) { cloud(g, x, -280, 9, x, 1.8, (x / 46) % 2 ? 1 : -1); } for (let x = -940; x < 980; x += 70) cut(g, q => arch(q, x, -170, 18, 36)); });
    ink(g, 2.2, wall);
    cut(g, q => arch(q, 0, 0, 200, 300)); ink(g, 6, q => arch(q, 0, 0, 212, 308), DYE.turmeric);
    for (const x of [-860, -520, -180, 180, 520, 860]) { const t = q => smooth(q, [[x - 70, 0], [x - 74, -380], [x - 50, -410], [x + 50, -410], [x + 74, -380], [x + 70, 0]]); fill(g, SAND, t); within(g, t, () => { g.fillStyle = DYE.peacock; g.fillRect(x - 80, -300, 160, 40); for (let k = 0; k < 4; k++) cut(g, q => arch(q, x - 36 + k * 24, -330, 12, 24)); for (let y = -380; y < 0; y += 30) cutLine(g, 1.2, q => { q.moveTo(x - 74, y); q.lineTo(x + 74, y); }); }); ink(g, 2, t); chhatri(g, x, -410, 110); }
    const mer = q => { for (let x = -980; x < 980; x += 30) { q.moveTo(x, -330); q.lineTo(x, -350); q.quadraticCurveTo(x + 10, -362, x + 20, -350); q.lineTo(x + 20, -330); q.closePath(); } }; fill(g, SAND, mer); ink(g, 1.2, mer);
  }, { ss: 1.1, seed: 91 }));
}
// ---- water temple: domed shrine on a causeway, rows of lamp holes along its outline
export function temple() {
  return memo('temple', () => piece([-520, -560, 520, 6], g => {
    const base = q => q.rect(-300, -220, 600, 226); fill(g, DYE.turmeric, base);
    within(g, base, () => { for (let k = 0; k < 5; k++) cut(g, q => arch(q, -200 + k * 100, -20, 54, 120)); g.fillStyle = DYE.gold; g.fillRect(-300, -220, 600, 22); beadLine(g, -290, -209, 290, -209, 3.2, 14); });
    ink(g, 2.2, base);
    const up = q => q.rect(-220, -340, 440, 120); fill(g, DYE.gold, up); within(g, up, () => { for (let k = 0; k < 6; k++) cut(g, q => arch(q, -175 + k * 70, -236, 30, 70)); beadLine(g, -210, -330, 210, -330, 3, 12); }); ink(g, 2, up);
    const dm = q => { q.moveTo(-150, -340); q.bezierCurveTo(-200, -430, -60, -480, 0, -540); q.bezierCurveTo(60, -480, 200, -430, 150, -340); q.closePath(); }; fill(g, DYE.turmeric, dm);
    within(g, dm, () => { for (let k = 0; k < 7; k++) cutLine(g, 2.6, q => { q.moveTo(-140 + k * 47, -340); q.quadraticCurveTo(-60 + k * 20, -440, 0, -530); }); }); ink(g, 2.2, dm);
    for (const x of [-260, 260, -150, 150]) chhatri(g, x, x * x > 40000 ? -220 : -340, 80);
    // the causeway
    const cw = q => poly(q, [[-520, 0], [-300, -30], [300, -30], [520, 0]]); fill(g, '#d9b07a', cw); within(g, cw, () => { for (let x = -500; x < 500; x += 26) cutLine(g, 2, q => { q.moveTo(x, -2); q.lineTo(x * .7, -28); }); }); ink(g, 1.6, cw);
    // lamp-row holes along the whole outline
    const row = (x0, y0, x1, y1, n) => beads(g, Array.from({ length: n + 1 }, (_, i) => [x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]), 3.4);
    row(-296, -196, 296, -196, 30); row(-216, -322, 216, -322, 22); row(-500, -8, -300, -34, 10); row(300, -34, 500, -8, 10);
    beads(g, Array.from({ length: 21 }, (_, i) => { const u = i / 20, a = Math.PI * (1 - u); return [Math.cos(a) * 150 * (1 - .1 * Math.sin(u * Math.PI)), -350 - Math.sin(a) * 160]; }), 3.4);
  }, { ss: 1.3, seed: 92 }));
}
export function waterStrip(w = 2400) { return memo('water' + w, () => piece([-w / 2, 0, w / 2, 260], g => { const s = q => q.rect(-w / 2, 0, w, 260); fill(g, '#1c4f74', s); within(g, s, () => { for (let row = 0; row < 12; row++) for (let x = -w / 2 + (row % 2) * 20; x < w / 2; x += 40) cutLine(g, 2.2 + row * .2, q => { const y = 12 + row * 21; q.moveTo(x - 16, y); q.quadraticCurveTo(x, y - 6, x + 16, y); }); }); }, { ss: 1, seed: 93 })); }
// ---- the teacher: still, frontal, featureless openwork; level 0..5 = more and more of the hide cut away
export function teacher(level) {
  return memo('teach' + level, () => piece([-340, -760, 340, 10], g => {
    const lv = level;
    // halo
    const halo = q => { q.arc(0, -520, 200, 0, 7); q.arc(0, -520, 150, 0, 7, true); };
    fill(g, DYE.turmeric, halo);
    within(g, halo, () => { for (let k = 0; k < 36; k++) { const a = k / 36 * 6.283; cutTaper(g, [[Math.cos(a) * 156, -520 + Math.sin(a) * 156], [Math.cos(a) * 194, -520 + Math.sin(a) * 194]], 6 + lv * 2.2); } });
    ink(g, 2, q => q.arc(0, -520, 200, 0, 7)); ink(g, 2, q => q.arc(0, -520, 150, 0, 7));
    // body: head, neck, shoulders, arms resting, crossed legs (seated, frontal, symmetrical)
    const body = q => smooth(q, [[0, -660], [44, -646], [60, -590], [50, -530], [30, -500], [34, -476], [110, -450], [140, -380], [150, -270], [170, -200], [260, -150], [280, -100], [200, -70], [0, -60], [-200, -70], [-280, -100], [-260, -150], [-170, -200], [-150, -270], [-140, -380], [-110, -450], [-34, -476], [-30, -500], [-50, -530], [-60, -590], [-44, -646]]);
    fill(g, '#c9883a', body);
    within(g, body, () => {
      // openwork grows with level
      const dens = [0, 1, 2, 3, 4, 5][lv];
      if (dens >= 1) for (let k = 0; k < 9; k++) cutLine(g, 2 + dens, q => { q.arc(0, -330, 60 + k * 26, .15 * Math.PI, .85 * Math.PI); });
      if (dens >= 2) lattice(g, -150, -460, 150, -200, 22, 7 - dens);
      if (dens >= 3) scalesOpen(g, -280, -200, 280, -60, 14 - dens);
      if (dens >= 4) { lattice(g, -60, -650, 60, -480, 16, 3); for (let k = 0; k < 40; k++) { const a = k / 40 * 6.283; cut(g, q => q.arc(Math.cos(a) * 120, -300 + Math.sin(a) * 120, 9, 0, 7)); } }
      if (dens >= 5) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,.82)'; g.fillRect(-400, -800, 800, 800); g.restore(); }
    });
    // folded hands (dhyana) and the line of the crossed legs, as carved strips
    ink(g, 3, q => { q.moveTo(-90, -200); q.quadraticCurveTo(0, -170, 90, -200); q.moveTo(-60, -210); q.quadraticCurveTo(0, -236, 60, -210); });
    ink(g, 3, q => { q.moveTo(-250, -120); q.quadraticCurveTo(0, -60, 250, -120); });
    ink(g, 2.6, body);
    // lotus seat
    const seat = q => smooth(q, [[-300, -70], [-220, -20], [0, 0], [220, -20], [300, -70], [200, -60], [0, -50], [-200, -60]]);
    fill(g, DYE.lotus, seat); within(g, seat, () => { for (let k = 0; k < 14; k++) cutLine(g, 2, q => { const x = -260 + k * 40; q.moveTo(x, -60); q.quadraticCurveTo(x + 10, -40, x + 20, -10); }); }); ink(g, 2, seat);
  }, { ss: 1.2, seed: 94 }));
}
// ---- the opening: a dark hide panel with a diya-shaped hole; rings (wider diya outlines) lift off one by one
export function darkRing(i) {
  return memo('ring' + i, () => piece([-1400, -1000, 1400, 1000], g => {
    const s0 = [1, 2.1, 3.6, 5.6, 8.4][i], s1 = [2.1, 3.6, 5.6, 8.4, 30][i];
    const shape = (q, s) => { diyaPath(q, -10 * s, 40 * s, s); q.moveTo(0, 0); flamePath(q, 46 * s, 30 * s, 1.6 * s); };
    // outer edge of this ring = the next wider diya outline (last ring = whole panel)
    g.beginPath(); if (i === 4) g.rect(-1400, -1000, 2800, 2000); else shape(g, s1); g.fillStyle = '#2a140a'; g.fill('nonzero');
    cut(g, q => shape(q, s0), 'nonzero');
    within(g, q => { if (i === 4) q.rect(-1400, -1000, 2800, 2000); else shape(q, s1); }, () => { const r = mulberry(40 + i); for (let k = 0; k < 40 + i * 30; k++) cloud(g, (r() - .5) * 260 * s1, (r() - .5) * 140 * s1, 6 + r() * 8 * Math.min(s1, 4), r() * 6, 1.6, r() > .5 ? 1 : -1); });
    ink(g, 3, q => shape(q, s0), DYE.turmeric);
  }, { ss: .8, seed: 95 + i }));
}
