// Head for an 80s character design: cranium sphere + egg-shaped jaw, three angles (front / q = 3/4 / side) × several expressions
// Local coordinates: cranium centre (0,0), radius 80; top of head -80, eye centre +22, nose base +54, mouth +74, chin +114. The face looks to screen right.
// Lines: skin = thin warm dark brown, hair = deep purple, lashes near-black, props near-black (the coloured lines, iro-sen, of 80s cels)
import { cel, path, poly, ribbon, flutter, line, TAU, rgba, mix, LWK } from './cel.js';

const LW = 1.5;                  // base line width (local units)
const LS = LW * .78, LH = LW * 1.05, LP = LW * 1.25;   // skin / hair / props

// ——— expression presets ———  brow: [inner-end dy, outer-end dy, arch] (positive = down)
export const EXPR = {
  neutral: { open: 1, lid: 0, brow: [0, 0, 2], mouth: 'closed' },
  determined: { open: .95, lid: .34, brow: [6, -3, 1], mouth: 'set', look: [.3, 0] },
  panting: { open: .55, lid: .5, brow: [-6, 5, 1.5], mouth: 'pant', look: [0, .25], sweat: true, blush: .45, shoulders: -10 },
  smile: { open: .72, lid: .1, brow: [-3, -1, 3], mouth: 'smile', smileEyes: true },
  smileopen: { open: .74, lid: .08, brow: [-4, -2, 3.5], mouth: 'smileopen', smileEyes: true },
  surprised: { open: 1.12, lid: -.25, brow: [-9, -7, 4.5], mouth: 'oh', iris: .78 },
  talk: { open: 1, lid: .1, brow: [0, 0, 2], mouth: 'talk' },
  closed: { open: 0, lid: 0, brow: [0, 0, 2], mouth: 'closed' },
  focus: { open: .8, lid: .45, brow: [7, -4, 0], mouth: 'set', look: [.4, 0] },
  grin: { open: .7, lid: .12, brow: [-4, -3, 4], mouth: 'smileopen', smileEyes: true },
  laugh: { open: 0, lid: 0, brow: [-5, -2, 4], mouth: 'smileopen', blush: .3 },
  smirk: { open: .7, lid: .35, brow: [-3, 3, 2], mouth: 'smile', look: [.2, .5] },
  stare: { open: .95, lid: .15, brow: [2, 0, 1.5], mouth: 'closed', look: [.2, -.4] },
  wide: { open: 1.15, lid: -.3, brow: [-9, -8, 5], mouth: 'closed', iris: .62 },
  calm: { open: .62, lid: .4, brow: [2, 1, 1], mouth: 'closed', look: [.3, 0] },
  breath: { open: .7, lid: .4, brow: [6, -2, 1], mouth: 'oh', look: [.4, 0] },
  hurt: { open: .9, lid: .2, brow: [-7, 6, 1], mouth: 'pant', look: [0, .4], sweat: true },
};

// ——— eyes ———
function eye(g, P, cx, cy, w, h, dir, fs, E, detail) {
  const open = Math.max(0, E.open ?? 1), lid = E.lid || 0, W2 = w / 2, lash = P.lash || P.hair.l;
  const X = u => cx + dir * u * W2;                    // u: -1 inner corner → +1 outer corner
  const inY = cy + h * .1, outY = cy - h * .08 - (E.smileEyes ? h * .06 : 0);
  const topY = cy - h * .5 * open + lid * h * .32;
  const botY = cy + h * .47 * Math.min(1, open + .25) - (E.smileEyes ? h * .3 : 0);
  if (open > .08) {
    const WP = path([[X(-1), inY, 1], [X(-.4), topY + h * .05], [X(.3), topY], [X(1), outY, 1], [X(.45), botY], [X(-.4), botY - h * .02]], true);
    g.save(); g.clip(WP);
    g.fillStyle = P.white_eye; g.fill(WP);
    g.fillStyle = mix(P.white_eye, P.skin.s, .55); g.fillRect(cx - w, topY - 6, w * 2, h * .22 + 6);   // upper-eyelid cast shadow
    const sc = E.iris || 1, iw = w * .25 * sc * (fs < 1 ? .92 : 1), ih = h * .46 * sc;
    const ix = cx + dir * W2 * .04 + (E.look?.[0] || 0) * w * .15, iy = cy + h * .08 + (E.look?.[1] || 0) * h * .14;
    const IR = new Path2D(); IR.ellipse(ix, iy, iw, ih, 0, 0, TAU);
    g.fillStyle = P.eye.f; g.fill(IR);
    g.save(); g.clip(IR);
    g.fillStyle = P.eye.s; g.fillRect(ix - iw, iy - ih, iw * 2, ih * .95);                 // dark upper part
    g.fillStyle = mix(P.eye.s, lash, .5); g.fillRect(ix - iw, iy - ih, iw * 2, ih * .38);     // darkest band at the top
    g.fillStyle = mix(P.eye.l, lash, .3); g.beginPath(); g.ellipse(ix, iy - ih * .02, iw * .46, ih * .52, 0, 0, TAU); g.fill();   // pupil
    g.fillStyle = P.eye.h; g.beginPath(); g.ellipse(ix, iy + ih * .9, iw * 1.05, ih * .52, 0, 0, TAU); g.fill();                    // bright crescent at the bottom
    g.fillStyle = mix(P.eye.h, '#ffffff', .45); g.beginPath(); g.ellipse(ix, iy + ih * 1.05, iw * .7, ih * .32, 0, 0, TAU); g.fill();
    if (E.reflect) { g.strokeStyle = rgba(E.reflect, .85); g.lineWidth = iw * .18; g.beginPath(); g.arc(ix, iy, ih * .72, .3, 1.3); g.stroke(); }
    g.restore();
    g.strokeStyle = mix(P.eye.l, lash, .5); g.lineWidth = LW * .75 * LWK.k; g.stroke(IR);
    g.fillStyle = '#ffffff';   // highlights: large ellipse top-left + small circle bottom-right
    g.beginPath(); g.ellipse(ix - dir * iw * .34, iy - ih * .34, iw * .42, ih * .27, -.5 * dir, 0, TAU); g.fill();
    g.beginPath(); g.arc(ix + dir * iw * .42, iy + ih * .34, iw * .2, 0, TAU); g.fill();
    g.restore();
    // lower lid: a short thin line on the outer side + one faint lower lash
    line(g, [[X(.95), outY + h * .12], [X(.5), botY + 1], [X(.05), botY + 1.5]], mix(P.skin.l, P.skin.f, .35), LS * .8);
  }
  const t = h * (E.kid ? .1 : E.male ? .15 : .19), fl = E.kid ? .9 : 2.1;
  if (open > .08) {   // thick upper lash line, thickened and flicked up at the outer corner
    cel(g, [[X(-1.03), inY + 1, 1], [X(-.4), topY + h * .05 - t * .6], [X(.3), topY - t * .75], [X(.95), outY - t], [X(1.25 - (E.kid ? .15 : 0)), outY - t * fl, 1],
      [X(1.03), outY + t * .5], [X(.3), topY + t * .45], [X(-.4), topY + h * .05 + t * .35], [X(-.98), inY + t * .6, 1]], { f: lash });
    if (!E.male) for (let k = 0; k < 3; k++) {   // 3 lashes flicking out at the outer corner
      const u = .55 + k * .2, bx = X(u), by = topY + (outY - topY) * ((u - .3) / .7) - t * .5;
      cel(g, [[bx - dir * 2, by, 1], [bx + dir * (4 + k * 3), by - h * (.16 + k * .05), 1], [bx + dir * 3, by + 1, 1]], { f: lash });
    }
    line(g, [[X(-.25), topY - h * .22], [X(.45), topY - h * .25], [X(1), outY - h * .3]], mix(P.skin.l, P.skin.f, .3), LS * .85);   // double eyelid crease
  } else {   // closed eye (the single drawing of a quick blink)
    cel(g, [[X(-1), inY, 1], [X(0), cy + h * .22], [X(1.05), outY + h * .04], [X(1.22), outY - t, 1], [X(1), outY + t * .8], [X(0), cy + h * .22 + t * .8], [X(-.98), inY + t * .5, 1]], { f: lash });
  }
}
function eyeSide(g, P, cx, cy, w, h, E) {   // full profile: wedge-shaped eye
  const open = Math.max(0, E.open ?? 1), lid = E.lid || 0, lash = P.lash || P.hair.l;
  const topY = cy - h * .5 * open + lid * h * .32, front = cx + w * .5, back = cx - w * .5;
  const botY = cy + h * .46 - (E.smileEyes ? h * .26 : 0);
  if (open > .08) {
    const WP = path([[back, cy - h * .12, 1], [cx - w * .1, topY], [front, cy + h * .06, 1], [cx, botY]], true);
    g.save(); g.clip(WP); g.fillStyle = P.white_eye; g.fill(WP);
    const ix = cx + w * .2, iy = cy + h * .1, iw = w * .24, ih = h * .46;
    g.fillStyle = P.eye.f; g.beginPath(); g.ellipse(ix, iy, iw, ih, 0, 0, TAU); g.fill();
    g.fillStyle = P.eye.s; g.fillRect(ix - iw, iy - ih, iw * 2, ih * .95);
    g.fillStyle = mix(P.eye.s, lash, .5); g.fillRect(ix - iw, iy - ih, iw * 2, ih * .38);
    g.fillStyle = P.eye.h; g.beginPath(); g.ellipse(ix, iy + ih * .9, iw, ih * .5, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ix - iw * .15, iy - ih * .32, iw * .45, ih * .24, 0, 0, TAU); g.fill();
    g.restore();
    const t = h * .17;
    cel(g, [[back - w * .35, cy - h * .3 - t, 1], [cx - w * .1, topY - t * .6], [front + w * .04, cy + h * .02, 1], [cx - w * .1, topY + t * .5], [back, cy - h * .06, 1]], { f: lash });
    cel(g, [[back - w * .1, cy - h * .2, 1], [back - w * .5, cy - h * .45, 1], [back - w * .05, cy - h * .12, 1]], { f: lash });
    line(g, [[cx - w * .15, botY], [front - w * .1, cy + h * .26]], mix(P.skin.l, P.skin.f, .3), LS * .8);
    line(g, [[back + w * .05, topY - h * .12], [cx + w * .2, topY - h * .2]], mix(P.skin.l, P.skin.f, .3), LS * .8);
  } else cel(g, [[back - w * .3, cy - h * .12, 1], [cx, cy + h * .2], [front, cy + h * .08, 1], [cx, cy + h * .28], [back, cy + h * .02, 1]], { f: lash });
}
function brow(g, P, ix, iy, ox, oy, B, bw = 1, col = null) {   // brow: inner end → outer end, B = [inner dy, outer dy, arch], bw = thickness
  const a = [ix, iy + B[0]], c = [ox, oy + B[1]], m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 - B[2]];
  col = col || P.brow || P.lash || P.hair.l;
  cel(g, [[a[0], a[1] - 1.4 * bw, 1], [m[0], m[1] - 1.6 * bw], [c[0], c[1] - .2 * bw, 1], [m[0], m[1] + 1.2 * bw], [a[0], a[1] + 1.4 * bw, 1]], { f: col, l: bw > 2 ? P.hair.l : null, lw: .8 });
}

