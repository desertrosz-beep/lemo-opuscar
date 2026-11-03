// Jointed hide puppets for "Five Lamps": one rig, ten characters.
// Local units: px on the 1920×1080 cloth at camera 1×. Origin = waist, figure faces +x. Rotations: radians, + = clockwise.
// Arms: 0 = hanging, negative = raised forward. Open-cut faces = sympathetic; solid faces = antagonists.
import { piece, drawPiece, fill, cut, cutLine, ink, within, smooth, poly, scales, scalesOpen, lattice, coin, cloud, beads, beadLine, plum, rivet, DYE as D0 } from './carve.js';

export const DYE = { ...D0,
  saffron: '#e07a1a', turmeric: '#dca41e', crimson: '#9c1a22', pink: '#d4577e', rose: '#c23a5c', peacock: '#1d6f8a',
  emerald: '#1f7a4a', violet: '#5a2a78', plum: '#3d1a4e', blueSkin: '#4f86c6', blueWash: '#93bde6', deer: '#d99a22', lotus: '#e07a9a'
};
export const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
export const T = (x, y) => [1, 0, 0, 1, x, y];
export const R = a => { const c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, 0, 0]; };
export const S = (kx, ky = kx) => [kx, 0, 0, ky, 0, 0];
export const ap = (M, x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
const set = (g, M) => g.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);

const HK = 1.42;
export const J = { neck: [7, -122], shF: [14, -108], shB: [0, -110], hipF: [10, 42], hipB: [-8, 40], elbow: [0, 62], wrist: [0, 60] };
export const LEG = 232;           // hip → sole
const facePts = [[-6, 6], [8, 6], [9, -6], [13, -12], [18, -15], [19.5, -19], [21, -21.5], [19.5, -23.2], [22.5, -24.5], [21.5, -28], [24, -29.5], [27.5, -32.5], [22, -42], [18.5, -52], [17.5, -60], [17, -65], [-2, -64], [-6, -56], [-5, -40], [-9, -26], [-10, -10]];

// ---------------------------------------------------------------- head
function head(sp) {
  const k = sp.kind || 'man';
  return piece([-130 * HK, -260 * HK, 70 * HK, 30 * HK], g => {
    g.scale(HK, HK);
    // Ravana's nine extra heads are drawn by the rig, not here.
    if (k === 'monkey') { monkeyHead(g, sp); return; }
    if (k === 'back') { backHead(g, sp); return; }
    const face = q => poly(q, facePts);
    // hair
    const hairPts = sp.fem
      ? [[-2, -64], [-18, -66], [-30, -58], [-34, -40], [-30, -16], [-22, 4], [-8, 8], [-10, -10], [-9, -26], [-4.5, -33], [-5, -40], [-6, -56]]
      : [[-2, -64], [-18, -64], [-28, -58], [-31, -40], [-27, -18], [-17, 2], [-6, 7], [-10, -10], [-9, -26], [-4.5, -33], [-5, -40], [-6, -56]];
    fill(g, DYE.ink, q => poly(q, hairPts));
    within(g, q => poly(q, hairPts), () => { for (let i = 0; i < 6; i++) cutLine(g, .7, q => { q.moveTo(-6 - i * 3, -60); q.quadraticCurveTo(-24 - i, -40 + i * 2, -16 - i * 1.5, -2 + i); }); });
    if (sp.fem) { const bun = q => q.arc(-34, -30, 11, 0, 7); fill(g, DYE.ink, bun); cloud(g, -34, -30, 6, 1, 1, 1); beadLine(g, -40, -40, -28, -20, 1.2, 4); }
    if (sp.face === 'solid') {
      fill(g, sp.faceCol, face);
      // carved features: slit eye, heavy brow, fanged mouth, curled moustache
      cut(g, q => { q.moveTo(17, -46); q.quadraticCurveTo(9, -50, 2, -45); q.quadraticCurveTo(9, -43, 17, -46); });
      fill(g, DYE.ink, q => smooth(q, [[19, -54], [10, -58], [-2, -60], [-8, -64], [-6, -58], [2, -55], [10, -53], [18, -51]]));
      ink(g, 2.2, q => { q.moveTo(23, -27); q.quadraticCurveTo(10, -24, 2, -32); q.quadraticCurveTo(-4, -36, -2, -42); });
      cut(g, q => poly(q, [[20, -22], [17, -15], [15, -22]]));
      cutLine(g, 1.1, q => { q.moveTo(-2, -38); q.quadraticCurveTo(-6, -30, -2, -24); });
      cloud(g, 0, -20, 4, 0, 1, 1);
      ink(g, 2, face);
    } else {
      if (sp.wash) { g.save(); g.globalAlpha = sp.washA ?? .55; fill(g, sp.wash, face); g.restore(); }
      // hollow face: outline + features as thin hide strips
      ink(g, 2.3, q => poly(q, facePts.slice(1, 17), false));
      ink(g, 1.2, q => { q.moveTo(16.5, -15); q.quadraticCurveTo(6, -9, -6, -24); });
      ink(g, 1.5, q => { q.moveTo(15.5, -44.2); q.quadraticCurveTo(8, -48.2, -1, -46); q.quadraticCurveTo(-4, -46.5, -6.5, -49.5); });
      ink(g, 1.05, q => { q.moveTo(15, -43.6); q.quadraticCurveTo(8, -41.8, 1.5, -44.6); });
      g.beginPath(); g.arc(9.5, -45, 1.9, 0, 7); g.fillStyle = DYE.ink; g.fill();
      fill(g, DYE.ink, q => smooth(q, [[17.5, -51.4], [10, -54.2], [0, -56.4], [-8, -59.8], [-7, -57.2], [1, -53.8], [10, -51.6], [17, -49.8]]));
      ink(g, 1.1, q => { q.moveTo(23.8, -30.3); q.quadraticCurveTo(21, -31.5, 21.6, -28.4); });
      ink(g, 1.2, q => { q.moveTo(20.5, -23.4); q.lineTo(15.5, -22.6); });
      if (sp.tilak) { fill(g, DYE.red, q => poly(q, [[17.6, -58], [19, -66], [16.4, -66]])); }
      if (sp.fem) { g.beginPath(); g.arc(18.8, -55, 1.6, 0, 7); g.fillStyle = DYE.red; g.fill(); }
    }
    // ear + earring
    ink(g, 1.3, q => { q.moveTo(-3, -40); q.bezierCurveTo(-9, -41, -10, -30, -4.5, -30.5); });
    const er = q => { q.arc(-5, -24, 5.5, 0, 7); }; fill(g, DYE.turmeric, er); cut(g, q => q.arc(-5, -24, 3, 0, 7)); ink(g, 1, er);
    // headwear
    const hw = sp.hw || 'none';
    if (sp.peacock) peacock(g);
    if (hw === 'kirita') kirita(g, sp);
    if (hw === 'pagri') pagri(g, sp.hwCol || DYE.crimson);
    if (hw === 'mukut') mukut(g, sp.hwCol || DYE.turmeric);
    if (hw === 'horns') horns(g, sp);
    if (hw === 'tiara') tiara(g);
  }, { seed: sp.seed || 1 });
}
function kirita(g, sp) {
  const col = sp.hwCol || DYE.turmeric, H = sp.hwH || 120;
  const band = q => poly(q, [[22, -60], [22, -74], [-26, -72], [-28, -58]]);
  fill(g, DYE.crimson, band); within(g, band, () => { for (let x = -22; x < 20; x += 8) coin(g, x, -66, 3); }); ink(g, 1.5, band);
  // tall tapering crown with tiers
  const tw = q => smooth(q, [[18, -72], [14, -72 - H * .35], [8, -72 - H * .7], [2, -72 - H], [-6, -72 - H], [-12, -72 - H * .7], [-20, -72 - H * .35], [-24, -72]]);
  fill(g, col, tw);
  within(g, tw, () => {
    for (let k = 1; k < 6; k++) { const y = -72 - H * k / 6; cutLine(g, 1.6, q => { q.moveTo(-26, y); q.lineTo(22, y); }); for (let x = -18; x < 18; x += 7) cut(g, q => { q.moveTo(x, y - 3); q.lineTo(x + 3, y - H / 12); q.lineTo(x + 6, y - 3); q.closePath(); }); }
    lattice(g, -24, -72 - H, 20, -72 - H * .84, 7, 1.4);
  });
  ink(g, 1.7, tw);
  // finial + side wing ornament
  const fn = q => { q.moveTo(-2, -72 - H); q.quadraticCurveTo(-10, -80 - H, -2, -98 - H); q.quadraticCurveTo(6, -80 - H, -2, -72 - H); };
  fill(g, DYE.red, fn); ink(g, 1.2, fn);
  const wg = q => smooth(q, [[-22, -78], [-40, -96], [-50, -88], [-44, -74], [-32, -70]]);
  fill(g, col, wg); cloud(g, -40, -84, 5, 0, 1.2, -1); ink(g, 1.3, wg);
}
function pagri(g, col) {     // profile turban for the kings: wrapped folds, a jewel and a short plume at the front
  const tb = q => smooth(q, [[20, -58], [24, -76], [16, -94], [-4, -102], [-24, -96], [-36, -76], [-34, -54], [-10, -62]]);
  fill(g, col, tb);
  within(g, tb, () => { for (let k = 0; k < 4; k++) ink(g, 1.6, q => { q.moveTo(-36, -60 - k * 10); q.quadraticCurveTo(-4, -70 - k * 10 + (k % 2 ? 6 : -4), 24, -64 - k * 9); }, 'rgba(40,14,4,.55)'); });
  ink(g, 1.7, tb);
  fill(g, DYE.turmeric, q => q.arc(14, -78, 4.5, 0, 7)); ink(g, 1, q => q.arc(14, -78, 4.5, 0, 7));
  const pl = q => smooth(q, [[12, -82], [10, -100], [16, -114], [20, -100], [17, -84]]); fill(g, DYE.turmeric, pl); ink(g, 1, pl);
}
function mukut(g, col) {
  const c = q => poly(q, [[20, -60], [22, -78], [14, -72], [8, -90], [0, -74], [-8, -92], [-14, -74], [-22, -86], [-26, -62]]);
  fill(g, col, c); within(g, c, () => { beadLine(g, -22, -66, 18, -66, 1.4, 5); cut(g, q => q.arc(0, -80, 2.6, 0, 7)); }); ink(g, 1.5, c);
}
function tiara(g) {
  const c = q => smooth(q, [[18, -62], [12, -74], [0, -80], [-14, -76], [-26, -64], [-22, -60], [0, -68]]);
  fill(g, DYE.turmeric, c); within(g, c, () => beadLine(g, -18, -66, 12, -70, 1.3, 4.5)); ink(g, 1.3, c);
}
function horns(g, sp) {
  mukut(g, '#2a1430');
  for (const [x, d] of [[10, 1], [-18, -1]]) { const h = q => smooth(q, [[x - 5, -78], [x + d * 8, -104], [x + d * 22, -120], [x + d * 14, -100], [x + 5, -78]]); fill(g, '#d9c08a', h); ink(g, 1.3, h); }
}
function peacock(g) {
  // mor pankh tucked into the back of the crown: curved quill, carved barbs, the eye in concentric dye rings
  const Q = [[-16, -64], [-24, -100], [-34, -140], [-48, -176], [-58, -202]];
  const at = u => { const n = Q.length - 1, i = Math.min(n - 1, Math.floor(u * n)), f = u * n - i; return [Q[i][0] + (Q[i + 1][0] - Q[i][0]) * f, Q[i][1] + (Q[i + 1][1] - Q[i][1]) * f]; };
  const L = [], Rr = [];
  for (let k = 0; k <= 20; k++) { const u = .35 + .65 * k / 20, p = at(u), q = at(Math.min(1, u + .02)), dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, w = 3 + 7 * Math.sin(Math.PI * Math.min(1, (u - .35) / .6)); L.push([p[0] - dy / l * w, p[1] + dx / l * w]); Rr.push([p[0] + dy / l * w, p[1] - dx / l * w]); }
  const vane = q => { q.moveTo(...L[0]); L.forEach(p => q.lineTo(...p)); for (let i = Rr.length - 1; i >= 0; i--) q.lineTo(...Rr[i]); q.closePath(); };
  fill(g, DYE.emerald, vane);
  within(g, vane, () => { for (let k = 1; k < 20; k += 1) { const c = at(.35 + .65 * k / 20); cutLine(g, .7, q => { q.moveTo(c[0], c[1]); q.lineTo(L[k][0], L[k][1] - 3); q.moveTo(c[0], c[1]); q.lineTo(Rr[k][0], Rr[k][1] - 3); }); } });
  ink(g, 1, vane);
  ink(g, 1.6, q => { q.moveTo(...Q[0]); for (const p of Q.slice(1)) q.lineTo(...p); }, '#2a1a0c');           // quill
  const E = [-59, -206], ring = (r, col) => fill(g, col, q => q.ellipse(E[0], E[1], 11 * r, 15 * r, -.45, 0, 7));
  ring(1, DYE.turmeric); ring(.72, DYE.jade); ring(.42, '#1f2c6e');
  cut(g, q => q.ellipse(E[0] + 1, E[1] - 2, 1.6, 2.4, -.45, 0, 7));
  ink(g, 1.1, q => q.ellipse(E[0], E[1], 11, 15, -.45, 0, 7));
}
function monkeyHead(g, sp) {
  const hd = q => smooth(q, [[-26, 4], [-34, -24], [-30, -52], [-14, -66], [6, -66], [18, -56], [30, -44], [36, -30], [34, -18], [24, -10], [14, -4], [4, 6]]);
  fill(g, DYE.saffron, hd);
  within(g, hd, () => { for (let k = 0; k < 14; k++) cutLine(g, 1.4, q => { const a = -1.4 + k * .2; q.moveTo(-14 + Math.cos(a) * 14, -30 + Math.sin(a) * 14); q.lineTo(-14 + Math.cos(a) * 24, -30 + Math.sin(a) * 24); }); });
  // muzzle (open-cut: Hanuman is a hero)
  const mz = q => smooth(q, [[8, -42], [26, -40], [36, -30], [32, -16], [16, -10], [6, -20]]);
  cut(g, mz); ink(g, 2, mz);
  ink(g, 1.4, q => { q.moveTo(34, -24); q.quadraticCurveTo(24, -20, 14, -22); });
  const eye = q => q.ellipse(14, -46, 6, 4, 0, 0, 7); cut(g, eye); ink(g, 1.4, eye); g.beginPath(); g.arc(16, -46, 1.8, 0, 7); g.fillStyle = DYE.ink; g.fill();
  fill(g, DYE.ink, q => smooth(q, [[22, -52], [12, -56], [2, -54], [4, -51], [12, -52], [22, -49]]));
  const ear = q => q.ellipse(-12, -34, 8, 10, 0, 0, 7); fill(g, DYE.red, ear); cloud(g, -12, -34, 5, 0, 1, 1); ink(g, 1.2, ear);
  ink(g, 2.2, hd);
  mukut(g, DYE.turmeric);
}
function backHead(g, sp) {
  // back three-quarter view, facing away upstage: no face is ever shown. Solid hide: neck, dark hair at the nape, a beard edge at the
  // far jaw, a small ear, a full saffron pagri with carved folds and a gold jewel, and a kalgi plume rising from its front.
  const nk = q => poly(q, [[-9, 10], [-11, -14], [11, -14], [10, 10]]);
  fill(g, DYE.hide2, nk); ink(g, 1.4, nk);
  const beard = q => smooth(q, [[12, -30], [24, -30], [31, -16], [28, 0], [16, 12], [8, 2], [14, -12]]);
  fill(g, '#3a2212', beard); within(g, beard, () => { for (let k = 0; k < 4; k++) cutLine(g, .7, q => { q.moveTo(15 + k * 2.5, -22 + k); q.quadraticCurveTo(19 + k * 2, -8, 13 + k * 2, 4); }); }); ink(g, 1.3, beard);
  const hair = q => smooth(q, [[-22, -12], [-27, -32], [-22, -48], [0, -52], [16, -48], [20, -32], [14, -10], [4, 4], [-12, 4]]);
  fill(g, DYE.ink, hair); within(g, hair, () => { for (let k = 0; k < 3; k++) cutLine(g, .6, q => { q.moveTo(-14 + k * 9, -44); q.quadraticCurveTo(-16 + k * 9, -24, -10 + k * 8, -2); }); }); ink(g, 1.6, hair);
  const ear = q => q.ellipse(14, -28, 4.6, 7.5, .15, 0, 7); fill(g, DYE.hide2, ear); ink(g, 1.2, ear); ink(g, .8, q => { q.moveTo(13, -33); q.quadraticCurveTo(10, -28, 13, -23); });
  // the pagri
  const tb = q => smooth(q, [[-30, -32], [-37, -54], [-32, -78], [-14, -94], [10, -96], [28, -86], [37, -64], [32, -40], [12, -42], [-10, -38]]);
  fill(g, sp.turban || '#d9661a', tb);
  within(g, tb, () => {
    for (let k = 0; k < 6; k++) cutLine(g, 1.1, q => { q.moveTo(-34, -40 - k * 8); q.quadraticCurveTo(0, -46 - k * 9 + (k % 2 ? 7 : -5), 36, -60 - k * 6); });
    ink(g, 2.4, q => { q.moveTo(-31, -36); q.quadraticCurveTo(0, -46, 33, -44); }, '#9a3a0c');
  });
  ink(g, 2.2, tb);
  // kalgi: curved plume from a gold base at the front of the pagri
  const Q = [[27, -78], [30, -104], [24, -130], [10, -150], [-6, -158]];
  const at = u => { const n = Q.length - 1, i = Math.min(n - 1, Math.floor(u * n)), f = u * n - i; return [Q[i][0] + (Q[i + 1][0] - Q[i][0]) * f, Q[i][1] + (Q[i + 1][1] - Q[i][1]) * f]; };
  const L = [], Rr = [];
  for (let k = 0; k <= 18; k++) { const u = .12 + .88 * k / 18, p = at(u), q = at(Math.min(1, u + .02)), dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, w = 2 + 7 * Math.sin(Math.PI * Math.min(1, k / 18 * .9 + .1)); L.push([p[0] - dy / l * w, p[1] + dx / l * w]); Rr.push([p[0] + dy / l * w, p[1] - dx / l * w]); }
  const vane = q => { q.moveTo(...L[0]); L.forEach(p => q.lineTo(...p)); for (let i = Rr.length - 1; i >= 0; i--) q.lineTo(...Rr[i]); q.closePath(); };
  fill(g, DYE.turmeric, vane);
  within(g, vane, () => { for (let k = 1; k < 18; k++) { const c = at(.12 + .88 * k / 18); cutLine(g, .8, q => { q.moveTo(c[0], c[1]); q.lineTo(L[k][0], L[k][1] - 2); q.moveTo(c[0], c[1]); q.lineTo(Rr[k][0], Rr[k][1] - 2); }); } });
  ink(g, 1.2, vane); ink(g, 1.5, q => { q.moveTo(...Q[0]); for (const p of Q.slice(1)) q.lineTo(...p); }, '#3a1a08');
  const clasp = q => poly(q, [[22, -70], [33, -70], [32, -84], [23, -84]]); fill(g, DYE.gold, clasp); within(g, clasp, () => beadLine(g, 27.5, -82, 27.5, -72, 1.2, 3.5)); ink(g, 1.2, clasp);
  // gold jewel with a red stone
  const jw = q => q.arc(26, -62, 6.5, 0, 7); fill(g, DYE.turmeric, jw); fill(g, DYE.red, q => q.arc(26, -62, 3, 0, 7)); ink(g, 1.2, jw);
  beads(g, [[18, -56], [34, -56], [26, -52]], 1.4);
}
// ---------------------------------------------------------------- torso
function torso(sp) {
  const fem = sp.fem;
  const body = fem
    ? q => smooth(q, [[-22, 4], [-24, -40], [-28, -80], [-24, -104], [-12, -118], [0, -124], [14, -122], [24, -112], [34, -94], [36, -76], [30, -58], [26, -30], [24, 4]])
    : q => smooth(q, [[-26, 4], [-30, -40], [-32, -80], [-27, -104], [-14, -120], [0, -126], [14, -124], [27, -114], [39, -96], [45, -74], [41, -50], [33, -24], [28, 4]]);
  return piece([-42, -136, 50, 12], g => {
    fill(g, sp.top, body);
    within(g, body, () => {
      if (sp.topPat === 'fur') { for (let y = -110; y < 0; y += 9) for (let x = -30; x < 44; x += 10) cutLine(g, 1.6, q => { q.moveTo(x, y); q.lineTo(x + 3, y + 7); }); }
      else if (sp.topPat === 'scales') scalesOpen(g, -38, -92, 48, -18, 6.2);
      else if (sp.topPat === 'lattice') lattice(g, -34, -100, 46, -10, 10, 2);
      else if (sp.topPat === 'robe') { for (let x = -24; x < 40; x += 9) cutLine(g, 2.2, q => { q.moveTo(x, -96); q.lineTo(x + 2, 0); }); }
      else { // bare chest with a light openwork of the skin: crescent cuts for the ribs/breast, a navel
        for (let k = 0; k < 3; k++) cutLine(g, 1.5, q => { q.arc(12, -54 + k * 12, 16 - k * 2, .2 * Math.PI, .8 * Math.PI); });
        cut(g, q => q.arc(14, -16, 2.6, 0, 7));
      }
      // sacred thread / dupatta band across the chest
      if (sp.thread) ink(g, 3.2, q => { q.moveTo(-18, -112); q.quadraticCurveTo(10, -60, 34, -10); }, sp.thread);
    });
    ink(g, 2.3, body);
    // necklace collar (gold, carved)
    const cc = q => smooth(q, [[-24, -104], [-26, -94], [-14, -86], [0, -82], [16, -84], [30, -92], [34, -102], [22, -118], [2, -126], [-14, -120]]);
    fill(g, sp.collar || DYE.turmeric, cc);
    within(g, cc, () => { beadLine(g, -20, -98, 28, -96, 1.8, 6); cloud(g, 4, -106, 5, 1, 1.3, 1); cloud(g, 18, -104, 4, 2, 1.2, -1); });
    ink(g, 1.5, cc);
    // pendant
    const pd = q => { q.moveTo(8, -84); q.lineTo(14, -70); q.lineTo(4, -66); q.closePath(); }; fill(g, DYE.red, pd); ink(g, 1, pd);
    // waist sash
    const belt = q => poly(q, [[-26, -12], [30, -12], [28, 6], [-24, 6]]);
    fill(g, sp.sash || DYE.crimson, belt); within(g, belt, () => { for (let x = -20; x < 24; x += 9) coin(g, x, -3, 3.4); }); ink(g, 1.5, belt);
  }, { seed: (sp.seed || 1) + 10 });
}
// ---------------------------------------------------------------- lower garments
function dhoti(sp) {
  return piece([-50, -8, 64, 150], g => {
    const d = q => smooth(q, [[-30, -4], [30, -4], [42, 50], [46, 112], [30, 120], [12, 92], [0, 118], [-16, 122], [-38, 112], [-40, 50]]);
    fill(g, sp.low, d);
    within(g, d, () => {
      for (let x = -30; x < 44; x += 8) cutLine(g, 2, q => { q.moveTo(x, 8); q.quadraticCurveTo(x + 4, 60, x + 2, 116); });
      g.fillStyle = sp.border || DYE.crimson; g.beginPath(); d(g); g.lineWidth = 12; g.strokeStyle = sp.border || DYE.crimson; g.stroke();
      for (let x = -36; x < 46; x += 11) cut(g, q => q.arc(x, 112, 2.4, 0, 7));
    });
    // front pleat tab
    const tab = q => smooth(q, [[2, -2], [16, -2], [20, 70], [10, 100], [0, 70]]);
    fill(g, sp.border || DYE.crimson, tab); cloud(g, 10, 24, 5, 0, 1.3); coin(g, 10, 48, 4.5); ink(g, 1.4, tab);
    ink(g, 2, d);
  }, { seed: (sp.seed || 1) + 20 });
}
function lehenga(sp) {
  return piece([-70, -8, 84, 280], g => {
    const L = q => smooth(q, [[-26, -4], [28, -4], [44, 80], [62, 190], [74, 264], [40, 272], [0, 274], [-40, 272], [-62, 264], [-50, 190], [-38, 80]]);
    fill(g, sp.low, L);
    within(g, L, () => {
      for (let x = -60; x < 76; x += 11) cutLine(g, 2.2, q => { q.moveTo(x * .4, 10); q.lineTo(x, 240); });
      for (const y of [120, 196]) { g.fillStyle = sp.border || DYE.turmeric; g.fillRect(-80, y, 170, 14); for (let x = -70; x < 84; x += 12) cut(g, q => q.arc(x, y + 7, 3, 0, 7)); }
      g.fillStyle = sp.border || DYE.turmeric; g.fillRect(-80, 246, 170, 30);
      for (let x = -70; x < 84; x += 16) plum(g, x, 260, 4);
    });
    ink(g, 2.2, L);
    // toes peeking
    const ft = q => smooth(q, [[30, 270], [52, 270], [60, 278], [30, 280]]); fill(g, sp.skin || DYE.skin, ft); ink(g, 1.2, ft);
  }, { seed: (sp.seed || 1) + 21 });
}
function robeLong(sp) {   // the Guru's long robe (chola), seen from behind, to the ankles
  return piece([-70, -8, 80, 280], g => {
    const L = q => smooth(q, [[-28, -4], [28, -4], [40, 80], [54, 200], [62, 266], [0, 272], [-58, 266], [-50, 200], [-38, 80]]);
    fill(g, sp.low, L);
    within(g, L, () => { for (let x = -50; x < 60; x += 12) cutLine(g, 2.4, q => { q.moveTo(x * .5, 10); q.lineTo(x, 250); }); g.fillStyle = sp.border; g.fillRect(-80, 244, 170, 30); for (let x = -60; x < 70; x += 14) coin(g, x, 258, 5); });
    ink(g, 2.2, L);
  }, { seed: 33 });
}
function legPiece(sp) {
  return piece([-20, -12, 50, LEG + 10], g => {
    const sk = sp.legSkin || sp.skin || DYE.skin;
    const lg = q => smooth(q, [[-11, 60], [11, 60], [12, 120], [10, 190], [12, 206], [30, 212], [40, 220], [36, 228], [-12, 228], [-12, 190], [-13, 120]]);
    fill(g, sk, lg);
    if (sp.topPat === 'fur') within(g, lg, () => { for (let y = 70; y < 200; y += 10) cutLine(g, 1.4, q => { q.moveTo(-6, y); q.lineTo(-2, y + 7); q.moveTo(4, y + 4); q.lineTo(8, y + 10); }); });
    else within(g, lg, () => { cutLine(g, 1.2, q => { q.moveTo(8, 110); q.quadraticCurveTo(2, 140, 6, 176); }); });
    ink(g, 1.8, lg);
    const an = q => poly(q, [[-12, 196], [12, 196], [12, 204], [-12, 204]]); fill(g, DYE.turmeric, an); within(g, an, () => beadLine(g, -10, 200, 10, 200, 1.4, 4)); ink(g, 1, an);
  }, { seed: (sp.seed || 1) + 22 });
}
// ---------------------------------------------------------------- arms
function upperArm(sp) {
  return piece([-20, -16, 20, 74], g => {
    const sl = q => smooth(q, [[-11, -6], [11, -6], [10, 58], [-9, 58]]);
    fill(g, sp.arm || sp.skin, sl); fill(g, sp.arm || sp.skin, q => q.arc(0, 62, 9.5, 0, 7));
    within(g, sl, () => { if (sp.topPat === 'fur') for (let y = 0; y < 56; y += 9) cutLine(g, 1.3, q => { q.moveTo(-5, y); q.lineTo(-1, y + 6); }); else cutLine(g, 1.2, q => { q.moveTo(4, 8); q.quadraticCurveTo(-2, 30, 3, 50); }); });
    ink(g, 1.6, sl); ink(g, 1.4, q => q.arc(0, 62, 9.5, 0, 7));
    const ab = q => poly(q, [[-12, 14], [12, 14], [12, 24], [-12, 24]]); fill(g, DYE.turmeric, ab); within(g, ab, () => beadLine(g, -9, 19, 9, 19, 1.4, 4.5)); ink(g, 1.1, ab);
    const sh = q => q.arc(0, 0, 10, 0, 7); fill(g, sp.shoulder || sp.arm || sp.top, sh); cut(g, q => q.arc(0, 0, 3.5, 0, 7)); ink(g, 1.3, sh);
  }, { seed: (sp.seed || 1) + 23 });
}
function foreArm(sp, kind) {
  return piece([-18, -12, 22, 90], g => {
    const sk = sp.arm || sp.skin;
    const fa = q => smooth(q, [[-9, -2], [9, -2], [8, 50], [-7, 50]]);
    fill(g, sk, fa); fill(g, sk, q => q.arc(0, 0, 8.5, 0, 7)); ink(g, 1.5, fa);
    const bg = q => poly(q, [[-9, 40], [9, 40], [9, 50], [-9, 50]]); fill(g, DYE.turmeric, bg); within(g, bg, () => { cutLine(g, 1, q => { q.moveTo(-9, 45); q.lineTo(9, 45); }); }); ink(g, 1, bg);
    // hand
    const h = kind === 'open'
      ? q => smooth(q, [[-7, 50], [7, 50], [12, 60], [14, 74], [9, 84], [3, 76], [-3, 80], [-7, 68]])
      : q => smooth(q, [[-7, 50], [7, 50], [11, 58], [12, 68], [7, 74], [-3, 74], [-8, 64]]);
    fill(g, sk, h);
    if (kind === 'open') { for (const y of [62, 68, 74]) cutLine(g, .9, q => { q.moveTo(4, y); q.lineTo(11, y + 1); }); }
    else { cut(g, q => q.ellipse(2, 63, 2.6, 3.6, 0, 0, 7)); }
    ink(g, 1.4, h);
  }, { seed: (sp.seed || 1) + 24 });
}
// ---------------------------------------------------------------- props
export function propPiece(kind) {
  if (kind === 'bow') return piece([-14, -130, 40, 130], g => {
    const b = q => { q.moveTo(0, -124); q.quadraticCurveTo(46, -60, 22, 0); q.quadraticCurveTo(46, 60, 0, 124); q.lineTo(-4, 118); q.quadraticCurveTo(36, 60, 15, 0); q.quadraticCurveTo(36, -60, -4, -118); q.closePath(); };
    fill(g, DYE.brown, b); within(g, b, () => { for (const y of [-80, -40, 40, 80]) { g.fillStyle = DYE.turmeric; g.fillRect(-10, y - 3, 60, 6); } }); ink(g, 1.4, b);
    ink(g, 1.3, q => { q.moveTo(-2, -121); q.lineTo(-2, 121); }, '#3b2616');
  }, { seed: 41 });
  if (kind === 'gada') return piece([-26, -150, 26, 30], g => {
    ink(g, 6, q => { q.moveTo(0, 26); q.lineTo(0, -100); }, DYE.brown);
    const hd = q => q.ellipse(0, -118, 22, 30, 0, 0, 7); fill(g, DYE.turmeric, hd);
    within(g, hd, () => { for (const y of [-134, -118, -102]) cutLine(g, 2, q => { q.moveTo(-24, y); q.lineTo(24, y); }); for (let x = -14; x < 16; x += 7) cut(g, q => q.arc(x, -126, 2.2, 0, 7)); });
    ink(g, 1.6, hd); fill(g, DYE.red, q => poly(q, [[-4, -148], [4, -148], [0, -160]]));
  }, { seed: 42 });
  if (kind === 'lotus') return piece([-30, -70, 30, 10], g => {
    ink(g, 3, q => { q.moveTo(0, 8); q.quadraticCurveTo(-4, -20, 0, -36); }, DYE.emerald);
    for (const [a, c] of [[-.6, DYE.rose], [.6, DYE.rose], [-.25, DYE.lotus], [.25, DYE.lotus], [0, DYE.pink]]) { const p = q => { q.moveTo(0, -36); q.quadraticCurveTo(Math.sin(a) * 40 - 10, -54, Math.sin(a) * 26, -70); q.quadraticCurveTo(Math.sin(a) * 40 + 10, -54, 0, -36); }; fill(g, c, p); cutLine(g, 1, q => { q.moveTo(0, -40); q.lineTo(Math.sin(a) * 20, -62); }); ink(g, 1.1, p); }
  }, { seed: 43 });
  if (kind === 'chakra') return piece([-34, -34, 34, 34], g => {
    const o = q => { for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, b = a + Math.PI / 16; const r1 = 30, r0 = 22; q[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r0, Math.sin(a) * r0); q.lineTo(Math.cos(b) * r1, Math.sin(b) * r1); } q.closePath(); };
    fill(g, DYE.turmeric, o); cut(g, q => { q.arc(0, 0, 18, 0, 7); });
    fill(g, DYE.orange, q => q.arc(0, 0, 18, 0, 7)); within(g, q => q.arc(0, 0, 18, 0, 7), () => { for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + .2; cut(g, q => { q.moveTo(Math.cos(a) * 5, Math.sin(a) * 5); q.arc(0, 0, 15, a, a + .55); q.closePath(); }); } });
    cut(g, q => q.arc(0, 0, 2.6, 0, 7)); ink(g, 1.4, o); ink(g, 1.2, q => q.arc(0, 0, 18, 0, 7));
  }, { seed: 44 });
}

