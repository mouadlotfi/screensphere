import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, CACHE_TIMES } from '@/lib/tmdb';
import type { MovieDetails, ErrorWithStatus } from '@/lib/types';

interface MovieParams {
  movieId: string;
}

// Enable ISR for movie details - they rarely change
export const revalidate = CACHE_TIMES.MOVIE_DETAILS;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<MovieParams> }
): Promise<NextResponse<MovieDetails | { error: string }>> {
  const { movieId } = await params;

  if (!movieId) {
    return NextResponse.json({ error: 'Movie identifier is required.' }, { status: 400 });
  }

  try {
    const data = await fetchTmdb<MovieDetails>(
      `/movie/${movieId}`,
      { append_to_response: 'videos' },
      CACHE_TIMES.MOVIE_DETAILS
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TIMES.MOVIE_DETAILS}, stale-while-revalidate=${CACHE_TIMES.MOVIE_DETAILS * 2}`,
      },
    });
  } catch (error) {
    const err = error as ErrorWithStatus;
    const status = err.status ?? 500;
    return NextResponse.json(
      { error: err.message || 'Unable to fetch movie details.' },
      { status }
    );
  }
}
