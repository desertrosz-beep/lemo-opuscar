// Timeline: the single source of truth (shots, narration, lamps, sound events, music cues). 84 BPM: 1 beat = 0.714 s
export const BPM = 84, BEAT = 60 / BPM;
export const DUR = 168;
// act k (0..4): A = act start, S = story start (the rail shot rises to the cloth and the act plaque lifts off)
export const ACT = [13.0, 52.0, 76.8, 97.4, 122.0];
export const STORY = [16.8, 56.0, 80.6, 101.2, 125.8];
export const MATCH = ACT.map(a => +(a + .4).toFixed(3));
export const CATCH = ACT.map(a => +(a + 1.0).toFixed(3));
export const PEAKF = [0, 1, 2, 3, 4].map(i => +(143.4 + i * BEAT).toFixed(3));
export const SNUFF = [160.0, 159.6, 159.2, 158.8, 158.4];          // backstage lamp k+1 and rail diya k go out (5 → 1)
export const T = {
  clap: .35, pilot: .6, rings: [2.6, 3.8, 5.0, 6.2, 7.3], titleIn: 7.9, titleSet: 8.4, titleOut: 13.0,
  // Ram
  deer0: 23.2, swap: 24.6, grab: 25.9, flip: 26.5, whip: [26.7, 27.05], ravOut: 28.0,
  bridgeOn: 29.0, monk: [30.0, 33.2], leap: [32.3, 33.8],
  battle: 34.4, draw: [35.3, 36.3], loose: 36.6, hit: 37.0, bell1: 37.6,
  ret: 39.6, arrive: 43.4, win0: 43.6,
  // Lakshmi
  tug0: 56.0, seaLift: 64.4, rise: [64.6, 66.4], coins: [65.8, 69.0],
  doors: [70.4, 71.4], rangoli: 72.6, woman: [71.6, 73.4], place: 74.0,
  // Krishna
  heart: [80.6, 86.0], chariot: [86.0, 88.4], chakraUp: 88.6, throw: 89.2, chHit: 89.9, bell2: 90.0, back: [90.2, 90.9],
  barsOff: 92.4, stream: [93.0, 97.0],
  // Guru Hargobind
  tails: [107.6, 114.6],
  // Mahavira
  levels: [128.0, 129.6, 131.0, 132.4, 133.4], gone: 134.0, lamps: [135.2, 139.2],
  silence: 140.2, match2: 142.4,
  heroes: PEAKF[4] + .35, peakRise: [146.3, 147.4], pullBack: [149.0, 153.8],
  // close
  close: 153.8, viewer: [155.8, 157.6], vcatch: 157.6, endIn: 160.4, clap2: 166.4, fade: [166.8, 168.0]
};
// Narration (start times; durations from voices/dur.json); sub = what the placard shows
export const SHOTS = [
  [0, 13.0, 'hole'], [13.0, 16.8, 'act', 0], [16.8, 23.2, 'exile'], [23.2, 28.6, 'abduct'], [28.6, 34.4, 'bridge'], [34.4, 39.6, 'battle'], [39.6, 52.0, 'return'],
  [52.0, 56.0, 'act', 1], [56.0, 64.2, 'churn'], [64.2, 69.2, 'rise'], [69.2, 76.8, 'homes'],
  [76.8, 80.6, 'act', 2], [80.6, 86.0, 'fort'], [86.0, 92.2, 'strike'], [92.2, 97.4, 'freed'],
  [97.4, 101.2, 'act', 3], [101.2, 107.6, 'gwalior'], [107.6, 114.6, 'tails'], [114.6, 122.0, 'temple'],
  [122.0, 125.8, 'act', 4], [125.8, 140.2, 'teacher'], [140.2, 143.4, 'silence'], [143.4, 153.8, 'peak'], [153.8, 168.0, 'close']
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
