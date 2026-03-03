import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

interface AuthResult {
  userId: string;
  email: string;
}

/**
 * Require an authenticated session. Returns userId/email or a 401 response.
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return { userId: session.user.id, email: session.user.email || '' };
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

/**
 * Require admin access. Checks session + email against ADMIN_EMAILS env var.
 * If ADMIN_EMAILS is empty, any authenticated user is treated as admin (single-operator mode).
 */
export async function requireAdmin(): Promise<AuthResult | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(result.email.toLowerCase())) {
    return NextResponse.json({ success: false, error: 'Forbidden — admin access required' }, { status: 403 });
  }
  return result;
}

/** Type guard: true if the auth check failed (returned an HTTP response) */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
