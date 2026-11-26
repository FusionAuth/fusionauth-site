import * as client from 'openid-client';
import { redirect } from 'next/navigation';
import { CALLBACK_URL, getConfig, getSession } from '../../auth';

export async function GET() {
  const session = await getSession();
  session.codeVerifier = client.randomPKCECodeVerifier();
  await session.save();

  const url = client.buildAuthorizationUrl(await getConfig(), {
    redirect_uri: CALLBACK_URL,
    scope: 'openid',
    code_challenge: await client.calculatePKCECodeChallenge(session.codeVerifier),
    code_challenge_method: 'S256',
  });
  redirect(url.href);
}
