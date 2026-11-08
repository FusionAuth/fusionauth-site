require('dotenv/config');
const session = require('express-session');
const passport = require('passport');
const oauthStrategy = require('passport-oauth2');
const jwt_decode = require('jwt-decode');

function setupPassport(app) {
  app.use(
    session({
      secret: 's3cr3t',
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(passport.session());

  const authOptions = {
    authorizationURL: `${process.env.AUTH_URL}/authorize`,
    tokenURL: `${process.env.AUTH_URL}/token`,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK_URL,
  };

  passport.use(
    'oauth2',
    new oauthStrategy.Strategy(authOptions, function (
      accessToken,
      refreshToken,
      profile,
      callback
    ) {
      const token = jwt_decode(accessToken);
      callback(null, token.email);
    })
  );

  passport.serializeUser((user, callback) => {
    callback(null, user);
  });

  passport.deserializeUser((user, callback) => {
    callback(null, user);
  });
}

module.exports = setupPassport;
