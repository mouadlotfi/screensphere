import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, CACHE_TIMES } from '@/lib/tmdb';
import type { Videos, ErrorWithStatus } from '@/lib/types';

interface MovieParams {
  movieId: string;
}

// Enable ISR for video data (1 hour)
export const revalidate = 3600;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<MovieParams> }
): Promise<NextResponse<Videos | { error: string }>> {
  const { movieId } = await params;

  if (!movieId) {
    return NextResponse.json({ error: 'Movie identifier is required.' }, { status: 400 });
  }

  try {
    const data = await fetchTmdb<Videos>(
      `/movie/${movieId}/videos`,
      {},
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
      { error: err.message || 'Unable to fetch videos.' },
      { status }
    );
  }
}
