# storyboard sheet: frames with shot number, framing, timing and a line under each
import sys
from PIL import Image, ImageDraw, ImageFont
B = 'look/board/'
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; FR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
shots = [
 ('b_1.5.jpg', '1', '0–2.46 s', 'WIDE side track, slow-mo', 'Overtake at the line, freeze 2.0'),
 ('b_3.8.jpg', '2', '2.46–4.46 s', 'REW noise → INSERT kettle', 'Scratch, rewind to 5 AM, whistle'),
 ('b_9.5.jpg', '4', '7.96–11.46 s', 'FULL, crane up the stairway', 'Tray level, steps on beat, 0→300'),
 ('b_17.4.jpg', '7', '16.42–18.25 s', 'MEDIUM, slow-mo trip', 'Glasses fly; impact at 17.90'),
 ('b_18.9.jpg', '8a', '18.25–19.4 s', 'BUST, light band', 'Silence. Stopwatch click'),
 ('b_21.2.jpg', '8c', '20.5–21.92 s', 'INSERT stopwatch', 'After ECU eyes widening: 2:00'),
 ('b_38.9.jpg', '11d', '38.42–39.42 s', 'ECU bare feet (stab 3)', 'Sneakers on 34.41 and 36.41'),
 ('b_44.8.jpg', '13b', '43.9–45.9 s', 'SIDE TRACK, smears', 'Overtakes; stair flashes later'),
 ('b_55.3.jpg', '15a', '54.42–55.9 s', 'TWO-SHOT hand-over', 'Coach hands him the chai'),
 ('b_57.6.jpg', '15b', '55.9–58.45 s', 'LOW ANGLE, backlit', 'Glass to the sun, black 58.45'),
]
extra = [('b_17.95.jpg', '7', 'impact frame 17.90'), ('b_19.95.jpg', '8b', 'ECU coach eyes'), ('b_33.95.jpg', '11a', 'start line, last lane'), ('b_35.2.jpg', '11b', 'sneaker ECU 34.41'), ('b_46.8.jpg', '13c', 'ECU eyes, radial lines'), ('b_52.6.jpg', '14', 'finish, = shot 1 framing')]
w, h = 324, 576; cols = 5; pad = 14; th = 118
f1 = ImageFont.truetype(F, 22); f2 = ImageFont.truetype(F, 16); f3 = ImageFont.truetype(FR, 15); ft = ImageFont.truetype(F, 34)
rows = 2; ew, eh = 216, 384
W = cols * (w + pad) + pad; H = 90 + rows * (h + th + pad) + 60 + eh + 50
S = Image.new('RGB', (W, H), (24, 18, 30)); d = ImageDraw.Draw(S)
d.text((pad, 24), 'CHAI RUN — storyboard · 80s cel anime at sunrise · 1080×1920 · 24 fps · 58.5 s', font=ft, fill=(255, 214, 150))
for k, (fn, no, tm, fr, ln) in enumerate(shots):
    x, y = pad + (k % cols) * (w + pad), 90 + (k // cols) * (h + th + pad)
    S.paste(Image.open(B + fn).convert('RGB').resize((w, h)), (x, y))
    d.text((x, y + h + 8), f'SHOT {no}', font=f1, fill=(255, 170, 80)); d.text((x + 150, y + h + 12), tm, font=f2, fill=(230, 220, 240))
    d.text((x, y + h + 40), fr, font=f2, fill=(240, 240, 240)); d.text((x, y + h + 66), ln, font=f3, fill=(200, 190, 215))
y0 = 90 + rows * (h + th + pad) + 10
d.text((pad, y0), 'In-betweens', font=f1, fill=(255, 214, 150))
for k, (fn, no, ln) in enumerate(extra):
    x = pad + k * (ew + pad + 40)
    S.paste(Image.open(B + fn).convert('RGB').resize((ew, eh)), (x, y0 + 40))
    d.text((x, y0 + 44 + eh), f'{no} · {ln}', font=f3, fill=(220, 210, 230))
S.save('storyboard.jpg', quality=90); print(S.size)
M = Image.new('RGB', (2160, 1920)); M.paste(Image.open(B + 'chhotu_1.jpg'), (0, 0)); M.paste(Image.open(B + 'coach_1.jpg'), (1080, 0)); M.save('model_sheets.jpg', quality=90)
