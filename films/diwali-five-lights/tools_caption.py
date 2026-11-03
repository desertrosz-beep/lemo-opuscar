# Caption storyboard frames: shot number, framing, duration, line (then tiled with core/render/sheet.py)
import sys; from PIL import Image, ImageDraw, ImageFont
F = sys.argv[1]
font = ImageFont.truetype(F + '/fonts/CormorantGaramond-VF.ttf', 30); small = ImageFont.truetype(F + '/fonts/CormorantGaramond-VF.ttf', 26)
B = [
 ('5.6', '1 · HOLE', 'Full-frame dark hide, slow pull-out as carved rings lift off', '0–13.0 s', 'H2 "Five stories. Five lamps. And almost nobody knows all of them."'),
 ('14.9', '2 · THE FIRST LAMP', 'Close on the Lamp Rail; crash zoom on the dholak + bell catch', '13.0–16.8 s', 'R1 "The first lamp is for a prince."'),
 ('19.6', '3 · EXILE', 'Full, lateral pan from the Ayodhya gate into the forest', '16.8–23.2 s', 'R2 "Ram was sent into the forest for 14 years…"'),
 ('49.0', '4 · RETURN', 'Locked wide: windows uncovered one per beat outward; shehnai', '39.6–52.0 s', 'R6 "So the people of Ayodhya lit a lamp in every window…"'),
 ('66.9', '5 · RISE', 'Medium push-in: sea strip lifts off, Lakshmi rises, coins rain', '64.2–69.2 s', 'L3 "Out of the waves rose Lakshmi…"'),
 ('89.5', '6 · STRIKE', 'Full; whip pan with the chakra; Naraka falls on the bell @90.0', '86.0–92.2 s', 'K3 "Krishna and his queen Satyabhama rode out against him…"'),
 ('110.6', '7 · TAILS', 'Full, lateral pan along 52 kings holding the robe tails', '107.6–114.6 s', 'G3 "…52 kings held the tails of his robe…"'),
 ('130.2', '8 · TEACHER', 'Frontal medium, locked, very slow push; openwork grows to all hole', '125.8–140.2 s', 'M2 "On this night, Jains believe, Lord Mahavira attained nirvana…"'),
 ('150.6', '9 · PEAK', 'All five lamps lit, cloth bleached gold; pull back to the audience seat', '143.4–153.8 s', 'P2 "And every one of them ends the same way."'),
]
for i, (t, n, fr, d, l) in enumerate(B):
    im = Image.open(f'{F}/stills/sb_{t}.jpg').convert('RGB'); W, H = im.size
    out = Image.new('RGB', (W, H + 170), (24, 14, 10)); out.paste(im, (0, 0)); g = ImageDraw.Draw(out)
    g.text((24, H + 14), n, font=ImageFont.truetype(F + '/fonts/CormorantGaramond-VF.ttf', 46), fill=(243, 214, 160))
    g.text((W - 24, H + 22), d, font=font, fill=(220, 180, 120), anchor='ra')
    g.text((24, H + 72), fr, font=font, fill=(232, 220, 200)); g.text((24, H + 118), l, font=small, fill=(200, 170, 130))
    out.save(f'{F}/storyboard/shot{i + 1:02d}.jpg', quality=90)
