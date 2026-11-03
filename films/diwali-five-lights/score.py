"""Original score for "Five Lamps": percussion first (dholak dhin/ta, manjira, ghungroo, temple bell), a tanpura drone on D under
everything, bansuri for quiet, a plucked sitar-like string (core/audio/pluck.py, bends), Yaman-like (raised 4th) for wonder,
Bhairavi-like for sorrow, and a shehnai (oboe + formant + saturation) exactly once: Ram's return to Ayodhya.
All times come from events.json / story.js. All melodies are original.
Run from the library root: .venv/bin/python films/diwali-five-lights/score.py  → films/diwali-five-lights/out/score.wav"""
import sys, os, json
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S, pluck as P
from core.audio.sfx import SR, add, bp, hp, lp, noise, t_, env_exp, norm

EV = json.load(open(os.path.join(HERE, 'events.json'))); DUR = EV['dur']; ev = EV['ev']
N = int(DUR * SR) + SR
S.seed(5); rng = np.random.default_rng(3)
BEAT = 60 / 84
ACT = [13.0, 52.0, 76.8, 97.4, 122.0]; CATCH = [a + 1.0 for a in ACT]; PEAKF = [143.4 + i * BEAT for i in range(5)]
SIL = (140.2, 143.4)
D3 = 50; YAMAN = [0, 2, 4, 6, 7, 9, 11]; BHAIR = [0, 1, 3, 5, 7, 8, 10]
def deg(scale, d, base=62):  # scale degree (can be negative / above 7) → midi
    o, i = divmod(d, 7); return base + 12 * o + scale[i]
stems = {k: np.zeros((N, 2), np.float32) for k in ['drone', 'perc', 'bell', 'melody', 'shehnai']}
def A(stem, x, at, g=1., pan=0.):
    if SIL[0] - .03 < at < SIL[1]: return
    add(stems[stem], x, at, g, pan)

# ---------------- percussion (synthesised) ----------------
def dhin(v=1.):            # dholak: low bayan boom (pitch drop) + ringing dayan
    d = 1.0; tt = t_(d); f = 85 + 45 * np.exp(-tt / .05)
    low = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .32)
    hi = sum(a * np.sin(2 * np.pi * 290 * k * tt + rng.random()) * np.exp(-tt / (.28 / k ** .5)) for k, a in [(1, .5), (2, .32), (3, .2), (4, .12)])
    x = low + hi * .7 + lp(noise(d), 1800) * np.exp(-tt / .006) * .5
    return norm(x * np.minimum(1, tt / .002)) * v
def ta(v=1.):              # dholak: sharp high stroke
    d = .4; tt = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / tau) for f, a, tau in [(540, 1, .09), (1085, .55, .06), (1620, .35, .04), (2180, .2, .03)])
    return norm(x + bp(noise(d), 1800, 6000) * np.exp(-tt / .004) * 1.2) * v
def ge(v=1.):              # low muted stroke
    d = .35; tt = t_(d); f = 70 + 30 * np.exp(-tt / .03)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .12) + lp(noise(d), 600) * np.exp(-tt / .01) * .4) * v
def manjira(v=1., open_=True):
    d = 1.6 if open_ else .12; tt = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * tt + rng.random() * 6) * np.exp(-tt / (tau if open_ else .03)) for f, a, tau in [(2920, 1, 1.1), (4230, .8, .9), (5180, .6, .7), (6900, .4, .5), (8120, .3, .35), (2935, .7, 1.2)])
    return norm(x + hp(noise(d), 5000) * np.exp(-tt / .004) * .8) * v
def ghungroo(v=1., d=.5):
    out = np.zeros(int((d + .2) * SR))
    for k in range(int(30 * d) + 8):
        s = int((rng.random() ** 1.3) * d * SR); f = 3000 + rng.random() * 4500; tt = t_(.07)
        out[s:s + len(tt)] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / .015) * (.4 + rng.random() * .6)
    return norm(out) * v
def bell(v=1., f0=220., big=False):   # temple bell: inharmonic partials, beating, long tail
    d = 7.0 if big else 4.0; tt = t_(d)
    parts = [(.5, .6, 1.0), (1, 1, .85), (1.19, .45, .6), (1.56, .4, .5), (2.0, .55, .45), (2.51, .3, .35), (2.66, .25, .3), (3.01, .2, .25), (4.1, .12, .18)]
    x = sum(a * (np.sin(2 * np.pi * f0 * r * tt) + .6 * np.sin(2 * np.pi * (f0 * r + .9 + r) * tt)) * np.exp(-tt / (tau * d / 2)) for r, a, tau in parts)
    x += hp(noise(d), 3000) * np.exp(-tt / .003) * .8
    return norm(x) * v
def clapper(v=1.):
    d = .5; tt = t_(d)
    x = hp(noise(d), 900) * env_exp(d, .002) * 1.2 + sum(a * np.sin(2 * np.pi * f * tt) * env_exp(d, tau) for f, a, tau in [(1150, .7, .03), (2350, .5, .018), (620, .4, .05)])
    return norm(x) * v

# ---------------- tanpura (synthesised, jawari = a formant sweeping down each pluck) ----------------
def tan_note(m, d=3.2):
    tt = t_(d); f = 440 * 2 ** ((m - 69) / 12); c = 14 * np.exp(-tt / .9) + 3
    x = np.zeros_like(tt)
    for k in range(1, 26):
        if f * k > 9000: break
        x += np.sin(2 * np.pi * f * k * tt + k) * (k ** -.8) * (1 + 1.6 * np.exp(-((k - c) ** 2) / 6))
    return x * np.minimum(1, tt / .01) * np.exp(-tt / 1.6)
def tanpura_cycle():
    cyc = 4 * 1.25; out = np.zeros(int((cyc + 3.4) * SR))
    for i, m in enumerate([45, 50, 50, 38]):
        y = tan_note(m); s = int(i * 1.25 * SR); out[s:s + len(y)] += y
    return out / np.abs(out).max(), cyc
TC, tcyc = tanpura_cycle()
t = .6; i = 0
while t < DUR - .5:
    if not (SIL[0] - 3.5 < t < SIL[1]):
        g = .5 * min(1, (t - .6) / 2 + .3) * (.6 if 122 < t < 140 else 1)
        A('drone', TC * (1 + .02 * (i % 3)), t, g, -.25 if i % 2 else .25)
    t += tcyc; i += 1

# ---------------- melodic voices ----------------
def warp(x, semis):
    n = len(x); out_n = int(n * 1.6) + SR; tt = np.arange(out_n) / SR; r = 2 ** (semis(tt) / 12.0)
    ph = np.concatenate([[0], np.cumsum(r[:-1])]); ph = ph[ph < n - 1]; i = ph.astype(int); f = ph - i
    return (x[i] * (1 - f) + x[i + 1] * f).astype(np.float32)
def bansuri(m, d, v=.6, meend=None):
    """sampled flute (VSCO 2 CE), breathier and softer; meend = (semitones, at s) slide into the note"""
    y = S.note('flute', m - (meend[0] if meend else 0), d + .3, vel=v, attack=.06)
    if meend: y = warp(y, lambda tt: np.clip(tt / max(meend[1], .01), 0, 1) ** 1.6 * meend[0] + .12 * np.sin(2 * np.pi * 5 * tt) * np.clip((tt - .35) / .4, 0, 1))
    else: y = warp(y, lambda tt: .12 * np.sin(2 * np.pi * 5 * tt) * np.clip((tt - .35) / .4, 0, 1))
    br = bp(noise(len(y) / SR), 600, 3500) * .04 * np.exp(-np.arange(len(y)) / SR / .2)
    return lp(y, 5200) + br
def phrase(stem, notes, t0, g=1., pan=0., fn=bansuri):
    """notes: (degree-midi, beats, extra dict) on the 84-bpm grid"""
    t = t0
    for n in notes:
        m, b = n[0], n[1]; kw = n[2] if len(n) > 2 else {}
        if m is not None: A(stem, fn(m, b * BEAT, **kw), t, g, pan)
        t += b * BEAT
    return t
def sitar(m, v=.7, bend=None, d=None):
    return P.pluck('shamisen', m, dur=d, vel=v, t60=2.6, bright=.75, buzz=.75, bend=bend)
def shehnai(m, d, v=.8, slide=None):
    y = S.note('oboe', m - (slide or 0), d + .3, vel=v, attack=.03)
    y = warp(y, lambda tt: (np.clip(tt / .18, 0, 1) ** 1.5 * (slide or 0)) + .2 * np.sin(2 * np.pi * 6.2 * tt) * np.clip((tt - .25) / .3, 0, 1))
    y = y + bp(y, 1200, 3000) * 2.2                       # nasal formant
    y = np.tanh(y * 3.2) / 1.4                             # reed saturation
    return lp(y, 7000)

Y = lambda d, b=62: deg(YAMAN, d, b); Bh = lambda d, b=62: deg(BHAIR, d, b)

# ===== HOLE + TITLE (wonder, Yaman): a breath of bansuri, a small bell when the title lands
phrase('melody', [(Y(4), 3, {'meend': (2, .3)}), (Y(5), 1), (Y(4), 2), (Y(2), 2), (None, 1), (Y(3), 1, {'meend': (1, .2)}), (Y(4), 4)], 2.0, .55, -.2)
phrase('melody', [(Y(2), 1), (Y(3), 1), (Y(4), 1), (Y(6), 1), (Y(7), 4, {'meend': (2, .35)})], 7.4, .6, .1)
A('bell', bell(.6, 440), 8.4, .35, .2)
for r in [2.6, 3.8, 5.0, 6.2, 7.3]: A('perc', manjira(.4, False), r, .18, .4)
A('perc', clapper(), .35, .0)   # (the clapper itself is foley)

# ===== ACT LAMPS: dhin + temple bell on each catch (act 5: no drum, a far-off soft bell only)
for k, c in enumerate(CATCH):
    if k < 4: A('perc', dhin(1), c, .9); A('perc', ta(.6), c + .01, .25, .3); A('bell', bell(1, 196, True), c, .55)
    else: A('bell', bell(.5, 392), c, .16, .3)
# ===== EXILE (sorrow, Bhairavi): slow theka + sitar with bends
t = 16.8
while t < 23.0:
    b = int(round((t - 16.8) / BEAT)) % 8
    if b in (0, 5): A('perc', dhin(.7), t, .4)
    elif b in (3, 6): A('perc', ta(.5), t, .2, .2)
    else: A('perc', ge(.5), t, .2, -.1)
    t += BEAT
for i, (m, bd) in enumerate([(Bh(0, 50), None), (Bh(1, 50), [(0, 0), (.25, -1), (.5, 0)]), (Bh(2, 50), None), (Bh(1, 50), None), (Bh(0, 50), None), (Bh(-1, 50), [(0, 0), (.3, 1), (.6, 0)]), (Bh(0, 50), None)]):
    A('melody', sitar(m, .7, bd), 17.1 + i * BEAT * 1.0 + (i // 3) * BEAT, .8, -.2)
# ===== ABDUCTION: manjira, a rolling drum into the whip, low dhin on the swap and the grab
for i in range(8): A('perc', manjira(.5, i % 2 == 0), 23.3 + i * BEAT / 2, .14, .4)
A('perc', dhin(1), 24.6, .7); A('perc', dhin(1), 25.9, .8); A('perc', ta(1), 25.92, .35)
for i in range(10): tt = 26.0 + .7 * (1 - (1 - i / 10) ** 1.6); A('perc', ta(.4 + .06 * i), tt, .3, (-1) ** i * .2)
A('perc', dhin(1), 26.7, .85)
for i, m in enumerate([Bh(4, 50), Bh(3, 50), Bh(1, 50), Bh(0, 50)]): A('melody', sitar(m, .6), 27.2 + i * .3, .6, .2)
# ===== BRIDGE: groove at 84 (dhin dha ta dhin), ghungroo shake each bar, a rising roll into Hanuman's leap
t = 28.6; pat = ['dhin', 'ge', 'ta', 'dhin', 'ta', 'ge', 'ta', 'ta']; i = 0
while t < 32.2:
    s = pat[i % 8]; A('perc', {'dhin': dhin, 'ta': ta, 'ge': ge}[s](.75), t, {'dhin': .5, 'ta': .25, 'ge': .3}[s], .1 if s == 'ta' else 0)
    if i % 4 == 0: A('perc', ghungroo(.8, .4), t, .22, -.4)
    t += BEAT / 2; i += 1
for i in range(14): A('perc', ta(.3 + .05 * i), 32.2 + i * .07, .22, .3)
A('perc', dhin(1), 33.2, .7); A('bell', bell(.5, 330), 33.4, .2)
for i, m in enumerate([Y(0, 50), Y(2, 50), Y(4, 50), Y(6, 50), Y(7, 50)]): A('melody', sitar(m, .65), 29.6 + i * BEAT * 2, .55, -.2)
# ===== BATTLE: accelerating 84 → 120 bpm into the bell, then silence of drums
t = 34.4; i = 0
while t < 37.55:
    bpm = 84 + 36 * min(1, (t - 34.4) / 3.0); st = 60 / bpm / 2
    s = ['dhin', 'ta', 'ta', 'dhin', 'ge', 'ta', 'dhin', 'ta'][i % 8]
    A('perc', {'dhin': dhin, 'ta': ta, 'ge': ge}[s](.6 + .3 * (t - 34.4) / 3.2), t, {'dhin': .55, 'ta': .3, 'ge': .3}[s], (-1) ** i * .15)
    if i % 2 == 0: A('perc', manjira(.6, False), t, .12, .4)
    t += st; i += 1
A('perc', dhin(1), 36.6, .7); A('perc', ta(1), 37.0, .5)
A('bell', bell(1, 147, True), 37.6, .85); A('perc', dhin(1), 37.6, 1.0)
A('melody', sitar(Y(0, 50), .8, [(0, -2), (.25, 0)]), 38.4, .7); A('melody', sitar(Y(4, 50), .6), 38.9, .5)
# ===== RETURN: the shehnai (only once), manjira on every beat of the windows, a light dhin each bar
sh = [(Y(0), 2, {'slide': -2}), (Y(1), 1), (Y(2), 1), (Y(3), 1, {'slide': -1}), (Y(4), 3), (Y(5), 1), (Y(4), 1), (Y(3), 1), (Y(2), 1), (Y(4), 4, {'slide': -2}),
      (Y(7), 2, {'slide': -3}), (Y(6), 1), (Y(5), 1), (Y(4), 2), (Y(5), 1), (Y(6), 1), (Y(7), 4, {'slide': -1})]
phrase('shehnai', sh, 40.3, .55, .1, fn=shehnai)
for i in range(12): A('perc', manjira(.6, True), 43.6 + i * BEAT, .16, .35)
for b in range(16): A('perc', dhin(.55) if b % 4 == 0 else ge(.4), 40.0 + b * BEAT, .3 if b % 4 == 0 else .14)
# ===== CHURNING: tug pulse (low dhin every 2 beats), a low ostinato
for i in range(11): A('perc', dhin(.8), 56.0 + i * 2 * BEAT, .45 if i % 2 == 0 else .3, -.2 if i % 2 else .2)
for i in range(11): A('melody', sitar([38, 45, 50, 45][i % 4] + 12, .55), 56.35 + i * 2 * BEAT, .45, .2)
# ===== RISE + HOMES (wonder): bansuri Yaman, manjira shimmer, ghungroo with the coins, a soft dadra
phrase('melody', [(Y(0), 1), (Y(2), 1), (Y(3), 1, {'meend': (1, .15)}), (Y(4), 2), (Y(6), 1), (Y(7), 3, {'meend': (2, .3)}), (Y(9), 2), (Y(8), 1), (Y(7), 3)], 64.6, .6, -.1)
A('bell', bell(.6, 523), 66.4, .25, .2)
for i in range(6): A('perc', ghungroo(.6, .35), 66.0 + i * .5, .14, (-1) ** i * .4)
t = 69.4; i = 0
while t < 76.4:
    A('perc', [dhin, ge, ge, ta, ge, ge][i % 6](.45), t, [.3, .12, .12, .18, .12, .12][i % 6]); t += BEAT / 1.5; i += 1
phrase('melody', [(Y(4), 2), (Y(3), 1), (Y(2), 1), (Y(4), 2, {'meend': (2, .3)}), (Y(2), 1), (Y(1), 1), (Y(0), 3), (None, 1), (Y(2), 1), (Y(4), 1), (Y(5), 2), (Y(4), 3)], 70.4, .5, .15)
# ===== FORT: drone only (the heartbeat is foley); one slow Bhairavi bend
A('melody', sitar(Bh(1, 50), .5, [(0, 0), (.6, -1), (1.2, 0)]), 82.2, .45); A('melody', sitar(Bh(0, 50), .4), 84.4, .4)
# ===== STRIKE: rolls rising, ta hits on the chariot, the bell on Naraka's fall, a release
for i in range(16): A('perc', ta(.4 + .04 * i), 86.2 + i * .14, .22, (-1) ** i * .2)
for i in range(6): A('perc', dhin(.8), 86.2 + i * BEAT, .45)
for i in range(12): A('perc', ta(.5 + .04 * i), 88.6 + i * .05, .2, .3)
A('perc', dhin(1), 89.2, .7); A('perc', ta(1), 89.9, .45)
A('bell', bell(1, 147, True), 90.0, .85); A('perc', dhin(1), 90.0, 1.0)
for i, m in enumerate([50, 57, 62, 66]): A('melody', sitar(m, .7), 90.9 + i * .05, .55, -.2 + i * .1)
# ===== FREED (joy): groove + manjira + ghungroo + bansuri
t = 92.2; i = 0
while t < 97.2:
    s = ['dhin', 'ta', 'ge', 'ta'][i % 4]; A('perc', {'dhin': dhin, 'ta': ta, 'ge': ge}[s](.7), t, {'dhin': .45, 'ta': .22, 'ge': .25}[s])
    if i % 2 == 0: A('perc', manjira(.5, i % 4 == 0), t, .12, .4)
    t += BEAT / 2; i += 1
phrase('melody', [(Y(4), 1), (Y(5), 1), (Y(7), 2, {'meend': (2, .25)}), (Y(6), 1), (Y(5), 1), (Y(4), 2)], 93.4, .5, -.15)
# ===== GWALIOR: slow Bhairavi alap on the string
for i, (m, bd) in enumerate([(Bh(4, 50), [(0, 0), (.4, -1), (.8, 0)]), (Bh(3, 50), None), (Bh(1, 50), [(0, 0), (.3, -1)]), (Bh(0, 50), None)]):
    A('melody', sitar(m, .55, bd), 101.6 + i * 1.5, .5, -.1)
A('perc', dhin(.6), 101.4, .3); A('perc', dhin(.6), 104.3, .3)
# ===== TAILS: one pluck per pair as it comes out of the gate (an ascending run that turns into the Yaman scale), a light walking pulse
plk = [e['t'] for e in ev if e['type'] == 'pluck']
for j, tt in enumerate(plk): A('melody', sitar(Y(j % 8 + (j // 8) * 0, 50 + 12 * (j // 13)), .45 + .015 * j), tt, .38, -.4 + .8 * (j % 2))
for i in range(10): A('perc', ge(.45) if i % 2 else dhin(.5), 107.8 + i * BEAT, .18 if i % 2 else .3)
# ===== TEMPLE: bansuri Yaman over the drone, soft manjira
phrase('melody', [(Y(7), 3, {'meend': (2, .4)}), (Y(6), 1), (Y(4), 2), (Y(5), 1), (Y(6), 1), (Y(4), 4), (Y(3), 1), (Y(2), 1), (Y(4), 2)], 115.2, .5, .1)
for i in range(4): A('perc', manjira(.4, True), 115.0 + i * 1.8, .1, .3)
# ===== ACT 5 + TEACHER: bansuri only, Bhairavi for the passing, Yaman again for the small lamps
phrase('melody', [(Bh(4), 2, {'meend': (1, .3)}), (Bh(3), 1), (Bh(1), 1), (Bh(0), 4)], 122.3, .45, -.1)
phrase('melody', [(Bh(0), 2), (Bh(1), 1), (Bh(3), 1), (Bh(4), 3, {'meend': (2, .4)}), (Bh(3), 1), (Bh(1), 2), (Bh(0), 4), (None, 2), (Bh(-2), 2), (Bh(0), 6)], 126.6, .42, .1)
for tt in [128.0, 129.6, 131.0, 132.4, 133.4]: A('bell', bell(.4, 660), tt, .12, .3)
phrase('melody', [(Y(0), 1), (Y(2), 1), (Y(4), 2), (Y(6), 1), (Y(7), 3, {'meend': (1, .3)})], 135.4, .42, -.1)
# ===== SILENCE: nothing (the match is foley). PEAK: five flares on the beat, each with dhin + bell; then the full ensemble
for i, p in enumerate(PEAKF): A('perc', dhin(1), p, .85); A('bell', bell(1, [196, 220, 247, 262, 294][i], i == 4), p, .5 + .06 * i, -.4 + .2 * i)
t = PEAKF[4] + BEAT; i = 0
while t < 153.6:
    s = ['dhin', 'ta', 'ge', 'dhin', 'ta', 'ge', 'ta', 'ta'][i % 8]; A('perc', {'dhin': dhin, 'ta': ta, 'ge': ge}[s](.75), t, {'dhin': .45, 'ta': .22, 'ge': .25}[s], (-1) ** i * .1)
    if i % 2 == 0: A('perc', manjira(.6, i % 4 == 0), t, .13, .4)
    if i % 8 == 0: A('perc', ghungroo(.6, .5), t, .15, -.4)
    t += BEAT / 2; i += 1
phrase('melody', [(Y(7), 2, {'meend': (2, .3)}), (Y(9), 1), (Y(8), 1), (Y(7), 2), (Y(6), 1), (Y(4), 1), (Y(5), 2), (Y(4), 1), (Y(2), 1), (Y(4), 4)], 146.6, .55, -.1)
for i, m in enumerate([50, 57, 62]): A('melody', sitar(m, .7), 146.3 + i * .06, .5, .2)
A('bell', bell(1, 147, True), 153.5, .7); A('perc', dhin(1), 153.5, .8)
# ===== CLOSE: bansuri over the drone; a small bell when the end plaque lands; the last bell tail
phrase('melody', [(Y(4), 3), (Y(2), 1), (Y(3), 2, {'meend': (1, .3)}), (Y(2), 1), (Y(0), 5)], 155.2, .42, .1)
A('bell', bell(.7, 392), 160.4, .3)
phrase('melody', [(Y(2), 1), (Y(4), 1), (Y(7), 6, {'meend': (2, .4)})], 161.2, .38, -.1)
A('bell', bell(.8, 196, True), 166.6, .45)

# ---------------- hard cut at the silence (≤ 30 ms, tails included), master fade at the very end ----------------
a, b = int(SIL[0] * SR), int(SIL[1] * SR); ramp = int(.025 * SR)
for k, s_ in stems.items():
    s_[a:a + ramp] *= np.linspace(1, 0, ramp)[:, None]; s_[a + ramp:b] = 0
    fe = int(166.8 * SR); n2 = int(168 * SR); s_[fe:n2] *= np.linspace(1, 0, n2 - fe)[:, None]; s_[n2:] = 0
def arms(x):
    from scipy.ndimage import uniform_filter1d; e = np.sqrt(np.maximum(uniform_filter1d((x ** 2).mean(1), int(.4 * SR)), 0)); act = e > e.max() * .05
    return 20 * np.log10(np.sqrt((x[act] ** 2).mean()) + 1e-12)
for k, s_ in stems.items(): print(k, 'active rms', round(arms(s_), 1))
GAIN = dict(drone=.5, perc=1.0, bell=.9, melody=3.4, shehnai=.42)
mix = sum(stems[k] * GAIN[k] for k in stems)
pk = np.abs(mix).max(); mix = mix / pk * .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'score.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
for k, s_ in stems.items(): print(k, 'rms dB', round(20 * np.log10(np.sqrt((s_ ** 2).mean()) / pk + 1e-9), 1))
print('score.wav', round(DUR, 1), 's')
with open(os.path.join(HERE, 'out', 'instruments.json'), 'w') as f: json.dump(['flute', 'oboe'], f)