// ——— mouth (lip shape + inside-of-mouth colour) ———
function mouth(g, P, cx, cy, w, type, fs = 1) {
  const L = cx - w / 2, R = cx + w / 2 * fs;
  const lc = P.skin.l, lip = rgba(P.mouth, .22);
  const lowerLip = (y, ww) => { line(g, [[cx - ww * .6, y], [cx + ww * .5, y]], mix(lc, P.skin.f, .5), LS * .75); };
  if (type === 'closed' || type === 'set') {
    const dn = type === 'set' ? 1.6 : 0;
    line(g, [[L, cy + dn], [cx - w * .12, cy - .6], [cx + w * .06, cy + .2], [R, cy + dn]], lc, LS * 1.05);
    lowerLip(cy + 5.5, w * .2);
  } else if (type === 'smile') {
    line(g, [[L - 1, cy - 3], [cx - w * .15, cy + 1.6], [cx + w * .1, cy + 1.6], [R + 1, cy - 3]], lc, LS * 1.05);
    lowerLip(cy + 6.5, w * .16);
  } else {
    let pts, teeth = 0, tongue = 0, bot;
    if (type === 'smileopen') { pts = [[L - 1, cy - 3, 1], [cx, cy - 2], [R + 1, cy - 3, 1], [cx + w * .2, cy + 6], [cx, cy + 10], [cx - w * .22, cy + 6]]; teeth = 1; tongue = 1; bot = cy + 10; }
    else if (type === 'pant') { pts = [[L + 1, cy + 1, 1], [cx, cy - 2], [R - 1, cy + 1, 1], [cx + w * .2, cy + 14], [cx, cy + 17], [cx - w * .22, cy + 14]]; teeth = 1; tongue = 1; bot = cy + 17; }
    else if (type === 'oh') { pts = [[cx - w * .24, cy + 3], [cx, cy - 4], [cx + w * .22, cy + 3], [cx + w * .16, cy + 14], [cx - w * .16, cy + 14]]; bot = cy + 14; }
    else { pts = [[L + 3, cy, 1], [cx, cy - 1], [R - 3, cy, 1], [cx + w * .08, cy + 7], [cx - w * .1, cy + 7]]; tongue = .8; bot = cy + 7; }   // talk
    const MP = path(pts, true);
    g.save(); g.clip(MP); g.fillStyle = '#5a1a2a'; g.fill(MP);
    if (tongue) { g.fillStyle = '#e0707a'; g.beginPath(); g.ellipse(cx, bot + 1, w * .28, 6, 0, 0, TAU); g.fill(); }
    if (teeth) { g.fillStyle = '#ffffff'; g.fillRect(cx - w, cy - 8, w * 2, 10.5); }
    g.restore();
    g.strokeStyle = lc; g.lineWidth = LS * 1.05 * LWK.k; g.lineJoin = 'round'; g.stroke(MP);
    lowerLip(bot + 4.5, w * .14);
  }
}

// hair lock: two root points → tip; bend curves it to one side
function lock(x0, y0, x1, y1, tx, ty, bend = 0) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = tx - mx, dy = ty - my, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return [[x0, y0], [x0 + dx * .55 + nx * bend, y0 + dy * .55 + ny * bend], [tx, ty, 1], [x1 + dx * .5 + nx * bend * .7, y1 + dy * .5 + ny * bend * .7], [x1, y1]];
}
// Angel ring (天使の輪, hair sheen): one continuous jagged highlight band following the cranium curve (smooth arc on top, zigzag below)
function halo(g, P, cx, cy, rx, ry, a0, a1, th, teeth, tilt = 0) {
  const up = [], dn = [];
  for (let i = 0; i <= teeth * 2; i++) {
    const u = i / (teeth * 2), a = a0 + (a1 - a0) * u;
    const env = Math.sin(u * Math.PI) * .7 + .3;
    up.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry + Math.sin(a) * tilt]);
    const depth = th * env * (i % 2 ? 1.9 : .55);
    dn.push([cx + Math.cos(a) * (rx - depth * .15), cy + Math.sin(a) * ry + depth + Math.sin(a) * tilt]);
  }
  g.fillStyle = mix(P.hair.h, '#ffffff', .3);
  g.beginPath(); up.forEach((p, i) => g[i ? 'lineTo' : 'moveTo'](p[0], p[1])); for (let i = dn.length - 1; i >= 0; i--) g.lineTo(dn[i][0], dn[i][1]); g.closePath(); g.fill();
}

// ——— outlines per angle ———
const VIEWS = {
  front: {
    face: [[-66, -40], [-67, 4], [-64, 36], [-57, 64], [-44, 88], [-24, 105], [0, 114], [24, 105], [44, 88], [57, 64], [64, 36], [67, 4], [66, -40], [36, -64], [-36, -64]],
    neck: [[-27, 76], [27, 76], [30, 138], [-30, 138]],
    chinShadow: [[-40, 74], [40, 74], [40, 92], [24, 105], [0, 115], [-24, 105], [-40, 92]],
    farShade: [[90, 26], [90, 120], [26, 108], [44, 92], [54, 70], [60, 46], [64, 26]],
    eyes: [{ x: -38, y: 22, w: 40, h: 36, dir: -1, fs: 1 }, { x: 38, y: 22, w: 40, h: 36, dir: 1, fs: 1 }],
    brows: [[-16, -6, -56, -4], [16, -6, 56, -4]],
    nose: P => g => { g.fillStyle = P.skin.s; g.beginPath(); g.moveTo(3, 40); g.lineTo(7, 53); g.lineTo(1, 55); g.closePath(); g.fill(); line(g, [[-3, 55], [3, 55.5]], P.skin.l, LS); },
    mouth: { x: 0, y: 74, w: 24, fs: 1 },
    blush: [[-42, 48, 13, 4.5], [42, 48, 13, 4.5]],
    cup: [-72, 26],
  },
  q: {
    face: [[-64, -44], [-67, -4], [-66, 30], [-60, 60], [-46, 86], [-24, 104], [4, 114], [24, 108], [38, 94], [46, 78], [48, 64], [53, 46], [55, 30], [50, 16], [53, 0], [54, -40], [18, -64], [-36, -64]],
    neck: [[-36, 66], [12, 90], [16, 138], [-40, 138]],
    chinShadow: [[-46, 64], [20, 64], [20, 96], [4, 115], [-24, 104], [-46, 86]],
    farShade: [[90, 30], [90, 120], [18, 112], [34, 98], [41, 82], [44, 68], [47, 54], [51, 42], [55, 30]],
    eyes: [{ x: -21, y: 22, w: 44, h: 38, dir: -1, fs: 1 }, { x: 35, y: 20, w: 26, h: 35, dir: 1, fs: .6 }],
    brows: [[0, -4, -42, -2], [24, -6, 48, -1]],
    nose: P => g => { g.fillStyle = P.skin.s; g.beginPath(); g.moveTo(42, 42); g.lineTo(45, 51); g.lineTo(39, 55); g.lineTo(39, 49); g.closePath(); g.fill(); line(g, [[38, 55.5], [44, 53]], P.skin.l, LS); },
    mouth: { x: 24, y: 75, w: 22, fs: .7 },
    blush: [[-30, 48, 14, 4.5], [44, 46, 6, 3.5]],
    cup: [-60, 26],
  },
  side: {
    face: [[60, -50], [72, -24], [75, -2], [70, 14], [75, 30], [83, 47, 1], [77, 52], [78, 59], [80, 64], [75, 69], [78, 74], [72, 84], [76, 98, 1], [62, 111], [30, 106], [4, 90], [-8, 60], [-10, 20], [18, -52]],
    neck: [[-12, 60], [16, 100], [12, 126], [-36, 126]],
    chinShadow: [[-20, 58], [50, 58], [62, 111], [30, 106], [4, 90]],
    farShade: [[-40, -60], [8, -60], [2, 0], [-4, 40], [0, 70], [-40, 90]],
    eyes: [{ x: 58, y: 22, w: 26, h: 36, side: true }],
    brows: [[52, -4, 72, -3]],
    nose: P => g => { line(g, [[72, 49], [76, 50]], P.skin.l, LS); },
    mouth: null,
    blush: [[58, 50, 9, 3.5]],
    cup: [-4, 26],
  },
};

// ——— hair sets per character ——— locks = [rootx0,rooty0,rootx1,rooty1,tipx,tipy,bend]
const HAIRS = {
  chhotu: {
    q: {
      back: [[-78, -40], [-96, 0], [-92, 44], [-70, 66], [-36, 50], [20, 10], [50, -20], [-10, -60]],
      cap: [[-90, 14], [-98, -34], [-80, -84], [-34, -110], [16, -108], [54, -86], [68, -50], [62, -12], [46, -28], [0, -48], [-56, -26]],
      locks: [[-50, -88, -14, -98, -36, -8, -2], [-14, -100, 18, -96, 4, 4, 3], [10, -96, 44, -84, 30, -10, 5], [32, -84, 62, -64, 52, 2, 6], [48, -70, 70, -44, 64, 10, 5], [-80, -70, -46, -90, -64, -6, -4]],
      spikes: [[-74, -86, -44, -104, -112, -128, -6], [-36, -106, -4, -112, -34, -158, 6], [0, -110, 32, -100, 40, -146, 8], [-92, -52, -84, -84, -138, -76, -4], [-96, -8, -92, -42, -132, -12, 4], [-88, 34, -96, 2, -120, 52, 4], [26, -98, 50, -84, 78, -112, 6]],
      strays: [[-6, -96, -20, 8, 5], [22, -94, 38, 4, -4]],
      side: [[52, -40, 62, -26, 60, 36, 6]],
      halo: [-12, -14, 74, 62, Math.PI * 1.12, Math.PI * 1.85, 8, 8],
      ear: [[-44, 8], [-30, 4], [-24, 26], [-30, 52], [-44, 50], [-52, 30]], fy: 60,
    },
    side: {
      back: [[-20, -60], [-62, -40], [-66, 10], [-52, 46], [-20, 56], [-12, 20], [0, -40]],
      cap: [[-66, 22], [-76, -30], [-60, -80], [-18, -104], [32, -98], [66, -74], [78, -44], [64, -38], [30, -56], [-4, -40], [-14, 0], [-40, 30]],
      locks: [[10, -98, 40, -90, 62, -6, 4], [30, -92, 58, -78, 80, -2, 6], [44, -82, 76, -62, 88, -4, 8], [54, -68, 80, -48, 84, 8, 6]],
      spikes: [[-40, -92, -10, -104, -60, -142, -6], [-6, -104, 24, -100, 4, -150, 6], [-64, -60, -56, -86, -110, -86, -4], [-70, -16, -66, -46, -114, -26, 4], [-60, 24, -68, -6, -96, 40, 4], [26, -98, 56, -84, 70, -126, 6]],
      strays: [[40, -88, 70, 8, 6]],
      side: [[4, -60, 24, -50, 20, 34, 8]],
      halo: [0, -12, 68, 60, Math.PI * 1.1, Math.PI * 1.82, 8, 8],
      ear: [[-6, 12], [10, 10], [16, 30], [10, 54], [-4, 52], [-12, 32]], fy: 60,
    },
    front: {
      back: [[-84, -20], [-96, 30], [-80, 64], [-40, 60], [40, 60], [80, 64], [96, 30], [84, -20], [0, -60]],
      cap: [[-86, 8], [-94, -40], [-70, -88], [-26, -108], [26, -108], [70, -88], [94, -40], [86, 8], [66, -26], [0, -50], [-66, -26]],
      locks: [[-56, -82, -22, -92, -40, -8, -2], [-22, -96, 10, -96, -8, 6, 2], [6, -96, 40, -88, 22, -6, 4], [30, -86, 66, -70, 52, -4, 4], [-86, -54, -54, -74, -76, 8, -5], [56, -70, 88, -52, 78, 8, 5]],
      spikes: [[-70, -86, -40, -102, -110, -124, -6], [-26, -106, 6, -110, -12, -160, 6], [10, -108, 44, -98, 70, -140, 8], [-92, -40, -86, -74, -132, -60, -4], [92, -40, 86, -74, 132, -64, 4], [-94, 10, -96, -20, -128, 20, 4], [94, 10, 96, -20, 128, 22, -4]],
      strays: [[-4, -92, -14, 10, 5]],
      side: [[-80, -40, -62, -54, -74, 44, -6], [80, -40, 62, -54, 74, 44, 6]],
      halo: [0, -12, 74, 60, Math.PI * 1.1, Math.PI * 1.9, 8, 9],
      ear: null, fy: 60,
    },
  },
  coach: {
    q: {
      back: [[-74, -40], [-92, 0], [-88, 40], [-66, 58], [-40, 40], [-36, -20]],
      cap: [[-86, 16], [-94, -32], [-80, -76], [-42, -96], [6, -98], [40, -84], [52, -66], [26, -74], [-14, -70], [-48, -56], [-62, -20]],
      locks: [[-84, -40, -60, -60, -80, 14, -4], [-90, 0, -80, -30, -86, 40, -3], [-60, -78, -24, -90, -52, -56, -4]],
      spikes: [[-88, -60, -78, -80, -104, -66, -3], [-92, -20, -88, -40, -106, -20, 3]],
      strays: [], side: [[44, -54, 50, -44, 50, 6, 4]],
      halo: [-16, -20, 64, 62, Math.PI * 1.15, Math.PI * 1.7, 7, 6],
      ear: [[-44, 4], [-28, 0], [-20, 26], [-28, 56], [-44, 54], [-54, 30]], fy: 66,
      stache: [[-20, 70, 1], [-6, 58], [16, 52], [36, 54], [50, 58], [60, 70], [62, 90, 1], [48, 80], [30, 74], [12, 76], [-4, 80], [-16, 88, 1]],
    },
    side: {
      back: [[-20, -60], [-60, -40], [-64, 6], [-50, 36], [-22, 44], [-14, 10], [0, -40]],
      cap: [[-64, 20], [-74, -30], [-58, -78], [-18, -98], [26, -94], [48, -80], [30, -74], [0, -66], [-10, -30], [-30, 6]],
      locks: [[-60, -30, -50, -60, -70, 20, -4]], spikes: [], strays: [], side: [[2, -50, 20, -46, 16, 14, 6]],
      halo: [-6, -16, 60, 60, Math.PI * 1.12, Math.PI * 1.6, 7, 6],
      ear: [[-6, 12], [10, 10], [16, 30], [10, 56], [-4, 54], [-12, 32]], fy: 66,
      stache: [[62, 58], [80, 58, 1], [82, 66], [76, 82, 1], [66, 74], [56, 70]],
    },
    front: {
      back: [[-84, -20], [-92, 30], [-72, 54], [72, 54], [92, 30], [84, -20], [0, -60]],
      cap: [[-86, 10], [-92, -36], [-70, -80], [-26, -98], [26, -98], [70, -80], [92, -36], [86, 10], [70, -40], [40, -66], [0, -72], [-40, -66], [-70, -40]],
      locks: [[-86, -20, -72, -50, -90, 30, -4], [86, -20, 72, -50, 90, 30, 4]], spikes: [], strays: [], side: [],
      halo: [0, -20, 66, 60, Math.PI * 1.15, Math.PI * 1.85, 8, 7],
      ear: null, fy: 66,
      stache: [[-36, 64, 1], [-14, 56], [0, 59], [14, 56], [36, 64, 1], [44, 90, 1], [28, 76], [0, 74], [-28, 76], [-44, 90, 1]],
    },
  },
  kidA: null, kidB: null,
};
// rich kids: neat side-part / puffy hair, same construction
for (const v of Object.values(HAIRS.coach)) { const sc = (p) => [p[0] * .9, -10 + (p[1] + 10) * .9, p[2]]; v.cap = v.cap.map(sc); v.back = v.back.map(sc); }
HAIRS.kidA = { q: { ...HAIRS.chhotu.q, spikes: [[-36, -106, 10, -110, 60, -120, 10], [10, -104, 50, -90, 86, -96, 8]], locks: HAIRS.chhotu.q.locks.slice(0, 3).map(l => [l[0], l[1], l[2], l[3], l[4] + 18, l[5] - 30, 8]) } };
HAIRS.kidB = { q: { ...HAIRS.chhotu.q, cap: [[-94, 20], [-106, -40], [-86, -100], [-34, -128], [22, -124], [64, -96], [74, -52], [64, -14], [46, -30], [0, -50], [-56, -26]], spikes: [], locks: HAIRS.chhotu.q.locks.slice(0, 4) } };

// child proportions: lower face shortened and rounded, eyes a little larger
const CV = {};
function childView(view) {
  if (CV[view]) return CV[view];
  const V = VIEWS[view], sq = ([x, y, s]) => { const yy = y > 20 ? 20 + (y - 20) * .8 : y, xx = y > 30 ? x * (1 + .06 * Math.min(1, (y - 30) / 60)) : x * 1.03; return s ? [xx, yy, s] : [xx, yy]; };
  const out = { ...V, face: V.face.map(sq), chinShadow: V.chinShadow.map(sq), farShade: V.farShade.map(sq), neck: V.neck.map(([x, y]) => [x * .82, y > 80 ? y : sq([x, y])[1]]),
    eyes: V.eyes.map(e => ({ ...e, w: e.w * 1.08, h: e.h * 1.1, y: e.y + 2 })), mouth: V.mouth ? { ...V.mouth, y: 20 + (V.mouth.y - 20) * .8 - 2, w: V.mouth.w * .9 } : null,
    blush: V.blush.map(([x, y, rx, ry]) => [x, y - 6, rx, ry]),
    nose: P => g => { g.save(); g.translate(0, 20); g.scale(1, .8); g.translate(0, -20); V.nose(P)(g); g.restore(); } };
  return (CV[view] = out);
}
// head(g, P, o): o.who = 'chhotu' | 'coach' | 'kidA' | 'kidB'; o.view = 'q' | 'side' | 'front'; o.expr; o.light = [lx,ly]
export function head(g, P, o = {}) {
  const view = o.view || 'q', who = o.who || 'chhotu', kid = who !== 'coach';
  const V = kid ? childView(view) : VIEWS[view];
  const Hh = (HAIRS[who][view] || HAIRS[who].q);
  const E = { ...EXPR[o.expr || 'neutral'], ...(o.E || {}), male: true, kid };
  if (o.look) E.look = o.look; if (o.open != null) E.open = o.open; if (o.mouth) E.mouth = o.mouth; if (o.lid != null) E.lid = o.lid;
  if (who === 'coach') { E.open = (E.open ?? 1) * .82; E.iris = (E.iris || 1) * .9; }
  const ph = o.ph || 0, wind = o.wind ?? .3, rim = o.rim || P.hairRim;
  const hairSt = { f: P.hair.f, s: P.hair.s, h: P.hair.h, l: P.hair.l, lw: LH, rim };
  const lx = o.light?.[0] ?? -1, ly = o.light?.[1] ?? -.8;
  const SO = k => [lx * k, ly * k];
  const lf = Math.sin(ph * TAU) * 2.5 * wind;
  cel(g, Hh.back, { ...hairSt, f: P.hair.s, so: SO(10), s: mix(P.hair.s, '#000000', .25) });
  if (o.neck !== false) cel(g, poly(V.neck), { f: P.skin.f, s: P.skin.s, l: P.skin.l, lw: LS, sh: [V.chinShadow] });
  // spikes behind the head (messy hair)
  for (const L of Hh.spikes) { const [x0, y0, x1, y1, tx0, ty0, b] = L, mx = (x0 + x1) / 2, my = (y0 + y1) / 2, tx = mx + (tx0 - mx) * .6, ty = my + (ty0 - my) * .6; cel(g, lock(x0, y0, x1, y1, tx + lf * 2, ty + lf, b), { ...hairSt, so: SO(7) }); }
  if (Hh.ear) { const EA = Hh.ear.map(([x, y]) => [x - (view === 'q' ? 26 : 0), y]); cel(g, EA, { f: P.skin.f, s: P.skin.s, so: [8, 0], l: P.skin.l, lw: LS, clipFn: gg => line(gg, [[EA[1][0] - 2, EA[1][1] + 12], [EA[2][0] - 6, EA[2][1] + 4], [EA[3][0] - 2, EA[3][1] - 10]], P.skin.l, LS * .8) }); }
  cel(g, V.face, { f: P.skin.f, s: P.skin.s, l: P.skin.l, lw: LS, h: P.skin.h, so: SO(12), sh: o.light ? [] : [V.farShade],
    rim: o.skinRim ? { c: o.skinRim, d: [-lx * 3, -ly * 2.5] } : null,
    clipFn: gg => {
      gg.fillStyle = mix(P.skin.f, P.skin.s, .7);
      for (const L of Hh.locks) { const [x0, y0, x1, y1, tx, ty, b] = L; gg.fill(path(lock(x0 - 4, y0 + 8, x1 + 6, y1 + 8, tx + 3, ty + 9, b))); }
      gg.fillRect(-120, -140, 240, 140 - Hh.fy);
      if (who === 'coach') {   // age: cheek fold + eye bags + stubble shadow
        const fx = view === 'side' ? 1 : 0;
        if (view !== 'side') { line(gg, [[view === 'q' ? 30 : -30, 46], [view === 'q' ? 22 : -36, 70], [view === 'q' ? 18 : -34, 88]], mix(P.skin.l, P.skin.s, .4), LS * .9); if (view === 'front') line(gg, [[30, 46], [36, 70], [34, 88]], mix(P.skin.l, P.skin.s, .4), LS * .9); }
        gg.fillStyle = rgba(P.stubble || '#7a6a70', .13); gg.beginPath(); gg.ellipse(view === 'side' ? 60 : view === 'q' ? 20 : 0, 96, 48, 26, 0, 0, TAU); gg.fill();
      }
    } });
  for (const [x, y, rx, ry] of V.blush) { g.fillStyle = rgba(P.blush, (o.blush ?? E.blush ?? .12)); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); }
  V.nose(P)(g);
  if (V.mouth) mouth(g, P, V.mouth.x, V.mouth.y, V.mouth.w, E.mouth, V.mouth.fs);
  else sideMouth(g, P, E.mouth);
  for (const ey of V.eyes) { if (ey.side) eyeSide(g, P, ey.x, ey.y, ey.w, ey.h, E); else eye(g, P, ey.x, ey.y, ey.w, ey.h, ey.dir, ey.fs, E, o.detail); }
  if (who === 'coach') for (const ey of V.eyes) if (!ey.side) line(g, [[ey.x - ey.w * .4, ey.y + ey.h * .62], [ey.x, ey.y + ey.h * .72], [ey.x + ey.w * .4 * (ey.dir || 1), ey.y + ey.h * .6]], mix(P.skin.l, P.skin.s, .5), LS * .7);
  if (Hh.stache) cel(g, Hh.stache, { f: P.hair.f, s: P.hair.s, so: [0, 5], h: P.hair.h, l: P.hair.l, lw: LH });
  cel(g, Hh.cap, { ...hairSt, so: SO(10) });
  for (const L of Hh.side) { const [x0, y0, x1, y1, tx, ty, b] = L; cel(g, lock(x0, y0, x1, y1, tx - 6 * wind, ty, b), { ...hairSt, so: SO(7) }); }
  g.save(); g.fillStyle = P.hair.s; for (const L of Hh.locks) { const [x0, y0, x1, y1, tx, ty, b] = L; g.fill(path(lock(x0 - 10, y0, x1 + 10, y1, tx, ty + 3 + lf, b))); } g.restore();
  const lockSt = { ...hairSt, l: mix(P.hair.l, P.hair.s, .45), lw: LH * .6 };
  for (const L of Hh.locks) { const [x0, y0, x1, y1, tx, ty, b] = L; cel(g, lock(x0, y0, x1, y1, tx, ty + lf, b), { ...lockSt, so: SO(6) }); }
  for (const [x0, y0, tx, ty, b] of Hh.strays) cel(g, lock(x0 - 2, y0, x0 + 2, y0, tx, ty + lf, b), { f: P.hair.f, l: mix(P.hair.l, P.hair.s, .3), lw: LH * .6 });
  const hz = Hh.halo;
  g.save(); const HC = new Path2D(); HC.addPath(path(Hh.cap)); for (const L of Hh.locks) { const [x0, y0, x1, y1, tx, ty, b] = L; HC.addPath(path(lock(x0, y0, x1, y1, tx, ty + lf, b))); }
  g.clip(HC); halo(g, P, hz[0], hz[1], hz[2], hz[3], hz[4], hz[5], hz[6], hz[7]); g.restore();
  const bw = who === 'coach' ? 3.2 : 1.6;
  for (const b of V.brows) brow(g, P, b[0], b[1], b[2], b[3], E.brow || [0, 0, 2], bw, who === 'coach' ? P.hair.f : null);
  if (E.sweat) { const sx = view === 'side' ? 40 : view === 'q' ? -58 : -62; cel(g, [[sx, -16, 1], [sx + 7, 0], [sx, 6], [sx - 7, 0]], { f: '#e8f8ff', l: '#4a6a98', lw: LS, h: '#ffffff', hi: [[[sx - 3, -2], [sx - 1, -6], [sx - 4, 2]]] }); }
}
function sideMouth(g, P, type) {
  const lc = P.skin.l;
  if (type === 'closed' || type === 'set') { line(g, [[69, 69], [77, 69]], lc, LS * 1.05); }
  else if (type === 'smile') line(g, [[67, 66], [71, 70], [77, 69]], lc, LS * 1.05);
  else { const MP = path([[69, 67, 1], [78, 66], [76, type === 'pant' ? 79 : 75], [70, 74]], true); g.fillStyle = '#5a1a2a'; g.fill(MP); g.strokeStyle = lc; g.lineWidth = LS * LWK.k; g.stroke(MP); }
}
