import * as client from 'openid-client';

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const currentUrl = new URL(event.path, CALLBACK_URL);

  // exchange the authorization code for tokens and validate the ID token
  const tokens = await client.authorizationCodeGrant(await getConfig(), currentUrl, {
    pkceCodeVerifier: session.data.codeVerifier,
  });

  const claims = tokens.claims();
  const fullName = `${claims.given_name ?? ''} ${claims.family_name ?? ''}`.trim();
  const user = { id: claims.sub, email: claims.email, name: fullName || claims.email || 'User' };
  await session.update({ user, codeVerifier: undefined });
  return sendRedirect(event, '/');
});
