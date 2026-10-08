const assert = require('node:assert/strict');
const path = require('node:path');
const express = require('../changebank/node_modules/express');
const cookieParser = require('../changebank/node_modules/cookie-parser');

// Exercise each real middleware over HTTP, without a mock identity service.
// Token validity and revocation are verified separately against disposable FusionAuth.
(async () => {
  for (const appName of ['changebank', 'changebankforum']) {
    process.chdir(path.resolve(__dirname, '..', appName));
    require(path.resolve('node_modules/dotenv')).config({override:true});
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
      console.log(appName + ': actual middleware bypass and missing-token protection passed');
    } finally {await new Promise(resolve => server.close(resolve));}
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
