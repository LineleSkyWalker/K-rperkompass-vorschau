/**
 * Zutatenkatalog KÖRPER.KOMPASS
 *
 * `blsHint` = Suchbegriff(e) für den Zuordnungsvorschlag im BLS 4.0
 * (Skript: npm run recipes:map). Die tatsächliche Zuordnung (bls_code) wird
 * NICHT hier gepflegt, sondern in data/ingredient-mapping.json mit Status
 * (suggested/verified) – damit nie geratene Nährwerte in die App gelangen.
 *
 * Stückgewichte sind übliche Durchschnittswerte für die Umrechnung
 * (z. B. 1 Ei Größe M ≈ 55 g) und dienen der Einkaufsliste/Nährwertschätzung.
 */
import type { Allergen, ShoppingCategory } from '../src/types/recipe';

export interface CatalogIngredient {
  id: string;
  name: string; // kanonisch, ggf. mit Qualifier nach Komma: "Tomate, frisch"
  plural?: string;
  category: ShoppingCategory;
  gramsPerPiece?: number;
  gramsPerTablespoon?: number;
  gramsPerTeaspoon?: number;
  densityGPerMl?: number;
  allergens?: Allergen[];
  blsHint: string;
  /**
   * Gewürze/Kräuter in Kleinstmengen ohne BLS-Eintrag: fließen nicht in die
   * Nährwertberechnung ein und lösen keine "unvollständig"-Warnung aus.
   */
  nutritionNegligible?: boolean;
}

const TL_SPICE = 2;
const EL_OIL = 10;

