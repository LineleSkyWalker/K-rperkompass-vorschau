import re, json, subprocess, sys, os
src, out = sys.argv[1], sys.argv[2]
b = open(src, encoding='utf-8', errors='replace').read()

def literal_from(start):
    """Return the JS literal ([...] or {...}) starting at index start, string-aware."""
    open_ch = b[start]; close = {'[':']','{':'}'}[open_ch]
    depth = 0; i = start; q = None
    while i < len(b):
        c = b[i]
        if q:
            if c == '\\': i += 2; continue
            if c == q: q = None
        else:
            if c in '\'"`': q = c
            elif c in '[{': depth += 1
            elif c in ']}':
                depth -= 1
                if depth == 0: return b[start:i+1]
        i += 1
    raise SystemExit('unbalanced')

def find_all_arrays(marker):
    res = []
    for m in re.finditer(re.escape(marker), b):
        # walk back to the enclosing '[' that directly precedes the first object
        j = m.start()
        if b[j-1] == '[': res.append(j-1)
    return res

parts = {}
# recipes: several arrays "[{slug:'"
rec_starts = find_all_arrays("{slug:'")
parts['recipes'] = [literal_from(s) for s in rec_starts]
# ingredients: arrays starting with "[{id:'" that contain category:
ing = []
for s in find_all_arrays("{id:'"):
    lit = literal_from(s)
    if 'category:' in lit[:400] and ('blsHint' in lit or 'allergens' in lit): ing.append(lit)
parts['ingredients'] = ing
# images map
m = re.search(r'"RECIPE_IMAGES",\{enumerable:!0,get:function\(\)\{return (\w+)\}\}\);const \1=', b)
parts['images'] = [literal_from(m.end())] if m else []
# bls map: object containing haferflocken:{blsCode
m = re.search(r'haferflocken:\{blsCode', b)
k = m.start()
# walk back to the opening brace of the enclosing object: find "={" before with balanced scanning
cand = [x.end()-1 for x in re.finditer(r'=\{', b[:k])]
bls = None
for s in reversed(cand[-400:]):
    try:
        lit = literal_from(s)
    except SystemExit:
        continue
    if s + len(lit) > k and 'blsCode' in lit[:300]:
        bls = lit; break
parts['bls'] = [bls] if bls else []
js = 'const out={};\n'
for key, lits in parts.items():
    js += f'out[{json.dumps(key)}]=[' + ','.join(lits) + '];\n'
js += f'require("fs").writeFileSync({json.dumps(out)}, JSON.stringify(out));\n'
tmp = out + '.gen.js'
open(tmp, 'w', encoding='utf-8').write(js)
subprocess.run(['node', tmp], check=True)
os.remove(tmp)
d = json.load(open(out, encoding='utf-8'))
print({k: [len(x) for x in v] for k, v in d.items()})
