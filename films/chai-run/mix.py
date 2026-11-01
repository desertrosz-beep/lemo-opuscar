"""Chai Run mix: the user's track (the only music) + procedural SFX from events.json → out/mix.wav (48 kHz stereo)."""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ.get('LIB', os.path.abspath(os.path.join(HERE, '../..')))
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, step, click, crash, whoosh, thump, compress, limit, add

rng = np.random.default_rng(11)
ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']; N = int(DUR * SR)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)

# —— music: decode the user's mp3 at 48 kHz, untouched ——
wav = os.path.join(HERE, 'out/music48.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(HERE, 'music.mp3'), '-ar', str(SR), '-ac', '2', wav], check=True)
mus, _ = sf.read(wav, dtype='float32'); mus = mus[:N]
music = np.zeros((N, 2), np.float32); music[:len(mus)] = mus

def sine(f, d): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, (int(round(d * SR)),))) / SR)
def tail(x, d=.6, a=.25):   # small room reverb: a few decaying echoes
    out = np.concatenate([x, np.zeros(int(d * SR))])
    for k, (dl, g) in enumerate([(.031, .5), (.047, .4), (.071, .33), (.113, .25), (.17, .17), (.25, .1)]):
        s = int(dl * SR); out[s:s + len(x)] += lp(x, 4000 - k * 500) * g * a * 2
    return out

def scratch():   # vinyl scratch: a pitched noisy tone pushed back then forward
    d = .42; tt = t_(d); sp = np.interp(tt, [0, .12, .2, .32, .42], [1, -1.6, -.2, 1.8, .4])
    ph = np.cumsum(sp * 380 / SR) * 2 * np.pi
    x = np.sin(ph) * .6 + np.sin(ph * 2.01) * .3 + bp(noise(d), 600, 4000) * .5 * np.abs(sp)
    return norm(x * np.minimum(1, np.abs(sp) * 1.5) * np.sin(np.pi * tt / d) ** .3)
def rewind(d):   # tape spooling back: rising whine + hiss with flutter
    tt = t_(d); f = 900 + 2600 * (tt / d) ** .7 + 60 * np.sin(2 * np.pi * 17 * tt)
    return norm(sine(f, d) * .35 + hp(noise(d), 3000) * .5) * np.minimum(1, tt / .04) * np.minimum(1, (d - tt) / .06)
def kettle(d):   # whistle: two close partials, swelling, with vibrato and breath
    tt = t_(d); f = 2050 + 90 * np.minimum(1, tt / .5) + 18 * np.sin(2 * np.pi * 6.5 * tt)
    amp = np.minimum(1, tt / .45) ** 2 * np.minimum(1, (d - tt) / .12)
    x = sine(f, d) + .4 * sine(f * 1.012, d) + .12 * sine(f * 2, d) + bp(noise(d), 1700, 2600) * .35
    return norm(x * amp)
def clink(v=1):
    d = .5; tt = t_(d); x = sum(a * np.sin(2 * np.pi * f * tt) * env_exp(d, tau) for f, a, tau in [(3150, 1, .12), (4620, .6, .08), (6230, .4, .05), (2280, .3, .15)])
    return norm(x + hp(noise(d), 5000) * env_exp(d, .004) * .6) * v
def shatter():   # many glasses: a crash, a cloud of tinkles, a low body
    d = 1.6; out = np.zeros(int(d * SR))
    c = crash(1.0); out[:len(c)] += c * .8
    for k in range(60):
        s = int((rng.random() ** 2) * 1.1 * SR); cl = clink(.2 + rng.random() * .5)[: int(.3 * SR)]
        cl = np.interp(np.arange(len(cl)) * (0.8 + rng.random() * .9), np.arange(len(cl)), cl)
        out[s:s + len(cl)] += cl[:len(out) - s]
    out[:int(.3 * SR)] += lp(noise(.3), 250) * env_exp(.3, .06) * 1.2
    return norm(tail(out, .5, .3))
def pistol():
    d = .5; tt = t_(d)
    x = hp(noise(d), 300) * env_exp(d, .012) * 1.4 + lp(noise(d), 900) * env_exp(d, .05) + np.sin(2 * np.pi * 60 * tt) * env_exp(d, .09) * .8
    return norm(tail(x, 1.4, .55))
def horn():
    d = .7; tt = t_(d); sq = lambda f: np.sign(np.sin(2 * np.pi * f * tt))
    return norm(lp(sq(392) + sq(466), 2500) * np.minimum(1, tt / .02) * np.minimum(1, (d - tt) / .05))
def busby(d):   # engine roar passing
    tt = t_(d); f = 55 + 15 * np.sin(np.pi * tt / d)
    x = lp(np.sign(np.sin(2 * np.pi * np.cumsum(np.full(len(tt), 1.0) * f) / SR)), 600) * .6 + bp(noise(d), 200, 1500) * .8
    return norm(x * np.sin(np.pi * tt / d) ** 2)
def snap():
    d = .12; return norm(hp(noise(d), 1200) * env_exp(d, .01) + np.sin(2 * np.pi * 180 * t_(d)) * env_exp(d, .02) * .6)
def clang():
    d = 1.2; tt = t_(d); x = sum(a * np.sin(2 * np.pi * f * tt) * env_exp(d, tau) for f, a, tau in [(523, 1, .5), (1187, .7, .35), (1960, .5, .25), (2890, .3, .15)])
    return norm(x * (1 + .3 * np.sin(2 * np.pi * 9 * tt)))
def tick(v=1):
    d = .03; return norm(hp(noise(d), 4000) * env_exp(d, .002) + np.sin(2 * np.pi * 5200 * t_(d)) * env_exp(d, .003)) * v
