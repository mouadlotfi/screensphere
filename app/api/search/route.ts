import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, CACHE_TIMES } from '@/lib/tmdb';
import type { MoviesResponse, ErrorWithStatus } from '@/lib/types';

// No static caching for search - results depend on query
export const dynamic = 'force-dynamic';

interface SearchResponse {
  results: MoviesResponse['results'];
}

export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse | { error: string }>> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await fetchTmdb<MoviesResponse>(
      '/search/movie',
      {
        query: query.trim(),
        include_adult: 'false',
      },
      CACHE_TIMES.SEARCH
    );

    return NextResponse.json(
      { results: data.results ?? [] },
      {
        headers: {
          // Short cache for search results
          'Cache-Control': 'private, max-age=60',
        },
      }
    );
  } catch (error) {
    const err = error as ErrorWithStatus;
    const status = err.status ?? 500;
    return NextResponse.json(
      { error: err.message || 'Search failed.' },
      { status }
    );
  }
}
