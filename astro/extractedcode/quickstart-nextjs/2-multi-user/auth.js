import * as client from 'openid-client';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const FUSIONAUTH_URL = 'http://localhost:9011';
export const CLIENT_ID = process.env.FUSIONAUTH_CLIENT_ID;
export const CALLBACK_URL = process.env.FUSIONAUTH_CALLBACK_URL;

// find FusionAuth's login and token endpoints in its OpenID Connect discovery document
let config;
export async function getConfig() {
  config ??= await client.discovery(new URL(FUSIONAUTH_URL), CLIENT_ID, process.env.FUSIONAUTH_CLIENT_SECRET, undefined, {
    execute: [client.allowInsecureRequests], // the local FusionAuth instance uses http
  });
  return config;
}

// an encrypted cookie that holds the logged-in user and the PKCE code verifier
export async function getSession() {
  return getIronSession(await cookies(), { password: process.env.SESSION_SECRET, cookieName: 'session' });
}
