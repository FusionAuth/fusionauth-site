const express = require('express');
const router = express.Router();
const {FusionAuthClient} = require('@fusionauth/typescript-client');

// tag::clientIdSecret[]
// set in the environment or directly
const clientId = process.env.CLIENT_ID; // or set directly
const clientSecret = process.env.CLIENT_SECRET; // or set directly
// end::clientIdSecret[]

// tag::baseURL[]
const fusionAuthURL = process.env.BASE_URL;
// end::baseURL[]

const client = new FusionAuthClient('noapikeyneeded', fusionAuthURL);
const pkceChallenge = require('pkce-challenge');

// tag::logoutRoute[]
/* logout page. */
router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect(302, '/');
});
// end::logoutRoute[]

/* GET home page. */
router.get('/', function (req, res, next) {
  const stateValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  req.session.stateValue = stateValue;

  //generate the pkce challenge/verifier dict
  const pkce_pair = pkceChallenge.default();
  // Store the PKCE verifier in session
  req.session.verifier = pkce_pair['code_verifier'];
  const challenge = pkce_pair['code_challenge'];
  res.render('index', {user: req.session.user, title: 'FusionAuth Example', clientId: clientId, challenge: challenge, stateValue: stateValue, fusionAuthURL: fusionAuthURL});
});

// tag::fullOAuthCodeExchange[]
/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function (req, res, next) {
  console.dir(res);
  const stateFromServer = req.query.state;
  if (stateFromServer !== req.session.stateValue) {
    console.log("State doesn't match. uh-oh.");
    console.log("Saw: " + stateFromServer + ", but expected: " + req.session.stateValue);
    res.redirect(302, '/');
    return;
  }

// tag::exchangeOAuthCode[]
  // This code stores the user in a server-side session
 client.exchangeOAuthCodeForAccessTokenUsingPKCE(req.query.code,
                                                 clientId,
                                                 clientSecret,
                                                 'http://localhost:3000/oauth-redirect',
                                                 req.session.verifier)
// end::exchangeOAuthCode[]
      .then((response) => {
        console.log(response.response.access_token);
        return client.retrieveUserUsingJWT(response.response.access_token);
      })
      .then((response) => {
// tag::setUserInSession[]
        req.session.user = response.response.user;
        return response;
      })
// end::setUserInSession[]
      .then((response) => {
        res.redirect(302, '/');
      }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});

});
// end::fullOAuthCodeExchange[]

  // This code can be set in the last promise above to send the access and refresh tokens
  // back to the browser as secure, HTTP-only cookies, an alternative to storing user info in the session
  //     .then((response) => {
  //       res.cookie('access_token', response.response.access_token, {httpOnly: true});
  //       res.cookie('refresh_token', response.response.refresh_token, {httpOnly: true});
  //       res.redirect(302, '/');
  //     }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});

module.exports = router;
