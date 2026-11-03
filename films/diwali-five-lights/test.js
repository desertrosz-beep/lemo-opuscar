// ?test=model : model sheet from the real rig
import { drawFig, rodsFor } from './fig.js';
export function modelSheet(tr, fr, which) {
  tr.setTransform(1, 0, 0, 1, 0, 0); tr.fillStyle = '#fff'; tr.fillRect(0, 0, 1920, 1080);
  const sets = {
    a: [['ram', 200, {}], ['lakshman', 520, { aF: [-.6, -1.1] }], ['sita', 830, {}], ['ravana', 1220, { f: -1, aF: [-.9, -1.4] }], ['hanuman', 1620, { aF: [-1.2, -2.2] }]],
    b: [['lakshmi', 200, { aF: [-.9, -1.6], hF: 'open' }], ['krishna', 520, { aF: [-1.3, -2.0] }], ['satya', 820, {}], ['naraka', 1180, { f: -1, aF: [-.6, -1.6] }], ['guru', 1480, { f: -1 }], ['deva', 1760, { s: .8 }]],
    c: [['guru', 560, { s: 2.0, f: -1, y: 1060 }], ['krishna', 1300, { s: 2.0, y: 1100, aF: [-.3, -.6] }]],
  }[which] || [];
  const C = [.9, 0, 0, .9, 96, 40];
  for (const [n, x, o] of sets) { const r = drawFig(tr, C, n, { x, y: 640, ...o }); if (which !== 'c') rodsFor(tr, r, .9); }
  return { lamps: [[700, 420, 1, .95], [1300, 420, 1, .95]], cam: [960, 540, 1], expo: 1.75 / Math.sqrt(2), sigB: 700, sigC: 120, amb: .3, vign: .4, sat: 1.1, contrast: .15, bloom: .3 };
}
