p='src/template.html'; s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1, ('FEHLT/MEHRFACH', s.count(a), a[:90])
    s=s.replace(a,b)

# ---------- CSS
rep('/* Monster */', '''/* Umschalter Übersicht / Swipen */
.umschalter { display: flex; border: 1px solid var(--schwarz); border-radius: 999px; padding: 3px; max-width: 420px; width: 100%; margin-inline: auto; }
.umschalter button { flex: 1; border: 0; background: none; border-radius: 999px; padding: 8px 12px; font-weight: 600; font-size: 15px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
.umschalter button[aria-pressed="true"] { background: var(--schwarz); color: var(--weiss); }
.umschalter svg.i { width: 19px; height: 19px; }
.filterzeile { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
.swipen { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.swipen .hinweis { font-family: var(--display); letter-spacing: .1em; font-size: 15px; }
.stapel { position: relative; width: min(100%, 400px); aspect-ratio: 3 / 4; }
.swipe { position: absolute; inset: 0; background: var(--weiss); border-radius: 26px; box-shadow: 0 10px 30px rgba(17, 17, 17, .16); overflow: hidden; display: flex; flex-direction: column; }
.swipe.hinten { transform: scale(.95) translateY(14px); box-shadow: 0 6px 18px rgba(17, 17, 17, .10); }
.swipe.vorn { touch-action: pan-y; cursor: grab; user-select: none; -webkit-user-select: none; }
.swipe.vorn.zieht { cursor: grabbing; }
.swipe.fliegt { transition: transform .28s ease-in, opacity .28s ease-in; }
.swipe.zurueck { transition: transform .2s ease-out; }
.swipe .foto { border-radius: 0; flex: 1; aspect-ratio: auto; min-height: 0; }
.swipe .foto img { pointer-events: none; }
.swipe .text { padding: 14px 18px 16px; display: flex; flex-direction: column; gap: 6px; }
.swipe h3 { font-family: var(--display); font-weight: 400; font-size: 27px; letter-spacing: .04em; line-height: 1.02; overflow-wrap: anywhere; }
.swipe .meta { font-size: 13px; font-weight: 400; color: var(--grau); }
.swipe .kurztext { font-size: 14px; font-weight: 400; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.stempel { position: absolute; top: 18px; font-family: var(--display); font-size: 26px; letter-spacing: .1em; padding: 2px 14px; border-radius: 10px; border: 3px solid var(--schwarz); background: var(--weiss); opacity: 0; z-index: 2; pointer-events: none; }
.stempel.ja { left: 16px; transform: rotate(-10deg); background: var(--tuerkis); }
.stempel.nein { right: 16px; transform: rotate(10deg); background: var(--gelb); }
.swipeknoepfe { display: flex; align-items: center; justify-content: center; gap: 14px; }
.swipeknoepfe button { border-radius: 50%; border: 1px solid var(--schwarz); background: var(--weiss); display: grid; place-items: center; }
.swipeknoepfe .k-nein, .swipeknoepfe .k-ja { width: 64px; height: 64px; }
.swipeknoepfe .k-ja { background: var(--tuerkis); border-color: var(--tuerkis); }
.swipeknoepfe .k-nein:hover { background: var(--gelb); border-color: var(--gelb); }
.swipeknoepfe .k-klein { width: 46px; height: 46px; }
.swipeknoepfe .k-klein:disabled { opacity: .3; cursor: default; }
.swipeknoepfe svg.i { width: 28px; height: 28px; }
.swipeknoepfe .k-klein svg.i { width: 20px; height: 20px; }
.auftakt .taten { justify-content: center; margin-top: 14px; }
@media (prefers-reduced-motion: reduce) { .swipe.fliegt, .swipe.zurueck { transition: none; } }
/* Monster */''')

# ---------- Icons
rep("    zu: '<path d=\"M6 6l12 12M18 6L6 18\"/>',", "    zu: '<path d=\"M6 6l12 12M18 6L6 18\"/>',\n    karten: '<rect x=\"7\" y=\"4\" width=\"11\" height=\"15\" rx=\"2\" transform=\"rotate(8 12.5 11.5)\"/><path d=\"M5.2 7.2l-1 .3a1.6 1.6 0 0 0-1.1 2l2.6 8.8\"/>',\n    raster: '<rect x=\"4\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"4\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/>',\n    undo: '<path d=\"M9 7L4 12l5 5\"/><path d=\"M4 12h10a5 5 0 0 1 0 10h-2\" transform=\"translate(0 -3)\"/>',\n    auge: '<path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"/><circle cx=\"12\" cy=\"12\" r=\"2.8\"/>',\n    filter: '<path d=\"M4 6h16M7 12h10M10 18h4\"/>',")

