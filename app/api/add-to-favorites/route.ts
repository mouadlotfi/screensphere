import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { upsertFavorite } from '@/lib/favorites';

interface PostBody {
  tmdbId?: number;
  title?: string;
  overview?: string;
  releaseDate?: string;
  posterPath?: string;
  status?: 'watching' | 'completed' | 'planned';
}

interface PostResponse {
  message: string;
  favorite?: any;
}

interface ErrorResponse {
  error: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<PostResponse | ErrorResponse>> {
  try {
    const user = await requireUser(request);
    const body: PostBody = await request.json();

    const favorite = await upsertFavorite(user.id, body);

    return NextResponse.json({ message: 'Movie added to favorites successfully', favorite });
  } catch (error: any) {
    const status = error.status ?? 500;
    return NextResponse.json({ error: error.message || 'Unable to save favourite.' }, { status });
  }
}
