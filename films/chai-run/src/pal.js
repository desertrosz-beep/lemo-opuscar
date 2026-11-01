// Colour models (色指定): daylight base → per-lighting sets for the sunrise film. Skin is set by hand per lighting.
import { hex } from './cel.js';

const COMMON = {
  white_eye: '#fbf6f0', mouth: '#8a3440', blush: '#e07a6a',
  eye: { f: '#6a4026', s: '#3a2014', h: '#c08a58', l: '#1e0e08' },
  lash: '#1a0e12',
  steel: { f: '#c9d0dc', s: '#7a8296', h: '#ffffff', l: '#2c3040' },
  glass: { f: '#e8eef4', s: '#a8b4c4', h: '#ffffff', l: '#4a5468' },
  chai: { f: '#c8803a', s: '#8e4e22', h: '#f0b060', l: '#4a2410' },
  white: { f: '#f4f2ee', s: '#b8b4c4', h: '#ffffff', l: '#444058' },
};
export const CHARS = {
  chhotu: {
    ...COMMON,
    skin: { f: '#c98a5e', s: '#94573f', h: '#e6b085', l: '#4a2216' },
    hair: { f: '#2a2236', s: '#15101e', h: '#6a5e8a', l: '#0c0814' },
    tee: { f: '#f08a3c', s: '#c05a2c', h: '#ffb878', l: '#5a2210' },     // faded orange: the accent
    wear: '#f6b07a',
    shorts: { f: '#6a5244', s: '#47352c', h: '#8e7464', l: '#20140e' },
    chappal: { f: '#3a6ad0', s: '#24449a', h: '#7ea4ff', l: '#101c44' },
    sole: { f: '#8a8478', s: '#5a5650', l: '#24221e' },
  },
  coach: {
    ...COMMON,
    skin: { f: '#b67852', s: '#80492f', h: '#d49a72', l: '#3e1c12' },
    hair: { f: '#e8e4e0', s: '#a49cac', h: '#ffffff', l: '#4e4656' },
    stubble: '#6a5a60',
    jacket: { f: '#2f5aa8', s: '#1d3a78', h: '#6a94e0', l: '#0e1c40' },
    stripe: { f: '#f0f0ea', s: '#b0b4c4', l: '#40445a' },
    cord: { f: '#d23a3a', s: '#8e2020', l: '#40100e' },
    pants: { f: '#3a3a4e', s: '#24242f', h: '#5c5c74', l: '#0e0e16' },
  },
  kidA: {
    ...COMMON,
    skin: { f: '#d6a07a', s: '#a46a50', h: '#f0c09a', l: '#4e2618' },
    hair: { f: '#3a2a22', s: '#1e1410', h: '#806050', l: '#120a08' },
    top: { f: '#f6f6f2', s: '#b6bccc', h: '#ffffff', l: '#40465a' },
    trim: { f: '#18b8a8', s: '#0e7a72', l: '#063a36' },
    shorts: { f: '#2a3a6a', s: '#1a2448', h: '#4a5c9a', l: '#0a1028' },
    shoe: { f: '#f8f8f6', s: '#b8c0d0', h: '#ffffff', l: '#384058' }, swoosh: '#ff3c8c', shoeSole: '#ffd23c',
  },
  kidB: {
    ...COMMON,
    skin: { f: '#c4906a', s: '#906048', h: '#e2b490', l: '#482416' },
    hair: { f: '#241a26', s: '#120c14', h: '#5e5070', l: '#0a060c' },
    top: { f: '#ffd84a', s: '#c89a2a', h: '#fff2a0', l: '#4e3810' },
    trim: { f: '#2a2a3a', s: '#16161f', l: '#08080c' },
    shorts: { f: '#f4f4f0', s: '#b6bccc', h: '#ffffff', l: '#40465a' },
    shoe: { f: '#f8f8f6', s: '#b8c0d0', h: '#ffffff', l: '#384058' }, swoosh: '#26d8ff', shoeSole: '#ff4a6a',
  },
};

const mul = (c, m) => { const v = hex(c); return '#' + v.map((x, i) => Math.max(0, Math.min(255, Math.round(x * m[i]))).toString(16).padStart(2, '0')).join(''); };
// lighting sets: f/h × lit, s × shade, l × line
export const LIGHTS = {
  day: { lit: [1, 1, 1], shade: [1, 1, 1], line: [1, 1, 1] },
  sun: { lit: [1.08, .96, .84], shade: [.86, .66, .84], line: [.95, .72, .86] },        // low sunrise, warm key, rose-violet shadow
  shade: { lit: [.86, .78, .92], shade: [.66, .52, .8], line: [.8, .62, .9] },        // in the long shadow of a wall
  interior: { lit: [.92, .74, .6], shade: [.58, .4, .5], line: [.75, .5, .6] },       // dim stall, window light
  backlit: { lit: [.6, .42, .5], shade: [.36, .22, .36], line: [.4, .2, .34] },     // silhouette against the sun (warm rim added per shot)
};
const SKIN = {   // skin by hand per set (multiplying turns faces pink/grey)
  sun: { chhotu: { f: '#dc9864', s: '#a05a48', h: '#f6c08a' }, coach: { f: '#c88458', s: '#8a4c3a', h: '#e4a878' } },
  shade: { chhotu: { f: '#b07c62', s: '#7c4e4e', h: '#cc9a7c' }, coach: { f: '#9e6a54', s: '#6c4040', h: '#bc8a6c' } },
  interior: { chhotu: { f: '#b87850', s: '#6e3c34', h: '#e0a068' }, coach: { f: '#a46a46', s: '#62342c', h: '#cc9060' } },
};
const cache = {};
export function pal(who, light = 'sun') {
  const k = who + ':' + light; if (cache[k]) return cache[k];
  const L = LIGHTS[light], out = {};
  for (const [kk, v] of Object.entries(CHARS[who])) {
    if (typeof v === 'string') { out[kk] = mul(v, L.lit); continue; }
    out[kk] = {};
    for (const [q, c] of Object.entries(v)) out[kk][q] = mul(c, q === 's' ? L.shade : q === 'l' ? L.line : L.lit);
  }
  const sk = SKIN[light]?.[who] || SKIN[light]?.[who === 'coach' ? 'coach' : 'chhotu'];
  if (sk) Object.assign(out.skin, sk);
  out.eye = CHARS[who].eye; out.white_eye = light === 'backlit' ? '#806070' : CHARS[who].white_eye;
  if (light !== 'backlit') out.chai = CHARS[who].chai;
  if (who === 'coach') { out.hair = { ...CHARS.coach.hair }; if (light === 'sun' || light === 'backlit' || light === 'shade') out.hairRim = { c: '#ffd27a', d: [-3, 5] }; }   // the coach's hair stays white in every lighting (gold rim per shot)
  return (cache[k] = out);
}
// the sky + world palette
export const SKY = {
  top: '#3a2a6e', upper: '#7a3c8e', rose: '#e8607a', saffron: '#ff9a3c', gold: '#ffd27a', horizon: '#fff4d0',
  violet: '#5a3a7e', plum: '#3a2244', haze: '#f7b48a',
};
export const WALLS = ['#3fc4b4', '#f27aa0', '#b4d84a', '#e8b04a', '#8a7ae0', '#5ab4f0', '#f0d0a0', '#ff8a6a'];
