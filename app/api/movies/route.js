import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth.js';
import { getFavoritesForUser } from '@/lib/favorites.js';

export async function GET(request) {
  try {
    const user = await requireUser(request);
    const favorites = await getFavoritesForUser(user.id);

    const formatted = favorites.map((favorite) => ({
      id: favorite.id,
      user_id: favorite.userId,
      tmdb_id: favorite.tmdbId,
      title: favorite.title,
      overview: favorite.overview,
      release_date: favorite.releaseDate,
      poster_path: favorite.posterPath,
      status: favorite.status,
      created_at: favorite.createdAt,
      updated_at: favorite.updatedAt,
    }));

    return NextResponse.json({ savedShows: formatted });
  } catch (error) {
    const status = error.status ?? 500;
    return NextResponse.json({ error: error.message || 'Unable to load favourites.' }, { status });
  }
}
