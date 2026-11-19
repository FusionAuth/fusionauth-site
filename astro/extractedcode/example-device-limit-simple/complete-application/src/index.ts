// :snippet-start: top
import FusionAuthClient, { UserLoginSuccessEvent } from "@fusionauth/typescript-client";
import express from 'express';
import cookieParser from 'cookie-parser';
import pkceChallenge from 'pkce-challenge';
import { GetPublicKeyOrSecret, JwtPayload, verify } from 'jsonwebtoken';
import jwksClient, { RsaSigningKey } from 'jwks-rsa';
import * as path from 'path';
import { randomBytes } from 'crypto';

import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 8080;

for (const name of ['clientId', 'clientSecret', 'fusionAuthURL', 'fusionAuthAPIKey']) {
  if (!process.env[name]) {
    console.error(`Missing ${name} from .env`);
    process.exit(1);
  }
}
const clientId = process.env.clientId as string;
const clientSecret = process.env.clientSecret as string;
const fusionAuthURL = process.env.fusionAuthURL as string;
const fusionAPIKey = process.env.fusionAuthAPIKey as string;
const maxDeviceCount = parseInt(process.env.maxDeviceCount || '2');

const jwks = jwksClient({ jwksUri: `${fusionAuthURL}/.well-known/jwks.json` });

const getKey: GetPublicKeyOrSecret = (header, callback) => {
  jwks.getSigningKey(header.kid)
    .then((key) => callback(null, (key as RsaSigningKey).getPublicKey()))
    .catch((err) => callback(err));
};

// resolves to the decoded token, or false when the token is missing, expired, or badly signed
const validateUser = (userTokenCookie?: { access_token?: string }): Promise<JwtPayload | string | false> => {
  if (!userTokenCookie?.access_token) {
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    verify(userTokenCookie.access_token as string, getKey, undefined, (err, decoded) => resolve(err || !decoded ? false : decoded));
  });
};

const userSession = 'userSession';
const userToken = 'userToken';
// not HttpOnly, so the page script can read it; never trust it on the server
const userDetails = 'userDetails';

const client = new FusionAuthClient('noapikeyneeded', fusionAuthURL);
const apiClient = new FusionAuthClient(fusionAPIKey, fusionAuthURL);

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// :snippet-end:

// :snippet-start: static
app.use('/static', express.static(path.join(__dirname, '../static/')));
// :snippet-end:

// :snippet-start: homepage
app.get("/", async (req, res) => {
  const userTokenCookie = req.cookies[userToken];
  if (await validateUser(userTokenCookie)) {
    res.redirect(302, '/account');
  } else {
    const stateValue = randomBytes(32).toString('base64url');
    const pkcePair = await pkceChallenge();
    res.cookie(userSession, { stateValue, verifier: pkcePair.code_verifier, challenge: pkcePair.code_challenge }, { httpOnly: true });
    res.sendFile(path.join(__dirname, '../templates/home.html'));
  }
});
// :snippet-end:

// :snippet-start: login
app.get('/login', (req, res) => {
  const userSessionCookie = req.cookies[userSession];
  // the home page sets the state and PKCE cookie
  if (!userSessionCookie?.stateValue || !userSessionCookie?.challenge) {
    res.redirect(302, '/');
    return;
  }

  res.redirect(302, `${fusionAuthURL}/oauth2/authorize?client_id=${clientId}&response_type=code&scope=offline_access&redirect_uri=http://localhost:${port}/oauth-redirect&state=${userSessionCookie?.stateValue}&code_challenge=${userSessionCookie?.challenge}&code_challenge_method=S256`)
});
// :snippet-end:

// :snippet-start: oauth-redirect
app.get('/oauth-redirect', async (req, res) => {
  const stateFromFusionAuth = `${req.query?.state}`;
  const authCode = `${req.query?.code}`;

  const userSessionCookie = req.cookies[userSession];
  if (stateFromFusionAuth !== userSessionCookie?.stateValue) {
    console.error('state mismatch, restarting login');
    res.redirect(302, '/');
    return;
  }

  try {
    const accessToken = (await client.exchangeOAuthCodeForAccessTokenUsingPKCE(authCode,
      clientId,
      clientSecret,
      `http://localhost:${port}/oauth-redirect`,
      userSessionCookie.verifier)).response;

    const decoded = await validateUser(accessToken);
    if (!decoded || typeof decoded === 'string' || !decoded.sub) {
      res.redirect(302, '/');
      return;
    }
    res.cookie(userToken, accessToken, { httpOnly: true });

    const userResponse = (await apiClient.retrieveUser(decoded.sub)).response;
    if (!userResponse?.user) {
      res.redirect(302, '/');
      return;
    }
    res.cookie(userDetails, userResponse.user);
    res.redirect(302, '/account');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'login failed' });
  }
});
// :snippet-end:

// :snippet-start: account
app.get("/account", async (req, res) => {
  const userTokenCookie = req.cookies[userToken];
  if (!await validateUser(userTokenCookie)) {
    res.redirect(302, '/');
  } else {
    res.sendFile(path.join(__dirname, '../templates/account.html'));
  }
});
// :snippet-end:

// :snippet-start: make-change
app.get("/make-change", async (req, res) => {
  const userTokenCookie = req.cookies[userToken];
  if (!await validateUser(userTokenCookie)) {
    res.redirect(302, '/');
  } else {
    res.sendFile(path.join(__dirname, '../templates/make-change.html'));
  }
});

app.post("/make-change", async (req, res) => {
  const userTokenCookie = req.cookies[userToken];
  if (!await validateUser(userTokenCookie)) {
    res.status(403).json(JSON.stringify({
      error: 'Unauthorized'
    }))
    return;
  }

  let error;
  let message;

  var coins = {
    quarters: 0.25,
    dimes: 0.1,
    nickels: 0.05,
    pennies: 0.01,
  };

  try {
    message = 'We can make change for';
    let remainingAmount = +req.body.amount;
    for (const [name, nominal] of Object.entries(coins)) {
      let count = Math.floor(remainingAmount / nominal);
      remainingAmount =
        Math.round((remainingAmount - count * nominal) * 100) / 100;

      message = `${message} ${count} ${name}`;
    }
    message = `${message}!`;
  } catch (ex) {
    error = `There was a problem converting the amount submitted. ${(ex as Error).message}`;
  }
  res.json(JSON.stringify({
    error,
    message
  }))

});
// :snippet-end:

// :snippet-start: logout
app.get('/logout', (req, res) => {
  res.redirect(302, `${fusionAuthURL}/oauth2/logout?client_id=${clientId}`);
});
// :snippet-end:

// :snippet-start: oauth-logout
app.get('/oauth2/logout', async (req, res) => {
  const refreshTokenId = req.cookies[userToken]?.refresh_token_id;
  // a revoked refresh token no longer counts toward the device limit
  if (refreshTokenId) {
    await apiClient.revokeRefreshTokenById(refreshTokenId).catch((err) => console.error(err));
  }

  res.clearCookie(userSession);
  res.clearCookie(userToken);
  res.clearCookie(userDetails);
  res.redirect(302, '/')
});
// :snippet-end:

// :snippet-start: device-limiting
app.post('/user-login-success', async (req, res) => {
  const event = req.body.event as UserLoginSuccessEvent;
  if (event.applicationId !== clientId || !event.user?.id) {
    res.sendStatus(200);
    return;
  }

  // :snippet-start: active-session-count
  const { refreshTokens = [] } = (await apiClient.retrieveRefreshTokens(event.user.id)).response;
  // the SSO session and other applications' tokens don't count
  const activeSessionCount = refreshTokens.filter((token) => token.applicationId === clientId).length;
  // :snippet-end:

  // a non-2xx response stops the login when the webhook transaction requires success
  if (activeSessionCount >= maxDeviceCount) {
    console.log(`blocked login for user ${event.user.id}: ${activeSessionCount} of ${maxDeviceCount} sessions in use`);
    res.sendStatus(403);
    return;
  }
  res.sendStatus(200);
});
// :snippet-end:

// :snippet-start: app
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
// :snippet-end:
