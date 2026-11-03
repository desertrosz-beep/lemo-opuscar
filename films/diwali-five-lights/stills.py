"""poster.jpg (1920×1080) and thumbnail.jpg (1280×720, "NOT ONLY RAM") from the real peak frame (t = 150.6, no subtitle)"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
H = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(H, '../..'))
out = os.path.join(H, 'out', 'st'); os.makedirs(out, exist_ok=True)
for i in range(3):
    if subprocess.call(['node', 'core/render/still.mjs', H, '150.6', '--q', 'nosub=1', '--prefix', 'peak_', '--out', out], cwd=LIB) == 0: break
src = Image.open(os.path.join(out, 'peak_150.6.jpg')).convert('RGB')
VF = os.path.join(H, 'fonts', 'CormorantGaramond-VF.ttf'); VI = os.path.join(H, 'fonts', 'CormorantGaramond-Italic-VF.ttf')
def font(path, size, w=700):
    f = ImageFont.truetype(path, size)
    try: f.set_variation_by_axes([w])
    except Exception: pass
    return f
def plaque(img, box, r=18):
    d = ImageDraw.Draw(img, 'RGBA'); d.rounded_rectangle(box, r, fill=(34, 15, 8, 236)); x0, y0, x1, y1 = box
    d.rounded_rectangle((x0 + 9, y0 + 9, x1 - 9, y1 - 9), r - 6, outline=(176, 134, 64, 220), width=3)
# poster: the film's title on a lacquer plaque over the peak line-up
P = src.copy(); d = ImageDraw.Draw(P)
plaque(P, (360, 880, 1560, 1060))
t1, t2 = 'FIVE LAMPS', 'Why Diwali Is Celebrated  ·  a shadow puppet tale'
f1, f2 = font(VF, 96, 700), font(VI, 40, 600)
d.text((960, 935), t1, font=f1, fill=(246, 226, 186), anchor='mm', spacing=0); d.text((960, 1012), t2, font=f2, fill=(220, 180, 120), anchor='mm')
P.save(os.path.join(H, 'poster.jpg'), quality=92)
# thumbnail: three words, big, high contrast
Tn = src.resize((1280, 720), Image.LANCZOS)
band = Image.new('RGBA', (1280, 720), (0, 0, 0, 0)); bd = ImageDraw.Draw(band)
bd.rounded_rectangle((30, 22, 1030, 182), 20, fill=(30, 12, 6, 240)); bd.rounded_rectangle((40, 32, 1020, 172), 14, outline=(196, 150, 70, 255), width=4)
Tn = Image.alpha_composite(Tn.convert('RGBA'), band)
d = ImageDraw.Draw(Tn); f = font(VF, 128, 700)
w1 = d.textlength('NOT ONLY ', font=f); w2 = d.textlength('RAM', font=f); x = 530 - (w1 + w2) / 2
glow = Image.new('RGBA', (1280, 720), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
gd.text((x, 100), 'NOT ONLY ', font=f, fill=(255, 190, 90, 160), anchor='lm'); gd.text((x + w1, 100), 'RAM', font=f, fill=(255, 150, 60, 200), anchor='lm')
Tn = Image.alpha_composite(Tn, glow.filter(ImageFilter.GaussianBlur(10))); d = ImageDraw.Draw(Tn)
d.text((x, 100), 'NOT ONLY ', font=f, fill=(250, 236, 205), anchor='lm'); d.text((x + w1, 100), 'RAM', font=f, fill=(255, 168, 52), anchor='lm')
Tn.convert('RGB').save(os.path.join(H, 'thumbnail.jpg'), quality=92)
print('poster.jpg', P.size, 'thumbnail.jpg', Tn.size)
