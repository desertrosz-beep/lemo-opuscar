// One timeline for picture, SFX, captions and checks. Measured from chai_run_music_edit.mp3:
// 120 BPM; beats at 0.45 + 0.5k s before 12 s, 0.40 + 0.5k s after (50 ms splice in the edit). Hits: 2.475, drop 17.90, stabs 34.41/36.41/38.41, pistol beat 41.90, hard stop 58.45.
export const FPS = 24, DUR = 58.5;
const F = n => n / FPS;
export const beat = t => (t < 12 ? .45 : .40);                       // grid phase
export const onGrid = t => { const p = beat(t); return p + Math.round((t - p) * 2) / 2; };
export const HIT = { scratch: 2.475, drop: 17.90, stab1: 34.41, stab2: 36.41, stab3: 38.41, pistol: 41.90, stop: 58.45 };
// scene table: [start, end, id]; cuts snapped to frames on the beat grid
export const SCENES = [
  [0, F(59), 's1'],            // 0–2.458 finish, slow-mo, freeze
  [F(59), F(107), 's2'],       // rewind → kettle
  [F(107), F(191), 's3'],      // tray grab, bolt out
  [F(191), F(275), 's4'],      // stairway 0 → 300
  [F(275), F(334), 's5'],      // bus + newspaper man
  [F(334), F(394), 's6'],      // rich kids, poster
  [F(394), F(438), 's7'],      // trip, shatter at 17.90
  [F(438), F(526), 's8'],      // coach, stopwatch
  [F(526), F(610), 's9'],      // poster on the stall
  [F(610), F(814), 's10'],     // montage
  [F(814), F(946), 's11'],     // start line + stabs
  [F(946), F(1006), 's12'],    // breath, pistol at 41.90
  [F(1006), F(1222), 's13'],   // race
  [F(1222), F(1306), 's14'],   // finish (= s1 framing)
  [F(1306), F(1403), 's15'],   // chai at sunrise
  [F(1403), DUR, 'black'],     // hard stop
];
export const sceneAt = t => SCENES.find(s => t >= s[0] && t < s[1]) || SCENES[SCENES.length - 1];
// captions: [t0, t1, text, y]
export const CAPS = [
  [.3, F(59), 'Isne kabhi training\nnahi ki…', 470],
  [3.0, F(107), '…ya ki?', 620],
  [18.6, F(526), '300 seedhiyaan…\n2 minute?!', 430],
  [35.0, F(946), 'Last place.', 640],
  [F(1306), F(1403), 'Har roz ki daud…\nek din jeet banti hai.', 330],
  [55.95, F(1403), 'Tumhari 300 seedhiyaan\nkya hain?', 1352, 84],
];
