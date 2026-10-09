"""Bringt alle Monster auf dieselbe Größe: gleicher Körper (Füße bis Hornspitze), gleiche Standlinie, gleiche Bildfläche."""
import sys, os, numpy as np
from PIL import Image
from scipy import ndimage
S = sys.argv[1]; U = '/root/.claude/uploads/714a0e9d-e2ed-5fd4-8abe-1a3aa7661807/'
M = {'kontrolle':'8991ad21','balance':'4c5002e8','stress':'2f6e62b7','reiz':'7fc3ae58','gewohnheit':'b1f13718','belohnung':'14322552','allesnichts':'25597778','trost':'65e7df53'}
ZIEL = 300  # Körperhöhe in Pixeln
teile = {}
for name, f in M.items():
    im = Image.open(U + f + '-image.png').convert('RGBA')
    a = np.array(im.getchannel('A')); a[a < 40] = 0
    im.putalpha(Image.fromarray(a))
    maske = a > 120
    lab, n = ndimage.label(maske)
    gr = ndimage.sum(maske, lab, range(1, n + 1)); haupt = lab == (int(np.argmax(gr)) + 1)
    ys, xs = np.where(haupt); oben, unten = ys.min(), ys.max()
    h = unten - oben + 1
    # Körpermitte aus dem Rumpf (mittlere Zeilen, mittlere 60 % der Breite gewichtet über den Median)
    mitte = []
    for y in range(int(oben + h * 0.45), int(oben + h * 0.8)):
        zx = np.where(haupt[y])[0]; mitte.append((zx.min() + zx.max()) / 2)
    cx = float(np.median(mitte))
    # Rumpfbreite als zweites Maß, damit dünne und breite Figuren vergleichbar bleiben
    breiten = [np.ptp(np.where(haupt[y])[0]) for y in range(int(oben + h * 0.55), int(oben + h * 0.75))]
    ay, ax = np.where(maske)
    teile[name] = dict(im=im, h=h, cx=cx, unten=unten, rumpf=float(np.median(breiten)), links=cx - ax.min(), rechts=ax.max() - cx, hoch=unten - ay.min())
    print(f"{name:12} Körperhöhe {h:5} Rumpfbreite {teile[name]['rumpf']:6.0f}  Verhältnis {teile[name]['rumpf']/h:.2f}")
# Maßstab je Figur: gleiche Körperhöhe
for t in teile.values(): t['k'] = ZIEL / t['h']
halb = max(max(t['links'], t['rechts']) * t['k'] for t in teile.values())
hoch = max(t['hoch'] * t['k'] for t in teile.values())
W, H = int(2 * halb + 12), int(hoch + 12)
os.makedirs(S + '/app/assets/monster', exist_ok=True)
for name, t in teile.items():
    im = t['im']; k = t['k']
    kl = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    blatt = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    blatt.alpha_composite(kl, (round(W / 2 - t['cx'] * k), round(H - 6 - (t['unten'] + 1) * k)))
    out = S + '/app/assets/monster/' + name + '.webp'
    blatt.save(out, 'WEBP', quality=84, method=6)
print('Bildfläche', W, 'x', H)
namen = ['allesnichts', 'reiz', 'balance', 'gewohnheit', 'belohnung', 'kontrolle', 'trost', 'stress']
sheet = Image.new('RGB', (len(namen) * (W // 2 + 6), H // 2 + 20), (232, 250, 250))
for i, n in enumerate(namen):
    im = Image.open(S + '/app/assets/monster/' + n + '.webp').convert('RGBA').resize((W // 2, H // 2), Image.LANCZOS)
    sheet.paste(im, (i * (W // 2 + 6) + 3, 10), im)
sheet.save(S + '/app/check/monster-sheet.png')
