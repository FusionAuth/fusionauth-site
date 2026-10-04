const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');

const root = path.join(__dirname, '..');
const localRequire = createRequire(path.join(root, 'package.json'));
const env = {
  TENANT_NAME: 'fixture', ROPC_FLOW_NAME: 'b2c_1_fixture', ROPC_CLIENT_ID: 'fixture-client',
};
const user = {
  id: 'fixture-user', accountEnabled: true, givenName: 'Ada', displayName: 'Ada Fixture',
  surname: 'Fixture', userPrincipalName: 'fixture-upn', createdDateTime: '2022-08-05T21:05:58Z',
  identities: [{signInType: 'emailAddress', issuerAssignedId: 'ada@example.invalid'}],
};

function loadFunction(response, graphUser = user) {
  const requests = [], graphIds = [];
  const context = {log: () => {}};
  const sandbox = {
    module: {exports: {}}, process: {env},
    require: name => name === './graph' ? {getUser: async id => {graphIds.push(id); return graphUser;}} : localRequire(name),
    fetch: async (url, options) => {requests.push({url, options}); return response;},
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'RopcProxyFunction/index.js'), 'utf8'), sandbox);
  return {invoke: req => sandbox.module.exports(context, req), context, requests, graphIds};
}

function successfulResponse() {
  // Synthetic payload only for the decode step; no authentication claim.
  const token = 'e30.' + Buffer.from(JSON.stringify({oid: 'fixture-user'})).toString('base64url') + '.fixture';
  return {ok: true, json: async () => ({access_token: token})};
}

test('ROPC form encodes credentials and targets the configured tenant and flow', async () => {
  const run = loadFunction({ok: false, text: async () => 'fixture-denied'});
  await run.invoke({body: {loginId: 'a+b@example.invalid', password: 'fixture & + value'}});
  assert.equal(run.requests.length, 1);
  assert.equal(run.requests[0].url, 'https://fixture.b2clogin.com/fixture.onmicrosoft.com/b2c_1_fixture/oauth2/v2.0/token');
  assert.equal(run.requests[0].options.method, 'POST');
  assert.equal(run.requests[0].options.headers['Content-type'], 'application/x-www-form-urlencoded');
  const form = new URLSearchParams(run.requests[0].options.body);
  assert.equal(form.get('username'), 'a+b@example.invalid');
  assert.equal(form.get('password'), 'fixture & + value');
  assert.equal(form.get('grant_type'), 'password');
  assert.equal(form.get('scope'), 'openid fixture-client');
  assert.equal(form.get('client_id'), 'fixture-client');
});

test('successful upstream response maps the Graph user into the connector response', async () => {
  const run = loadFunction(successfulResponse());
  await run.invoke({body: {loginId: 'ada@example.invalid', password: 'fixture'}});
  assert.equal(run.context.res.status, 200);
  assert.deepEqual(run.graphIds, ['fixture-user']);
  const result = JSON.parse(JSON.stringify(run.context.res.body.user));
  assert.equal(result.id, user.id);
  assert.equal(result.active, true);
  assert.equal(result.email, 'ada@example.invalid');
  assert.equal(result.firstName, 'Ada');
  assert.equal(result.fullName, 'Ada Fixture');
  assert.equal(result.lastName, 'Fixture');
  assert.equal(result.username, 'fixture-upn');
  assert.equal(result.verified, true);
  assert.deepEqual(result.data.azure.identities, user.identities);
  // Preserve source behavior; seconds here do not validate the API timestamp contract.
  assert.equal(result.insertInstant, 1659733558);
});

test('rejected credentials return 404 and never retrieve the Graph profile', async () => {
  const run = loadFunction({ok: false, text: async () => 'fixture-invalid-credentials'});
  await run.invoke({body: {loginId: 'ada@example.invalid', password: 'invalid'}});
  assert.equal(run.context.res.status, 404);
  assert.equal(run.context.res.body, 'fixture-invalid-credentials');
  assert.deepEqual(run.graphIds, []);
});

test('Graph adapter retrieves the exact authenticated user through its SDK', async () => {
  const calls = [];
  const sandbox = {
    module: {exports: {}}, console: {log: () => {}},
    require: name => {
      if (name === './authProvider') return class {};
      if (name === '@microsoft/microsoft-graph-client') return {Client: {initWithMiddleware: options => {
        assert.equal(options.defaultVersion, 'beta');
        return {api: route => ({get: async () => {calls.push(route); return user;}})};
      }}};
      return localRequire(name);
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'RopcProxyFunction/graph.js'), 'utf8'), sandbox);
  assert.equal(await sandbox.module.exports.getUser('fixture-user'), user);
  assert.deepEqual(calls, ['/users/fixture-user']);
});

test('settings contain placeholders and Function binding retains authorization', () => {
  const settings = JSON.parse(fs.readFileSync(path.join(root, 'local.settings.json')));
  for (const key of ['TENANT_NAME', 'ROPC_FLOW_NAME', 'ROPC_CLIENT_ID', 'GRAPH_CLIENT_ID', 'GRAPH_CLIENT_SECRET']) {
    assert.equal(settings.Values[key], 'YOUR_' + key);
  }
  const binding = JSON.parse(fs.readFileSync(path.join(root, 'RopcProxyFunction/function.json'))).bindings[0];
  assert.equal(binding.authLevel, 'function');
  assert.ok(binding.methods.includes('post'));
});
