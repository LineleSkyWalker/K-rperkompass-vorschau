import { buildShoppingList, formatItemQuantity, groupByCategory, mergeWithSavedState } from '../shoppingList';
import { entry, ingredient, recipe, recipeIngredient } from './fixtures';
import type { ShoppingListItem } from '@/types/recipe';

const tomato = ingredient({ id: 'tomato', canonicalName: 'Tomate, frisch', shoppingCategory: 'produce', gramsPerPiece: 80 });
const pasta = ingredient({ id: 'pasta', canonicalName: 'Nudeln', shoppingCategory: 'dry_goods' });
const egg = ingredient({ id: 'egg', canonicalName: 'Ei', shoppingCategory: 'dairy_chilled', gramsPerPiece: 55 });
const salt = ingredient({ id: 'salt', canonicalName: 'Salz', shoppingCategory: 'spices' });
const milk = ingredient({ id: 'milk', canonicalName: 'Milch', shoppingCategory: 'dairy_chilled', densityGPerMl: 1.03 });

describe('buildShoppingList', () => {
  it('führt gleiche Zutaten zusammen: 200 g + 400 g = 600 g', () => {
    const r1 = recipe({ id: 'r1', defaultServings: 2, ingredients: [recipeIngredient(tomato, 200, 'g', 200)] });
    const r2 = recipe({ id: 'r2', defaultServings: 2, ingredients: [recipeIngredient(tomato, 400, 'g', 400)] });
    const list = buildShoppingList([
      entry({ recipe: r1, date: '2026-09-14' }),
      entry({ recipe: r2, date: '2026-09-15' }),
    ]);
    expect(list).toHaveLength(1);
    expect(list[0]!.quantity).toBe(600);
    expect(list[0]!.unit).toBe('g');
    expect(list[0]!.fromRecipeIds).toEqual(['r1', 'r2']);
  });

  it('skaliert nach geplanten Portionen', () => {
    const r = recipe({ id: 'r', defaultServings: 2, ingredients: [recipeIngredient(pasta, 200, 'g', 200)] });
    const list = buildShoppingList([entry({ recipe: r, date: '2026-09-14', servings: 5 })]);
    expect(list[0]!.quantity).toBe(500);
  });

  it('summiert Stück in Stück, wenn alle Vorkommen Stück sind', () => {
    const r1 = recipe({ id: 'r1', ingredients: [recipeIngredient(egg, 2, 'Stück', 110)] });
    const r2 = recipe({ id: 'r2', ingredients: [recipeIngredient(egg, 3, 'Stück', 165)] });
    const list = buildShoppingList([entry({ recipe: r1, date: 'd1' }), entry({ recipe: r2, date: 'd2' })]);
    expect(list[0]!.quantity).toBe(5);
    expect(list[0]!.unit).toBe('Stück');
    expect(list[0]!.quantityInGrams).toBe(275);
  });

  it('führt gemischte Einheiten (Stück + g) auf Gramm zusammen, wenn Stückgewicht bekannt', () => {
    const r1 = recipe({ id: 'r1', ingredients: [recipeIngredient(tomato, 2, 'Stück', 160)] });
    const r2 = recipe({ id: 'r2', ingredients: [recipeIngredient(tomato, 300, 'g', 300)] });
    const list = buildShoppingList([entry({ recipe: r1, date: 'd1' }), entry({ recipe: r2, date: 'd2' })]);
    expect(list[0]!.quantity).toBe(460);
    expect(list[0]!.unit).toBe('g');
  });

  it('summiert ml und l zu ml', () => {
    const r1 = recipe({ id: 'r1', ingredients: [recipeIngredient(milk, 250, 'ml', 257.5)] });
    const r2 = recipe({ id: 'r2', ingredients: [recipeIngredient(milk, 0.5, 'l', 515)] });
    const list = buildShoppingList([entry({ recipe: r1, date: 'd1' }), entry({ recipe: r2, date: 'd2' })]);
    expect(list[0]!.quantity).toBe(750);
    expect(list[0]!.unit).toBe('ml');
  });

  it('markiert Zutaten nach Geschmack als "nach Bedarf"', () => {
    const r = recipe({ id: 'r', ingredients: [recipeIngredient(salt, null, null, null)] });
    const list = buildShoppingList([entry({ recipe: r, date: 'd1' })]);
    expect(list[0]!.toTaste).toBe(true);
    expect(formatItemQuantity(list[0]!)).toBe('nach Bedarf');
  });

  it('überspringt Reste-Einträge und optionale Zutaten', () => {
    const r = recipe({
      id: 'r',
      ingredients: [recipeIngredient(pasta, 200, 'g', 200), recipeIngredient(egg, 1, 'Stück', 55, { optional: true })],
    });
    const cook = entry({ recipe: r, date: 'd1' });
    const leftover = entry({ recipe: r, date: 'd2', leftoverOfEntryId: cook.id });
    const list = buildShoppingList([cook, leftover]);
    expect(list).toHaveLength(1);
    expect(list[0]!.ingredientId).toBe('pasta');
    expect(list[0]!.quantity).toBe(200);
  });

  it('sortiert nach Kategorie-Reihenfolge und Name', () => {
    const r = recipe({
      id: 'r',
      ingredients: [
        recipeIngredient(salt, null, null, null),
        recipeIngredient(pasta, 100, 'g', 100),
        recipeIngredient(tomato, 100, 'g', 100),
      ],
    });
    const list = buildShoppingList([entry({ recipe: r, date: 'd1' })]);
    expect(list.map((i) => i.category)).toEqual(['produce', 'dry_goods', 'spices']);
    const groups = groupByCategory(list);
    expect(groups.map((g) => g.category)).toEqual(['produce', 'dry_goods', 'spices']);
  });
});

describe('mergeWithSavedState', () => {
  it('behält abgehakt / "habe ich" und manuelle Einträge', () => {
    const r = recipe({ id: 'r', ingredients: [recipeIngredient(pasta, 100, 'g', 100)] });
    const generated = buildShoppingList([entry({ recipe: r, date: 'd1' })]);
    const saved: ShoppingListItem[] = [
      {
        id: 's1', userId: 'u', ingredientId: 'pasta', name: 'Nudeln', quantity: 50, unit: 'g', quantityInGrams: 50,
        category: 'dry_goods', checked: true, alreadyHave: false, fromRecipeIds: ['r'], manual: false,
      },
      {
        id: 'm1', userId: 'u', ingredientId: null, name: 'Spülmittel', quantity: 1, unit: 'Stück', quantityInGrams: null,
        category: 'other', checked: false, alreadyHave: false, fromRecipeIds: [], manual: true,
      },
    ];
    const merged = mergeWithSavedState(generated, saved, 'u');
    const pastaItem = merged.find((i) => i.ingredientId === 'pasta')!;
    expect(pastaItem.checked).toBe(true);
    expect(pastaItem.quantity).toBe(100); // Menge kommt aus dem Plan, nicht aus dem alten Stand
    expect(merged.some((i) => i.name === 'Spülmittel')).toBe(true);
  });
});
