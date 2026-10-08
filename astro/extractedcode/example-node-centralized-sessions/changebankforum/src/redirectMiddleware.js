// :snippet-start: redirectFunction
const alwaysAllowed = [ "/logout", "/login", "/favicon.ico", "/endsession","/" ];
const alwaysAllowedPrefix = [ "/oauth-redirect", "/static" ];

const {FusionAuthClient} = require('@fusionauth/typescript-client');

const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.apiKey;
const fusionAuthURL = process.env.fusionAuthURL;
const client = new FusionAuthClient(apiKey, fusionAuthURL);
const refreshToken = 'refreshTokenCBF';

/**
 * Redirect function
 * @param {import('express').Request} req - The request object
 * @param {import('express').Response} res - The response object
 * @param {import('express').NextFunction} next - The next middleware function
 */
function redirectFunction(req, res, next) {
  // console.log('url:', req.originalUrl);
  if (alwaysAllowed.indexOf(req.originalUrl) > -1 ) {
    // always allow this
    next();
    return;
  }

  for (let i = 0; i < alwaysAllowedPrefix.length; i++) {
    let prefix = alwaysAllowedPrefix[i];
    if (req.originalUrl.startsWith(prefix)) {
      // always allow this
      next();
      return;
    }
  }

  const refreshTokenId = req.cookies[refreshToken];
  if (!refreshTokenId) {
    // console.log("no refresh token");
    res.redirect(302, "/login");
    return;
  }

  client.retrieveRefreshTokenById(refreshTokenId)
    .then(clientResponse => {
      // console.log("valid session found");
      next();
      return;
    }).catch(clientResponse => {
      if (clientResponse.statusCode !== 200) {
        // console.log("session revoked");
        res.redirect(302, "/logout");
        next();
        return;
      }
    });
}

module.exports = { redirectFunction };
// :snippet-end:
