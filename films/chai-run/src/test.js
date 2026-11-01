// model sheet / action tests: ?test=model | coach | run
import { W, H, LWK } from './cel.js';
import { pal } from './pal.js';
import { head } from './head.js';
import { figure, runPose, standPose, crouchPose } from './body.js';
function cell(g, x, y, w, h, label, fn) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = '#e8e2dc'; g.fillRect(x, y, w, h); fn(); g.restore();
  g.strokeStyle = '#8a8494'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2);
  g.fillStyle = '#3a3448'; g.font = '700 26px "Barlow SC"'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(label, x + 14, y + 10);
}
export function test(g, e, t, name) {
  g.fillStyle = '#d8d0cc'; g.fillRect(0, 0, W, H);
  const light = new URLSearchParams(location.search).get('light') || 'day';
  if (name === 'model' || name === 'coach') {
    const who = name === 'model' ? 'chhotu' : 'coach', P = pal(who, light);
    g.fillStyle = '#2a2436'; g.font = 'italic 900 52px Kanit'; g.textAlign = 'left'; g.textBaseline = 'top';
    g.fillText((who === 'chhotu' ? 'CHHOTU' : 'COACH') + ' — MODEL SHEET', 24, 18);
    g.font = '700 24px "Barlow SC"'; g.fillText('CHAI RUN · 80s cel anime · ' + light + ' light', 26, 82);
    [['3/4', 'q'], ['PROFILE', 'side'], ['FRONT', 'front']].forEach(([lab, view], i) => cell(g, i * 360, 120, 360, 420, lab, () => { g.translate(i * 360 + 180, 120 + 210); g.scale(1.25, 1.25); head(g, P, { who, view, expr: who === 'chhotu' ? 'determined' : 'calm' }); }));
    const ex = who === 'chhotu' ? [['DETERMINED', 'focus'], ['GRIN', 'grin'], ['HURT', 'hurt'], ['STARE', 'stare']] : [['CALM', 'calm'], ['WIDE EYES', 'wide'], ['SMILE', 'smile'], ['NEUTRAL', 'neutral']];
    ex.forEach(([lab, expr], i) => cell(g, (i % 2) * 540, 540 + Math.floor(i / 2) * 330, 540, 330, lab, () => { g.translate((i % 2) * 540 + 270, 540 + Math.floor(i / 2) * 330 + 160); g.scale(1.05, 1.05); head(g, P, { who, view: 'q', expr }); }));
    // full body
    const poses = who === 'chhotu' ? [['STAND + TRAY', standPose({ arms: [{ b1: 2.05, b2: 1.05 }, { b1: -.05, b2: .25 }] }), { tray: {} , chappal: true}], ['SPRINT', runPose(.25), { smear: false }], ['SPRINT (smear)', runPose(.05), { smear: true, ghostPoses: [runPose(-.07), runPose(-.03)] }], ['CROUCH', crouchPose(), {}]]
      : [['STAND', standPose({ arms: [{ b1: .5, b2: 1.6 }, { b1: -.05, b2: .25 }] }), {}], ['REACH', standPose({ arms: [{ b1: 2.6, b2: .2 }, { b1: -.05, b2: .25 }] }), {}], ['HAND OVER', standPose({ arms: [{ b1: 1.3, b2: .3 }, { b1: -.05, b2: .25 }] }), {}], ['WALK', runPose(.2, { speed: .35, lean: .03 }), {}]];
    poses.forEach(([lab, pose, o], i) => cell(g, i * 270, 1200, 270, 720, lab, () => { g.translate(i * 270 + 120, 1200 + 690); g.scale(.5, .5); figure(g, e, P, pose, { who, view: 'side', expr: 'determined', chappal: who === 'chhotu', ...o }); }));
  }
  if (name === 'run') {
    for (let i = 0; i < 8; i++) { const p = i / 8; g.save(); g.translate((i % 4) * 270 + 110, Math.floor(i / 4) * 900 + 860); g.scale(.6, .6); figure(g, e, pal('chhotu', light), runPose(p), { who: 'chhotu', view: 'side', expr: 'focus' }); g.restore(); g.fillStyle = '#222'; g.font = '700 30px "Barlow SC"'; g.fillText('p=' + p.toFixed(3), (i % 4) * 270 + 20, Math.floor(i / 4) * 900 + 40); }
  }
}
