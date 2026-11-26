import * as client from 'openid-client';

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const currentUrl = new URL(event.path, CALLBACK_URL);

  // exchange the authorization code for tokens and validate the ID token
  const tokens = await client.authorizationCodeGrant(await getConfig(), currentUrl, {
    pkceCodeVerifier: session.data.codeVerifier,
  });

  await session.update({ user: { id: tokens.claims().sub }, codeVerifier: undefined });
  return sendRedirect(event, '/');
});