# ---------- Zitate mit Bezug zur Rezepte-App
i=s.index("  var TYPEN = ["); j=s.index("  function gedanke(k, text) {")
s=s[:i]+"""  var TYPEN = [
    ['allesnichts', 'Alles-oder-nichts-Esser', 'Du musst nicht jeden Tag frisch kochen. Ein neues Rezept pro Woche ist auch ein Anfang.'],
    ['reiz', 'Reiz-Esser', 'Das Foto macht Appetit? Merk dir das Rezept und koch es, wenn du Hunger hast.'],
    ['balance', 'Balance-Esser', 'Heute Linsensuppe, morgen Bananenbrot. Hier hat beides Platz.'],
    ['gewohnheit', 'Gewohnheits-Esser', 'Dein Lieblingsgericht darf bleiben. Swipe dir einfach ein neues dazu.'],
    ['belohnung', 'Belohnungs-Esser', 'Dessert steht hier ganz normal im Wochenplan. Verdienen musst du es dir nicht.'],
    ['kontrolle', 'Kontroll-Esser', 'Ein Rezept ist ein Vorschlag, keine Vorschrift. Tausch ruhig Zutaten aus.'],
    ['trost', 'Trost-Esser', 'Suppe, Auflauf, Porridge: Manche Rezepte dürfen einfach guttun.'],
    ['stress', 'Stress-Esser', 'Keine Zeit? Filter auf Schnell und nimm das Erste, das dich anlacht.']
  ];
"""+s[j:]
rep("<p>Du kennst sie aus dem Essenstyp-Test. Hier hat jedes einen Satz für dich.</p>", "<p>Du kennst sie aus dem Essenstyp-Test. Hier hat jedes einen Satz für deine Küche.</p>")

# ---------- Zustand
rep("fav: [], plan: {}, haken: [], waehlTag: '',", "fav: [], plan: {}, haken: [], gesehen: [], modus: 'liste', filterAuf: false, letzter: null, waehlTag: '',")
rep("      Z.haken = alt.haken || [];", "      Z.haken = alt.haken || [];\n      Z.gesehen = (alt.gesehen || []).filter(function (s) { return NACH[s]; });")
rep("JSON.stringify({ fav: Z.fav, plan: Z.plan, haken: Z.haken })", "JSON.stringify({ fav: Z.fav, plan: Z.plan, haken: Z.haken, gesehen: Z.gesehen })")

# ---------- Entdecken: Einstieg ins Swipen
rep("""'<p>' + R.length + ' Ideen für jeden Tag. Ohne Verbote und ohne Kalorienzählen.</p>' +""",
    """'<p>' + R.length + ' Ideen für jeden Tag. Ohne Verbote und ohne Kalorienzählen.</p>' +
        '<div class="taten"><button class="gross" type="button" data-start="swipe">' + ic('karten') + 'Rezepte swipen</button><button class="gross rand" type="button" data-start="liste">' + ic('raster') + 'Zur Übersicht</button></div>' +""")

