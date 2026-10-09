import json
def load(S):
    raw = json.load(open(S+'/app/data/raw.json', encoding='utf-8'))
    bls = json.load(open(S+'/app/data/bls.json', encoding='utf-8'))
    recs = [r for arr in raw['recipes'] for r in arr]
    ings = {i['id']: i for i in raw['ingredients'][0]}
    return recs, ings, bls, raw['images'][0]
def grams(ing, amount, unit):
    if unit == 'g': return amount
    if unit == 'ml': return amount * ing.get('densityGPerMl', 1)
    if unit == 'TL': return amount * ing.get('gramsPerTeaspoon', (ing.get('gramsPerTablespoon', 12) / 3))
    if unit == 'Stück': return amount * ing.get('gramsPerPiece', 100)
    return amount
KEYS = ['ENERCC','PROT625','FAT','CHO','FIBT','SUGAR','FASAT','FAPUN3','NACL']
def per_portion(r, ings, bls):
    tot = {k: 0.0 for k in KEYS}; gr = {}
    for row in r["ingredients"]:
        iid, amt, unit = row[0], row[1], row[2]
        g = grams(ings[iid], amt, unit); gr[iid] = g
        n = bls.get(iid, {}).get('nutritionPer100g')
        if not n: continue
        for k in KEYS:
            v = n.get(k)
            if v: tot[k] += v * g / 100
    s = (r['servings'] or 1) / r.get('per', 1)
    return {k: v / s for k, v in tot.items()}, {k: v / s for k, v in gr.items()}
