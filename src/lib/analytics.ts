/**
 * Datenschutzfreundliche Produktmetriken.
 * Keine user_id, keine E-Mail, kein Geräte-Fingerprint – nur ein zufälliger
 * Sitzungs-Hash, der beim App-Start neu erzeugt wird.
 * Im lokalen Modus werden Events nur in den Debug-Log geschrieben.
 */
import type { AnalyticsEvent } from '@/types/recipe';
import { getSupabase } from '@/lib/supabase';
import { newId } from '@/lib/ids';

const sessionHash = newId().slice(0, 8);
let enabled = true;

export function setAnalyticsEnabled(on: boolean) {
  enabled = on;
}

export function track(event: AnalyticsEvent): void {
  if (!enabled) return;
  const { type, ...rest } = event;
  const recipeId = 'recipeId' in rest ? rest.recipeId : null;
  const meta = { ...rest } as Record<string, unknown>;
  delete meta.recipeId;
  const sb = getSupabase();
  if (!sb) {
    if (__DEV__) console.log('[analytics]', type, recipeId ?? '', meta);
    return;
  }
  sb.from('analytics_event')
    .insert({ event_type: type, recipe_id: recipeId, meta, session_hash: sessionHash })
    .then(({ error }) => {
      if (error && __DEV__) console.warn('[analytics] insert failed', error.message);
    });
}
