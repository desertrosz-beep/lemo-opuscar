// Painted background plates (drawn once at load: colour + emissive pair), sunrise colour model
import { canvas, rng, rgba, mix, airbrush, vgrad, TAU, poly, path, cel, line } from './cel.js';
import { SKY, WALLS } from './pal.js';

// —— sky ——  sun at (sx, sy); horizon at hy
export function skyPlate(w, h, hy, sx, sy, seed = 1, o = {}) {
  const [c, g] = canvas(w, h), [ec, e] = canvas(w, h), R = rng(seed);
  e.fillStyle = '#000'; e.fillRect(0, 0, w, h);
  vgrad(g, 0, 0, w, h, [[0, SKY.top], [Math.max(.01, (hy - 1500) / h), SKY.top], [(hy - 900) / h, SKY.upper], [(hy - 420) / h, SKY.rose], [(hy - 160) / h, SKY.saffron], [(hy - 30) / h, SKY.gold], [Math.min(.999, hy / h), SKY.horizon], [1, SKY.haze]].filter(s => s[0] >= 0 && s[0] <= 1).sort((a, b) => a[0] - b[0]));
  // airbrushed sun haze
  airbrush(g, sx, sy, w * .9, 520, '#ffd9a0', .5, .9);
  airbrush(g, sx, sy, 380, 260, '#fff2c8', .7, .8);
  // clouds: long bands, violet tops, gold lit undersides
  for (let i = 0; i < (o.clouds ?? 9); i++) {
    const y = hy - 140 - R() * (o.cloudH ?? 900), x = R() * w, L = 300 + R() * 700, th = 26 + R() * 50;
    const near = (hy - y) / 900;
    airbrush(g, x, y, L, th, mix(SKY.violet, SKY.rose, near * .3 + .2), .55, .7);
    airbrush(g, x + 20, y + th * .45, L * .85, th * .45, mix(SKY.gold, '#ffffff', .2), .75 * (1 - near * .5), .5);
    e.globalAlpha = .25; airbrush(e, x + 20, y + th * .45, L * .7, th * .35, '#ff9a40', .6, .6); e.globalAlpha = 1;
  }
  // sun disc
  const sunR = o.sunR ?? 120;
  g.fillStyle = '#fffbea'; g.beginPath(); g.arc(sx, sy, sunR, 0, TAU); g.fill();
  const gr = e.createRadialGradient(sx, sy, 0, sx, sy, sunR * 6);
  gr.addColorStop(0, '#fff6dc'); gr.addColorStop(.17, '#ffd890'); gr.addColorStop(.35, 'rgba(255,150,60,.45)'); gr.addColorStop(1, 'rgba(255,90,40,0)');
  e.fillStyle = gr; e.beginPath(); e.arc(sx, sy, sunR * 6, 0, TAU); e.fill();
  return { c, e: ec };
}

