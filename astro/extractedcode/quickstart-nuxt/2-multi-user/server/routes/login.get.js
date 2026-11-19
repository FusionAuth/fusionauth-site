import * as client from 'openid-client';

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const codeVerifier = client.randomPKCECodeVerifier();
  await session.update({ codeVerifier });

  const url = client.buildAuthorizationUrl(await getConfig(), {
    redirect_uri: CALLBACK_URL,
    scope: 'openid profile email',
    code_challenge: await client.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: 'S256',
  });
  return sendRedirect(event, url.href);
});
