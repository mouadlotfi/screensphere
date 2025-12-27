import { getSupabaseServiceRoleClient } from './supabaseServer';
import { buildFavoriteUpsertPayload, mapFavoriteRecord, MappedFavorite, FavoriteInput } from './supabase/mappers';
import type { ErrorWithStatus } from './types';

interface DeleteFavoriteParams {
  userId: string;
  favoriteId: string;
}

interface SupabaseError {
  message?: string;
  status?: number;
}

const FAVORITES_TABLE = 'favorites';

/**
 * Only select the columns we need to reduce payload size
 * This is more efficient than select('*')
 */
const FAVORITES_COLUMNS = 'id, user_id, tmdb_id, title, overview, release_date, poster_path, status, created_at, updated_at';

const handleSupabaseError = (error: unknown, fallbackMessage: string): void => {
  if (!error) {
    return;
  }

  const supabaseError = error as SupabaseError;
  const wrapped = new Error(supabaseError.message || fallbackMessage) as ErrorWithStatus;
  if (supabaseError.status) {
    wrapped.status = supabaseError.status;
  }
  throw wrapped;
};

/**
 * Get all favorites for a user with optimized column selection
 * Orders by created_at descending (newest first)
 */
export const getFavoritesForUser = async (userId: string): Promise<MappedFavorite[]> => {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(FAVORITES_TABLE)
    .select(FAVORITES_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  handleSupabaseError(error, 'Unable to load favourites.');

  return Array.isArray(data) ? data.map(mapFavoriteRecord).filter((item): item is MappedFavorite => item !== null) : [];
};

export const upsertFavorite = async (userId: string, favorite: FavoriteInput): Promise<MappedFavorite> => {
  const supabase = getSupabaseServiceRoleClient();
  const payload = buildFavoriteUpsertPayload(userId, favorite);

  const { data, error } = await supabase
    .from(FAVORITES_TABLE)
    .upsert(payload, { onConflict: 'user_id,tmdb_id' })
    .select()
    .maybeSingle();

  handleSupabaseError(error, 'Unable to save favourite.');

  if (!data) {
    const fallback = new Error('Unable to save favourite.') as ErrorWithStatus;
    fallback.status = 500;
    throw fallback;
  }

  const mapped = mapFavoriteRecord(data);
  if (!mapped) {
    const fallback = new Error('Unable to save favourite.') as ErrorWithStatus;
    fallback.status = 500;
    throw fallback;
  }
  return mapped;
};

export const deleteFavorite = async ({ userId, favoriteId }: DeleteFavoriteParams): Promise<boolean> => {
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