// —— a basti house (box, flat roof, lit east face) —— returns nothing; draws on g/e
export function house(g, e, x, y, w, h, R, o = {}) {
  const col = o.col || WALLS[Math.floor(R() * WALLS.length)];
  const sunSide = o.sunSide ?? 1;   // sun from the right
  const side = 34 + R() * 30;
  // long cast shadow to the left
  if (o.shadow !== false) { g.fillStyle = rgba('#3a1e4e', .28); g.fill(poly([[x, y + h], [x - h * .9, y + h + 10], [x - h * .9, y + h - 60], [x, y + 20]])); }
  // front face (gold-washed), side face (bright lit or violet)
  const front = mix(col, '#ffcf8a', .28), shade = mix(col, '#4a2a6a', .5), lit = mix(col, '#fff0c0', .45);
  g.fillStyle = front; g.fillRect(x, y, w, h);
  g.fillStyle = sunSide > 0 ? lit : shade; g.fill(poly([[x + w, y], [x + w + side * .5, y - side * .35], [x + w + side * .5, y + h - side * .35], [x + w, y + h]]));
  // weathering
  for (let k = 0; k < 4; k++) airbrush(g, x + R() * w, y + R() * h, 20 + R() * 50, 30 + R() * 60, mix(col, '#5a3a4a', .4), .18, 1);
  // roof parapet + water tank + rebar
  g.fillStyle = mix(front, '#ffffff', .15); g.fillRect(x - 4, y - 10, w + 8, 12);
  if (R() < .6) { const tx = x + 12 + R() * (w - 60), tw = 34 + R() * 16; cel(g, poly([[tx, y - 10], [tx + tw, y - 10], [tx + tw, y - 10 - tw * 1.1], [tx, y - 10 - tw * 1.1]]), { f: '#2e2838', s: '#1a1622', sh: [[[tx, y - 10], [tx + tw * .35, y - 10], [tx + tw * .35, y - 10 - tw * 1.1], [tx, y - 10 - tw * 1.1]]], l: '#100c16', lw: 1.4 }); g.fillStyle = '#ffcf8a'; g.fillRect(tx + tw - 5, y - 10 - tw * 1.1, 4, tw * 1.1); }
  if (R() < .5) { g.strokeStyle = '#4a3a44'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { const rx = x + w - 10 - k * 9; g.beginPath(); g.moveTo(rx, y - 8); g.lineTo(rx + 2, y - 30 - R() * 14); g.stroke(); } }
  // windows / door
  const rows = Math.max(1, Math.floor(h / 90)), cols = Math.max(1, Math.floor(w / 70));
  for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) {
    if (R() < .25) continue;
    const wx = x + 14 + cc * (w - 28) / cols + 6, wy = y + 22 + r * 90, ww = Math.min(34, (w - 28) / cols - 14), wh = 44;
    const lamp = R() < (o.lamps ?? .03);
    g.fillStyle = lamp ? '#ffcf70' : mix('#2a1a3a', col, .2); g.fillRect(wx, wy, ww, wh);
    g.fillStyle = mix(front, '#ffffff', .3); g.fillRect(wx - 3, wy + wh, ww + 6, 4);
    if (lamp && e) { e.fillStyle = rgba('#ffb040', .55); e.fillRect(wx - 6, wy - 6, ww + 12, wh + 12); e.fillStyle = '#ffd080'; e.fillRect(wx, wy, ww, wh); }
    else { g.fillStyle = rgba('#ffd080', .5); g.fillRect(wx + ww - 5, wy, 5, wh); }
  }
  if (o.door !== false && R() < .7) { const dx = x + w * .2 + R() * w * .4; g.fillStyle = mix(WALLS[Math.floor(R() * 8)], '#2a1a3a', .45); g.fillRect(dx, y + h - 86, 40, 86); }
  // laundry line
  if (R() < .35) { const ly = y + 12 + R() * 30; g.strokeStyle = '#3a2a3a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + w, ly); g.quadraticCurveTo(x + w + 60, ly + 18, x + w + 120, ly); g.stroke();
    for (let k = 0; k < 4; k++) { g.fillStyle = WALLS[Math.floor(R() * 8)]; g.fillRect(x + w + 12 + k * 26, ly + 6 + Math.sin(k) * 3, 18, 26); } }
}

// —— the hillside basti with the long stairway (diagonal, rising to the right) ——
// world: stairs from (sx0, sy0) to (sx1, sy1); plate is tall. Returns {c,e, stair:{x0,y0,x1,y1,n}}
export function stairPlate(w, h, seed = 7) {
  const [c, g] = canvas(w, h), [ec, e] = canvas(w, h), R = rng(seed);
  e.fillStyle = '#000'; e.fillRect(0, 0, w, h);
  const sky = skyPlate(w, h, 700, w * .78, 560, 3, { cloudH: 600 });
  g.drawImage(sky.c, 0, 0); e.drawImage(sky.e, 0, 0);
  // the hill: a painted slope, far houses first (small, hazy), then near
  const x0 = 120, y0 = h - 160, x1 = w - 160, y1 = 1100, n = 300;
  const hillY = x => y1 - 300 + (x / w) * 0 + Math.sin(x * .004) * 60;
  g.fillStyle = mix(SKY.rose, SKY.violet, .4); g.beginPath(); g.moveTo(0, h); g.lineTo(0, 900); for (let x = 0; x <= w; x += 40) g.lineTo(x, 820 + Math.sin(x * .006) * 50); g.lineTo(w, h); g.fill();
  // houses stacked along the slope, both sides of the stair
  const sy = x => y0 + (y1 - y0) * (x - x0) / (x1 - x0);
  const rows = [];
  for (let y = 860; y < h + 200; y += 90 + R() * 40) rows.push(y);
  for (const ry of rows) {
    const depth = Math.min(1, (ry - 860) / (h - 860));
    let x = -60 + R() * 60;
    while (x < w) {
      const hw = 120 + R() * 160 * (.6 + depth), hh = 140 + R() * 180 * (.6 + depth);
      const midx = x + hw / 2, st = sy(midx);
      if (Math.abs(ry + hh - st) > 160 || ry + hh < st - 40) {   // keep the stair band clear
        g.save(); g.globalAlpha = .55 + depth * .45; house(g, e, x, ry, hw, hh, R, {}); g.restore();
        g.fillStyle = rgba('#ffb88a', (1 - depth) * .35); g.fillRect(x - 4, ry - 12, hw + 30, hh + 14);
      }
      x += hw + 6 + R() * 30;
    }
  }
  // the stairway: a sawtooth concrete stair seen from the side and slightly above, with a painted rail
  const nd = 110, dx = (x1 - x0) / nd, dy = (y1 - y0) / nd, TW = 34, TH = -22;   // TW/TH: tread depth offset (3/4 view)
  const prof = [[x0 - 80, y0 + 60]];
  for (let i = 0; i < nd; i++) { const ux = x0 - 80 + dx * i, uy = y0 + 60 + dy * i; prof.push([ux, uy + dy], [ux + dx, uy + dy]); }
  prof.push([x1 + 400, y1 + 60 + dy], [x1 + 400, h], [x0 - 80, h]);
  g.fillStyle = '#9a7a8e'; g.fill(poly(prof));                    // side wall
  vgrad(g, 0, 0, 0, 0, []);
  for (let i = 0; i < nd; i++) {
    const ux = x0 - 80 + dx * i, uy = y0 + 60 + dy * (i + 1);
    g.fillStyle = i % 2 ? '#f0cfb2' : '#f8dcc0'; g.fill(poly([[ux, uy], [ux + dx, uy], [ux + dx + TW, uy + TH], [ux + TW, uy + TH]]));   // tread top
    g.fillStyle = '#c69a9a'; g.fill(poly([[ux + dx, uy], [ux + dx, uy - dy], [ux + dx + TW, uy - dy + TH], [ux + dx + TW, uy + TH]]));   // riser (lit edge)
    g.fillStyle = '#7a5a74'; g.fillRect(ux, uy, dx, 4);
  }
  // shadow band from the houses on the right, gold edge light on the left
  g.fillStyle = rgba('#3a1e4e', .18); g.fill(poly([[x0 + 40, y0 + 60], [x1 + 40, y1 + 60], [x1 + 400, y1 + 60], [x0 + 400, y0 + 60]]));
  g.strokeStyle = '#ffd890'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 - 80, y0 + 62); g.lineTo(x1 - 80, y1 + 62); g.stroke();
  // rail (blue pipe) along the stair
  g.strokeStyle = '#2a5aa8'; g.lineWidth = 8; g.beginPath(); g.moveTo(x0 - 100, y0 - 40); g.lineTo(x1 - 100, y1 - 40); g.stroke();
  g.strokeStyle = '#8ab0ff'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0 - 100, y0 - 44); g.lineTo(x1 - 100, y1 - 44); g.stroke();
  for (let i = 0; i <= 40; i++) { const u = i / 40, ux = x0 - 100 + (x1 - x0) * u, uy = y0 + (y1 - y0) * u; g.strokeStyle = '#2a5aa8'; g.lineWidth = 5; g.beginPath(); g.moveTo(ux, uy - 40); g.lineTo(ux, uy + 64); g.stroke(); }
  return { c, e: ec, stair: { x0, y0: y0 + 60, x1, y1: y1 + 60, n } };
}

// —— street: a strip of houses + road (loops horizontally) ——
export function streetPlate(w, h, seed = 11, o = {}) {
  const [c, g] = canvas(w, h), [ec, e] = canvas(w, h), R = rng(seed);
  e.fillStyle = '#000'; e.fillRect(0, 0, w, h);
  const sky = skyPlate(w, h, o.hy ?? 900, w * .7, 760, seed, { cloudH: 500 });
  g.drawImage(sky.c, 0, 0); e.drawImage(sky.e, 0, 0);
  const ground = o.ground ?? h - 520;
  // far row (hazy), near row
  for (const [yb, sc, a] of [[ground - 160, .7, .55], [ground, 1.15, 1]]) {
    let x = -40;
    while (x < w) { const hw = (130 + R() * 150) * sc, hh = (180 + R() * 260) * sc; g.save(); g.globalAlpha = a; house(g, e, x, yb - hh, hw, hh, R, { shadow: false }); g.restore(); if (a < 1) { g.fillStyle = rgba('#ffb88a', .3); g.fillRect(x - 4, yb - hh - 12, hw + 30, hh + 14); } x += hw + 4 + R() * 20; }
  }
  // electric wires
  g.strokeStyle = rgba('#2a1a2e', .8); g.lineWidth = 2;
  for (let k = 0; k < 4; k++) { g.beginPath(); for (let x = 0; x <= w; x += 60) g.lineTo(x, ground - 520 - k * 26 + Math.sin(x / 340 * Math.PI) * 40); g.stroke(); }
  // pavement + road
  vgrad(g, 0, ground, w, 120, [[0, '#d2a88e'], [1, '#b8889a']]);
  vgrad(g, 0, ground + 120, w, h - ground - 120, [[0, '#6a5470'], [1, '#3a2a44']]);
  g.fillStyle = rgba('#ffe0a0', .5); for (let x = 0; x < w; x += 220) g.fillRect(x, ground + 300, 110, 10);
  // long shadows across the road
  for (let x = 0; x < w; x += 260 + R() * 200) { g.fillStyle = rgba('#2a1640', .22); g.fill(poly([[x, ground], [x + 120, ground], [x - 260, h], [x - 520, h]])); }
  return { c, e: ec, ground };
}

// —— chai stall interior (looking at the stove; door on the right with sunrise) ——
export function stallPlate(w, h, seed = 5) {
  const [c, g] = canvas(w, h), [ec, e] = canvas(w, h), R = rng(seed);
  e.fillStyle = '#000'; e.fillRect(0, 0, w, h);
  vgrad(g, 0, 0, w, h, [[0, '#3a2234'], [.6, '#5a3040'], [1, '#2a1a28']]);
  // door/window: sunrise outside
  const dx = w * .58, dy = 260, dw = w * .36, dh = 1100;
  const sky = skyPlate(Math.ceil(dw), dh, dh * .78, dw * .5, dh * .66, 9, { sunR: 70, clouds: 4, cloudH: 400 });
  g.drawImage(sky.c, dx, dy); e.drawImage(sky.e, dx, dy);
  for (let k = 0; k < 4; k++) { g.save(); g.globalAlpha = .7; house(g, e, dx + k * 110 - 20, dy + dh * .62 + (k % 2) * 30, 100, 260, R, { shadow: false }); g.restore(); }
  g.fillStyle = '#2a1a22'; g.fillRect(dx - 24, dy - 24, 24, dh + 24); g.fillRect(dx + dw, dy - 24, 24, dh + 24); g.fillRect(dx - 24, dy - 24, dw + 48, 24);
  // light shaft from the door (emissive, slanting left)
  e.fillStyle = rgba('#ff9a40', .25); e.fill(poly([[dx, dy + 80], [dx, dy + dh], [dx - 520, h], [dx - 760, h]]));
  g.fillStyle = rgba('#ffb060', .18); g.fill(poly([[dx, dy + 80], [dx, dy + dh], [dx - 520, h], [dx - 760, h]]));
  // shelf with glasses, posters, calendar (generic)
  g.fillStyle = '#6a4030'; g.fillRect(40, 520, dx - 120, 18);
  for (let k = 0; k < 9; k++) { const gx = 70 + k * 50; g.fillStyle = rgba('#e8eef4', .5); g.fillRect(gx, 474, 30, 46); g.strokeStyle = '#4a5468'; g.lineWidth = 1.2; g.strokeRect(gx, 474, 30, 46); }
  g.fillStyle = '#c84a3a'; g.fillRect(90, 220, 180, 230); g.fillStyle = '#ffd27a'; g.fillRect(104, 236, 152, 120); g.fillStyle = '#3a2234'; g.font = 'italic 900 30px Kanit'; g.fillText('2025', 120, 420);
  // counter (wood) + stove
  vgrad(g, 0, 1280, w, 640, [[0, '#8a5230'], [.08, '#6a3a22'], [1, '#3a2016']]);
  g.fillStyle = '#c07a48'; g.fillRect(0, 1270, w, 16);
  for (let k = 0; k < 8; k++) { g.fillStyle = rgba('#2a1410', .25); g.fillRect(0, 1320 + k * 70, w, 3); }
  // stove (generic kerosene burner)
  g.fillStyle = '#3a3440'; g.fillRect(120, 1190, 420, 90); g.fillStyle = '#5a5464'; g.fillRect(120, 1190, 420, 14);
  return { c, e: ec, stove: [330, 1190], door: [dx, dy, dw, dh] };
}

