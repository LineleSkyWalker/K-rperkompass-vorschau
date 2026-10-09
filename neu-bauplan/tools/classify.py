"""Ordnet jedes Rezept Ernährungsformen und Alltagsfiltern zu – nach festen, nachvollziehbaren Regeln."""
from nutri import per_portion

LEGUMES = {'kichererbsen-dose','kidneybohnen-dose','schwarze-bohnen-dose','weisse-bohnen-dose','linsen-gegart','rote-linsen','linsen-braun','edamame-tk','erbsen-tk','hummus','gruene-bohnen','tofu','raeuchertofu','tempeh'}
FISH = {'lachsfilet','raeucherlachs','forelle','hering-matjes','makrele-geraeuchert','makrele-frisch','zanderfilet','thunfisch-frisch','forelle-geraeuchert','hering-frisch','kabeljaufilet','garnelen','thunfisch-dose','sardinen-dose'}
RED_MEAT = {'hackfleisch-rind','hackfleisch-gemischt','rinderbraten','rinderfilet','schweinefilet','schweinebraten','kassler','kalbschnitzel','schweinekotelett','schinken-gekocht','speck','rindergulasch','gefluegelwurst'}
POULTRY = {'haehnchenbrust','haehnchenschenkel','hackfleisch-huhn','putenbrust','haehnchen-ganz'}
WHOLE = {'haferflocken','vollkornpasta','reis-vollkorn','quinoa','bulgur','hirse','buchweizen','graupen','dinkelkoerner','gruenkern','vollkornbrot','toast-vollkorn','vollkorn-bagel','roggenbrot','broetchen-vollkorn','vollkornmehl','knaeckebrot','popcorn-mais'}
REFINED = {'spaghetti','pasta-kurz','lasagneplatten','reis-basmati','reis-risotto','couscous','mehl','dinkelmehl','baguette','burger-bun','tortilla','pita','gnocchi','pizzateig','blaetterteig','spaetzle','semmelknoedel-roh','kartoffelknoedel','weichweizengriess','hartweizengriess','dinkelgriess','nudeln-reis','mie-nudeln','polenta','sauerteigbrot','semmelbroesel','reiswaffeln','maultaschen','speisestaerke'}
STARCH = WHOLE | REFINED | {'kartoffel','suesskartoffel'}
FREE_SUGAR = {'zucker','brauner-zucker','puderzucker','honig','ahornsirup','vanillezucker','schokodrops','dunkle-schoko-drops','zartbitterschokolade','ketchup','apfelmus','rosinen','datteln','kirschen-glas'}
MED_VEG = {'tomate','cherrytomaten','tomaten-dose','tomaten-passiert','aubergine','zucchini','paprika','fenchel','spinat','spinat-tk','rucola','gurke','rote-zwiebel'}
MED_EXTRA = {'feta','mozzarella','parmesan','halloumi','ricotta','griechischer-joghurt','oliven','kapern','zitrone','zitronensaft','zitronenabrieb','basilikum','oregano','thymian','rosmarin','petersilie','minze','knoblauch','pinienkerne','mandeln','walnuesse','tahini','bulgur','couscous','vollkornpasta','polenta','pita','granatapfel'}
NORD_GRAIN = {'haferflocken','roggenbrot','vollkornbrot','knaeckebrot','graupen','dinkelkoerner','gruenkern','broetchen-vollkorn','leinsamen'}
NORD_VEG = {'weisskohl','rotkohl','gruenkohl','rosenkohl','wirsing','kohlrabi','sauerkraut','karotte','rote-bete','rote-bete-roh','pastinake','sellerieknolle','kartoffel','meerrettich','radieschen','lauch','erbsen-tk','champignons','gurke','gewuerzgurken'}
NORD_FRUIT = {'beeren-gemischt','blaubeeren','himbeeren','brombeeren','erdbeeren','apfel','birne','zwetschgen','pflaumen','kirschen','rhabarber'}
NORD_PROT = {'lachsfilet','raeucherlachs','forelle','hering-matjes','makrele-geraeuchert','makrele-frisch','zanderfilet','forelle-geraeuchert','hering-frisch','kabeljaufilet','skyr','quark','quark-20','kefir','buttermilch','huettenkaese'}
NORD_HERB = {'dill','schnittlauch','kresse','kuemmel','senf','petersilie'}
TROPICAL = {'mango','ananas','kokosmilch','kokosraspel','kokosjoghurt','kokosoel','avocado','limette','limettensaft','currypaste','garam-masala','sojasauce','sesamoel','tahini','feta','halloumi','mozzarella','oliven'}
PRODUCE_SKIP = {'zitronensaft','limettensaft','zitronenabrieb','limettenabrieb','knoblauch','ingwer','basilikum','petersilie','koriander','dill','schnittlauch','minze','chili','rosmarin','kresse','meerrettich'}
SPICY = {'chili','chiliflocken','currypaste','meerrettich'}
BASIC = {'salz','pfeffer','wasser','olivenoel','rapsoel'}
FAMILY_TAGS = {'pasta','pancake','casserole','potato_dish','soup','wrap','porridge','rice_dish','baking','egg_dish','bread_dish','german_classic','comfort_food'}