// ---------------------------------------------------------------- characters
const CAST = {
  ram: { skin: DYE.blueSkin, wash: DYE.blueWash, washA: .7, top: DYE.blueSkin, arm: DYE.blueSkin, legSkin: DYE.blueSkin, low: DYE.turmeric, border: DYE.crimson, hw: 'kirita', hwH: 128, tilak: 1, thread: DYE.white, sash: DYE.crimson, propF: null, propB: 'bow', seed: 1 },
  lakshman: { skin: DYE.hide, wash: DYE.hide, washA: .35, top: DYE.hide2, arm: DYE.hide, legSkin: DYE.hide, low: DYE.saffron, border: DYE.emerald, hw: 'kirita', hwH: 96, hwCol: DYE.gold, tilak: 1, thread: DYE.white, sash: DYE.emerald, propB: 'bow', seed: 2 },
  sita: { fem: 1, skin: DYE.skin, wash: DYE.skin, washA: .3, top: DYE.orange, arm: DYE.skin, low: DYE.saffron, border: DYE.turmeric, veil: DYE.red, hw: 'tiara', sash: DYE.red, collar: DYE.turmeric, seed: 3 },
  ravana: { skin: DYE.green, face: 'solid', faceCol: '#2c6b3a', top: DYE.crimson, topPat: 'scales', arm: '#2c6b3a', legSkin: '#2c6b3a', low: DYE.crim, border: DYE.ink, hw: 'kirita', hwH: 110, hwCol: DYE.gold, tenHeads: 1, sash: DYE.ink, collar: DYE.gold, seed: 4 },
  hanuman: { kind: 'monkey', skin: DYE.saffron, top: DYE.saffron, topPat: 'fur', arm: DYE.saffron, legSkin: DYE.saffron, low: DYE.red, border: DYE.turmeric, propF: 'gada', tail: 1, sash: DYE.turmeric, seed: 5 },
  lakshmi: { fem: 1, skin: DYE.skin, wash: DYE.skin, washA: .3, top: DYE.crimson, arm: DYE.skin, low: DYE.crimson, border: DYE.turmeric, veil: DYE.pink, hw: 'kirita', hwH: 70, propF: 'lotus', sash: DYE.turmeric, seed: 6 },
  krishna: { skin: DYE.blueSkin, wash: DYE.blueWash, washA: .7, top: DYE.blueSkin, arm: DYE.blueSkin, legSkin: DYE.blueSkin, low: DYE.turmeric, border: DYE.peacock, hw: 'kirita', hwH: 92, peacock: 1, tilak: 1, thread: DYE.turmeric, sash: DYE.peacock, propF: 'chakra', seed: 7 },
  satya: { fem: 1, skin: DYE.skin, wash: DYE.skin, washA: .3, top: DYE.emerald, arm: DYE.skin, low: DYE.jade, border: DYE.turmeric, veil: DYE.emerald, hw: 'tiara', propB: 'bow', sash: DYE.turmeric, seed: 8 },
  naraka: { face: 'solid', faceCol: DYE.violet, skin: DYE.violet, top: DYE.plum, topPat: 'scales', arm: DYE.violet, legSkin: DYE.violet, low: '#2a1430', border: DYE.crimson, hw: 'horns', propF: 'gada', sash: DYE.crimson, collar: DYE.gold, seed: 9 },
  guru: { kind: 'back', skin: DYE.hide2, top: '#e59a3a', topPat: 'robe', arm: '#e59a3a', low: '#e59a3a', border: DYE.crimson, turban: '#d9661a', robe: 1, sash: DYE.crimson, collar: DYE.crimson, seed: 10 },
  deva: { skin: DYE.hide, wash: DYE.hide, washA: .4, top: DYE.turmeric, arm: DYE.hide, legSkin: DYE.hide, low: DYE.saffron, border: DYE.crimson, hw: 'mukut', sash: DYE.crimson, seed: 11 },
  asura: { face: 'solid', faceCol: '#4a2a5e', skin: '#4a2a5e', top: '#3a1a2a', topPat: 'scales', arm: '#4a2a5e', legSkin: '#4a2a5e', low: '#2a1430', border: DYE.crimson, hw: 'horns', sash: DYE.crimson, seed: 12 },
  woman: { fem: 1, skin: DYE.skin, wash: DYE.skin, washA: .3, top: DYE.turmeric, arm: DYE.skin, low: DYE.rose, border: DYE.turmeric, veil: DYE.saffron, hw: 'none', sash: DYE.turmeric, seed: 13 },
};
export const KINGS = [DYE.crimson, DYE.peacock, DYE.emerald, DYE.saffron].map((c, i) => ({ skin: DYE.hide, wash: DYE.hide, washA: .35, top: c, topPat: 'lattice', arm: DYE.hide, legSkin: DYE.hide, low: [DYE.turmeric, DYE.saffron, DYE.turmeric, DYE.crimson][i], border: DYE.ink, hw: 'mukut', sash: DYE.ink, seed: 20 + i }));
for (let i = 0; i < KINGS.length; i++) CAST['king' + i] = KINGS[i];
// turbaned kings for the procession: turban colour, coat and dhoti vary
export const RAJAS = [[DYE.crimson, DYE.saffron, DYE.turmeric], [DYE.saffron, DYE.peacock, DYE.turmeric], [DYE.emerald, DYE.crimson, DYE.saffron], [DYE.peacock, DYE.turmeric, DYE.crimson], [DYE.rose, DYE.emerald, DYE.turmeric], [DYE.turmeric, DYE.crimson, DYE.jade]];
RAJAS.forEach(([tb, coat, low], i) => { CAST['raja' + i] = { skin: DYE.hide, wash: DYE.hide, washA: .35, top: coat, topPat: 'lattice', arm: DYE.hide, legSkin: DYE.hide, low, border: DYE.ink, hw: 'pagri', hwCol: tb, sash: DYE.ink, seed: 40 + i }; });
export { CAST };

