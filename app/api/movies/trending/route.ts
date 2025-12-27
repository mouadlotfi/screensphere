import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, CACHE_TIMES } from '@/lib/tmdb';
import type { MoviesResponse, ErrorWithStatus } from '@/lib/types';

// Enable ISR for this route (5 minutes)
export const revalidate = 300;

export async function GET(request: NextRequest): Promise<NextResponse<MoviesResponse | { error: string }>> {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') ?? '1';

  try {
    const data = await fetchTmdb<MoviesResponse>(
      '/trending/movie/week',
      { language: 'en-US', page },
      CACHE_TIMES.TRENDING
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TIMES.TRENDING}, stale-while-revalidate=${CACHE_TIMES.TRENDING * 2}`,
      },
    });
  } catch (error) {
    const err = error as ErrorWithStatus;
    const status = err.status ?? 500;
    return NextResponse.json(
      { error: err.message || 'Unable to fetch trending movies.' },
      { status }
    );
  }
}
