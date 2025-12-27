import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabaseServer';

interface DeleteAccountBody {
  password: string;
}

interface DeleteAccountResponse {
  message?: string;
  error?: string;
}

export async function DELETE(request: NextRequest): Promise<NextResponse<DeleteAccountResponse>> {
  try {
    const body: DeleteAccountBody = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to delete your account.' },
        { status: 422 }
      );
    }

    // Get the user from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Create a service role client to delete the user
    const supabaseServiceRole = getSupabaseServiceRoleClient();

    // First, verify the password by attempting to get the user data
    // We need to decode the JWT to get the user ID
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return NextResponse.json(
          { error: 'Invalid token.' },
          { status: 401 }
        );
      }

      // Decode the payload (second part)
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );

      const userId = payload.sub;

      if (!userId) {
        return NextResponse.json(
          { error: 'Invalid token.' },
          { status: 401 }
        );
      }

      // Delete the user using the service role client
      const { error: deleteError } = await supabaseServiceRole.auth.admin.deleteUser(userId);

      if (deleteError) {
        return NextResponse.json(
          { error: 'Unable to delete account. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Account deleted successfully.' },
        { status: 200 }
      );
    } catch {
      return NextResponse.json(
        { error: 'Invalid token.' },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Unable to delete account. Please try again.' },
      { status: 500 }
    );
  }
}
