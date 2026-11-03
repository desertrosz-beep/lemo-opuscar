"""Mix for "Five Lamps": foley (hide, wood, clay, fire, cloth) from events.json + narration + score (ducked under the voice) → out/mix.wav
Run from the library root: .venv/bin/python films/diwali-five-lights/mix.py"""
import sys, os, json, numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, creak, whoosh, compress, limit, add, heartbeat
from scipy.signal import fftconvolve
from scipy.ndimage import uniform_filter1d
EV = json.load(open(os.path.join(HERE, 'events.json'))); DUR = EV['dur']; ev = EV['ev']
N = int(DUR * SR) + SR
fx = np.zeros((N, 2)); vo = np.zeros((N, 2)); amb = np.zeros((N, 2))
rng = np.random.default_rng(11)
SIL = (140.2, 143.4)

def room_ir(d=.7, damp=3000):
    n = int(d * SR); e = np.exp(-np.arange(n) / SR / (d / 6.9)); ir = np.stack([lp(rng.standard_normal(n), damp) * e, lp(rng.standard_normal(n), damp) * e], 1)
    ir[0] = 1; return ir / np.abs(ir).sum(0) * 6
def verb(x, ir, mix=.25):
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1); return x * (1 - mix) + y * mix

# ---------------- foley ----------------
def woodclap(v=1.):        # the storyteller's wooden clapper
    d = .5; tt = t_(d); x = hp(noise(d), 900) * env_exp(d, .002) * 1.2
    x += sum(a * np.sin(2 * np.pi * f * tt + rng.random() * 6) * env_exp(d, tau) for f, a, tau in [(1150, .7, .03), (2350, .5, .018), (3500, .3, .01), (620, .4, .05)])
    return norm(x + np.sin(2 * np.pi * 140 * tt) * env_exp(d, .04) * .8) * v
def match_(v=1.):
    d = .6; tt = t_(d); am = lp((rng.random(len(tt)) > .7) * 1.0, 60)
    x = bp(noise(d), 1800, 6500) * am * np.minimum(1, tt / .03) * np.exp(-np.maximum(0, tt - .18) / .05)
    return norm(x + lp(noise(d), 1500) * np.sin(np.clip((tt - .15) / .45, 0, 1) * np.pi) * .6) * v
def fwoomp(v=1., d=.8, f=900):
    tt = t_(d); e = np.minimum(1, tt / .06) * np.exp(-tt / (d / 3))
    return norm(lp(noise(d), f) * e + np.sin(2 * np.pi * 70 * tt) * e * .4) * v
def clay(v=1.):            # clay lamp touched on wood
    d = .15; tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * tt) * env_exp(d, tau) for f, a, tau in [(760, 1, .03), (1830, .5, .015), (3100, .3, .01)]) + hp(noise(d), 2000) * env_exp(d, .003)) * v
def rodtap(v=1.):
    d = .12; tt = t_(d)
    return norm(hp(noise(d), 1500) * env_exp(d, .003) + sum(a * np.sin(2 * np.pi * f * tt) * env_exp(d, tau) for f, a, tau in [(1800, .5, .01), (3200, .3, .006)]) + lp(noise(d), 500) * env_exp(d, .015) * .6) * v
def flap(v=1.):            # hide lifting off the cloth
    d = .2; tt = t_(d); return norm(bp(noise(d), 600, 5000) * np.sin(np.pi * tt / d) ** 2 * (1 + .6 * np.sin(2 * np.pi * 30 * tt))) * v
def leather_step(v=1.):
    d = .07; tt = t_(d); return norm(bp(noise(d), 900, 4000) * env_exp(d, .006) + np.sin(2 * np.pi * 380 * tt) * env_exp(d, .01) * .5) * v
def twang(v=1.):
    d = .6; tt = t_(d); f = 196 * (1 + .03 * np.exp(-tt / .02))
    return norm(sum(a * np.sin(2 * np.pi * f * k * tt) * env_exp(d, .18 / k) for k, a in [(1, 1), (2, .5), (3, .35), (4, .2)]) + hp(noise(d), 2000) * env_exp(d, .004) * .6) * v
def thwack(v=1.):
    d = .25; tt = t_(d); return norm(bp(noise(d), 300, 2500) * env_exp(d, .02) + np.sin(2 * np.pi * 160 * tt * (1 - tt)) * env_exp(d, .05)) * v
def snuff(v=1.):
    d = .7; tt = t_(d); return norm(lp(noise(d), 700) * env_exp(d, .05) * 1.2 + hp(noise(d), 4000) * np.minimum(1, tt / .05) * env_exp(d, .25) * .35) * v
def cloth(v=1., d=.7):
    tt = t_(d); am = lp(rng.random(len(tt)), 25); return norm(bp(noise(d), 1500, 6500) * am * np.sin(np.pi * tt / d)) * v
def stone(v=1.):
    d = .3; tt = t_(d); return norm(lp(noise(d), 900) * env_exp(d, .03) + np.sin(2 * np.pi * (110 + 40 * rng.random()) * tt) * env_exp(d, .06)) * v
def coin(v=1.):
    d = .5; tt = t_(d); f = 2600 + rng.random() * 1200
    return norm(sum(a * np.sin(2 * np.pi * f * r * tt) * env_exp(d, tau) for r, a, tau in [(1, 1, .15), (2.76, .5, .08), (5.4, .25, .04)])) * v
def tick(v=1.):
    d = .08; tt = t_(d); return norm(hp(noise(d), 2500) * env_exp(d, .004) + np.sin(2 * np.pi * 1300 * tt) * env_exp(d, .012) * .6) * v
def crowd_bed(d, v=1.):
    tt = t_(d); am = lp(rng.random(len(tt)), 8); x = bp(noise(d), 300, 2200) * (.4 + am)
    return x * np.minimum(1, tt / .6) * np.minimum(1, (d - tt) / .6) * v
def sea_bed(d):
    tt = t_(d); sw = .55 + .45 * np.sin(2 * np.pi * tt / 3.2) ** 2; x = lp(noise(d), 900) * sw + bp(noise(d), 1500, 5000) * sw ** 3 * .25
    return x * np.minimum(1, tt / .8) * np.minimum(1, (d - tt) / .8)
def fire_bed(d):
    out = lp(brown(d), 200) * .8; tt = t_(d)
    for _ in range(int(d * 24)):
        s = int(rng.random() * (len(out) - 2000)); c = hp(noise(.01), 2500) * env_exp(.01, .0015) * (.3 + rng.random()); out[s:s + len(c)] += c * .8
    return out * np.minimum(1, tt / .5) * np.minimum(1, (d - tt) / .5)
def water_bed(d):
    tt = t_(d); m = lp(rng.random(len(tt)), 6); return bp(noise(d), 500, 3500) * (.4 + m) * np.minimum(1, tt / 1.0) * np.minimum(1, (d - tt) / 1.0)
def wind_bed(d):
    tt = t_(d); return bp(noise(d), 200, 1200) * (.5 + .5 * lp(rng.random(len(tt)), 2)) * np.sin(np.pi * tt / d)
def room_bed(d):
    tt = t_(d); return (lp(brown(d), 250) * .6) * np.minimum(1, tt / .5) * np.minimum(1, (d - tt) / .4)
def rattle(v=1.):
    out = np.zeros(int(.6 * SR))
    for k in range(6): s = int(k * .07 * SR + rng.random() * 800); c = sum(a * np.sin(2 * np.pi * f * t_(.12)) * env_exp(.12, .03) for f, a in [(420, 1), (1130, .6), (2400, .3)]); out[s:s + len(c)] += c * (1 - k * .12)
    return norm(out) * v
def wheel_bed(d):
    tt = t_(d); return lp(brown(d), 120) * (1 + .5 * np.sin(2 * np.pi * 4 * tt)) * np.sin(np.pi * tt / d)
def whirr(d):
    tt = t_(d); f = 9 + 8 * np.sin(np.pi * tt / d); am = .5 + .5 * np.sin(2 * np.pi * np.cumsum(f) / SR)
    return bp(noise(d), 1500, 6000) * am * np.sin(np.pi * tt / d)
def gate_creak(d):
    out = np.zeros(int((d + .3) * SR)); k = 0.0
    while k < d: c = creak(.5 + k / d * .3); s = int(k * SR); out[s:s + len(c)] += c * (.6 + .4 * np.sin(np.pi * k / d)); k += .1
    return lp(out, 2500)
def sand(d=1.2):
    tt = t_(d); return hp(noise(d), 3000) * (lp(rng.random(len(tt)), 30)) * np.sin(np.pi * tt / d)
def chime(v=1.):
    d = 2.0; tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * tt) * env_exp(d, tau) for f, a, tau in [(1320, 1, .7), (3610, .4, .3)])) * v

G = dict(clap=.9, pilot=.2, liftoff=.22, rodtap=.3, match=.55, catch=.5, step=.2, wind=.3, deerhop=.25, swap=.3, thwack=.5, cloth=.25,
         whip=.4, press=.25, stone=.3, whoosh=.35, creak=.28, twang=.45, arrow=.35, tick=.25, rise=.25, coin=.18, door=.3, sand=.2,
         rattle=.3, whirr=.12, gate=.35, tinyflare=.12, snuff=.35, swish=.18)
for e in ev:
    ty, t, v = e['type'], e['t'], e.get('v', 1)
    if ty == 'clap': add(fx, woodclap(v), t, G[ty])
    elif ty == 'pilot': add(fx, fwoomp(1, .9, 700), t, G[ty])
    elif ty == 'match': add(fx, match_(v), t, G[ty] * (1.4 if e.get('solo') else 1), .3)
    elif ty == 'catch': add(fx, fwoomp(1, .7, 1300), t, G[ty] * (.6 if e.get('quiet') else 1), -.4 + .2 * e.get('k', 2)); add(fx, clay(.7), t - .05, .2)
    elif ty == 'liftoff': add(fx, flap(v), t, G[ty])
    elif ty == 'rodtap': add(fx, rodtap(v), t, G[ty])
    elif ty == 'press': add(fx, rodtap(v), t, G[ty]); add(fx, flap(.6), t - .1, G[ty] * .6)
    elif ty == 'step': add(fx, leather_step(v), t, G[ty], -.2 + .4 * rng.random())
    elif ty == 'wind': add(amb, wind_bed(e['d']), t, .25)
    elif ty == 'deerhop': add(fx, leather_step(v), t, .3); add(fx, rodtap(.5), t + .02, .15)
    elif ty == 'swap': add(fx, flap(1), t, G[ty]); add(fx, fwoomp(1, .5, 600), t, .2)
    elif ty == 'thwack': add(fx, thwack(v), t, G[ty])
    elif ty == 'cloth': add(fx, cloth(1), t, G[ty])
    elif ty == 'whip': add(fx, whoosh(.35, 1), t, G[ty])
    elif ty == 'sea': add(amb, sea_bed(e['d']), t, .2)
    elif ty == 'stone': add(fx, stone(v), t, G[ty], -.5 + rng.random())
    elif ty == 'crowd': add(amb, crowd_bed(e['d'], v), t, .12)
    elif ty == 'whoosh': add(fx, whoosh(e.get('d', .6), 1), t, G[ty])
    elif ty == 'creak':
        d = e.get('d', .3); k = 0.0
        while k < d: add(fx, creak(1 + k / max(d, .01) * .5), t + k, G[ty] * v * (.6 + .4 * k / max(d, .01)), -.1); k += .11
    elif ty == 'twang': add(fx, twang(v), t, G[ty], -.1)
    elif ty == 'arrow': add(fx, whoosh(max(.2, e['d'] + .1), 1), t, G[ty], .2)
    elif ty == 'fire': add(amb, fire_bed(e['d']), t, .3)
    elif ty == 'tick': add(fx, tick(1), t, G[ty], -.3 + .05 * e.get('i', 0))
    elif ty == 'rise': add(fx, whoosh(e['d'], 1), t, G[ty])
    elif ty == 'coin': add(fx, coin(v), t, G[ty], -.5 + rng.random())
    elif ty == 'door': add(fx, gate_creak(e['d']), t, G[ty])
    elif ty == 'sand': add(fx, sand(), t, G[ty])
    elif ty == 'heart':
        k = 0.0
        while k < e['d']: add(fx, heartbeat(1), t + k, .22); k += 60 / 66
    elif ty == 'rattle': add(fx, rattle(v), t, G[ty])
    elif ty == 'wheel': add(amb, wheel_bed(e['d']), t, .1)
    elif ty == 'whirr': add(fx, whirr(e['d']), t, G[ty], .3)
    elif ty == 'gate': add(fx, gate_creak(e['d']), t, G[ty])
    elif ty == 'water': add(amb, water_bed(e['d']), t, .1)
    elif ty == 'ting': add(fx, chime(.6), t, .08, .3)
    elif ty == 'tinyflare': add(fx, fwoomp(.6, .35, 1600), t, G[ty], -.6 + 1.2 * (e['i'] % 9) / 8)
    elif ty == 'snuff': add(fx, snuff(v), t, G[ty], -.5 + .25 * e['i'])
    elif ty == 'swish': add(fx, whoosh(.5, 1), t, G[ty])
    elif ty == 'room': add(amb, room_bed(e['d']), t, .1)
# backstage room tone + a faint wick crackle whenever the theatre is lit
add(amb, room_bed(SIL[0] - .6), .6, .07); add(amb, room_bed(DUR - SIL[1]), SIL[1], .07)

# ---------------- narration ----------------
vo_env = np.zeros(N)
for e in ev:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = soxr.resample(y, sr, SR); y = compress(norm(y, .9), .3, 3); y = y + lp(y, 250) * .2
    add(vo, y, e['t'], 1.35); s = int(e['t'] * SR); vo_env[s:s + len(y)] = 1
vo = verb(vo, room_ir(.9), .14)

# ---------------- music + ducking ----------------
m, sr = sf.read(os.path.join(HERE, 'out', 'score.wav'))
if sr != SR: m = soxr.resample(m, sr, SR)
mus = np.zeros((N, 2)); mus[:min(N, len(m))] = m[:N]
k = np.clip(uniform_filter1d(vo_env, int(.25 * SR)) * 1.6, 0, 1)
mus *= (10 ** (-12 * k / 20))[:, None]
fx = verb(fx, room_ir(.6), .18); fx *= (10 ** (-4 * k / 20))[:, None]; amb *= (10 ** (-5 * k / 20))[:, None]
# the silence: hard-cut every bed (≤ 25 ms), only the match strike stays inside
a, b = int(SIL[0] * SR), int(SIL[1] * SR); r = int(.025 * SR)
for x in (mus, amb):
    x[a:a + r] *= np.linspace(1, 0, r)[:, None]; x[a + r:b] = 0
keep = np.zeros(N);
for e in ev:
    if e['type'] == 'match' and SIL[0] < e['t'] < SIL[1]: s = int(e['t'] * SR); keep[s - 100:s + int(.9 * SR)] = 1
inside = np.zeros(N); inside[a + r:b] = 1; fx[(inside > 0) & (keep == 0)] = 0
mix = mus * .9 + fx + amb + vo
mix = np.stack([limit(mix[:, c], .95) for c in range(2)], 1)[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
def rms(x): return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('mix.wav', mix.shape, 'peak', np.abs(mix).max().round(3))
print('silence', round(rms(mix[a + r:int(142.3 * SR)]), 1), 'dB (should be ~ -inf)')
bed = (mus * .9 + fx + amb)[:int(DUR * SR)]
worst = 99
for e in ev:
    if e['type'] != 'vo': continue
    s0, s1 = int(e['t'] * SR), int((e['t'] + 1.5) * SR); d = rms(vo[s0:s1]) - rms(bed[s0:s1]); worst = min(worst, d)
    print(f"{e['id']:3s} voice-over-bed {d:5.1f} dB")
print('worst voice-over-bed', round(worst, 1), 'dB')
# low end check (20–120 Hz vs the rest)
X = np.abs(np.fft.rfft(mix.mean(1))); f = np.fft.rfftfreq(len(mix), 1 / SR)
lo = (X[(f > 20) & (f < 120)] ** 2).sum(); rest = (X[(f >= 120) & (f < 12000)] ** 2).sum()
print('low end 20-120 Hz vs rest', round(10 * np.log10(lo / rest), 1), 'dB')