export const INGREDIENTS: CatalogIngredient[] = [
  // --- Obst & Gemüse ---------------------------------------------------------
  { id: 'apfel', name: 'Apfel', plural: 'Äpfel', category: 'produce', gramsPerPiece: 150, blsHint: 'Apfel roh' },
  { id: 'banane', name: 'Banane', plural: 'Bananen', category: 'produce', gramsPerPiece: 120, blsHint: 'Banane roh' },
  { id: 'beeren-gemischt', name: 'Beeren, gemischt (TK oder frisch)', category: 'produce', blsHint: 'Beerenobst gemischt' },
  { id: 'blaubeeren', name: 'Blaubeeren', category: 'produce', blsHint: 'Heidelbeere roh' },
  { id: 'himbeeren', name: 'Himbeeren', category: 'produce', blsHint: 'Himbeere roh' },
  { id: 'erdbeeren', name: 'Erdbeeren', category: 'produce', blsHint: 'Erdbeere roh' },
  { id: 'birne', name: 'Birne', plural: 'Birnen', category: 'produce', gramsPerPiece: 160, blsHint: 'Birne roh' },
  { id: 'mango', name: 'Mango', category: 'produce', gramsPerPiece: 300, blsHint: 'Mango roh' },
  { id: 'zitrone', name: 'Zitrone', plural: 'Zitronen', category: 'produce', gramsPerPiece: 60, blsHint: 'Zitrone roh' },
  { id: 'zitronensaft', name: 'Zitronensaft', category: 'produce', gramsPerTablespoon: 15, gramsPerTeaspoon: 5, densityGPerMl: 1, blsHint: 'Zitronensaft' },
  { id: 'limette', name: 'Limette', plural: 'Limetten', category: 'produce', gramsPerPiece: 50, blsHint: 'Limette roh' },
  { id: 'orange', name: 'Orange', plural: 'Orangen', category: 'produce', gramsPerPiece: 180, blsHint: 'Orange roh' },
  { id: 'avocado', name: 'Avocado', plural: 'Avocados', category: 'produce', gramsPerPiece: 140, blsHint: 'Avocado roh' },
  { id: 'tomate', name: 'Tomate, frisch', plural: 'Tomaten', category: 'produce', gramsPerPiece: 80, blsHint: 'Tomate roh' },
  { id: 'cherrytomaten', name: 'Cherrytomaten', category: 'produce', gramsPerPiece: 15, blsHint: 'Tomate roh' },
  { id: 'gurke', name: 'Salatgurke', category: 'produce', gramsPerPiece: 400, blsHint: 'Gurke roh' },
  { id: 'paprika', name: 'Paprika, rot', plural: 'Paprika', category: 'produce', gramsPerPiece: 150, blsHint: 'Paprika rot roh' },
  { id: 'zucchini', name: 'Zucchini', category: 'produce', gramsPerPiece: 200, blsHint: 'Zucchini roh' },
  { id: 'aubergine', name: 'Aubergine', category: 'produce', gramsPerPiece: 250, blsHint: 'Aubergine roh' },
  { id: 'karotte', name: 'Karotte', plural: 'Karotten', category: 'produce', gramsPerPiece: 80, blsHint: 'Möhre roh' },
  { id: 'kartoffel', name: 'Kartoffel, festkochend', plural: 'Kartoffeln', category: 'produce', gramsPerPiece: 100, blsHint: 'Kartoffel roh' },
  { id: 'suesskartoffel', name: 'Süßkartoffel', plural: 'Süßkartoffeln', category: 'produce', gramsPerPiece: 250, blsHint: 'Süßkartoffel roh' },
  { id: 'zwiebel', name: 'Zwiebel', plural: 'Zwiebeln', category: 'produce', gramsPerPiece: 80, blsHint: 'Zwiebel roh' },
  { id: 'rote-zwiebel', name: 'Zwiebel, rot', plural: 'rote Zwiebeln', category: 'produce', gramsPerPiece: 80, blsHint: 'Zwiebel roh' },
  { id: 'fruehlingszwiebel', name: 'Frühlingszwiebel', plural: 'Frühlingszwiebeln', category: 'produce', gramsPerPiece: 15, blsHint: 'Lauchzwiebel roh' },
  { id: 'knoblauch', name: 'Knoblauch', category: 'produce', gramsPerPiece: 5, blsHint: 'Knoblauch roh' },
  { id: 'ingwer', name: 'Ingwer, frisch', category: 'produce', gramsPerPiece: 20, gramsPerTeaspoon: 3, blsHint: 'Ingwer roh' },
  { id: 'lauch', name: 'Lauch', category: 'produce', gramsPerPiece: 250, blsHint: 'Porree roh' },
  { id: 'brokkoli', name: 'Brokkoli', category: 'produce', gramsPerPiece: 400, blsHint: 'Brokkoli roh' },
  { id: 'blumenkohl', name: 'Blumenkohl', category: 'produce', gramsPerPiece: 800, blsHint: 'Blumenkohl roh' },
  { id: 'spinat', name: 'Spinat, frisch', category: 'produce', blsHint: 'Spinat roh' },
  { id: 'spinat-tk', name: 'Spinat, TK (Blattspinat)', category: 'frozen', blsHint: 'Spinat tiefgefroren' },
  { id: 'gruenkohl', name: 'Grünkohl', category: 'produce', blsHint: 'Grünkohl roh' },
  { id: 'champignons', name: 'Champignons', category: 'produce', blsHint: 'Champignon roh' },
  { id: 'kuerbis', name: 'Hokkaido-Kürbis', category: 'produce', gramsPerPiece: 1000, blsHint: 'Kürbis roh' },
  { id: 'rote-bete', name: 'Rote Bete, gekocht', category: 'produce', gramsPerPiece: 150, blsHint: 'Rote Bete gegart' },
  { id: 'sellerie', name: 'Staudensellerie', category: 'produce', gramsPerPiece: 50, allergens: ['celery'], blsHint: 'Sellerie Stangen roh' },
  { id: 'feldsalat', name: 'Feldsalat', category: 'produce', blsHint: 'Feldsalat roh' },
  { id: 'rucola', name: 'Rucola', category: 'produce', blsHint: 'Rucola roh' },
  { id: 'salat-mix', name: 'Blattsalat, gemischt', category: 'produce', blsHint: 'Kopfsalat roh' },
  { id: 'eisbergsalat', name: 'Eisbergsalat', category: 'produce', gramsPerPiece: 500, blsHint: 'Eisbergsalat roh' },
  { id: 'basilikum', name: 'Basilikum, frisch', category: 'produce', gramsPerPiece: 20, blsHint: 'Basilikum frisch' },
  { id: 'petersilie', name: 'Petersilie, frisch', category: 'produce', gramsPerPiece: 25, gramsPerTablespoon: 4, blsHint: 'Petersilie frisch' },
  { id: 'koriander', name: 'Koriander, frisch', category: 'produce', gramsPerPiece: 20, nutritionNegligible: true, blsHint: 'Koriander Blätter frisch' },
  { id: 'dill', name: 'Dill, frisch', category: 'produce', gramsPerPiece: 15, gramsPerTablespoon: 3, nutritionNegligible: true, blsHint: 'Dill frisch' },
  { id: 'schnittlauch', name: 'Schnittlauch', category: 'produce', gramsPerPiece: 15, gramsPerTablespoon: 3, blsHint: 'Schnittlauch frisch' },
  { id: 'minze', name: 'Minze, frisch', category: 'produce', gramsPerPiece: 15, nutritionNegligible: true, blsHint: 'Pfefferminze frisch' },
  { id: 'chili', name: 'Chilischote, frisch', category: 'produce', gramsPerPiece: 8, nutritionNegligible: true, blsHint: 'Chili roh' },
  { id: 'erbsen-tk', name: 'Erbsen, TK', category: 'frozen', blsHint: 'Erbsen grün tiefgefroren' },
  { id: 'edamame-tk', name: 'Edamame, TK', category: 'frozen', allergens: ['soy'], blsHint: 'Sojabohnen grün' },
  { id: 'mais-dose', name: 'Mais, Dose', category: 'canned', gramsPerPiece: 285, blsHint: 'Mais Konserve' },
  { id: 'kichererbsen-dose', name: 'Kichererbsen, Dose (Abtropfgewicht)', category: 'canned', gramsPerPiece: 240, blsHint: 'Kichererbsen Konserve' },
  { id: 'kidneybohnen-dose', name: 'Kidneybohnen, Dose (Abtropfgewicht)', category: 'canned', gramsPerPiece: 255, blsHint: 'Kidneybohnen Konserve' },
  { id: 'schwarze-bohnen-dose', name: 'Schwarze Bohnen, Dose (Abtropfgewicht)', category: 'canned', gramsPerPiece: 240, blsHint: 'Bohnen schwarz Konserve' },
  { id: 'weisse-bohnen-dose', name: 'Weiße Bohnen, Dose (Abtropfgewicht)', category: 'canned', gramsPerPiece: 250, blsHint: 'Bohnen weiß Konserve' },
  { id: 'tomaten-dose', name: 'Tomaten, gehackt (Dose)', category: 'canned', gramsPerPiece: 400, blsHint: 'Tomaten Konserve' },
  { id: 'tomaten-passiert', name: 'Tomaten, passiert', category: 'canned', gramsPerPiece: 500, densityGPerMl: 1.03, blsHint: 'Tomaten passiert' },
  { id: 'tomatenmark', name: 'Tomatenmark', category: 'canned', gramsPerTablespoon: 15, gramsPerTeaspoon: 5, blsHint: 'Tomatenmark' },
  { id: 'kokosmilch', name: 'Kokosmilch', category: 'canned', gramsPerPiece: 400, densityGPerMl: 1, blsHint: 'Kokosmilch' },
  { id: 'oliven', name: 'Oliven, schwarz', category: 'canned', blsHint: 'Oliven schwarz' },
  { id: 'thunfisch-dose', name: 'Thunfisch, Dose (im eigenen Saft, Abtropfgewicht)', category: 'canned', gramsPerPiece: 130, allergens: ['fish'], blsHint: 'Thunfisch Konserve' },

  // --- Brot & Backwaren -------------------------------------------------------
  { id: 'vollkornbrot', name: 'Vollkornbrot', category: 'bakery', gramsPerPiece: 45, allergens: ['gluten'], blsHint: 'Vollkornbrot' },
  { id: 'toast-vollkorn', name: 'Vollkorntoast', category: 'bakery', gramsPerPiece: 30, allergens: ['gluten'], blsHint: 'Toastbrot Vollkorn' },
  { id: 'baguette', name: 'Baguette', category: 'bakery', gramsPerPiece: 250, allergens: ['gluten'], blsHint: 'Baguette' },
  { id: 'burger-bun', name: 'Burgerbrötchen', plural: 'Burgerbrötchen', category: 'bakery', gramsPerPiece: 60, allergens: ['gluten', 'sesame'], blsHint: 'Brötchen Weizen' },
  { id: 'tortilla', name: 'Weizentortilla (Wrap)', plural: 'Wraps', category: 'bakery', gramsPerPiece: 60, allergens: ['gluten'], blsHint: 'Tortilla Weizen' },
  { id: 'pita', name: 'Pitabrot', plural: 'Pitabrote', category: 'bakery', gramsPerPiece: 70, allergens: ['gluten'], blsHint: 'Fladenbrot' },

  // --- Kühlregal --------------------------------------------------------------
  { id: 'ei', name: 'Ei (Größe M)', plural: 'Eier', category: 'dairy_chilled', gramsPerPiece: 55, allergens: ['egg'], blsHint: 'Hühnerei roh' },
  { id: 'milch', name: 'Milch, 3,5 %', category: 'dairy_chilled', densityGPerMl: 1.03, gramsPerTablespoon: 15, blsHint: 'Kuhmilch 3,5 %' },
  { id: 'hafermilch', name: 'Haferdrink', category: 'dairy_chilled', densityGPerMl: 1.02, allergens: ['gluten'], blsHint: 'Haferdrink' },
  { id: 'butter', name: 'Butter', category: 'dairy_chilled', gramsPerTablespoon: 12, gramsPerTeaspoon: 5, allergens: ['milk'], blsHint: 'Butter' },
  { id: 'sahne', name: 'Sahne, 30 %', category: 'dairy_chilled', densityGPerMl: 1, gramsPerTablespoon: 15, allergens: ['milk'], blsHint: 'Schlagsahne 30 %' },
  { id: 'schmand', name: 'Schmand', category: 'dairy_chilled', gramsPerTablespoon: 20, allergens: ['milk'], blsHint: 'Schmand' },
  { id: 'creme-fraiche', name: 'Crème fraîche', category: 'dairy_chilled', gramsPerTablespoon: 20, allergens: ['milk'], blsHint: 'Creme fraiche' },
  { id: 'joghurt', name: 'Joghurt, 3,5 %', category: 'dairy_chilled', gramsPerTablespoon: 15, gramsPerPiece: 150, allergens: ['milk'], blsHint: 'Joghurt 3,5 %' },
  { id: 'griechischer-joghurt', name: 'Joghurt, griechische Art (10 %)', category: 'dairy_chilled', gramsPerTablespoon: 15, allergens: ['milk'], blsHint: 'Joghurt 10 % Fett' },
  { id: 'skyr', name: 'Skyr', category: 'dairy_chilled', gramsPerTablespoon: 15, allergens: ['milk'], blsHint: 'Skyr' },
  { id: 'quark', name: 'Magerquark', category: 'dairy_chilled', gramsPerTablespoon: 15, allergens: ['milk'], blsHint: 'Speisequark mager' },
  { id: 'huettenkaese', name: 'Hüttenkäse', category: 'dairy_chilled', gramsPerTablespoon: 15, allergens: ['milk'], blsHint: 'Hüttenkäse' },
  { id: 'frischkaese', name: 'Frischkäse', category: 'dairy_chilled', gramsPerTablespoon: 15, allergens: ['milk'], blsHint: 'Frischkäse Doppelrahm' },
  { id: 'feta', name: 'Feta', category: 'dairy_chilled', gramsPerPiece: 150, allergens: ['milk'], blsHint: 'Feta Schafskäse' },
  { id: 'mozzarella', name: 'Mozzarella', category: 'dairy_chilled', gramsPerPiece: 125, allergens: ['milk'], blsHint: 'Mozzarella' },
  { id: 'parmesan', name: 'Parmesan', category: 'dairy_chilled', gramsPerTablespoon: 8, allergens: ['milk'], blsHint: 'Parmesan' },
  { id: 'gouda', name: 'Gouda, gerieben', category: 'dairy_chilled', gramsPerTablespoon: 10, allergens: ['milk'], blsHint: 'Gouda 48 %' },
  { id: 'cheddar', name: 'Cheddar', category: 'dairy_chilled', gramsPerPiece: 20, allergens: ['milk'], blsHint: 'Cheddar' },
  { id: 'halloumi', name: 'Halloumi', category: 'dairy_chilled', gramsPerPiece: 225, allergens: ['milk'], blsHint: 'Halloumi' },
  { id: 'tofu', name: 'Tofu, natur', category: 'dairy_chilled', gramsPerPiece: 200, allergens: ['soy'], blsHint: 'Tofu' },
  { id: 'raeuchertofu', name: 'Räuchertofu', category: 'dairy_chilled', gramsPerPiece: 200, allergens: ['soy'], blsHint: 'Tofu geräuchert' },
  { id: 'hummus', name: 'Hummus', category: 'dairy_chilled', gramsPerTablespoon: 20, allergens: ['sesame'], blsHint: 'Hummus' },
  { id: 'pizzateig', name: 'Pizzateig, frisch (Kühlregal)', category: 'dairy_chilled', gramsPerPiece: 400, allergens: ['gluten'], blsHint: 'Pizzateig' },
  { id: 'blaetterteig', name: 'Blätterteig, frisch', category: 'dairy_chilled', gramsPerPiece: 275, allergens: ['gluten', 'milk'], blsHint: 'Blätterteig' },

  // --- Fleisch & Fisch --------------------------------------------------------
  { id: 'haehnchenbrust', name: 'Hähnchenbrustfilet', category: 'meat_fish', gramsPerPiece: 180, blsHint: 'Hähnchen Brust ohne Haut roh' },
  { id: 'haehnchenschenkel', name: 'Hähnchenschenkel', category: 'meat_fish', gramsPerPiece: 200, blsHint: 'Hähnchen Schenkel roh' },
  { id: 'hackfleisch-rind', name: 'Rinderhackfleisch', category: 'meat_fish', blsHint: 'Rind Hackfleisch roh' },
  { id: 'hackfleisch-gemischt', name: 'Hackfleisch, gemischt', category: 'meat_fish', blsHint: 'Hackfleisch gemischt roh' },
  { id: 'lachsfilet', name: 'Lachsfilet', category: 'meat_fish', gramsPerPiece: 150, allergens: ['fish'], blsHint: 'Lachs roh' },
  { id: 'raeucherlachs', name: 'Räucherlachs', category: 'meat_fish', allergens: ['fish'], blsHint: 'Lachs geräuchert' },
  { id: 'forelle', name: 'Forellenfilet', category: 'meat_fish', gramsPerPiece: 150, allergens: ['fish'], blsHint: 'Forelle roh' },
  { id: 'garnelen', name: 'Garnelen, geschält (TK)', category: 'frozen', allergens: ['crustaceans'], blsHint: 'Garnele roh' },
  { id: 'hering-matjes', name: 'Matjesfilet', category: 'meat_fish', gramsPerPiece: 80, allergens: ['fish'], blsHint: 'Matjes' },
  { id: 'makrele-geraeuchert', name: 'Makrele, geräuchert', category: 'meat_fish', gramsPerPiece: 150, allergens: ['fish'], blsHint: 'Makrele geräuchert' },

  // --- Trockenwaren -----------------------------------------------------------
  { id: 'haferflocken', name: 'Haferflocken', category: 'dry_goods', gramsPerTablespoon: 10, allergens: ['gluten'], blsHint: 'Haferflocken' },
  { id: 'spaghetti', name: 'Spaghetti', category: 'dry_goods', allergens: ['gluten'], blsHint: 'Teigwaren Weizen roh' },
  { id: 'pasta-kurz', name: 'Pasta, kurz (Penne/Fusilli)', category: 'dry_goods', allergens: ['gluten'], blsHint: 'Teigwaren Weizen roh' },
  { id: 'vollkornpasta', name: 'Vollkornpasta', category: 'dry_goods', allergens: ['gluten'], blsHint: 'Teigwaren Vollkorn roh' },
  { id: 'lasagneplatten', name: 'Lasagneplatten', category: 'dry_goods', allergens: ['gluten'], blsHint: 'Teigwaren Weizen roh' },
  { id: 'gnocchi', name: 'Gnocchi (Kühlregal)', category: 'dairy_chilled', gramsPerPiece: 500, allergens: ['gluten'], blsHint: 'Gnocchi' },
  { id: 'reis-basmati', name: 'Basmatireis', category: 'dry_goods', blsHint: 'Reis Basmati roh' },
  { id: 'reis-vollkorn', name: 'Vollkornreis', category: 'dry_goods', blsHint: 'Reis Vollkorn roh' },
  { id: 'reis-risotto', name: 'Risottoreis', category: 'dry_goods', blsHint: 'Reis Rundkorn roh' },
  { id: 'quinoa', name: 'Quinoa', category: 'dry_goods', blsHint: 'Quinoa roh' },
  { id: 'couscous', name: 'Couscous', category: 'dry_goods', allergens: ['gluten'], blsHint: 'Couscous roh' },
  { id: 'bulgur', name: 'Bulgur', category: 'dry_goods', allergens: ['gluten'], blsHint: 'Bulgur roh' },
  { id: 'rote-linsen', name: 'Rote Linsen', category: 'dry_goods', blsHint: 'Linsen rot roh' },
  { id: 'linsen-braun', name: 'Linsen, braun (getrocknet)', category: 'dry_goods', blsHint: 'Linsen roh' },
  { id: 'mehl', name: 'Weizenmehl, Type 405', category: 'dry_goods', gramsPerTablespoon: 10, allergens: ['gluten'], blsHint: 'Weizenmehl Type 405' },
  { id: 'dinkelmehl', name: 'Dinkelvollkornmehl', category: 'dry_goods', gramsPerTablespoon: 10, allergens: ['gluten'], blsHint: 'Dinkelmehl Vollkorn' },
  { id: 'speisestaerke', name: 'Speisestärke', category: 'dry_goods', gramsPerTablespoon: 10, gramsPerTeaspoon: 3, blsHint: 'Speisestärke' },
  { id: 'backpulver', name: 'Backpulver', category: 'dry_goods', gramsPerTeaspoon: 3, gramsPerPiece: 15, blsHint: 'Backpulver' },
  { id: 'natron', name: 'Natron', category: 'dry_goods', gramsPerTeaspoon: 5, nutritionNegligible: true, blsHint: 'Natriumhydrogencarbonat' },
  { id: 'hefe-trocken', name: 'Trockenhefe', category: 'dry_goods', gramsPerPiece: 7, gramsPerTeaspoon: 3, blsHint: 'Backhefe' },
  { id: 'zucker', name: 'Zucker', category: 'dry_goods', gramsPerTablespoon: 12, gramsPerTeaspoon: 4, blsHint: 'Zucker Saccharose' },
  { id: 'brauner-zucker', name: 'Brauner Zucker', category: 'dry_goods', gramsPerTablespoon: 12, gramsPerTeaspoon: 4, blsHint: 'Zucker braun' },
  { id: 'puderzucker', name: 'Puderzucker', category: 'dry_goods', gramsPerTablespoon: 8, blsHint: 'Puderzucker' },
  { id: 'honig', name: 'Honig', category: 'dry_goods', gramsPerTablespoon: 20, gramsPerTeaspoon: 7, blsHint: 'Honig' },
  { id: 'ahornsirup', name: 'Ahornsirup', category: 'dry_goods', gramsPerTablespoon: 20, gramsPerTeaspoon: 7, blsHint: 'Ahornsirup' },
  { id: 'vanillezucker', name: 'Vanillezucker', category: 'dry_goods', gramsPerPiece: 8, gramsPerTeaspoon: 4, blsHint: 'Vanillezucker' },
  { id: 'kakao', name: 'Kakaopulver, ungesüßt', category: 'dry_goods', gramsPerTablespoon: 8, gramsPerTeaspoon: 3, blsHint: 'Kakaopulver schwach entölt' },
  { id: 'zartbitterschokolade', name: 'Zartbitterschokolade (70 %)', category: 'dry_goods', gramsPerPiece: 100, allergens: ['milk', 'soy'], blsHint: 'Schokolade Zartbitter' },
  { id: 'schokodrops', name: 'Schokoladentropfen', category: 'dry_goods', gramsPerTablespoon: 12, allergens: ['milk', 'soy'], blsHint: 'Schokolade Vollmilch' },
  { id: 'erdnussbutter', name: 'Erdnussbutter', category: 'dry_goods', gramsPerTablespoon: 15, gramsPerTeaspoon: 5, allergens: ['peanut'], blsHint: 'Erdnussbutter' },
  { id: 'mandelmus', name: 'Mandelmus', category: 'dry_goods', gramsPerTablespoon: 15, allergens: ['nuts'], blsHint: 'Mandelmus' },
  { id: 'tahini', name: 'Tahini (Sesammus)', category: 'dry_goods', gramsPerTablespoon: 15, allergens: ['sesame'], blsHint: 'Sesammus Tahin' },
  { id: 'walnuesse', name: 'Walnüsse', category: 'dry_goods', gramsPerTablespoon: 10, allergens: ['nuts'], blsHint: 'Walnuss' },
  { id: 'mandeln', name: 'Mandeln', category: 'dry_goods', gramsPerTablespoon: 10, allergens: ['nuts'], blsHint: 'Mandel süß' },
  { id: 'mandeln-gemahlen', name: 'Mandeln, gemahlen', category: 'dry_goods', gramsPerTablespoon: 8, allergens: ['nuts'], blsHint: 'Mandel süß' },
  { id: 'haselnuesse', name: 'Haselnüsse', category: 'dry_goods', gramsPerTablespoon: 10, allergens: ['nuts'], blsHint: 'Haselnuss' },
  { id: 'cashews', name: 'Cashewkerne', category: 'dry_goods', gramsPerTablespoon: 10, allergens: ['nuts'], blsHint: 'Cashewnuss' },
  { id: 'erdnuesse', name: 'Erdnüsse, geröstet', category: 'dry_goods', gramsPerTablespoon: 10, allergens: ['peanut'], blsHint: 'Erdnuss geröstet' },
  { id: 'pinienkerne', name: 'Pinienkerne', category: 'dry_goods', gramsPerTablespoon: 10, blsHint: 'Pinienkerne' },
  { id: 'kuerbiskerne', name: 'Kürbiskerne', category: 'dry_goods', gramsPerTablespoon: 10, blsHint: 'Kürbiskerne' },
  { id: 'sonnenblumenkerne', name: 'Sonnenblumenkerne', category: 'dry_goods', gramsPerTablespoon: 10, blsHint: 'Sonnenblumenkerne' },
  { id: 'sesam', name: 'Sesam', category: 'dry_goods', gramsPerTablespoon: 9, gramsPerTeaspoon: 3, allergens: ['sesame'], blsHint: 'Sesamsamen' },
  { id: 'leinsamen', name: 'Leinsamen, geschrotet', category: 'dry_goods', gramsPerTablespoon: 8, gramsPerTeaspoon: 3, blsHint: 'Leinsamen' },
  { id: 'chiasamen', name: 'Chiasamen', category: 'dry_goods', gramsPerTablespoon: 10, gramsPerTeaspoon: 4, blsHint: 'Chiasamen' },
  { id: 'hanfsamen', name: 'Hanfsamen, geschält', category: 'dry_goods', gramsPerTablespoon: 10, blsHint: 'Hanfsamen' },
  { id: 'rosinen', name: 'Rosinen', category: 'dry_goods', gramsPerTablespoon: 10, blsHint: 'Rosinen' },
  { id: 'datteln', name: 'Datteln, getrocknet', plural: 'Datteln', category: 'dry_goods', gramsPerPiece: 8, blsHint: 'Dattel getrocknet' },
  { id: 'kokosraspel', name: 'Kokosraspel', category: 'dry_goods', gramsPerTablespoon: 6, blsHint: 'Kokosraspel' },
  { id: 'semmelbroesel', name: 'Semmelbrösel', category: 'dry_goods', gramsPerTablespoon: 8, allergens: ['gluten'], blsHint: 'Paniermehl' },
  { id: 'gemuesebruehe', name: 'Gemüsebrühe (zubereitet)', category: 'dry_goods', densityGPerMl: 1, allergens: ['celery'], blsHint: 'Gemüsebrühe zubereitet' },
  { id: 'sojasauce', name: 'Sojasauce', category: 'dry_goods', gramsPerTablespoon: 15, gramsPerTeaspoon: 5, densityGPerMl: 1.1, allergens: ['soy', 'gluten'], blsHint: 'Sojasoße' },
  { id: 'currypaste', name: 'Currypaste, rot', category: 'dry_goods', gramsPerTablespoon: 15, gramsPerTeaspoon: 5, allergens: ['crustaceans'], blsHint: 'Currypaste' },
  { id: 'senf', name: 'Senf, mittelscharf', category: 'dry_goods', gramsPerTablespoon: 15, gramsPerTeaspoon: 5, allergens: ['mustard'], blsHint: 'Senf' },
  { id: 'ketchup', name: 'Ketchup', category: 'dry_goods', gramsPerTablespoon: 15, blsHint: 'Tomatenketchup' },
  { id: 'mayonnaise', name: 'Mayonnaise', category: 'dry_goods', gramsPerTablespoon: 15, allergens: ['egg', 'mustard'], blsHint: 'Mayonnaise 80 %' },
  { id: 'gewuerzgurken', name: 'Gewürzgurken', plural: 'Gewürzgurken', category: 'dry_goods', gramsPerPiece: 30, blsHint: 'Gewürzgurke' },
  { id: 'kapern', name: 'Kapern', category: 'dry_goods', gramsPerTablespoon: 8, blsHint: 'Kapern' },
  { id: 'nudeln-reis', name: 'Reisnudeln', category: 'dry_goods', blsHint: 'Reisnudeln roh' },
  { id: 'mie-nudeln', name: 'Mie-Nudeln', category: 'dry_goods', allergens: ['gluten', 'egg'], blsHint: 'Mie Nudeln' },
  { id: 'polenta', name: 'Polenta (Maisgrieß)', category: 'dry_goods', blsHint: 'Maisgrieß' },
  { id: 'knaeckebrot', name: 'Knäckebrot', plural: 'Knäckebrote', category: 'dry_goods', gramsPerPiece: 12, allergens: ['gluten'], blsHint: 'Knäckebrot' },
  { id: 'reiswaffeln', name: 'Reiswaffeln', plural: 'Reiswaffeln', category: 'dry_goods', gramsPerPiece: 8, blsHint: 'Reiswaffel' },
  { id: 'popcorn-mais', name: 'Popcornmais', category: 'dry_goods', gramsPerTablespoon: 12, blsHint: 'Mais Körner Popcorn' },
  { id: 'dunkle-schoko-drops', name: 'Zartbitter-Schokodrops', category: 'dry_goods', gramsPerTablespoon: 12, allergens: ['soy'], blsHint: 'Schokolade Zartbitter' },
  { id: 'kaffee', name: 'Espresso', category: 'dry_goods', densityGPerMl: 1, blsHint: 'Kaffee Getränk' },

  // --- Gewürze & Öle ----------------------------------------------------------
  { id: 'olivenoel', name: 'Olivenöl', category: 'spices', gramsPerTablespoon: EL_OIL, gramsPerTeaspoon: 4, densityGPerMl: 0.92, blsHint: 'Olivenöl' },
  { id: 'rapsoel', name: 'Rapsöl', category: 'spices', gramsPerTablespoon: EL_OIL, gramsPerTeaspoon: 4, densityGPerMl: 0.92, blsHint: 'Rapsöl' },
  { id: 'leinoel', name: 'Leinöl', category: 'spices', gramsPerTablespoon: EL_OIL, gramsPerTeaspoon: 4, densityGPerMl: 0.93, blsHint: 'Leinöl' },
  { id: 'kokosoel', name: 'Kokosöl', category: 'spices', gramsPerTablespoon: EL_OIL, gramsPerTeaspoon: 4, blsHint: 'Kokosfett' },
  { id: 'sesamoel', name: 'Sesamöl', category: 'spices', gramsPerTablespoon: EL_OIL, gramsPerTeaspoon: 4, allergens: ['sesame'], blsHint: 'Sesamöl' },
  { id: 'essig-balsamico', name: 'Balsamico-Essig', category: 'spices', gramsPerTablespoon: 15, gramsPerTeaspoon: 5, blsHint: 'Balsamessig' },
  { id: 'essig-apfel', name: 'Apfelessig', category: 'spices', gramsPerTablespoon: 15, gramsPerTeaspoon: 5, blsHint: 'Apfelessig' },
  { id: 'essig-reis', name: 'Reisessig', category: 'spices', gramsPerTablespoon: 15, gramsPerTeaspoon: 5, blsHint: 'Essig' },
  { id: 'salz', name: 'Salz', category: 'spices', gramsPerTeaspoon: 6, blsHint: 'Speisesalz' },
  { id: 'pfeffer', name: 'Pfeffer, schwarz', category: 'spices', gramsPerTeaspoon: TL_SPICE, blsHint: 'Pfeffer schwarz' },
  { id: 'paprikapulver', name: 'Paprikapulver, edelsüß', category: 'spices', gramsPerTeaspoon: TL_SPICE, nutritionNegligible: true, blsHint: 'Paprika Gewürz' },
  { id: 'paprikapulver-geraeuchert', name: 'Paprikapulver, geräuchert', category: 'spices', gramsPerTeaspoon: TL_SPICE, nutritionNegligible: true, blsHint: 'Paprika Gewürz' },
  { id: 'kreuzkuemmel', name: 'Kreuzkümmel, gemahlen', category: 'spices', gramsPerTeaspoon: TL_SPICE, nutritionNegligible: true, blsHint: 'Kreuzkümmel' },
  { id: 'koriander-gemahlen', name: 'Koriander, gemahlen', category: 'spices', gramsPerTeaspoon: TL_SPICE, nutritionNegligible: true, blsHint: 'Koriander Gewürz' },
  { id: 'kurkuma', name: 'Kurkuma, gemahlen', category: 'spices', gramsPerTeaspoon: TL_SPICE, nutritionNegligible: true, blsHint: 'Kurkuma' },
  { id: 'currypulver', name: 'Currypulver', category: 'spices', gramsPerTeaspoon: TL_SPICE, nutritionNegligible: true, blsHint: 'Curry Gewürz' },
  { id: 'garam-masala', name: 'Garam Masala', category: 'spices', gramsPerTeaspoon: TL_SPICE, nutritionNegligible: true, blsHint: 'Curry Gewürz' },
  { id: 'zimt', name: 'Zimt, gemahlen', category: 'spices', gramsPerTeaspoon: 2.5, nutritionNegligible: true, blsHint: 'Zimt' },
  { id: 'muskat', name: 'Muskatnuss, gerieben', category: 'spices', gramsPerTeaspoon: TL_SPICE, nutritionNegligible: true, blsHint: 'Muskatnuss' },
  { id: 'oregano', name: 'Oregano, getrocknet', category: 'spices', gramsPerTeaspoon: 1, nutritionNegligible: true, blsHint: 'Oregano getrocknet' },
  { id: 'thymian', name: 'Thymian, getrocknet', category: 'spices', gramsPerTeaspoon: 1, nutritionNegligible: true, blsHint: 'Thymian getrocknet' },
  { id: 'rosmarin', name: 'Rosmarin, frisch', category: 'produce', gramsPerPiece: 3, gramsPerTeaspoon: 1, nutritionNegligible: true, blsHint: 'Rosmarin' },
  { id: 'chiliflocken', name: 'Chiliflocken', category: 'spices', gramsPerTeaspoon: TL_SPICE, nutritionNegligible: true, blsHint: 'Chili getrocknet' },
  { id: 'lorbeer', name: 'Lorbeerblatt', plural: 'Lorbeerblätter', category: 'spices', gramsPerPiece: 0.5, nutritionNegligible: true, blsHint: 'Lorbeerblatt' },
  { id: 'vanille', name: 'Vanilleextrakt', category: 'spices', gramsPerTeaspoon: 4, nutritionNegligible: true, blsHint: 'Vanille' },
  { id: 'knoblauchpulver', name: 'Knoblauchpulver', category: 'spices', gramsPerTeaspoon: TL_SPICE, blsHint: 'Knoblauch Pulver' },
  { id: 'zwiebelpulver', name: 'Zwiebelpulver', category: 'spices', gramsPerTeaspoon: TL_SPICE, blsHint: 'Zwiebel Pulver' },
  { id: 'hefeflocken', name: 'Hefeflocken', category: 'spices', gramsPerTablespoon: 5, blsHint: 'Hefeflocken' },
  { id: 'wasser', name: 'Wasser', category: 'other', densityGPerMl: 1, blsHint: 'Trinkwasser' },
];

export const INGREDIENT_BY_ID: Record<string, CatalogIngredient> = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));