function veilBack(sp) {   // drapes from the head down the back
  return piece([-80, -150, 30, 130], g => {
    const v = q => smooth(q, [[6, -144], [-30, -150], [-56, -120], [-64, -60], [-70, 20], [-74, 110], [-44, 120], [-30, 40], [-18, -40], [-6, -110]]);
    fill(g, sp.veil, v);
    within(g, v, () => { for (let k = 0; k < 18; k++) { const y = -120 + k * 13; plum(g, -40 + Math.sin(k) * 10, y, 3.2); } ink(g, 6, v, DYE.turmeric); });
    ink(g, 1.8, v);
  }, { seed: (sp.seed || 1) + 30 });
}
function veilTop(sp) {  // the edge of the veil over the crown of the head (rides with the head)
  return piece([-50 * HK, -100 * HK, 30 * HK, 10 * HK], g => {
    g.scale(HK, HK);
    const v = q => smooth(q, [[18, -66], [8, -78], [-10, -82], [-30, -74], [-42, -50], [-44, -20], [-36, -18], [-32, -46], [-20, -66], [0, -70]]);
    fill(g, sp.veil, v); within(g, v, () => { ink(g, 4, v, DYE.turmeric); beadLine(g, -36, -52, 4, -74, 1.4, 5); }); ink(g, 1.6, v);
  }, { seed: (sp.seed || 1) + 31 });
}
function tailPiece() {
  return piece([-140, -230, 10, 10], g => {
    const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([-10 - u * 110 - Math.sin(u * 3.4) * 14, -u * 200 + Math.sin(u * 5) * 10]); }
    const Lp = [], Rp = []; pts.forEach((p, i) => { const q = pts[Math.min(i + 1, 30)], o = pts[Math.max(i - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1, w = 7 - i * .12; Lp.push([p[0] - dy / l * w, p[1] + dx / l * w]); Rp.push([p[0] + dy / l * w, p[1] - dx / l * w]); });
    const tp = q => { q.moveTo(...Lp[0]); Lp.forEach(p => q.lineTo(...p)); for (let i = 30; i >= 0; i--) q.lineTo(...Rp[i]); q.closePath(); };
    fill(g, DYE.saffron, tp); within(g, tp, () => { for (let i = 2; i < 30; i += 2) cutLine(g, 1.2, q => { q.moveTo(...Lp[i]); q.lineTo((Lp[i][0] + Rp[i][0]) / 2, (Lp[i][1] + Rp[i][1]) / 2); }); }); ink(g, 1.4, tp);
    const tuft = q => q.arc(pts[30][0], pts[30][1] - 4, 10, 0, 7); fill(g, DYE.red, tuft); cloud(g, pts[30][0], pts[30][1] - 4, 6, 0, 1.1); ink(g, 1.2, tuft);
  }, { seed: 50 });
}
const PC = new Map();
export function parts(name) {
  if (PC.has(name)) return PC.get(name);
  const sp = typeof name === 'string' ? CAST[name] : name;
  const p = { sp, head: head(sp), torso: torso(sp), ua: upperArm(sp), faB: foreArm(sp, 'fist'), faF: foreArm(sp, sp.openHand ? 'open' : 'fist'), faO: foreArm(sp, 'open') };
  if (sp.fem) p.lower = lehenga(sp); else if (sp.robe) p.lower = robeLong(sp); else { p.lower = dhoti(sp); p.leg = legPiece(sp); }
  if (sp.veil) { p.veilB = veilBack(sp); p.veilT = veilTop(sp); }
  if (sp.tail) p.tail = tailPiece();
  if (sp.tenHeads) p.small = head({ ...sp, hw: 'mukut', seed: 60 });
  for (const k of ['propF', 'propB']) if (sp[k]) p[k] = propPiece(sp[k]);
  PC.set(name, p); return p;
}

// pose: {x,y,rot,head,f(±1 facing),s(scale), aF:[upper,fore], aB:[upper,fore], hF:'open'|'fist', legF, legB, low(hem sway), tail, prop rotation pF/pB}
export const REST = { x: 0, y: 0, rot: 0, head: 0, f: 1, s: 1, aF: [-.15, -.35], aB: [.12, -.2], legF: -.06, legB: .08, low: 0, tail: 0, pF: 0, pB: 0 };
export function drawFig(g, Cam, name, pose, opt = {}) {
  const P = parts(name), sp = P.sp, p = { ...REST, ...pose };
  const MW = mul(T(p.x, p.y), mul(S(p.f * p.s, p.s), R(p.rot)));
  const W = mul(Cam, MW);
  const k = Math.hypot(Cam[0], Cam[1]) * p.s;
  const dp = (M, pc) => { set(g, M); drawPiece(g, pc); };
  const Mhead = mul(W, mul(T(...J.neck), R(p.head)));
  const arm = (sh, a) => { const Mu = mul(W, mul(T(...J[sh]), R(a[0]))); const Mf = mul(Mu, mul(T(...J.elbow), R(a[1] - a[0]))); return [Mu, Mf, mul(Mf, T(0, 66))]; };
  const [MuB, MfB, MhB] = arm('shB', p.aB), [MuF, MfF, MhF] = arm('shF', p.aF);
  g.save(); g.globalCompositeOperation = 'multiply';
  if (opt.alpha != null) g.globalAlpha = opt.alpha;
  if (opt.blur) g.filter = `blur(${opt.blur}px)`;
  if (P.tail) dp(mul(W, mul(T(-26, 20), R(p.tail))), P.tail);
  if (P.veilB) dp(mul(W, R(p.head * .3)), P.veilB);
  if (P.small) {   // Ravana: nine heads fanned behind the main head
    // tiered fan: 4 heads behind at eye level, 3 above, 2 on top (back to front so the nearest overlaps)
    const fan = [[-150, -6], [-114, -2], [-78, 2], [-42, 4], [-128, -58], [-88, -54], [-48, -50], [-104, -108], [-64, -104]];
    for (const [x, y] of fan) dp(mul(Mhead, mul(T(x * .8, y), S(.62))), P.small);
  }
  if (P.propB && opt.propB !== false) dp(mul(MhB, mul(T(2, 6), R(p.pB))), P.propB);
  dp(MuB, P.ua); dp(MfB, P.faB);
  if (P.leg) { dp(mul(W, mul(T(...J.hipB), R(p.legB))), P.leg); dp(mul(W, mul(T(...J.hipF), R(p.legF))), P.leg); }
  dp(mul(W, R(p.low)), P.lower);
  dp(W, P.torso);
  dp(Mhead, P.head);
  if (P.veilT) dp(Mhead, P.veilT);
  dp(MuF, P.ua); dp(MfF, p.hF === 'open' ? P.faO : P.faF);
  if (P.propF && opt.propF !== false) dp(mul(MhF, mul(T(2, 4), R(p.pF))), P.propF);
  g.restore();
  if (opt.rivets !== false) {
    set(g, [1, 0, 0, 1, 0, 0]);
    const rv = (M, x, y) => { const q = ap(M, x, y); rivet(g, q[0], q[1], 3.2 * k); };
    rv(W, ...J.neck); rv(W, ...J.shB); rv(W, ...J.shF); rv(MuB, ...J.elbow); rv(MuF, ...J.elbow); if (P.leg) { rv(W, ...J.hipB); rv(W, ...J.hipF); }
  }
  return { rods: [ap(W, 4, -96), ap(MhF, 0, 2), ap(MhB, 0, 2)], hand: ap(MhF, 2, 4), handB: ap(MhB, 2, 6), MhF, MhB, W, Mhead };
}
// where a figure's front hand is (world coords), without drawing it
export function handAt(pose) {
  const p = { ...REST, ...pose }, MW = mul(T(p.x, p.y), mul(S(p.f * p.s, p.s), R(p.rot)));
  const Mu = mul(MW, mul(T(...J.shF), R(p.aF[0]))), Mf = mul(Mu, mul(T(...J.elbow), R(p.aF[1] - p.aF[0])));
  return ap(mul(Mf, T(0, 66)), 2, 4);
}
export const toWorld = (pose, x, y) => { const p = { ...REST, ...pose }; return ap(mul(T(p.x, p.y), mul(S(p.f * p.s, p.s), R(p.rot))), x, y); };
// Thin bamboo control rods, held off the cloth: soft, dark
export function drawRods(g, pts, ends, blur = 2.5, alpha = .55) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.filter = `blur(${blur}px)`; g.globalAlpha = alpha;
  pts.forEach((p, i) => { const e = ends[i]; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(e[0], e[1]); g.strokeStyle = '#2a1a10'; g.lineWidth = i === 0 ? 4 : 2.6; g.stroke(); });
  g.restore();
}
export function rodsFor(g, r, k, alpha = .5, lean = 1) {
  drawRods(g, r.rods, r.rods.map((q, j) => [q[0] - (120 - j * 50) * k * lean, q[1] + 900 * k]), 2.4 * k, alpha);
}
