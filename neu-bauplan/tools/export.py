import sys, json, collections, base64, io
sys.path.insert(0, '.')
from nutri import load
from classify import *
S = sys.argv[1]
recs, ings, bls, imgs = load(S)
import os
_bp = S + '/app/data/brote.json'
if os.path.exists(_bp): recs = recs + json.load(open(_bp, encoding='utf-8'))
_np = S + '/app/data/neue.json'
NEU = set()
if os.path.exists(_np):
    _neue = json.load(open(_np, encoding='utf-8')); NEU = {r['slug'] for r in _neue}; recs = recs + _neue
assert len({r['slug'] for r in recs}) == len(recs), 'doppelte Kennung'
def pro(r):
    if 'unit' not in r: return 'pro Portion'
    return 'pro ' + (r['unit'][0] if r['per'] == 1 else str(r['per']) + ' ' + r['unit'][1])

NICE = {'rote-zwiebel':'rote Zwiebel','griechischer-joghurt':'griechischer Joghurt','ei':'Ei','tomaten-dose':'Tomaten','tomaten-passiert':'Tomaten','beeren-gemischt':'Beeren','erbsen-tk':'Erbsen','edamame-tk':'Edamame','spinat-tk':'Spinat','quark-20':'Quark','reis-vollkorn':'Naturreis','linsen-gegart':'Linsen','linsen-braun':'Linsen','rote-linsen':'rote Linsen','pasta-kurz':'Pasta','hering-matjes':'Matjes','rote-bete-roh':'Rote Bete','sellerieknolle':'Knollensellerie','olivenoel':'Olivenöl','karotte':'Möhren','gurke':'Gurke','lachsfilet':'Lachs','kabeljaufilet':'Kabeljau','zanderfilet':'Zander'}
def nice(i, dat=False):
    if dat and i in DAT: return DAT[i]
    if i in NOM: return NOM[i]
    if i in NICE: return NICE[i]
    return ings[i]['name'].split(',')[0].split('(')[0].strip()
DAT = {'weisse-bohnen-dose':'weißen Bohnen','schwarze-bohnen-dose':'schwarzen Bohnen','gruene-bohnen':'grünen Bohnen','rote-linsen':'roten Linsen','rote-zwiebel':'roten Zwiebeln','griechischer-joghurt':'griechischem Joghurt','rote-bete':'Roter Bete','rote-bete-roh':'Roter Bete'}
NOM = {'weisse-bohnen-dose':'weiße Bohnen','schwarze-bohnen-dose':'schwarze Bohnen','gruene-bohnen':'grüne Bohnen'}
import re as _re
def kurz_fix(t):
    def rep(m):
        vor = t[:m.start()]
        satz = _re.split(r'[.–:]', vor)[-1]
        adj = m.group(1).lower()
        return (adj + 'n' if ' mit ' in ' ' + satz else adj) + ' Bohnen'
    return _re.sub(r'\b(Weiße|Schwarze|Grüne) Bohnen\b', rep, t)
def join(xs):
    xs = list(dict.fromkeys(xs))
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' und ' + xs[-1]
def top(g, key, k=2, skip=()):
    c = []
    for i, gr in g.items():
        n = bls.get(i, {}).get('nutritionPer100g') or {}
        v = (n.get(key) or 0) * gr / 100
        if v > 0 and i not in skip: c.append((v, i))
    c.sort(reverse=True)
    return [nice(i, True) for v, i in c[:k]]
def de(x, d=0):
    s = f'{x:.{d}f}'.replace('.', ',')
    return s
def reasons(r, n, g, f, x):
    w = {}; PP = pro(r)
    if f['ballast']: w['ballast'] = f"{de(n['FIBT'])} g Ballaststoffe {PP}, vor allem aus {join(top(g,'FIBT'))}."
    if f['eiweiss']: w['eiweiss'] = f"{de(n['PROT625'])} g Eiweiß {PP}, vor allem aus {join(top(g,'PROT625'))}."
    if f['blutzucker']: w['blutzucker'] = f"{de(n['FIBT'])} g Ballaststoffe und {de(n['PROT625'])} g Eiweiß {PP}, kaum zugesetzter Zucker."
    if f['mittelmeer']:
        veg, extra, leg, fish = x['med']
        parts = sorted(fish, key=lambda i: -g[i])[:1] + sorted(veg, key=lambda i: -g[i])[:2] + sorted(leg, key=lambda i: -g[i])[:1]
        if len(parts) < 2: parts += sorted(extra, key=lambda i: -g[i])[:2]
        w['mittelmeer'] = f"Olivenöl, {join([nice(i) for i in parts[:3]])}: typische Zutaten der Mittelmeerküche."
    if f['nordisch']:
        its = []
        for grp in x['nord'][:4]:
            its += sorted(grp, key=lambda i: -g[i])[:1]
        w['nordisch'] = f"{join([nice(i) for i in its])}: heimische Zutaten der nordischen Küche."
    if f['ausgewogen']:
        st = sorted([i for i in g if i in STARCH], key=lambda i: -g[i])[:1]
        w['ausgewogen'] = f"Rund {de(round(x['veg']/10)*10)} g Gemüse und Obst, dazu {join([nice(i) for i in st])} und {de(n['PROT625'])} g Eiweiß pro Portion."
    return w

FORM_ORDER = ['ausgewogen','mittelmeer','nordisch','blutzucker','ballast','eiweiss']
ALL_ORDER = ['vegetarisch','vegan','familie','schnell','mealprep','wenig','klassiker','besonders']
MEAL = {'breakfast':'fr','lunch':'ma','dinner':'ma','snack':'sn','dessert':'de','bread':'br'}
out = []; cf = collections.Counter(); ca = collections.Counter()
for r in recs:
    n, g, f, a, x = classify(r, ings, bls)
    w = reasons(r, n, g, f, x)
    al = sorted({al for row in r['ingredients'] for al in ings[row[0]].get('allergens', [])})
    im = imgs.get(r['slug'], {})
    if os.path.exists(S + '/app/assets/fotos/' + r['slug'] + '.jpg'):   # eigenes, mit KI erstelltes Bild
        im = {'url': 'fotos/' + r['slug'] + '.jpg', 'attribution': 'Bild mit KI erstellt, dient als Serviervorschlag'}
    meals = list(dict.fromkeys(MEAL[m] for m in r['mealTypes']))
    for k in FORM_ORDER: cf[k] += f[k]
    for k in ALL_ORDER: ca[k] += a[k]
    out.append({'s': r['slug'], 't': r['title'], 'k': kurz_fix(r['short']), 'm': meals, 'p': r['prep'], 'c': r['cook'], 'n': r['servings'],
                'i': r['ingredients'], 'st': r['steps'], 'f': [k for k in FORM_ORDER if f[k]], 'a': [k for k in ALL_ORDER if a[k]], 'w': w,
                'nu': [round(n['ENERCC']), round(n['PROT625'],1), round(n['FAT'],1), round(n['CHO'],1), round(n['FIBT'],1), round(n['SUGAR'],1)],
                'al': al, 'im': im.get('url',''), 'at': im.get('attribution',''), 'su': im.get('sourceUrl','')})
    if r['slug'] in NEU: out[-1]['neu'] = 1
    if 'unit' in r:
        out[-1].update({'rz': r.get('rest', 0), 'eh': r['unit'], 'pp': r['per'], 'np': pro(r), 'neu': 1})
used = {row[0] for r in recs for row in r['ingredients']}
ing_out = {i: [v['name'], v.get('plural'), v['category']] for i, v in ings.items() if i in used}
json.dump({'R': out, 'I': ing_out}, open(S + '/app/data/data.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('Formen:', dict(cf)); print('Alltag:', dict(ca))
print('ohne Form:', sum(1 for o in out if not o['f']), '| Größe data.json KB:', len(json.dumps({'R': out, 'I': ing_out}, ensure_ascii=False))//1024)
for k in FORM_ORDER:
    ex = [o for o in out if k in o['f']]
    for o in ex[:: max(1, len(ex)//3)][:3]: print(f"  [{k}] {o['t']}: {o['w'][k]}")
print(' Mittelmeer alle:', [o['t'] for o in out if 'mittelmeer' in o['f']])
