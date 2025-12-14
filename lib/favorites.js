import { getSupabaseServiceRoleClient } from './supabaseServer.js';
import { buildFavoriteUpsertPayload, mapFavoriteRecord } from './supabase/mappers.js';

const FAVORITES_TABLE = 'favorites';

const handleSupabaseError = (error, fallbackMessage) => {
  if (!error) {
    return;
  }

  const wrapped = new Error(error.message || fallbackMessage);
  if (error.status) {
    wrapped.status = error.status;
  }
  throw wrapped;
};

export const getFavoritesForUser = async (userId) => {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(FAVORITES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  handleSupabaseError(error, 'Unable to load favourites.');

  return Array.isArray(data) ? data.map(mapFavoriteRecord).filter(Boolean) : [];
};

export const upsertFavorite = async (userId, favorite) => {
  const supabase = getSupabaseServiceRoleClient();
  const payload = buildFavoriteUpsertPayload(userId, favorite);

  const { data, error } = await supabase
    .from(FAVORITES_TABLE)
    .upsert(payload, { onConflict: 'user_id,tmdb_id', returning: 'representation' })
    .select()
    .maybeSingle();

  handleSupabaseError(error, 'Unable to save favourite.');

  if (!data) {
    const fallback = new Error('Unable to save favourite.');
    fallback.status = 500;
    throw fallback;
  }

  return mapFavoriteRecord(data);
};

export const deleteFavorite = async ({ userId, favoriteId }) => {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(FAVORITES_TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('id', favoriteId)
    .select('id');

  handleSupabaseError(error, 'Unable to delete favourite.');

  return Array.isArray(data) && data.length > 0;
};
