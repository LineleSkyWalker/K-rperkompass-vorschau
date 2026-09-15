import { buildRecipe, type RecipeDraft } from './_dsl';
import { BREAKFAST } from './breakfast';
import { MAINS_1 } from './mains-1';
import { MAINS_2 } from './mains-2';
import { MAINS_3 } from './mains-3';
import { SNACKS } from './snacks';
import { DESSERTS_BAKING } from './desserts-baking';
import type { Recipe } from '../../src/types/recipe';
import { RECIPE_IMAGES } from '../recipe-images';

export const RECIPE_DRAFTS: RecipeDraft[] = [...BREAKFAST, ...MAINS_1, ...MAINS_2, ...MAINS_3, ...SNACKS, ...DESSERTS_BAKING];

export const RECIPES: Recipe[] = RECIPE_DRAFTS.map(buildRecipe).map((r) => ({ ...r, image: RECIPE_IMAGES[r.id] ?? r.image }));
