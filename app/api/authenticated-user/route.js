import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth.js';

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ user });
}
