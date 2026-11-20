import * as client from 'openid-client';
import { redirect } from 'next/navigation';
import { CALLBACK_URL, getConfig, getSession } from '../../auth';

export async function GET(request) {
  const session = await getSession();
  const currentUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, CALLBACK_URL);

  // exchange the authorization code for tokens and validate the ID token
  const tokens = await client.authorizationCodeGrant(await getConfig(), currentUrl, {
    pkceCodeVerifier: session.codeVerifier,
  });

  const claims = tokens.claims();
  const fullName = `${claims.given_name ?? ''} ${claims.family_name ?? ''}`.trim();
  session.user = { id: claims.sub, email: claims.email, name: fullName || claims.email || 'User' };
  delete session.codeVerifier;
  await session.save();
  redirect('/');
}
