import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getFavoritesForUser } from '@/lib/favorites';

interface SavedShow {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface GetResponse {
  savedShows?: SavedShow[];
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<GetResponse>> {
  try {
    const user = await requireUser(request);
    const favorites = await getFavoritesForUser(user.id);

    const formatted: SavedShow[] = favorites.map((favorite: any) => ({
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
  } catch (error: any) {
    const status = error.status ?? 500;
    return NextResponse.json({ error: error.message || 'Unable to load favourites.' }, { status });
  }
}
