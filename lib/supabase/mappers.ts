import { User } from '@supabase/supabase-js';

export interface MappedUser {
  id: string;
  email: string | null;
  name: string;
  metadata: Record<string, any>;
}

export interface MappedFavorite {
  id: string;
  userId: string;
  tmdbId: number | string;
  title: string;
  overview: string;
  releaseDate: string;
  posterPath: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteInput {
  id?: string;
  tmdbId?: number | string;
  tmdb_id?: number | string;
  movie_id?: number | string;
  title?: string | null;
  overview?: string | null;
  release_date?: string;
  releaseDate?: string;
  poster_path?: string | null;
  posterPath?: string | null;
  status?: string | null;
  createdAt?: string;
}

const sanitizeString = (value: unknown, fallback: string = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
};

const deriveNameFromMetadata = (user: User | null): string | null => {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata ?? {};
  const nameCandidates = [
    metadata.full_name,
    metadata.name,
    metadata.display_name,
    metadata.username,
  ];

  const fromMetadata = nameCandidates.find(
    (candidate) => typeof candidate === 'string' && candidate.trim().length > 0,
  );

  if (fromMetadata) {
    return fromMetadata.trim();
  }

  const emailPrefix = typeof user.email === 'string' ? user.email.split('@')[0] : null;
  if (emailPrefix && emailPrefix.trim().length > 0) {
    return emailPrefix.trim();
  }

  return null;
};

export const mapSupabaseUser = (user: User | null): MappedUser | null => {
  if (!user) {
    return null;
  }

  const name = deriveNameFromMetadata(user) ?? 'Viewer';

  return {
    id: user.id,
    email: user.email ?? null,
    name,
    metadata: user.user_metadata ?? {},
  };
};

const normaliseTmdbId = (value: unknown): number | string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  return String(value);
};

export const mapFavoriteRecord = (record: any): MappedFavorite | null => {
  if (!record) {
    return null;
  }

  const tmdbId = normaliseTmdbId(record.tmdb_id);
  if (!tmdbId) {
    return null;
  }

  return {
    id: record.id,
    userId: record.user_id,
    tmdbId,
    title: sanitizeString(record.title),
    overview: sanitizeString(record.overview),
    releaseDate: record.release_date ?? '1900-01-01',
    posterPath: sanitizeString(record.poster_path),
    status: sanitizeString(record.status),
    createdAt: record.created_at ?? new Date().toISOString(),
    updatedAt: record.updated_at ?? new Date().toISOString(),
  };
};

export const buildFavoriteUpsertPayload = (userId: string, favorite: FavoriteInput) => {
  const tmdbId =
    favorite?.tmdbId ?? favorite?.tmdb_id ?? favorite?.movie_id ?? favorite?.id ?? null;

  if (!tmdbId) {
    const error = new Error('A TMDB identifier is required.') as Error & { status?: number };
    error.status = 422;
    throw error;
  }

  const payload: Record<string, any> = {
    user_id: userId,
    tmdb_id: normaliseTmdbId(tmdbId),
    title: sanitizeString(favorite?.title),
    overview: sanitizeString(favorite?.overview),
    release_date: favorite?.release_date ?? favorite?.releaseDate ?? '1900-01-01',
    poster_path: sanitizeString(favorite?.poster_path ?? favorite?.posterPath),
    status: sanitizeString(favorite?.status),
  };

  if (favorite?.id) {
    payload.id = favorite.id;
  }

  if (favorite?.createdAt) {
    payload.created_at = favorite.createdAt;
  }

  return payload;
};
