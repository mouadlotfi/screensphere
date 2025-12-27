import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getFavoritesForUser } from '@/lib/favorites';

interface GetResponse {
  user?: any;
  message?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<GetResponse>> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
  }

  const favorites = await getFavoritesForUser(user.id);

  return NextResponse.json({ user: { ...user, favorites } });
}
