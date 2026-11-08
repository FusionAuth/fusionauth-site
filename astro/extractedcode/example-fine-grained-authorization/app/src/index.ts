// :snippet-start: top
import FusionAuthClient from "@fusionauth/typescript-client";
import express from 'express';
import cookieParser from 'cookie-parser';
import pkceChallenge from 'pkce-challenge';
import { GetPublicKeyOrSecret, verify } from 'jsonwebtoken';
import jwksClient, { RsaSigningKey } from 'jwks-rsa';
import * as path from 'path';

import * as permify from "@permify/permify-node";


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
  console.error('Missing fusionAuthURL from .env');
  process.exit();
}
if (!process.env.PRESHARED_KEY) {
  console.error('Missing preshared key from .env');
  process.exit();
}
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const fusionAuthURL = process.env.fusionAuthURL;

const permifyclient = permify.grpc.newClient({
  endpoint: "localhost:3478", // Replace with your Permify server URL
  cert: null, // Optional: SSL certificate
  insecure: true, // Set to false in production
  pk: null,
  certChain: null,
},
  permify.grpc.newAccessTokenInterceptor(process.env.PRESHARED_KEY)
);


// Validate the token signature, make sure it wasn't expired, check for permissions
const validateUser = async (userTokenCookie: { access_token: string }, permission: string) => {
  // Make sure the user is authenticated.
  if (!userTokenCookie || !userTokenCookie?.access_token) {
    return false;
  }

  if (permission == "home") {
    // always treat this as a logged out user
    return false;
  }

  try {

    const key = await getKey; // Await the key first
    const decodedFromJwt = await new Promise<any>((resolve, reject) => {
      verify(userTokenCookie.access_token, key, undefined, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
    // console.log(decodedFromJwt);

    // use for testing specific hours. between 7 and 17 should work. These are in permify-setup/src/loaddata.ts and are the openValue and closeValue values. Uncomment below and then comment out the mtTime.getHours() line below
    //const hour = 1;

    // :snippet-start: checkingPermission
    const now = new Date();
    const mtTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Denver"}));
    const hour = mtTime.getHours();

    let response = await permifyclient.permission.check({
      tenantId: "t1",
      metadata: {
        schemaVersion: "",
        depth: 20,
      },
      entity: {
        type: "bank",
        id: "1",
      },
      permission: permission,
      subject: {
        type: "user",
        id: decodedFromJwt?.sub
      },
      context: {
        data: {
            "current_hour": hour
        }
      }
    });
    
    let checkresult = response.can === permify.grpc.base.CheckResult.CHECK_RESULT_ALLOWED;
    // :snippet-end:

    console.log(checkresult ? "RESULT_ALLOWED" : "RESULT_DENIED");
    return checkresult;
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
  const userTokenCookie = req.cookies[userToken];
  if (await validateUser(userTokenCookie,"home")) {
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

  res.redirect(302, `${fusionAuthURL}/oauth2/authorize?scope=email%20profile%20openid&client_id=${clientId}&response_type=code&redirect_uri=http://localhost:${port}/oauth-redirect&state=${userSessionCookie?.stateValue}&code_challenge=${userSessionCookie?.challenge}&code_challenge_method=S256`)
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

    // Exchange Access Token for User
    const userResponse = (await client.retrieveUserInfoFromAccessToken(accessToken.access_token)).response;
    console.log(userResponse);
    if (!userResponse) {
      console.error('Failed to get User info from access token, redirecting home.');
      res.redirect(302, '/');
    }
    res.cookie(userDetails, userResponse);

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
app.get("/account", async (req, res) => {
  const userTokenCookie = req.cookies[userToken];
  if (!await validateUser(userTokenCookie,"account")) {
    res.redirect(302, '/error');
  } else {
    res.sendFile(path.join(__dirname, '../templates/account.html'));
  }
});
// :snippet-end:

// :snippet-start: error
app.get("/error", async (req, res) => {
  res.sendFile(path.join(__dirname, '../templates/error.html'));
});
// :snippet-end:

// :snippet-start: admin
app.get("/admin", async (req, res) => {
  const userTokenCookie = req.cookies[userToken];
  if (!await validateUser(userTokenCookie,"admin")) {
    res.redirect(302, '/error');
  } else {
    res.sendFile(path.join(__dirname, '../templates/admin.html'));
  }
});
// :snippet-end:

// :snippet-start: make-change
app.get("/make-change", async (req, res) => {
  const userTokenCookie = req.cookies[userToken];
  if (!await validateUser(userTokenCookie,"makechange")) {
    res.redirect(302, '/error');
  } else {
    res.sendFile(path.join(__dirname, '../templates/make-change.html'));
  }
});

app.post("/make-change", async (req, res) => {
  const userTokenCookie = req.cookies[userToken];
  if (!await validateUser(userTokenCookie,"makechange")) {
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
app.get('/oauth2/logout', (req, res, next) => {
  console.log('Logging out...')
  res.clearCookie(userSession);
  res.clearCookie(userToken);
  res.clearCookie(userDetails);

  res.redirect(302, '/')
});
// :snippet-end:

// start the Express server
// :snippet-start: app
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
// :snippet-end:
