p='src/template.html'; s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)>=1, 'FEHLT: '+a[:80]
    s=s.replace(a,b,1)

rep('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Kristi&family=Nunito+Sans:opsz,wght@6..12,300;6..12,400;6..12,600;6..12,700&display=swap">','{{FONTS}}')

rep('.fuss { border-top:', '''/* Monster */
img.m { display: block; height: auto; }
.zitat.mit { margin-top: 46px; padding-top: 62px; }
.zitat.mit img.m { position: absolute; top: -52px; left: 50%; transform: translateX(-50%); width: 104px; }
.zitat.mit::before { top: 44px; }
.leer img.m { width: 118px; }
.titel.mitm { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 14px; align-items: end; }
.titel.mitm > div { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.titel.mitm img.m { width: 84px; }
.typen { background: linear-gradient(165deg, #1AC7C9 0%, #6FDCDB 60%, #BDEFEE 100%); border-radius: 26px; padding: 26px 18px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
.typen .schreib { font-family: var(--schreib); font-size: clamp(42px, 10vw, 56px); line-height: .85; color: var(--weiss); }
.typen h2 { font-family: var(--display); font-weight: 400; font-size: clamp(26px, 6vw, 34px); letter-spacing: .06em; line-height: 1.05; text-wrap: balance; }
.typen p { font-weight: 400; max-width: 52ch; }
.typen ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px 8px; width: 100%; max-width: 880px; }
@media (min-width: 760px) { .typen ul { grid-template-columns: repeat(8, minmax(0, 1fr)); } .typen { padding: 34px 28px 30px; } }
.typen li { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; min-width: 0; }
.typen li img.m { width: 100%; max-width: 92px; }
.typen li span { font-family: var(--display); font-size: 13px; letter-spacing: .06em; line-height: 1.05; overflow-wrap: anywhere; }
a.gross { text-decoration: none; }
.neu { position: absolute; top: 8px; left: 8px; background: var(--gelb); font-family: var(--display); font-size: 13px; letter-spacing: .1em; padding: 2px 9px; border-radius: 999px; z-index: 1; }
.fuss { border-top:''')

rep("    teller: '<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/>',",
    "    teller: '<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/>',\n    brot: '<path d=\"M4 11a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4c0 1.3-.7 2.3-1.5 2.8V18a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-4.2C4.7 13.3 4 12.3 4 11z\"/><path d=\"M9.5 10.5l1.3 2M13.2 10.5l1.3 2\"/>',")
rep("  function ic(n) {", """  var MO = { allesnichts: '{{M_allesnichts}}', reiz: '{{M_reiz}}', balance: '{{M_balance}}', gewohnheit: '{{M_gewohnheit}}', belohnung: '{{M_belohnung}}', kontrolle: '{{M_kontrolle}}', trost: '{{M_trost}}', stress: '{{M_stress}}' };
  var TYPEN = [['allesnichts', 'Alles oder nichts'], ['reiz', 'Reiz'], ['balance', 'Balance'], ['gewohnheit', 'Gewohnheit'], ['belohnung', 'Belohnung'], ['kontrolle', 'Kontrolle'], ['trost', 'Trost'], ['stress', 'Stress']];
  function mo(n) { return '<img class="m" src="' + MO[n] + '" alt="" loading="lazy">'; }
  function ic(n) {""")

rep("['sn', 'Snack'], ['de', 'Dessert']];", "['sn', 'Snack'], ['de', 'Dessert'], ['br', 'Brot & Gebäck']];")
rep("Snacks und Desserts ab 8 g Ballaststoffen pro Portion.'", "Snacks und Desserts ab 8 g Ballaststoffen pro Portion, Brot ab 6 g pro zwei Scheiben.'")
rep("Snacks und Desserts ab 15 g Eiweiß pro Portion.'", "Snacks und Desserts ab 15 g Eiweiß pro Portion, Brot ab 12 g pro zwei Scheiben.'")

rep("  function ruhe(r) { return r.c >= 120 ? r.c : 0; }\n  function stunden(min) { var h = Math.round(min / 30) / 2; return zahl(h) + ' Std.'; }",
    "  function ruhe(r) { return r.rz || (r.c >= 120 ? r.c : 0); }\n  function stunden(min) { if (min < 120) return min + ' Min.'; var h = Math.round(min / 30) / 2; return zahl(h) + ' Std.'; }\n  function brot(r) { return !!r.eh; }\n  function mengeText(r, n) { return brot(r) ? n + ' ' + (n === 1 ? r.eh[0] : r.eh[1]) : n + (n === 1 ? ' Portion' : ' Portionen'); }")
rep("(ruhe(r) ? ' + ' + stunden(ruhe(r)) + ' Ruhezeit' : '')", "(ruhe(r) ? ' + ' + stunden(ruhe(r)) + (brot(r) ? ' Gehzeit' : ' Ruhezeit') : '')")

rep("""'<span class="foto">' + ic('teller') + (r.im ?""", """'<span class="foto">' + ic(brot(r) ? 'brot' : 'teller') + (r.neu ? '<span class="neu">Neu</span>' : '') + (r.im ?""")

rep("""'<section class="zitat"><p>Du musst dich nicht für eine Ernährungsform entscheiden.</p>""", """'<section class="zitat mit">' + mo('balance') + '<p>Du musst dich nicht für eine Ernährungsform entscheiden.</p>""")
rep("""        '<footer class="fuss"><p>Fotos: Wikimedia Commons.""", """        '<section class="typen"><div><div class="schreib">Dein Essenstyp</div><h2>Warum isst du, wie du isst?</h2></div>' +
          '<ul>' + TYPEN.map(function (t) { return '<li>' + mo(t[0]) + '<span>' + t[1] + '</span></li>'; }).join('') + '</ul>' +
          '<p>Essen ist selten nur Essen. Der kostenlose Test zeigt dir in 3 bis 5 Minuten, welche Muster dein Essverhalten gerade prägen.</p>' +
          '<a class="gross" href="https://app.dein-koerperkompass.de" target="_blank" rel="noopener">Zum Essenstyp-Test</a></section>' +
        '<footer class="fuss"><p>Fotos: Wikimedia Commons.""")

