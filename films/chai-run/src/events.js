// SFX events for mix.py (the music is the user's own track; these sit on top of it)
import { HIT } from './timeline.js';
export function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  const steps = (a, b, phase, v = 1, every = .25) => { for (let t = phase + Math.ceil((a - phase) / every) * every; t < b; t += every) add('step', t, { v: v * (Math.abs(((t - phase) / .5) % 1) < .01 ? 1 : .7) }); };
  // 1 finish (slow): slowed crowd, heavy slow steps; L-cut: the crowd runs under the rewind
  add('crowd', 0, { d: 2.8, v: .55, slow: 1 });
  for (const t of [.35, .9, 1.45]) add('step', t, { v: .9, slow: 1 });
  // 2 rewind + kettle (J-cut: the whistle starts under the rewind)
  add('scratch', HIT.scratch - .02); add('rewind', 2.47, { d: .56 }); add('kettle', 2.78, { d: 1.75 });
  // 3 tray, door
  add('clink', 4.97); add('clink', 5.12, { v: .6 }); add('door', 6.45); add('whoosh', 6.42, { v: .6 });
  steps(5.45, 7.95, .45, .8);
  // 4 stairs: a step on every 8th, accent on the beat
  steps(7.95, 11.45, .45, 1);
  // 5 bus, newspaper man
  steps(11.45, 11.75, .45, .8); add('horn', 11.55); add('busby', 11.6, { d: 1.0 }); add('paper', 13.05); add('clink', 13.35, { v: .8 });
  // 6 kids: (music carries)  7 trip + shatter
  steps(16.42, 16.9, .4, .9); add('snap', 16.9); add('whoosh', 17.12, { d: .5, v: .7 }); add('shatter', HIT.drop); add('clang', HIT.drop + .06);
  // 8 the quiet: birds, stopwatch click + ticks
  add('birds', 18.1, { d: 7.3 }); add('click', 18.5, { v: 1 }); for (let t = 19.0; t < 21.9; t += .5) add('tick', t, { v: .5 });
  // 9 the poster
  add('slap', 22.4); add('tape', 22.6); add('tape', 22.85, { v: .7 });
  // 10 montage: a whoosh into every cut, steps throughout, counter ticks
  for (const t of [25.42, 27.4, 29.4, 31.4]) add('whoosh', t - .2, { d: .35, v: .8 });
  steps(25.42, 31.4, .4, .8); for (let t = 31.45; t < 33.85; t += .125) add('tick', t, { v: .35 });
  // 11 start line: crowd murmur arrives before the cut (J-cut)
  add('crowd', 33.4, { d: 6.1, v: .4 });
  // 12 breath, hush, pistol
  add('breath', 39.7); add('breath', 40.75, { v: .8 }); add('crowd', 39.4, { d: 2.5, v: .12 });
  add('pistol', HIT.pistol);
  // 13 race: crowd rising to a roar, steps on 8ths, whooshes on the cuts
  add('crowd', HIT.pistol + .02, { d: 12.6, v: .5, rise: 1 }); steps(42.3, 50.9, .4, 1);
  for (const t of [43.9, 45.9, 47.9, 49.9]) add('whoosh', t - .2, { d: .35, v: .8 });
  // 14 slow-mo finish, tape breaks; 15 the glass
  for (const t of [51.3, 51.85, 52.4, 52.95]) add('step', t, { v: .9, slow: 1 }); add('whoosh', 52.9, { d: .6, v: .6 });
  add('crowd', 54.4, { d: 4.0, v: .25 }); add('clink', 55.25);
  return ev.sort((a, b) => a.t - b.t);
}
