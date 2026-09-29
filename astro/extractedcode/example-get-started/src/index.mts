import express, {type Application} from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {FusionAuthSDK} from './sdk.ts';

// ESM workaround for __dirname
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);
const port: number = 8080; // default port to listen

const sdk: FusionAuthSDK = new FusionAuthSDK(
    {
      apiKey: 'noapikeyneeded',
      applicationId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e',
      baseURL: 'http://localhost:9011',
      clientId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e',
      clientSecret: 'super-secret-secret-that-should-be-regenerated-for-production',
      port: port
    }
);

const app: Application = express();

app.use(cookieParser());
app.use(express.urlencoded());

// Static Files
app.use('/static', express.static(path.join(__dirname, '../static/')));

// Homepage (always display this)
app.get("/", async (_req, res) => {
  res.sendFile(path.join(__dirname, '../templates/home.html'));
});

// Login route
// :snippet-start: login
app.get('/login', async (req, res) => {
  if (await sdk.userLoggedIn(req, res)) {
    res.redirect(302, '/account');
    return;
  }

  sdk.sendToLoginPage(res);
});
// :snippet-end:

// OAuth return route
app.get('/oauth-redirect', async (req, res) => {
  const accessToken = await sdk.handleOAuthRedirect(req);
  if (!accessToken) {
    console.error('Failed to get Access Token');
    res.redirect(302, '/');
    return;
  }

  sdk.logInUser(accessToken, res);
  res.redirect(302, '/account');
});

// Account page
// :snippet-start: account
app.get("/account", async (req, res) => {
  if (!await sdk.userHasAccess(req, res, ["admin", "user"])) {
    res.redirect(302, '/login');
    return;
  }

  res.sendFile(path.join(__dirname, '../templates/account.html'));
});
// :snippet-end:

// Make change page
app.get("/make-change", async (req, res) => {
  if (!await sdk.userHasAccess(req, res, ["admin", "user"])) {
    res.redirect(302, '/login');
    return;
  }

  res.sendFile(path.join(__dirname, '../templates/make-change.html'));
});

// Make change submit
app.post("/make-change", async (req, res) => {
  if (!await sdk.userHasAccess(req, res, ["admin", "user"])) {
    res.status(403).json(JSON.stringify({
      error: 'Unauthorized'
    }))
    return;
  }

  const coins = {
    quarters: 0.25,
    dimes: 0.1,
    nickels: 0.05,
    pennies: 0.01,
  };

  let error = '';
  let message = '';
  try {
    message = 'We can make change for';
    let remainingAmount = +req.body.amount;
    for (const [name, nominal] of Object.entries(coins)) {
      let count = Math.floor(remainingAmount / nominal);
      remainingAmount = Math.round((remainingAmount - count * nominal) * 100) / 100;
      message = `${message} ${count} ${name}`;
    }
  } catch (ex: any) {
    error = `There was a problem converting the amount submitted. ${ex.message}`;
  }

  res.json(JSON.stringify({
    error,
    message
  }));
});

// Admin page
// :snippet-start: admin
app.get("/admin", async (req, res) => {
  if (!await sdk.userHasAccess(req, res, ["admin"])) {
    res.redirect(302, '/account');
    return;
  }

  res.sendFile(path.join(__dirname, '../templates/admin.html'));
});
// :snippet-end:

// Logout redirect to FusionAuth
// :snippet-start: logout
app.get('/logout', (_req, res) => {
  sdk.sendToLogoutPage(res);
});
// :snippet-end:

// OAuth logout return
// :snippet-start: oauth2-logout
app.get('/oauth2/logout', (_req, res) => {
  sdk.handleOAuthLogoutRedirect(res);
  res.redirect(302, '/')
});
// :snippet-end:

// Start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
