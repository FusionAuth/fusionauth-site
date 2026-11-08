// :snippet-start: top
import FusionAuthClient from "@fusionauth/typescript-client";
import express from 'express';
import cookieParser from 'cookie-parser';
import pkceChallenge from 'pkce-challenge';
import { GetPublicKeyOrSecret, verify } from 'jsonwebtoken';
import jwksClient, { RsaSigningKey } from 'jwks-rsa';
import * as path from 'path';

// Add environment variables
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 8080; // default port to listen

if (!process.env.clientId) {
  console.error('Missing clientId from .env');
  process.exit();
}
if (!process.env.clientSecret) {
  console.error('Missing clientSecret from .env');
  process.exit();
}
if (!process.env.fusionAuthURL) {
  console.error('Missing clientSecret from .env');
  process.exit();
}
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const fusionAuthURL = process.env.fusionAuthURL;
const fusionAPIKey = process.env.fusionAuthAPIKey;
const maxDeviceCount: number = parseInt(process.env.maxDeviceCount || '2');

// Validate the token signature, make sure it wasn't expired
const validateUser = async (userTokenCookie: { access_token: string }) => {
  // Make sure the user is authenticated.
  if (!userTokenCookie || !userTokenCookie?.access_token) {
    return false;
  }
  try {
    let decodedFromJwt;
    await verify(userTokenCookie.access_token, await getKey, undefined, (err, decoded) => {
      decodedFromJwt = decoded;
    });
    return decodedFromJwt;
  } catch (err) {
    console.error(err);
    return false;
  }
}


const getKey: GetPublicKeyOrSecret = async (header, callback) => {
  const jwks = jwksClient({
    jwksUri: `${fusionAuthURL}/.well-known/jwks.json`
  });
  const key = await jwks.getSigningKey(header.kid) as RsaSigningKey;
  var signingKey = key?.getPublicKey() || key?.rsaPublicKey;
  callback(null, signingKey);
}

//Cookies
const userSession = 'userSession';
const userToken = 'userToken';
const userDetails = 'userDetails'; //Non Http-Only with user info (not trusted)

const client = new FusionAuthClient('noapikeyneeded', fusionAuthURL);

// :snippet-start: views-hbs
app.set('views', path.join(__dirname, '../templates'));
app.set('view engine', 'hbs');
// :snippet-end:

app.use(cookieParser());
/** Decode Form URL Encoded & json data */
app.use(express.urlencoded());
app.use(express.json());

// :snippet-end:

// Static Files
// :snippet-start: static
app.use('/static', express.static(path.join(__dirname, '../static/')));
// :snippet-end:

// :snippet-start: security

async function validateUserToken(req: any, res: any, next: any) {
  const userTokenCookie = req.cookies[userToken];
  const decodedUser = await validateUser(userTokenCookie);
  if (!decodedUser) {
    res.redirect(302, '/');
  } else {
    next();
  }
}
// :snippet-end:


// :snippet-start: get-active-devicelist
/**
  Middleware to check if the user has exceeded the device limit. Redirects to the device-limit page if so.
 */
async function checkDeviceLimit(req: any, res: any, next: any) {
  const deviceLimit = await getActiveDeviceList(req);
  if (deviceLimit.length >= maxDeviceCount) {
    return res.redirect(302, '/device-limit');
  } else {
    next();
  }
}


async function getActiveDeviceList(req: any): Promise<any> {

  const userDetailsCookie = req.cookies[userDetails];
  const userTokenCookie = req.cookies[userToken];
  const userId = userDetailsCookie.id;
  const tokenResponse = await fetch(`${fusionAuthURL}/api/jwt/refresh?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${fusionAPIKey}`
    }
  });
  const tokens: any = await tokenResponse.json();

  // Filter tokens that are for this application:
  tokens.refreshTokens = tokens.refreshTokens.filter((t: any) => t.applicationId && t.applicationId === clientId);
  // remove the current session token
  tokens.refreshTokens = tokens.refreshTokens.filter((t: any) => t.token !== userTokenCookie.refresh_token);

  // Map to a simple object for display, removing token values etc.
  return tokens.refreshTokens.map((t: any) => ({
    id: t.id,
    deviceName: t.metaData.device.name,
    startInstant: new Date(t.startInstant).toUTCString(),
    ipAddress: t.metaData.lastAccessedAddress
  }));

}
// :snippet-end:



// :snippet-start: homepage
app.get("/", async (req, res) => {
  const userTokenCookie = req.cookies[userToken];
  if (await validateUser(userTokenCookie)) {
    res.redirect(302, '/account');
  } else {
    const stateValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const pkcePair = await pkceChallenge();
    res.cookie(userSession, { stateValue, verifier: pkcePair.code_verifier, challenge: pkcePair.code_challenge }, { httpOnly: true });

    res.sendFile(path.join(__dirname, '../templates/home.html'));
  }
});
// :snippet-end:

// :snippet-start: login
app.get('/login', (req, res, next) => {
  const userSessionCookie = req.cookies[userSession];

  // Cookie was cleared, just send back (hacky way)
  if (!userSessionCookie?.stateValue || !userSessionCookie?.challenge) {
    res.redirect(302, '/');
  }

  res.redirect(302, `${fusionAuthURL}/oauth2/authorize?client_id=${clientId}&response_type=code&scope=offline_access&redirect_uri=http://localhost:${port}/oauth-redirect&state=${userSessionCookie?.stateValue}&code_challenge=${userSessionCookie?.challenge}&code_challenge_method=S256`)
  //res.redirect(302, `${fusionAuthURL}/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:${port}/oauth-redirect&state=${userSessionCookie?.stateValue}&code_challenge=${userSessionCookie?.challenge}&code_challenge_method=S256`);
});
// :snippet-end:

// :snippet-start: oauth-redirect
app.get('/oauth-redirect', async (req, res, next) => {
  // Capture query params
  const stateFromFusionAuth = `${req.query?.state}`;
  const authCode = `${req.query?.code}`;

  // Validate cookie state matches FusionAuth's returned state
  const userSessionCookie = req.cookies[userSession];
  if (stateFromFusionAuth !== userSessionCookie?.stateValue) {
    console.log("State doesn't match. uh-oh.");
    console.log("Saw: " + stateFromFusionAuth + ", but expected: " + userSessionCookie?.stateValue);
    res.redirect(302, '/');
    return;
  }

  try {
    // Exchange Auth Code and Verifier for Access Token
    const accessToken = (await client.exchangeOAuthCodeForAccessTokenUsingPKCE(authCode,
      clientId,
      clientSecret,
      `http://localhost:${port}/oauth-redirect`,
      userSessionCookie.verifier)).response;

    if (!accessToken.access_token) {
      console.error('Failed to get Access Token')
      return;
    }
    res.cookie(userToken, accessToken, { httpOnly: true })

    //TODO: Remove this logging line:
    console.log(`Access Token: ${accessToken.access_token.substring(0, 10)} ...`);
    console.log(`Refresh Token: ${accessToken.refresh_token?.substring(0, 10)} ...`);

    // user api no longer accepts JWTs, so look the user up by the token sub
    const { sub } = JSON.parse(Buffer.from((accessToken.access_token as string).split('.')[1], 'base64url').toString());
    const userResponse = (await new FusionAuthClient(fusionAPIKey as string, fusionAuthURL).retrieveUser(sub)).response;
    if (!userResponse?.user) {
      console.error('Failed to get User from access token, redirecting home.');
      res.redirect(302, '/');
    }
    res.cookie(userDetails, userResponse.user);

    res.redirect(302, '/account');
  } catch (err: any) {
    console.error(err);
    res.status(err?.statusCode || 500).json(JSON.stringify({
      error: err
    }))
  }
});
// :snippet-end:



// :snippet-start: account
app.get("/account", validateUserToken, checkDeviceLimit, async (req: any, res: any) => {
  res.sendFile(path.join(__dirname, '../templates/account.html'));
});
// :snippet-end:

// :snippet-start: make-change
// :snippet-start: make-change-check-devicelimit
app.get("/make-change", validateUserToken, checkDeviceLimit, async (req, res) => {
  res.sendFile(path.join(__dirname, '../templates/make-change.html'));
});
// :snippet-end:

// This endpoint is called by Javascript as an API call, so the security is handled a bit differently,
// as we don't want to redirect the user, we just want to block the request.
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
    `${message}!`;
  } catch (ex: any) {
    error = `There was a problem converting the amount submitted. ${ex.message}`;
  }
  res.json(JSON.stringify({
    error,
    message
  }))

});
// :snippet-end:

// :snippet-start: logout
app.get('/logout', (req, res, next) => {
  res.redirect(302, `${fusionAuthURL}/oauth2/logout?client_id=${clientId}`);
});
// :snippet-end:

// :snippet-start: oauth-logout
app.get('/oauth2/logout', async (req, res, next) => {
  console.log('Logging out...')

  const userTokenCookie = req.cookies[userToken];
  const refreshTokenId = userTokenCookie?.refresh_token_id;
  // Revoke the refresh token
  const result = await fetch(`${fusionAuthURL}/api/jwt/refresh/${refreshTokenId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${fusionAPIKey}`
    }
  });

  // Clear all cookies. 
  res.clearCookie(userSession);
  res.clearCookie(userToken);
  res.clearCookie(userDetails);
  res.redirect(302, '/')
});
// :snippet-end:

// :snippet-start: device-limiting
// :snippet-start: device-limiting-maxcount
app.get("/device-limit", validateUserToken,  async (req, res) => {

    const devices = await getActiveDeviceList(req);
    res.render('device-limit', { devices, maxDeviceCount });
});
// :snippet-end:

// :snippet-start: device-limiting-validatetoken
app.post("/device-limit", validateUserToken, async (req, res) => {

  // Get the refresh token id from the form
  const refreshTokenIds = req.body.deviceIds;
  if (!refreshTokenIds) return res.redirect('/device-limit');

  // revoke the refresh tokens for the selected devices
  for (const refreshTokenId of refreshTokenIds) {
    try {
      const result = await fetch(`${fusionAuthURL}/api/jwt/refresh/${refreshTokenId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${fusionAPIKey}`
        }
      });
    }
    catch (err) {
      console.error(err);
    }
  }

  res.redirect('/account');
});
// :snippet-end:
// :snippet-end:

// start the Express server
// :snippet-start: app
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
// :snippet-end:
