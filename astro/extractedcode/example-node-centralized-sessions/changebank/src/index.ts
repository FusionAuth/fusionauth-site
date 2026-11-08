import FusionAuthClient from "@fusionauth/typescript-client";
import express from 'express';
import cookieParser from 'cookie-parser';
import pkceChallenge from 'pkce-challenge';
import { GetPublicKeyOrSecret, verify, JwtPayload } from 'jsonwebtoken';
import jwksClient, { RsaSigningKey } from 'jwks-rsa';
import * as path from 'path';
import {redirectFunction} from './redirectMiddleware';

// Add environment variables
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 8080; // default port to listen
const hostname = 'changebank.local'; // default hostname

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
if (!process.env.apiKey) {
  console.error('Missing apiKey from .env');
  process.exit();
}
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const fusionAuthURL = process.env.fusionAuthURL;

const apiKey = process.env.apiKey;

// Validate the token signature, make sure it wasn't expired
const validateUser = async (userTokenCookie: { access_token: string }) => {
  // Make sure the user is authenticated.
  if (!userTokenCookie || !userTokenCookie?.access_token) {
    return false;
  }
  try {
    let decodedFromJwt;
    await verify(userTokenCookie.access_token, await getKey, undefined, (err, decoded) => {
      decodedFromJwt = decoded as JwtPayload;
      //console.log(decodedFromJwt);
      if (!decodedFromJwt) {
        console.error("Incorrect jwt after decoding");
        decodedFromJwt = false;
        return;
      }
      if (!decodedFromJwt.iss || decodedFromJwt.iss !== fusionAuthURL) {
        console.error("Incorrect issuer");
        decodedFromJwt = false;
        return;
      } 
      if (!decodedFromJwt.aud || decodedFromJwt.aud !== clientId) {
        console.error("Incorrect aud, token incorrect");
        decodedFromJwt = false;
        return;
      } 
      if (!decodedFromJwt.applicationId || decodedFromJwt.applicationId !== clientId) {
        console.error("Incorrect applicationId, user not registered");
        decodedFromJwt = false;
        return;
      } 
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

// Cookie names
const userSession = 'userSessionCB';
const userToken = 'userTokenCB';
const refreshToken = 'refreshTokenCB';
const userDetails = 'userDetailsCB'; //Non Http-Only with user info (not trusted)

const client = new FusionAuthClient(apiKey, fusionAuthURL);

app.use(cookieParser());
/** Decode Form URL Encoded data */
app.use(express.urlencoded());

app.use(redirectFunction);

// Static Files
app.use('/static', express.static(path.join(__dirname, '../static/')));

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

app.get('/login', (req, res, next) => {
  const userSessionCookie = req.cookies[userSession];

  // Cookie was cleared, just send back (hacky way), that gets us the right PKCE value
  if (!userSessionCookie?.stateValue || !userSessionCookie?.challenge) {
    res.redirect(302, '/');
    return;
  }

  res.redirect(302, `${fusionAuthURL}/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=http://${hostname}:${port}/oauth-redirect&state=${userSessionCookie?.stateValue}&code_challenge=${userSessionCookie?.challenge}&code_challenge_method=S256&scope=offline_access%20openid%20profile%20email`)
});

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
      `http://${hostname}:${port}/oauth-redirect`,
      userSessionCookie.verifier)).response;

    const refreshTokenId = accessToken.refresh_token_id;
    if (!refreshTokenId) {
      console.error('Failed to get Refresh Token')
      return;
    }

    if (!accessToken.access_token) {
      console.error('Failed to get Access Token')
      return;
    }

    // Retrieve the user's OpenID Connect claims using the access token
    const userInfo = (await client.retrieveUserInfoFromAccessToken(accessToken.access_token)).response;
    if (!userInfo?.sub) {
      console.error('Failed to get User from access token, redirecting home.');
      return res.redirect(302, '/');
    }
    res.cookie(refreshToken, refreshTokenId, { httpOnly: true });
    res.cookie(userToken, accessToken, { httpOnly: true });
    res.cookie(userDetails, {
      id: userInfo.sub,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name
    });

    res.redirect(302, '/account');
  } catch (err: any) {
    console.error('OAuth callback failed:', err?.statusCode || err?.message);
    res.status(502).send('Unable to sign in. Please try again.');
  }
});

app.get("/account", async (req, res) => {
  const userTokenCookie = req.cookies[userToken];
  if (!await validateUser(userTokenCookie)) {
    res.redirect(302, '/');
  } else {
    res.sendFile(path.join(__dirname, '../templates/account.html'));
  }
});

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
    `${message}!`;
  } catch (ex: any) {
    error = `There was a problem converting the amount submitted. ${ex.message}`;
  }
  res.json(JSON.stringify({
    error,
    message
  }))

});

app.get('/logout', (req, res, next) => {
  res.redirect(302, `${fusionAuthURL}/oauth2/logout?client_id=${clientId}`);
});

// :snippet-start: endsession
app.get('/endsession', async (req, res, next) => {
  console.log('Ending session...')
  const refreshTokenId = req.cookies[refreshToken];

  if (refreshTokenId) {
    try {
      const refreshTokenResponse = await client.retrieveRefreshTokenById(refreshTokenId);
      const responseJSON = refreshTokenResponse.response;
      if (responseJSON['refreshToken'] && responseJSON['refreshToken']['userId']) {
        const userId = responseJSON['refreshToken']['userId'];
        await client.revokeRefreshTokensByUserId(userId);
      }
    } catch(err) {
      console.log("in error");
      console.error(JSON.stringify(err));
    }
  }

  res.clearCookie(refreshToken);
  res.clearCookie(userSession);
  res.clearCookie(userToken);
  res.clearCookie(userDetails);

  res.redirect(302, '/')
});
// :snippet-end:

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://${hostname}:${port}`);
});
