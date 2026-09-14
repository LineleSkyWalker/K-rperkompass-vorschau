import { buildDisplayText, scaleIngredient, scaleRecipe } from '../servings';
import { ingredient, recipe, recipeIngredient } from './fixtures';

const pasta = ingredient({ id: 'pasta', canonicalName: 'Nudeln, roh', shoppingCategory: 'dry_goods' });
const salt = ingredient({ id: 'salt', canonicalName: 'Salz', shoppingCategory: 'spices' });

describe('scaleIngredient', () => {
  it('rechnet 2 → 4 Portionen: 200 g → 400 g', () => {
    const ri = recipeIngredient(pasta, 200, 'g', 200);
    const scaled = scaleIngredient(ri, 2, 4);
    expect(scaled.quantity).toBe(400);
    expect(scaled.quantityInGrams).toBe(400);
    expect(scaled.displayText).toBe('400 g Nudeln');
  });

  it('rechnet auch nach unten und mit ungeraden Faktoren', () => {
    const ri = recipeIngredient(pasta, 300, 'g', 300);
    expect(scaleIngredient(ri, 4, 3).quantity).toBe(225);
    expect(scaleIngredient(ri, 4, 1).quantity).toBe(75);
  });

  it('lässt Mengen "nach Geschmack" unverändert', () => {
    const ri = recipeIngredient(salt, null, null, null);
    const scaled = scaleIngredient(ri, 2, 6);
    expect(scaled.quantity).toBeNull();
    expect(scaled.displayText).toBe('Salz');
  });

  it('wirft bei ungültigen Portionen', () => {
    const ri = recipeIngredient(pasta, 200, 'g', 200);
    expect(() => scaleIngredient(ri, 0, 4)).toThrow();
    expect(() => scaleIngredient(ri, 2, -1)).toThrow();
  });
});

describe('scaleRecipe', () => {
  it('skaliert alle Zutaten und behält defaultServings bei', () => {
    const r = recipe({
      id: 'r1',
      defaultServings: 2,
      ingredients: [recipeIngredient(pasta, 200, 'g', 200), recipeIngredient(salt, null, null, null)],
    });
    const scaled = scaleRecipe(r, 6);
    expect(scaled.ingredients[0]!.quantity).toBe(600);
    expect(scaled.ingredients[1]!.quantity).toBeNull();
    expect(scaled.defaultServings).toBe(2);
  });
});

describe('buildDisplayText', () => {
  it('kürzt den Qualifier hinter dem Komma und hängt die Zubereitungsnotiz an', () => {
    const tomato = ingredient({ id: 't', canonicalName: 'Tomate, frisch' });
    const ri = recipeIngredient(tomato, 3, 'Stück', null, { preparationNote: 'gewürfelt' });
    expect(buildDisplayText(ri)).toBe('3 Stück Tomate, gewürfelt');
  });
});
