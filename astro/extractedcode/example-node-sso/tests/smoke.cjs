const assert = require('node:assert/strict');
const path = require('node:path');

// Run the actual Express applications; no identity provider is simulated.
(async () => {
  for (const appName of ['pied-piper', 'hooli']) {
    process.chdir(path.resolve(__dirname, '..', appName));
    require(path.resolve('node_modules/dotenv')).config({override:true});
    const app = require(path.resolve('app.js'));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    try {
      const home = await fetch(base, {redirect: 'manual'});
      assert.equal(home.status, 302);
      const login = new URL(home.headers.get('location'));
      assert.equal(login.pathname, '/oauth2/authorize');
      assert.equal(login.searchParams.get('response_type'), 'code');
      assert.equal(login.searchParams.get('scope'), 'offline_access openid profile email');
      assert.equal(login.searchParams.get('client_id'), process.env.clientId);
      assert.equal(login.searchParams.get('redirect_uri'), 'http://' + (appName === 'hooli' ? 'hooli.local:3001' : 'piedpiper.local:3000') + '/oauth-redirect');
      const page = await fetch(base + '/login');
      assert.equal(page.status, 200);
      assert.match(await page.text(), /Login/);
      const logout = await fetch(base + '/logout', {redirect: 'manual'});
      assert.equal(logout.status, 302);
      assert.equal(new URL(logout.headers.get('location')).pathname, '/oauth2/logout');
      for (let repeat = 0; repeat < 2; repeat++) {
        const ended = await fetch(base + '/endsession', {redirect: 'manual'});
        assert.equal(ended.status, 302);
        assert.equal(ended.headers.get('location'), '/login');
      }
      assert.equal((await fetch(base + '/stylesheets/style.css')).status, 200);
      assert.equal((await fetch(base + '/missing')).status, 404);
      console.log(appName + ': actual logged-out routes, OAuth parameters, idempotent end-session, CSS and 404 passed');
    } finally { await new Promise(resolve => server.close(resolve)); }
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
