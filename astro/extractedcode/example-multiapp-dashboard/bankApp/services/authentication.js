require("dotenv/config");
const session = require("express-session");
const passport = require("passport");
const oauthStrategy = require("passport-oauth2");
const jwt_decode = require("jwt-decode");

function setupPassport(app) {
  app.use(
    session({
      secret: "s3cr3t",
      resave: false,
      saveUninitialized: true,
    }),
  );

  app.use(passport.session());

  const authOptions = {
    authorizationURL: `${process.env.AUTH_URL}/authorize`,
    tokenURL: `${process.env.TOKEN_URL}/token`,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK_URL,
    scope: "openid email profile offline_access",
  };

  passport.use(
    "oauth2",
    new oauthStrategy.Strategy(authOptions, function (
      accessToken,
      refreshToken,
      params,
      profile,
      callback,
    ) {
      const token = jwt_decode(accessToken);
      const email = jwt_decode(params.id_token).email;
      const user = { ...token, email };
      callback(null, user);
    }),
  );

  passport.serializeUser((user, callback) => {
    if (!user.email)
      throw new Error("FusionAuth did not return email for user");
    callback(null, user.email);
  });

  passport.deserializeUser((user, callback) => {
    callback(null, user);
  });
}

module.exports = setupPassport;