def wclick():   # stopwatch button: a double mechanical click
    a = click(1.4, 1.0); b = click(1.8, .7); out = np.zeros(len(a) + int(.035 * SR)); out[:len(a)] += a; out[int(.035 * SR):int(.035 * SR) + len(b)] += b
    return norm(tail(out, .3, .2))
def paper():
    d = .45; tt = t_(d); return norm(bp(noise(d), 1500, 7000) * (np.abs(np.sin(2 * np.pi * 14 * tt)) ** 2) * np.sin(np.pi * tt / d))
def tape():
    d = .35; tt = t_(d); crk = (rng.random(len(tt)) > .985) * 1.0
    return norm(bp(noise(d), 800, 6000) * .6 + lp(crk, 6000) * 2) * np.sin(np.pi * tt / d) ** .5
def slap():
    d = .2; return norm(lp(noise(d), 2500) * env_exp(d, .015) + thump(.5, 110)[:int(d * SR)] * .5)
def breath(v=1):
    d = .9; tt = t_(d); return norm(bp(noise(d), 500, 2500) * np.sin(np.pi * tt / d) ** 2) * v
def door():
    return norm(thump(1, 60) + lp(noise(.35), 1200) * env_exp(.35, .03))
def birds(d):   # morning birds + a far dog: sparse chirps over a soft wind
    out = lp(noise(d), 500) * .08
    for k in range(int(d * 2.2)):
        s = rng.random() * (d - .3); n = rng.integers(2, 5); f0 = 2800 + rng.random() * 1800
        for j in range(n):
            cd = .06 + rng.random() * .05; tt = t_(cd); ch = np.sin(2 * np.pi * np.cumsum(f0 * (1 + .25 * np.sin(np.pi * tt / cd)) * np.ones(len(tt))) / SR) * np.sin(np.pi * tt / cd)
            i = int((s + j * .09) * SR); out[i:i + len(ch)] += ch[:len(out) - i] * .3
    return out
def crowd(d, rise=False, slow=False):   # stadium crowd: babble bands + cheering swells
    tt = t_(d); x = np.zeros(len(tt))
    for k in range(8):
        f = 300 + k * 260; mod = .6 + .4 * np.sin(2 * np.pi * (.3 + rng.random()) * tt + rng.random() * 6)
        x += bp(noise(d), f, f * 1.6) * mod
    x += bp(noise(d), 1800, 4200) * .5 * (np.sin(2 * np.pi * .7 * tt) * .5 + .5)
    env = np.minimum(1, tt / .3) * np.minimum(1, (d - tt) / .4)
    if rise: env *= .35 + .65 * np.minimum(1, tt / (d * .8))
    x = norm(x * env)
    if slow: x = lp(np.interp(np.arange(len(x)) * .6, np.arange(len(x)), x), 1400)
    return x

def stereo(x, pan=0.0):
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([x * l * 1.414, x * r * 1.414], 1)
fx = np.zeros((N, 2), np.float32); bed = np.zeros((N, 2), np.float32)
for e in ev['ev']:
    t, ty, v = e['t'], e['type'], e.get('v', 1.0)
    if ty == 'step':
        s = step(1.0) + thump(.5, 90)[:int(.05 * SR)] * .6
        if e.get('slow'): s = lp(np.interp(np.arange(int(len(s) / .45)) * .45, np.arange(len(s)), s), 1500)
        add(fx, s, t, .62 * v, (rng.random() - .5) * .3)
    elif ty == 'scratch': add(fx, scratch(), t, .8)
    elif ty == 'rewind': add(fx, rewind(e['d']), t, .35)
    elif ty == 'kettle': add(fx, kettle(e['d']), t, .3, .2)
    elif ty == 'clink': add(fx, clink(), t, .4 * v, .2)
    elif ty == 'door': add(fx, door(), t, .5)
    elif ty == 'whoosh': add(fx, whoosh(e.get('d', .35)), t, .3 * v)
    elif ty == 'horn': add(fx, horn(), t, .32, .4)
    elif ty == 'busby': add(fx, busby(e['d']), t, .4, .3)
    elif ty == 'paper': add(fx, paper(), t, .3, -.3)
    elif ty == 'snap': add(fx, snap(), t, .5)
    elif ty == 'shatter': add(fx, shatter(), t, 1.0)
    elif ty == 'clang': add(fx, clang(), t, .3)
    elif ty == 'click': add(fx, wclick(), t, .75)
    elif ty == 'tick': add(fx, tick(), t, .3 * v)
    elif ty == 'slap': add(fx, slap(), t, .45)
    elif ty == 'tape': add(fx, tape(), t, .45 * v)
    elif ty == 'breath': add(fx, breath(), t, .3 * v)
    elif ty == 'pistol': add(fx, pistol(), t, 1.5)
    elif ty == 'birds': add(bed, birds(e['d']), t, .35)
    elif ty == 'crowd': add(bed, crowd(e['d'], e.get('rise'), e.get('slow')), t, .32 * v)
fx = np.stack([compress(fx[:, 0], .5, 3), compress(fx[:, 1], .5, 3)], 1)
duck = np.ones(N, np.float32)
for e in ev['ev']:
    if e['type'] in ('pistol', 'scratch'):   # short duck so the hit cuts through the track
        i = int(e['t'] * SR); a, b = i - int(.01 * SR), i + int(.35 * SR); duck[a:b] = np.minimum(duck[a:b], np.linspace(.5, 1, b - a) ** 2)
mix = music * .82 * duck[:, None] + fx + bed
mix[int((1403 / 24) * SR):] *= 0   # hard stop with the picture
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
sf.write(os.path.join(HERE, 'out/mix.wav'), mix, SR, subtype='PCM_24')
print('mix', mix.shape, 'peak', float(np.abs(mix).max()))