# ---------- Rezepte-Ansicht: Umschalter, Filterzeile, Swipe-Stapel
a_start = s.index("    var aktivFilter = Z.formen.length || Z.alltag.length || Z.mahl || Z.q;")
a_end = s.index("  function merkliste() {")
neu = r"""    var aktivFilter = Z.formen.length || Z.alltag.length || Z.mahl || Z.q;
    var swipe = Z.modus === 'swipe' && !Z.waehlTag;
    var anzahlFilter = Z.formen.length + Z.alltag.length + (Z.mahl ? 1 : 0) + (Z.q ? 1 : 0);
    var umschalter = Z.waehlTag ? '' : '<div class="umschalter"><button type="button" data-modus="liste" aria-pressed="' + !swipe + '">' + ic('raster') + 'Übersicht</button><button type="button" data-modus="swipe" aria-pressed="' + swipe + '">' + ic('karten') + 'Swipen</button></div>';
    var filter = '<section class="filter">' +
        '<label class="suche">' + ic('suche') + '<input id="suchfeld" type="search" placeholder="Zutat oder Gericht, z. B. Linsen" value="' + esc(Z.q) + '" aria-label="Rezepte durchsuchen"></label>' +
        '<div class="reihe"><span>Ernährungsform</span><div class="wahl">' + knoepfe(FORMEN, 'f', Z.formen) + '</div></div>' +
        '<div class="reihe"><span>Alltag</span><div class="wahl">' + knoepfe(ALLTAG, 'a', Z.alltag) + '</div></div>' +
        '<div class="reihe"><span>Mahlzeit</span><div class="wahl">' + knoepfe(MAHL, 'm', Z.mahl) + '</div></div>' +
      '</section>';
    if (swipe) {
      var offen = treffer.filter(function (r) { return Z.gesehen.indexOf(r.s) < 0; });
      var zeile = '<div class="filterzeile"><button class="knopf" type="button" data-filter-auf aria-expanded="' + Z.filterAuf + '">' + ic('filter') + 'Filter' + (anzahlFilter ? ' <small>' + anzahlFilter + ' aktiv</small>' : '') + '</button>' + (aktivFilter ? '<button class="link" type="button" data-filter-leeren>Filter zurücksetzen</button>' : '') + '</div>';
      var stapel;
      if (offen.length) {
        stapel = '<div class="swipen"><p class="hinweis">Rechts = mag ich · Links = weiter</p>' +
          '<div class="stapel">' + (offen[1] ? swipekarte(offen[1], false) : '') + swipekarte(offen[0], true) + '</div>' +
          '<div class="swipeknoepfe">' +
            '<button class="k-klein" type="button" data-swipe-undo aria-label="Letzte Entscheidung zurücknehmen"' + (Z.letzter ? '' : ' disabled') + '>' + ic('undo') + '</button>' +
            '<button class="k-nein" type="button" data-swipe="nein" aria-label="Weiter, nicht merken">' + ic('zu') + '</button>' +
            '<button class="k-ja" type="button" data-swipe="ja" aria-label="Mag ich, auf die Merkliste">' + ic('merkliste') + '</button>' +
            '<button class="k-klein" type="button" data-rezept="' + offen[0].s + '" aria-label="Rezept ansehen">' + ic('auge') + '</button>' +
          '</div><p class="klein">Noch ' + offen.length + (offen.length === 1 ? ' Rezept' : ' Rezepte') + ' in dieser Auswahl. Was du magst, landet auf der Merkliste.</p></div>';
      } else {
        stapel = '<div class="leer">' + mo(treffer.length ? 'belohnung' : 'allesnichts') + '<div class="schreib">' + (treffer.length ? 'Alles gesehen' : 'Nichts gefunden') + '</div><p>' + (treffer.length ? 'Du hast alle Rezepte dieser Auswahl durchgeswipt. Schau auf deine Merkliste oder fang noch einmal an.' : 'Zu dieser Kombination gibt es noch kein Rezept. Nimm einen Filter heraus.') + '</p>' +
          (treffer.length ? '<div class="taten"><button class="gross" type="button" data-geh="merkliste">Zur Merkliste</button><button class="gross rand" type="button" data-swipe-neu>Nochmal von vorn</button></div>' : '') + '</div>';
      }
      return '<div class="seite ansicht">' + umschalter + zeile + (Z.filterAuf ? filter : '') + stapel + '</div>';
    }
    return '<div class="seite ansicht">' + umschalter + kopf + filter +
      '<div class="stand"><b>' + treffer.length + (treffer.length === 1 ? ' Rezept' : ' Rezepte') + '</b>' + (aktivFilter ? '<button class="link" type="button" data-filter-leeren>Filter zurücksetzen</button>' : '') + '</div>' +
      (treffer.length ? '<div class="karten">' + sicht.map(karte).join('') + '</div>' : '<div class="leer">' + mo('allesnichts') + '<div class="schreib">Nichts gefunden</div><p>Zu dieser Kombination gibt es noch kein Rezept. Nimm einen Filter heraus oder probier einen anderen Suchbegriff.</p></div>') +
      (treffer.length > sicht.length ? '<button class="gross rand mehr" type="button" data-mehr>Weitere Rezepte anzeigen (' + (treffer.length - sicht.length) + ')</button>' : '') +
    '</div>';
  }
  function swipekarte(r, vorn) {
    var marken = r.f.slice(0, 3).map(function (k) { return '<span class="markeF">' + esc(form(k).n) + '</span>'; }).join('') + r.a.filter(function (k) { return k === 'schnell' || k === 'familie' || k === 'mealprep'; }).slice(0, 2).map(function (k) { return '<span class="markeA">' + esc(name(ALLTAG, k).replace(', bis 30 Min.', '')) + '</span>'; }).join('');
    return '<article class="swipe ' + (vorn ? 'vorn' : 'hinten') + '"' + (vorn ? ' id="swipekarte" data-s="' + r.s + '"' : ' aria-hidden="true"') + '>' +
      (vorn ? '<span class="stempel ja">Mag ich</span><span class="stempel nein">Weiter</span>' : '') +
      '<span class="foto">' + ic(brot(r) ? 'brot' : 'teller') + (r.im ? '<img alt="" draggable="false" src="' + esc(r.im.replace('/960px-', '/500px-')) + '">' : '') + '</span>' +
      '<div class="text"><h3>' + esc(r.t) + '</h3><span class="meta">' + zeitKurz(r) + ' · ' + r.m.map(function (m) { return name(MAHL, m); }).join(', ') + '</span>' +
      '<span class="kurztext">' + esc(r.k) + '</span>' + (marken ? '<div class="marken">' + marken + '</div>' : '') + '</div></article>';
  }
"""
s = s[:a_start] + neu + s[a_end:]

