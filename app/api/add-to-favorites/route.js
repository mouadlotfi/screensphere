import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth.js';
import { upsertFavorite } from '@/lib/favorites.js';

export async function POST(request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();

    const favorite = await upsertFavorite(user.id, body);

    return NextResponse.json({ message: 'Movie added to favorites successfully', favorite });
  } catch (error) {
    const status = error.status ?? 500;
    return NextResponse.json({ error: error.message || 'Unable to save favourite.' }, { status });
  }
}
