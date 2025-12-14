const sanitizeString = (value, fallback = '') => {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
};

const deriveNameFromMetadata = (user) => {
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

export const mapSupabaseUser = (user) => {
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

const normaliseTmdbId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  return String(value);
};

export const mapFavoriteRecord = (record) => {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    userId: record.user_id,
    tmdbId: normaliseTmdbId(record.tmdb_id),
    title: sanitizeString(record.title),
    overview: sanitizeString(record.overview),
    releaseDate: record.release_date ?? '1900-01-01',
    posterPath: sanitizeString(record.poster_path),
    status: sanitizeString(record.status),
    createdAt: record.created_at ?? new Date().toISOString(),
    updatedAt: record.updated_at ?? new Date().toISOString(),
  };
};

export const buildFavoriteUpsertPayload = (userId, favorite) => {
  const tmdbId =
    favorite?.tmdbId ?? favorite?.tmdb_id ?? favorite?.movie_id ?? favorite?.id ?? null;

  if (!tmdbId) {
    const error = new Error('A TMDB identifier is required.');
    error.status = 422;
    throw error;
  }

  const payload = {
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