rep("Tippe bei einem Rezept auf das Herz, dann findest du es hier wieder.", "Wische beim Swipen nach rechts oder tippe bei einem Rezept auf das Herz. Dann findest du es hier wieder.")

# ---------- Swipe-Logik
rep("  document.addEventListener('click', function (e) {", r"""  function swipeFertig(richtung) {
    var k = document.getElementById('swipekarte'); if (!k) return;
    var r = NACH[k.dataset.s], warFav = Z.fav.indexOf(r.s) > -1;
    if (Z.gesehen.indexOf(r.s) < 0) Z.gesehen.push(r.s);
    if (richtung === 'ja' && !warFav) Z.fav.unshift(r.s);
    Z.letzter = { s: r.s, richtung: richtung, warFav: warFav };
    merken();
    var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var weiter = function () { zeichne(); if (richtung === 'ja') melde('Auf der Merkliste'); };
    if (ruhig) { weiter(); return; }
    k.classList.remove('zieht', 'zurueck'); k.classList.add('fliegt');
    k.style.transform = 'translate(' + (richtung === 'ja' ? 1 : -1) * (window.innerWidth * 0.9 + 200) + 'px, 40px) rotate(' + (richtung === 'ja' ? 22 : -22) + 'deg)';
    k.style.opacity = '0';
    setTimeout(weiter, 260);
  }
  function swipeBinden() {
    var k = document.getElementById('swipekarte'); if (!k) return;
    var ja = k.querySelector('.stempel.ja'), nein = k.querySelector('.stempel.nein'), x0 = 0, y0 = 0, dx = 0, aktivZug = false, bewegt = false;
    k.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      aktivZug = true; bewegt = false; x0 = e.clientX; y0 = e.clientY; dx = 0;
      k.classList.remove('zurueck');
      try { k.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
    });
    k.addEventListener('pointermove', function (e) {
      if (!aktivZug) return;
      dx = e.clientX - x0; var dy = e.clientY - y0;
      if (!bewegt && Math.abs(dx) < 8) return;
      bewegt = true; k.classList.add('zieht');
      k.style.transform = 'translate(' + dx + 'px, ' + dy * 0.15 + 'px) rotate(' + dx / 20 + 'deg)';
      ja.style.opacity = Math.max(0, Math.min(1, dx / 90)); nein.style.opacity = Math.max(0, Math.min(1, -dx / 90));
    });
    var ende = function (abbruch) {
      if (!aktivZug) return; aktivZug = false; k.classList.remove('zieht');
      if (!bewegt) { if (!abbruch) oeffne(NACH[k.dataset.s]); return; }
      if (!abbruch && Math.abs(dx) > 90) { swipeFertig(dx > 0 ? 'ja' : 'nein'); return; }
      k.classList.add('zurueck'); k.style.transform = ''; ja.style.opacity = 0; nein.style.opacity = 0;
    };
    k.addEventListener('pointerup', function () { ende(false); });
    k.addEventListener('pointercancel', function () { ende(true); });
  }

  document.addEventListener('click', function (e) {""")
rep("    fotos(haupt); reiter();", "    fotos(haupt); reiter(); swipeBinden();")
rep("    if (d.geh) { geh(d.geh); }", """    if (d.geh) { geh(d.geh); }
    else if (d.start) { Z.modus = d.start; Z.formen = []; Z.alltag = []; Z.mahl = ''; Z.q = ''; Z.filterAuf = false; geh('rezepte'); }
    else if (d.modus) { Z.modus = d.modus; Z.filterAuf = false; Z.grenze = 24; zeichne(); }
    else if (t.hasAttribute('data-filter-auf')) { Z.filterAuf = !Z.filterAuf; zeichne(); }
    else if (d.swipe) { swipeFertig(d.swipe); }
    else if (t.hasAttribute('data-swipe-undo')) {
      var l = Z.letzter; if (l) { Z.gesehen = Z.gesehen.filter(function (x) { return x !== l.s; }); if (l.richtung === 'ja' && !l.warFav) Z.fav = Z.fav.filter(function (x) { return x !== l.s; }); Z.letzter = null; merken(); zeichne(); }
    }
    else if (t.hasAttribute('data-swipe-neu')) { Z.gesehen = []; Z.letzter = null; merken(); zeichne(); }""")
rep("  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && Z.offen) schliesse(); });",
    """  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && Z.offen) { schliesse(); return; }
    if (Z.offen || Z.ansicht !== 'rezepte' || Z.modus !== 'swipe' || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') swipeFertig('ja'); else if (e.key === 'ArrowLeft') swipeFertig('nein');
  });""")
open(p,'w',encoding='utf-8').write(s); print('ok', len(s))
