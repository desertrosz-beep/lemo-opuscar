"""Subtitle cues from lines.json + voices/dur.json, with the same timing rule the page uses → out/cues.json (then core/render/srt.py)"""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(os.path.join(H, 'lines.json'))); D = json.load(open(os.path.join(H, 'voices', 'dur.json')))
cues = []
for i, v in enumerate(L):
    t1 = v['t'] + max(1.8, D.get(v['id'], 2.5) + .7)
    if i + 1 < len(L): t1 = min(t1, L[i + 1]['t'] - .25)
    cues.append({'t0': v['t'], 't1': round(t1, 3), 'text': v.get('sub') or v['text']})
os.makedirs(os.path.join(H, 'out'), exist_ok=True)
json.dump(cues, open(os.path.join(H, 'out', 'cues.json'), 'w'), indent=1)
short = [c for c in cues if c['t1'] - c['t0'] < 1.8]
print(len(cues), 'cues; shorter than 1.8 s:', short)