def meal_class(r):
    m = r['mealTypes']
    if 'bread' in m: return 'bread'
    if 'lunch' in m or 'dinner' in m: return 'main'
    if 'breakfast' in m: return 'breakfast'
    return 'small'

def active_minutes(r):
    return r['prep'] + (r['cook'] if r['cook'] < 120 else 0)

def classify(r, ings, bls):
    n, g = per_portion(r, ings, bls)
    ids = set(g); mc = meal_class(r); tags = set(r['tags'])
    sumg = lambda s: sum(v for k, v in g.items() if k in s)
    veg = sum(v for k, v in g.items() if (ings[k]['category'] == 'produce' and k not in PRODUCE_SKIP and k not in ('kartoffel','suesskartoffel')) or k in ('spinat-tk','erbsen-tk','edamame-tk','tomaten-dose','tomaten-passiert','sauerkraut','mais-dose'))
    f = {}
    # --- Ernährungsformen
    fib_min = {'main': 18, 'breakfast': 11, 'small': 8, 'bread': 6}[mc]
    f['ballast'] = n['FIBT'] >= fib_min
    prot_min = {'main': 30, 'breakfast': 25, 'small': 15, 'bread': 12}[mc]
    f['eiweiss'] = n['PROT625'] >= prot_min
    free = sumg(FREE_SUGAR); refined = sumg(REFINED)
    f['blutzucker'] = (n['FIBT'] >= {'main': 10, 'breakfast': 8, 'small': 4, 'bread': 5}[mc] and n['PROT625'] >= {'main': 20, 'breakfast': 15, 'small': 8, 'bread': 8}[mc]
                       and free <= 5 and refined <= 20 and n['SUGAR'] <= {'main': 15, 'breakfast': 15, 'small': 10, 'bread': 10}[mc])
    med_hits = (ids & MED_VEG, ids & MED_EXTRA, ids & (LEGUMES - {'tofu','raeuchertofu','tempeh','edamame-tk'}), ids & FISH)
    med_base = ('olivenoel' in ids and not (ids & RED_MEAT) and sumg({'butter','sahne','schmand','creme-fraiche'}) <= 10
                and not (ids & {'kokosmilch','sojasauce','currypaste','garam-masala','currypulver'}))
    med_total = sum(len(x) for x in med_hits)
    f['mittelmeer'] = med_base and ((bool(med_hits[3]) and med_total >= 3) or
                                    (len(med_hits[0]) >= 1 and (bool(med_hits[2]) or len(med_hits[0]) >= 2) and med_total >= 4))
    groups = [ids & NORD_GRAIN, ids & NORD_VEG, ids & NORD_FRUIT, ids & NORD_PROT, ids & NORD_HERB]
    nord_n = sum(len(x) for x in groups[:4]); nord_g = sum(1 for x in groups if x)
    f['nordisch'] = ('olivenoel' not in ids and not (ids & TROPICAL) and nord_n >= 3 and nord_g >= 3 and not (ids & (RED_MEAT | POULTRY))
                     and not (ids & {'currypulver','kurkuma','kreuzkuemmel','kokosmilch'}))
    starch = sumg(STARCH)
    if mc == 'main':
        f['ausgewogen'] = veg >= 200 and starch >= 40 and n['PROT625'] >= 20 and n['FASAT'] <= 12 and free <= 10
    elif mc == 'breakfast':
        f['ausgewogen'] = veg >= 100 and starch >= 30 and n['PROT625'] >= 15 and free <= 10
    else:
        f['ausgewogen'] = False
    # --- Alltag
    a = {}
    a['vegetarisch'] = 'vegetarian' in tags
    a['vegan'] = 'vegan' in tags
    act = active_minutes(r)
    a['schnell'] = act <= 30
    core = [k for k in ids if k not in BASIC and not ings[k].get('nutritionNegligible')]
    a['wenig'] = len(core) <= 5
    title = r['title'].lower()
    a['mealprep'] = bool(tags & {'soup','curry','one_pot','casserole'}) or (('meal_prep' in tags) and 'nicecream' not in title) or ('pasta' in tags and 'bolognese' in title) or (not tags & {'salad','wrap','bowl','soup','curry','pasta','german_classic','potato_dish'} and mc == 'main' and ' mit ' in title and bool(ids & WHOLE))
    a['familie'] = ('family_friendly' in tags and bool(tags & FAMILY_TAGS) and not (ids & SPICY) and (act <= 60 or mc == 'bread') and 'curry' not in tags)
    return n, g, f, a, dict(veg=veg, act=act, free=free, refined=refined, med=med_hits, nord=groups)
