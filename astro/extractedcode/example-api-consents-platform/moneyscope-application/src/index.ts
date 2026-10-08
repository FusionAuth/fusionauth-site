// :snippet-start: top
import FusionAuthClient from "@fusionauth/typescript-client";
import express from 'express';
import cookieParser from 'cookie-parser';
import pkceChallenge from 'pkce-challenge';
import { GetPublicKeyOrSecret, verify } from 'jsonwebtoken';
import jwksClient, { RsaSigningKey } from 'jwks-rsa';
import * as path from 'path';
import session from 'express-session';


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Add environment variables
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(session({
  secret: 'I love OAuth scopes',
  resave: false,
  saveUninitialized: true
}));

const port = 8080; // default port to listen

// Set up Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../templates'));

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
const changebankURL = process.env.changebankURL;

// Validate the token signature, make sure it wasn't expired
const validateUser = async (access_token: string ) => {

  // Make sure the user is authenticated.
  if (!access_token) {
    return false;
  }
  try {
    let decodedFromJwt;
    await verify(access_token, await getKey, undefined, (err, decoded) => {
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
const userDetails = 'userDetails'; //Non Http-Only with user info (not trusted)

const client = new FusionAuthClient('noapikeyneeded', fusionAuthURL);

app.use(cookieParser());
/** Decode Form URL Encoded data */
app.use(express.urlencoded());

// :snippet-end:

// Static Files
// :snippet-start: static
app.use('/static', express.static(path.join(__dirname, '../static/')));
// :snippet-end:

// :snippet-start: homepage
app.get("/", async (req, res) => {
  const accessToken = req.session.accessToken;
  if (await validateUser(accessToken)) {
    res.redirect(302, '/account');
  } else {
    const stateValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const pkcePair = await pkceChallenge();
    req.session.userSession = { stateValue, verifier: pkcePair.code_verifier, challenge: pkcePair.code_challenge };

    res.render('home');
  }
});
// :snippet-end:

// :snippet-start: login
app.get('/login', (req, res, next) => {
  const userSession = req.session.userSession;

  // Session was cleared, just send back (hacky way)
  if (!userSession?.stateValue || !userSession?.challenge) {
    res.redirect(302, '/');
  }

  res.redirect(302, `${fusionAuthURL}/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:${port}/oauth-redirect&state=${userSession?.stateValue}&code_challenge=${userSession?.challenge}&code_challenge_method=S256&scope=profile%20email%20openid%20offline_access`)
});
// :snippet-end:

// :snippet-start: authorize
app.get('/authorize', (req, res, next) => {
  const userSession = req.session.userSession;

  if (!userSession?.stateValue || !userSession?.challenge) {
    // uh oh, not sure what is going on here
    res.redirect(302, '/');
  }

  res.redirect(302, `${fusionAuthURL}/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:${port}/oauth-redirect&state=${userSession?.stateValue}&code_challenge=${userSession?.challenge}&code_challenge_method=S256&scope=profile%20email%20openid%20offline_access%20accounts.read%20creditScore.read%20investments.read%20profile.read%20transactions.read`)


});
// :snippet-end:

// :snippet-start: oauth-redirect
app.get('/oauth-redirect', async (req, res, next) => {
  // Capture query params
  const stateFromFusionAuth = `${req.query?.state}`;
  const authCode = `${req.query?.code}`;

  const oauthError = `${req.query?.error_reason}`;
 
  if (oauthError == 'consent_canceled') {
    res.render('error');
    return;
  }

  // Validate cookie state matches FusionAuth's returned state
  const userSession = req.session.userSession;
  if (stateFromFusionAuth !== userSession?.stateValue) {
    console.log("State doesn't match. uh-oh.");
    console.log("Saw: " + stateFromFusionAuth + ", but expected: " + userSession?.stateValue);
    res.redirect(302, '/');
    return;
  }

  try {
    // Exchange Auth Code and Verifier for Access Token
    const loginResponse = (await client.exchangeOAuthCodeForAccessTokenUsingPKCE(authCode,
      clientId,
      clientSecret,
      `http://localhost:${port}/oauth-redirect`,
      userSession.verifier)).response;

    if (!loginResponse.access_token) {
      console.error('Failed to get Access Token')
      return;
    }
    req.session.accessToken = loginResponse?.access_token;
    req.session.refreshToken = loginResponse?.refresh_token;

    res.cookie(userDetails, loginResponse.id_token);

    res.redirect(302, '/account');
  } catch (err: any) {
    console.error(err);
    res.status(err?.statusCode || 500).json(JSON.stringify({
      error: err
    }))
  }
});
// :snippet-end:


interface Balance {
  balance: number;
}

// :snippet-start: account
app.get("/account", async (req, res) => {
  const access_token = req.session.accessToken;
  if (!await validateUser(access_token)) {
    res.redirect(302, '/');
  } else {

      const response = await fetch(changebankURL+'/read-balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.status}`);
    }

    const balanceData: Balance = await response.json();
    res.render('account', { balanceData });
    //res.render(path.join(__dirname, '../templates/account.html'), {
       //balanceData: balanceData
    //});
  }
});
// :snippet-end:

// :snippet-start: logout
app.get('/logout', (req, res, next) => {
  res.redirect(302, `${fusionAuthURL}/oauth2/logout?client_id=${clientId}`);
});
// :snippet-end:

// :snippet-start: oauth-logout
app.get('/oauth2/logout', (req, res, next) => {
  console.log('Logging out...')
  req.session.destroy(() => {});

  res.redirect(302, '/')
});
// :snippet-end:

// start the Express server
// :snippet-start: app
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
// :snippet-end:


// todo
// after authorization, store the access token in the session
// then on the account page, pull the account from the changebank API