// —— running track, side view: lanes as bands, stand with crowd behind, sunrise sky ——
export function trackSidePlate(w, h, seed = 21, o = {}) {
  const [c, g] = canvas(w, h), [ec, e] = canvas(w, h), R = rng(seed);
  e.fillStyle = '#000'; e.fillRect(0, 0, w, h);
  const hy = o.hy ?? 980;
  const sky = skyPlate(w, h, hy, w * (o.sunX ?? .7), hy - 90, seed, { sunR: 140, cloudH: 700 });
  g.drawImage(sky.c, 0, 0); e.drawImage(sky.e, 0, 0);
  // distant hills + basti silhouettes
  g.fillStyle = mix(SKY.rose, SKY.violet, .55); g.beginPath(); g.moveTo(0, hy); for (let x = 0; x <= w; x += 30) g.lineTo(x, hy - 60 - Math.sin(x * .003 + 1) * 50 - Math.sin(x * .011) * 16); g.lineTo(w, hy); g.fill();
  // stand (concrete steps) with the crowd: painted as rows of heads/shoulders
  const st = hy + 20, sb = hy + 420;
  vgrad(g, 0, st, w, sb - st, [[0, '#8a6a8a'], [1, '#5a3e60']]);
  for (let r = 0; r < 6; r++) {
    const yy = st + 30 + r * 64;
    g.fillStyle = rgba('#3a2240', .5); g.fillRect(0, yy + 44, w, 8);
    for (let x = R() * 30; x < w; x += 34 + R() * 18) {
      const col = WALLS[Math.floor(R() * 8)], sk = mix('#b47850', '#6a3a3a', R() * .5);
      g.fillStyle = mix(col, '#3a2244', .35); g.beginPath(); g.ellipse(x, yy + 38, 18, 16, 0, Math.PI, 0); g.fill();
      g.fillStyle = mix(sk, '#4a2a4a', .3); g.beginPath(); g.arc(x, yy + 12, 11, 0, TAU); g.fill();
      g.fillStyle = '#1e1426'; g.beginPath(); g.arc(x, yy + 8, 11, Math.PI, 0); g.fill();
      g.fillStyle = rgba('#ffc080', .5); g.fillRect(x + 6, yy + 4, 4, 30);
    }
  }
  // banners on the stand rail
  g.fillStyle = '#e8e2d8'; g.fillRect(0, sb - 10, w, 12);
  for (let x = 40; x < w; x += 420) { g.fillStyle = '#c8303a'; g.fillRect(x, sb - 70, 300, 56); g.fillStyle = '#fff2d0'; g.font = 'italic 900 34px Kanit'; g.textBaseline = 'middle'; g.fillText('DISTRICT MEET', x + 20, sb - 42); }
  // infield grass strip + the track (red-orange lanes, white lines)
  vgrad(g, 0, sb, w, 120, [[0, '#6a9a4a'], [1, '#4a7a3a']]);
  vgrad(g, 0, sb + 120, w, h - sb - 120, [[0, '#d05a3a'], [1, '#a03a32']]);
  for (let k = 0; k < 6; k++) { const ly = sb + 120 + k * (h - sb - 120) / 5; g.fillStyle = '#f6efe4'; g.fillRect(0, ly, w, 6 + k * 2); }
  // long shadows of the stand poles
  for (let x = 0; x < w; x += 300) { g.fillStyle = rgba('#3a1640', .2); g.fill(poly([[x, sb + 120], [x + 20, sb + 120], [x - 600, h], [x - 680, h]])); }
  return { c, e: ec, hy, track: sb + 120 };
}
