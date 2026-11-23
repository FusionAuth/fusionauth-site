// :snippet-start: top
import FusionAuthClient from "@fusionauth/typescript-client";
import express, { NextFunction, Request, Response } from 'express';
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

// :snippet-start: views-hbs
app.set('views', path.join(__dirname, '../templates'));
app.set('view engine', 'hbs');
// :snippet-end:

app.use(cookieParser());
// extended parsing turns the picker's deviceIds[] checkboxes into an array
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// :snippet-end:

// :snippet-start: static
app.use('/static', express.static(path.join(__dirname, '../static/')));
// :snippet-end:

// :snippet-start: security
async function validateUserToken(req: Request, res: Response, next: NextFunction) {
  const decoded = await validateUser(req.cookies[userToken]);
  if (!decoded || typeof decoded === 'string' || !decoded.sub) {
    res.redirect(302, '/');
    return;
  }
  res.locals.userId = decoded.sub;
  next();
}
// :snippet-end:

// :snippet-start: get-active-devicelist
interface Device {
  id: string;
  deviceName: string;
  startInstant: string;
  ipAddress: string;
}

async function checkDeviceLimit(req: Request, res: Response, next: NextFunction) {
  const otherDevices = await getActiveDeviceList(req, res);
  if (otherDevices.length >= maxDeviceCount) {
    res.redirect(302, '/device-limit');
    return;
  }
  next();
}

// the user's other sessions for this application, without token values
async function getActiveDeviceList(req: Request, res: Response): Promise<Device[]> {
  const currentRefreshTokenId = req.cookies[userToken]?.refresh_token_id;
  const { refreshTokens = [] } = (await apiClient.retrieveRefreshTokens(res.locals.userId)).response;
  return refreshTokens
    .filter((t) => t.applicationId === clientId && t.id !== currentRefreshTokenId)
    .map((t) => ({
      id: t.id as string,
      deviceName: t.metaData?.device?.name ?? 'Unknown device',
      startInstant: new Date(t.startInstant as number).toUTCString(),
      ipAddress: t.metaData?.device?.lastAccessedAddress ?? ''
    }));
}
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
app.get("/account", validateUserToken, checkDeviceLimit, (req, res) => {
  res.sendFile(path.join(__dirname, '../templates/account.html'));
});
// :snippet-end:

// :snippet-start: make-change
// :snippet-start: make-change-check-devicelimit
app.get("/make-change", validateUserToken, checkDeviceLimit, (req, res) => {
  res.sendFile(path.join(__dirname, '../templates/make-change.html'));
});
// :snippet-end:

// the page script calls this route, so answer 403 instead of redirecting
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
// :snippet-start: device-limiting-maxcount
app.get("/device-limit", validateUserToken, async (req, res) => {
  const devices = await getActiveDeviceList(req, res);
  res.render('device-limit', { devices, maxDeviceCount });
});
// :snippet-end:

// :snippet-start: device-limiting-validatetoken
app.post("/device-limit", validateUserToken, async (req, res) => {
  const refreshTokenIds: string[] = [].concat(req.body.deviceIds ?? []);
  if (refreshTokenIds.length === 0) {
    res.redirect(302, '/device-limit');
    return;
  }

  // only revoke tokens that belong to this user and application
  const ownDeviceIds = new Set((await getActiveDeviceList(req, res)).map((device) => device.id));
  for (const refreshTokenId of refreshTokenIds.filter((id) => ownDeviceIds.has(id))) {
    await apiClient.revokeRefreshTokenById(refreshTokenId).catch((err) => console.error(err));
  }
  res.redirect(302, '/account');
});
// :snippet-end:
// :snippet-end:

// :snippet-start: app
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
// :snippet-end:
