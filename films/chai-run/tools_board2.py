from PIL import Image, ImageDraw, ImageFont
B = 'look/board2/n_'
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; FR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
shots = [
 ('5.0', '3a', '4.46–6.45', 'MEDIUM in the stall', 'Grabs the tray of 12'),
 ('7.0', '3b', '6.45–7.96', 'TRACK out the door', 'Into gold light, 12/12'),
 ('11.95', '5a', '11.46–12.9', 'SIDE TRACK, bus wipe', 'Dodges the bus'),
 ('13.5', '5b', '12.9–13.92', 'TWO-SHOT', 'Never looks up: 11/12'),
 ('14.8', '6a', '13.92–15.4', 'LOW ANGLE kids', 'Laughing; DISTRICT MEET'),
 ('15.9', '6b', '15.4–16.42', 'INSERT chappals', 'Torn strap, their shadows'),
 ('22.8', '9a', '21.92–23.9', 'MEDIUM, Coach', 'Tapes the poster up'),
 ('24.6', '9b', '23.9–25.42', 'BUST, push in', 'Chhotu stares at it'),
 ('26.3', '10a', '25.42–27.4', 'SIDE TRACK', 'Racing the bus'),
 ('28.3', '10b', '27.4–29.4', 'CLOSE, whip', 'Tray faster, dead level'),
 ('30.3', '10c', '29.4–31.4', 'FULL, stairs ×1.75', 'Sprinting the stairs'),
 ('32.4', '10d', '31.4–33.92', 'GRAPHIC', 'Counter spins, 2:00 → 1:28'),
 ('40.8', '12', '39.42–41.92', 'CROUCH at the line', 'Breathing; pistol 41.9'),
 ('1.9', '1', '0–2.46', 'FINISH (open)', 'White-shirt runner, freeze'),
 ('53.9', '14', '50.92–54.42', 'FINISH = shot 1', 'Same framing, tape breaks'),
 ('57.9', '15b', '55.9–58.45', 'LOW ANGLE', 'Glass clear, CTA lower'),
]
w, h, cols, pad, th = 252, 448, 8, 12, 104
f1 = ImageFont.truetype(F, 20); f2 = ImageFont.truetype(F, 14); f3 = ImageFont.truetype(FR, 14); ft = ImageFont.truetype(F, 30)
W = cols * (w + pad) + pad; H = 80 + 2 * (h + th + pad)
S = Image.new('RGB', (W, H), (24, 18, 30)); d = ImageDraw.Draw(S)
d.text((pad, 22), 'CHAI RUN — new boards (3, 5, 6, 9, 10) + fixes (12, 14 = 1, 15b)', font=ft, fill=(255, 214, 150))
for k, (t, no, tm, fr, ln) in enumerate(shots):
    x, y = pad + (k % cols) * (w + pad), 80 + (k // cols) * (h + th + pad)
    S.paste(Image.open(B + t + '.jpg').convert('RGB').resize((w, h)), (x, y))
    d.text((x, y + h + 6), 'SHOT ' + no, font=f1, fill=(255, 170, 80)); d.text((x + 128, y + h + 10), tm, font=f2, fill=(230, 220, 240))
    d.text((x, y + h + 36), fr, font=f2, fill=(240, 240, 240)); d.text((x, y + h + 60), ln, font=f3, fill=(200, 190, 215))
S.save('storyboard2.jpg', quality=90); print(S.size)
M = Image.new('RGB', (2160, 1920)); M.paste(Image.open('look/board/model_day_1.jpg'), (0, 0)); M.paste(Image.open('look/board/coach_sun_1.jpg'), (1080, 0)); M.save('model_sheets.jpg', quality=90)
