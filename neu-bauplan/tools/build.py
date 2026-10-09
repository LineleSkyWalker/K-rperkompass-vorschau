import sys, json, base64, io, os, shutil
from PIL import Image
S = sys.argv[1]; A = S + '/app'
tpl = open(A + '/src/template.html', encoding='utf-8').read()
data = open(A + '/data/data.json', encoding='utf-8').read().replace('</', '<\\/')
im = Image.open('/home/claude/lineleskywalker/k-rperkompass-vorschau/assets/assets/brand/logo-round.071d8c0a6dcbc5522e336a8a59974ee1.png').convert('RGBA')
im.thumbnail((224, 224), Image.LANCZOS)
buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
logo_png = buf.getvalue()
MON = ['allesnichts', 'reiz', 'balance', 'gewohnheit', 'belohnung', 'kontrolle', 'trost', 'stress']
GOOGLE = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Kristi&family=Nunito+Sans:opsz,wght@6..12,300;6..12,400;6..12,600;6..12,700&display=swap">'

def fill(t, fonts, logo, mon, d=None):
    t = t.replace('{{FONTS}}', fonts).replace('{{LOGO}}', logo)
    for m in MON: t = t.replace('{{M_' + m + '}}', mon(m))
    assert '{{' not in t.replace('{{DATA}}', ''), 'offene Platzhalter'
    return t.replace('{{DATA}}', d or data)

# 1) Vorschau als eine einzige Datei
b64 = lambda b: base64.b64encode(b).decode()
FOTOS = sorted(f for f in os.listdir(A + '/assets/fotos') if f.endswith('.jpg')) if os.path.isdir(A + '/assets/fotos') else []
_j = json.loads(open(A + '/data/data.json', encoding='utf-8').read())
for r in _j['R']:
    if r.get('im', '').startswith('fotos/'):
        _i = Image.open(A + '/assets/' + r['im']).convert('RGB'); _i.thumbnail((400, 300), Image.LANCZOS)
        _b = io.BytesIO(); _i.save(_b, 'JPEG', quality=70, optimize=True)
        r['im'] = 'data:image/jpeg;base64,' + b64(_b.getvalue())
data_one = json.dumps(_j, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
one = fill(tpl, GOOGLE, 'data:image/png;base64,' + b64(logo_png), lambda m: 'data:image/webp;base64,' + b64(open(f'{A}/assets/monster/{m}.webp', 'rb').read()), data_one)
os.makedirs(A + '/dist', exist_ok=True)
open(A + '/dist/index.html', 'w', encoding='utf-8').write(one)

# 2) Fassung für die eigene Adresse: Schriften und Bilder liegen als Dateien daneben
site = A + '/site/neu'
shutil.rmtree(A + '/site', ignore_errors=True)
os.makedirs(site + '/fonts'); os.makedirs(site + '/monster')
F = A + '/check/node_modules/@fontsource'
faces = [('Bebas Neue', 400, F + '/bebas-neue/files/bebas-neue-latin-400-normal.woff2', 'bebas-neue-400.woff2'),
         ('Kristi', 400, F + '/kristi/files/kristi-latin-400-normal.woff2', 'kristi-400.woff2')] + \
        [('Nunito Sans', w, F + f'/nunito-sans/files/nunito-sans-latin-{w}-normal.woff2', f'nunito-sans-{w}.woff2') for w in (300, 400, 600, 700)]
css = ''
for fam, w, src, name in faces:
    shutil.copy(src, site + '/fonts/' + name)
    css += f'@font-face{{font-family:"{fam}";font-style:normal;font-weight:{w};font-display:swap;src:url(fonts/{name}) format("woff2")}}\n'
for m in MON: shutil.copy(f'{A}/assets/monster/{m}.webp', site + '/monster/' + m + '.webp')
if FOTOS:
    os.makedirs(site + '/fotos')
    for f in FOTOS: shutil.copy(A + '/assets/fotos/' + f, site + '/fotos/' + f)
open(site + '/logo.png', 'wb').write(logo_png)
body = fill(tpl, '<style>\n' + css + '</style>', 'logo.png', lambda m: 'monster/' + m + '.webp')
head, rest = body.split('<header class="kopf">', 1)
doc = ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<meta name="robots" content="noindex">\n<meta name="theme-color" content="#1AC7C9">\n<meta name="description" content="Rezepte von KØRPERKOMPASS, sortiert nach Ernährungsformen. Ohne Verbote und ohne Kalorienzählen.">\n'
       '<link rel="icon" href="/favicon.ico">\n'
       '<style>:root{padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}html{-webkit-text-size-adjust:100%}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
       + head + '</head>\n<body>\n<header class="kopf">' + rest + '\n</body>\n</html>\n')
open(site + '/index.html', 'w', encoding='utf-8').write(doc)
# 3) Foto-Check: alle Rezeptfotos zum Durchsehen und Markieren
_d = json.loads(open(A + '/data/data.json', encoding='utf-8').read())
_l = [{'s': r['s'], 't': r['t'], 'u': r['im'].replace('/960px-', '/500px-')} for r in _d['R'] if r.get('im')]
open(site + '/fotos.html', 'w', encoding='utf-8').write(open(A + '/src/fotos.html', encoding='utf-8').read().replace('{{LISTE}}', json.dumps(_l, ensure_ascii=False).replace('</', '<\\/')))
size = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(site) for f in fs)
print('Vorschau-Datei', len(one.encode()) // 1024, 'KB | Ordner neu/', size // 1024, 'KB,', sum(len(fs) for _, _, fs in os.walk(site)), 'Dateien')
