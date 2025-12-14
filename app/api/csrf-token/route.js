import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = crypto.randomBytes(16).toString('hex');
  return NextResponse.json({ csrf_token: token });
}
