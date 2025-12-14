import { NextResponse } from 'next/server';
import { fetchTmdb } from '@/lib/tmdb.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') ?? '1';

  try {
    const data = await fetchTmdb('/movie/top_rated', { language: 'en-US', page });
    return NextResponse.json(data);
  } catch (error) {
    const status = error.status ?? 500;
    return NextResponse.json({ error: error.message || 'Unable to fetch top rated movies.' }, { status });
  }
}
