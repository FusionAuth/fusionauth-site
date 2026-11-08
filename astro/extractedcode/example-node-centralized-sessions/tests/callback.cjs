const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');

// This is a controlled HTTP fixture, not a successful FusionAuth login test.
// The actual app routes and SDK exercise the token -> UserInfo -> session contract.
(async () => {
  let scenario = 'success';
  const calls = [];
  const identity = http.createServer((req, res) => {
    calls.push(req.url);
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/oauth2/token') {
      res.end(JSON.stringify({access_token: 'fixture-token', refresh_token_id: 'fixture-refresh'}));
    } else if (req.url === '/oauth2/userinfo') {
      assert.equal(req.headers.authorization, 'Bearer fixture-token');
      res.statusCode = scenario === 'unauthorized' ? 401 : 200;
      res.end(JSON.stringify(scenario === 'success' ? {
        sub: 'fixture-user', email: 'richard@example.com', given_name: 'Richard', family_name: 'Hendricks'
      } : {}));
    } else {
      res.statusCode = 404;
      res.end('{}');
    }
  });
  identity.listen(0, '127.0.0.1');
  await new Promise(resolve => identity.once('listening', resolve));
  const identityURL = 'http://127.0.0.1:' + identity.address().port;
  try {
    for (const name of ["changebank","changebankforum"]) {
      const dir = path.resolve(__dirname, '..', name);
      process.chdir(dir);
      require(path.join(dir, 'node_modules/dotenv')).config({override: true});
      process.env.fusionAuthURL = identityURL;
      const express = require(path.join(dir, 'node_modules/express'));
      let server;
      const listen = express.application.listen;
      express.application.listen = function (port, callback) {
        server = listen.call(this, 0, '127.0.0.1', callback);
        return server;
      };
      const compiler = require(path.join(dir, 'node_modules/ts-node')).register({compilerOptions: {module: 'CommonJS', esModuleInterop: true}});
      try { require(path.join(dir, 'src/index.ts')); }
      finally { express.application.listen = listen; compiler.enabled(false); }
      await new Promise(resolve => server.once('listening', resolve));
      const base = 'http://127.0.0.1:' + server.address().port;
      try {
        for (scenario of ['success', 'unauthorized', 'missing-subject']) {
          calls.length = 0;
          let cookie = '';
          let query = '?code=fixture-code';
          const home = await fetch(base, {redirect: 'manual'});
          cookie = home.headers.get('set-cookie').split(';')[0];
          const state = JSON.parse(decodeURIComponent(cookie.split('=').slice(1).join('=')).replace(/^j:/, '')).stateValue;
          query += '&state=' + encodeURIComponent(state);
          const response = await fetch(base + '/oauth-redirect' + query, {
            redirect: 'manual', headers: cookie ? {Cookie: cookie} : {}, signal: AbortSignal.timeout(5000)
          });
          assert.deepEqual(calls, ['/oauth2/token', '/oauth2/userinfo']);
          if (scenario === 'success') {
            assert.equal(response.status, 302);
            assert.equal(response.headers.get('location'), name === 'changebank' ? '/account' : '/forum');
            const details = response.headers.get('set-cookie').match(/userDetailsCBF?=([^;]+)/)[1];
            assert.deepEqual(JSON.parse(decodeURIComponent(details).replace(/^j:/, '')), {
              id: 'fixture-user', email: 'richard@example.com', firstName: 'Richard', lastName: 'Hendricks'
            });
          } else {
            assert.equal(response.status, scenario === 'unauthorized' ? 502 : 302);
            assert.doesNotMatch(response.headers.get('set-cookie') || '', /userToken|refreshToken|userDetails/);
          }
        }
        console.log(name + ': actual callback uses UserInfo, maps claims, and completes both failure responses');
      } finally { await new Promise(resolve => server.close(resolve)); }
    }
  } finally { await new Promise(resolve => identity.close(resolve)); }
})().catch(error => {console.error(error); process.exitCode = 1;});
