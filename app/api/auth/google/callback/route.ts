import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient, saveTokens } from '@/lib/google-calendar';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?calendar=error', req.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?calendar=error', req.url)
    );
  }

  try {
    const orgId  = Buffer.from(state, 'base64').toString('utf8');
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);

    await saveTokens(orgId, tokens);

    return NextResponse.redirect(
      new URL('/dashboard/settings?calendar=connected', req.url)
    );
  } catch (err) {
    console.error('[google-callback]', err);
    return NextResponse.redirect(
      new URL('/dashboard/settings?calendar=error', req.url)
    );
  }
}
