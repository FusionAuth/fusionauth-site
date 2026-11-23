const assert = require('node:assert/strict');
const path = require('node:path');
const express = require('../changebank/node_modules/express');
const cookieParser = require('../changebank/node_modules/cookie-parser');

// Exercise each real middleware over HTTP, without a mock identity service.
// Token validity and revocation are verified separately against disposable FusionAuth.
(async () => {
  // fixture identity service: token 'valid' exists, anything else is revoked
  const identity = require('node:http').createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = req.url === '/api/jwt/refresh/valid' ? 200 : 404;
    res.end(res.statusCode === 200 ? JSON.stringify({refreshToken: {id: 'valid'}}) : '');
  });
  identity.listen(0, '127.0.0.1');
  await new Promise(resolve => identity.once('listening', resolve));
  const identityURL = 'http://127.0.0.1:' + identity.address().port;
  for (const appName of ['changebank', 'changebankforum']) {
    process.chdir(path.resolve(__dirname, '..', appName));
    require(path.resolve('node_modules/dotenv')).config({override:true});
    process.env.fusionAuthURL = identityURL;
    const {redirectFunction} = require(path.resolve('src/redirectMiddleware.js'));
    const app = express();
    app.use(cookieParser());
    app.use(redirectFunction);
    app.use((req, res) => res.status(204).end());
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    try {
      for (const route of ['/', '/login', '/logout', '/endsession', '/favicon.ico', '/oauth-redirect?code=example', '/static/css/changebank.css']) {
        assert.equal((await fetch(base + route, {redirect: 'manual'})).status, 204, route);
      }
      for (const route of ['/account', '/forum', '/latest-posts', '/make-change']) {
        const response = await fetch(base + route, {redirect: 'manual'});
        assert.equal(response.status, 302, route);
        assert.equal(response.headers.get('location'), '/login', route);
      }
      const cookieName = appName === 'changebank' ? 'refreshTokenCB' : 'refreshTokenCBF';
      const valid = await fetch(base + '/account', {redirect: 'manual', headers: {cookie: cookieName + '=valid'}});
      assert.equal(valid.status, 204, 'valid refresh token passes');
      const revoked = await fetch(base + '/account', {redirect: 'manual', headers: {cookie: cookieName + '=revoked'}});
      assert.equal(revoked.status, 302, 'revoked refresh token redirects');
      assert.equal(revoked.headers.get('location'), '/logout');
      console.log(appName + ': actual middleware bypass, missing-token, and revoked-token protection passed');
    } finally {await new Promise(resolve => server.close(resolve));}
  }
  identity.close();
})().catch(error => {console.error(error); process.exitCode = 1;});