rep("""'<div class="leer"><div class="schreib">Nichts gefunden</div>""", """'<div class="leer">' + mo('allesnichts') + '<div class="schreib">Nichts gefunden</div>""")
rep("""'<div class="leer"><div class="schreib">Noch leer</div>""", """'<div class="leer">' + mo('balance') + '<div class="schreib">Noch leer</div>""")
rep("""'<div class="leer"><div class="schreib">Noch nichts geplant</div>""", """'<div class="leer">' + mo('belohnung') + '<div class="schreib">Noch nichts geplant</div>""")
rep("""'<div class="seite ansicht"><div class="titel"><h2>Wochenplan</h2><p>Plane so viel oder so wenig, wie dir guttut. Ein Tag ohne Plan ist auch ein Plan.</p></div>' +""",
    """'<div class="seite ansicht"><div class="titel mitm"><div><h2>Wochenplan</h2><p>Plane so viel oder so wenig, wie dir guttut. Ein Tag ohne Plan ist auch ein Plan.</p></div>' + mo('kontrolle') + '</div>' +""")

rep("""'<div class="foto">' + ic('teller') + (r.im ? '<img alt="" src="' + esc(r.im) + '">' : '')""", """'<div class="foto' + (r.im ? '' : ' ohne') + '">' + ic(brot(r) ? 'brot' : 'teller') + (r.im ? '<img alt="" src="' + esc(r.im) + '">' : '')""")
rep("""(r.c ? '<span>' + ic('uhr') + (ruhe(r) ? 'Ruhezeit ' + stunden(r.c) : 'Garen ' + r.c + ' Min.') + '</span>' : '') + '</div>' +""",
    """(r.c && r.c < 120 ? '<span>' + ic('uhr') + (brot(r) ? 'Backen ' : 'Garen ') + r.c + ' Min.</span>' : '') + (ruhe(r) ? '<span>' + ic('uhr') + (brot(r) ? 'Gehzeit ' : 'Ruhezeit ') + stunden(ruhe(r)) + '</span>' : '') + '</div>' +""")
rep("""'<div class="tage"><span>Für welchen Tag? Geplant werden ' + Z.portionen + ' Portionen.</span>'""", """'<div class="tage"><span>Für welchen Tag? Geplant wird die Menge für ' + mengeText(r, Z.portionen) + '.</span>'""")
rep("""<button type="button" data-portion="-1" aria-label="Eine Portion weniger"' + (Z.portionen <= 1 ? ' disabled' : '') + '>' + ic('minus') + '</button><output aria-live="polite">' + Z.portionen + (Z.portionen === 1 ? ' Portion' : ' Port.') + '</output><button type="button" data-portion="1" aria-label="Eine Portion mehr"' + (Z.portionen >= 12 ? ' disabled' : '') + '>'""",
    """<button type="button" data-portion="-1" aria-label="Weniger"' + (Z.portionen <= (r.eh ? r.n : 1) ? ' disabled' : '') + '>' + ic('minus') + '</button><output aria-live="polite">' + (brot(r) ? mengeText(r, Z.portionen) : Z.portionen + (Z.portionen === 1 ? ' Portion' : ' Port.')) + '</output><button type="button" data-portion="1" aria-label="Mehr"' + (Z.portionen >= (r.eh ? r.n * 3 : 12) ? ' disabled' : '') + '>'""")
rep("""'<details class="werte"><summary>Nährwerte pro Portion</summary>""", """'<details class="werte"><summary>Nährwerte ' + (r.np || 'pro Portion') + '</summary>""")
rep("""(r.al.length ? '<p class="klein">Enthält: '""", """(r.neu ? '<p class="klein">Neues Rezept, noch nicht probegebacken.</p>' : '') + (r.al.length ? '<p class="klein">Enthält: '""")
rep(""".zaehler output { font-family: var(--display); font-size: 22px; min-width: 3.4em;""", """.zaehler output { font-family: var(--display); font-size: 22px; min-width: 3.4em; white-space: nowrap; padding-inline: 4px;""")

rep("""(x.n <= 1 ? ' disabled' : '') + '>' + ic('minus') + '</button><output>' + x.n + ' P.</output>'""", """(x.n <= (NACH[x.s].eh ? NACH[x.s].n : 1) ? ' disabled' : '') + '>' + ic('minus') + '</button><output>' + x.n + (NACH[x.s].eh ? ' St.' : ' P.') + '</output>'""")
rep("""x.n = Math.max(1, Math.min(12, x.n + Number(p[2])));""", """var sr = NACH[x.s], st = sr.eh ? sr.n : 1; x.n = Math.max(st, Math.min(sr.eh ? sr.n * 3 : 12, x.n + Number(p[2]) * st));""")
rep("""Z.portionen = Math.max(1, Math.min(12, Z.portionen + Number(d.portion)));""", """var ro = Z.offen, sch = ro.eh ? ro.n : 1; Z.portionen = Math.max(sch, Math.min(ro.eh ? ro.n * 3 : 12, Z.portionen + Number(d.portion) * sch));""")
open(p,'w',encoding='utf-8').write(s)
print('ok', len(s))
