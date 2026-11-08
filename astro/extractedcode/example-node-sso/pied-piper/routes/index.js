// :snippet-start: routes
// :snippet-start: constants
const express = require('express');
const router = express.Router();
const {FusionAuthClient} = require('@fusionauth/typescript-client');

const dotenv = require('dotenv');
dotenv.config();

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
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const fusionAuthURL = process.env.fusionAuthURL;

const hostName = 'piedpiper.local';

const port = 3000;
const title = 'Pied Piper';

const client = new FusionAuthClient('noapikeyneeded', fusionAuthURL);
const loginUrl = fusionAuthURL+'/oauth2/authorize?client_id='+clientId+'&response_type=code&redirect_uri=http%3A%2F%2F'+hostName+'%3A'+port+'%2Foauth-redirect&scope=offline_access%20openid%20profile%20email';
const logoutUrl = fusionAuthURL+'/oauth2/logout?client_id='+clientId;
// :snippet-end:

// :snippet-start: homepageroute
/* GET home page. */
router.get('/', function (req, res, next) {

  if (!req.session.user) {
     res.redirect(302, loginUrl);
     return;
  }
  res.render('index', {user: req.session.user, title: title + ' App', clientId: clientId, logoutUrl: "/logout", loginUrl: loginUrl});
});
// :snippet-end:

// :snippet-start: loginpageroute
/* Login page if we aren't logged in */
router.get('/login', function (req, res, next) {
  res.render('login', {title: title + ' Login', clientId: clientId, loginUrl: loginUrl});
});
// :snippet-end:

// :snippet-start: logoutpageroute
/* Logout page */
router.get('/logout', function (req, res, next) {
  req.session.user = null;
  res.redirect(302, logoutUrl);
});
// :snippet-end:

// :snippet-start: endsessionroute
/* End session for global SSO logout */
router.get('/endsession', function (req, res, next) {
  req.session.user = null;
  res.redirect(302, "/login");
});
// :snippet-end:

// :snippet-start: oauthredirectroute
/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function (req, res, next) {
  // This code stores the user in a server-side session
  client.exchangeOAuthCodeForAccessToken(req.query.code,
                                         clientId,
                                         clientSecret,
                                         'http://'+hostName+':'+port+'/oauth-redirect')
      .then((response) => {
        return client.retrieveUserInfoFromAccessToken(response.response.access_token);
      })
      .then((response) => {
        const userInfo = response.response;
        if (!userInfo?.sub) {
          throw new Error('Missing UserInfo subject');
        }
        req.session.user = {
          id: userInfo.sub,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name
        };
        res.redirect(302, '/');
      }).catch((err) => {
        console.error('OAuth callback failed:', err.statusCode || err.message);
        next(new Error('Unable to sign in. Please try again.'));
      });
});
// :snippet-end:

module.exports = router;
// :snippet-end:
