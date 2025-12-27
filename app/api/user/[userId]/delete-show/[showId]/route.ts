import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { deleteFavorite } from '@/lib/favorites';

interface DeleteParams {
  userId: string;
  showId: string;
}

interface DeleteResponse {
  message?: string;
  error?: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<DeleteParams> }
): Promise<NextResponse<DeleteResponse>> {
  try {
    const user = await requireUser(request);
    const { userId, showId } = await params;

    if (user.id !== userId) {
      return NextResponse.json({ error: 'You can only modify your own favourites.' }, { status: 403 });
    }

    const deleted = await deleteFavorite({ userId, favoriteId: showId });

    if (!deleted) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Saved show deleted successfully' });
  } catch (error: any) {
    const status = error.status ?? 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}
