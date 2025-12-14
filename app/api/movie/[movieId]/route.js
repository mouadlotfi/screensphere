import { NextResponse } from 'next/server';
import { fetchTmdb } from '@/lib/tmdb.js';

export async function GET(_request, { params }) {
  const { movieId } = params;
  if (!movieId) {
    return NextResponse.json({ error: 'Movie identifier is required.' }, { status: 400 });
  }

  try {
    const data = await fetchTmdb(`/movie/${movieId}`, { append_to_response: 'videos' });
    return NextResponse.json(data);
  } catch (error) {
    const status = error.status ?? 500;
    return NextResponse.json({ error: error.message || 'Unable to fetch movie details.' }, { status });
  }
}
