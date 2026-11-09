import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambda, runLambda, networkError } from './index.js';

const user = { id: '00000000-0000-0000-0000-000000000001', email: 'richard@example.com', data: { tier: 'gold' } };

test('only the FusionAuth globals exist', () => {
  const source = `function populate(jwt) {
    jwt.types = [typeof require, typeof process, typeof setTimeout, typeof URL, typeof atob, typeof crypto, typeof Buffer, typeof console.warn];
    jwt.provided = [typeof fetch, typeof Headers, typeof FusionAuth.ActiveDirectory.b64GuidToString, typeof console.info];
  }`;
  const { jwt } = runLambda(source, 'JWTPopulate', { jwt: {} });
  assert.deepEqual(jwt.types, Array(8).fill('undefined'));
  assert.deepEqual(jwt.provided, Array(4).fill('function'));
});

test('changes to immutable arguments are discarded', () => {
  const source = `function populate(jwt, user) { user.email = 'changed'; jwt.email = user.email; }`;
  const result = runLambda(source, 'JWTPopulate', { jwt: {}, user });
  assert.equal(result.jwt.email, 'changed');
  assert.equal(result.user, undefined);
  assert.equal(user.email, 'richard@example.com');
});

test('values round trip through JSON', () => {
  const source = `function populate(jwt) {
    jwt.when = new Date(0); jwt.gone = undefined; jwt.fn = function () {}; delete jwt.keep; jwt.nested = { a: 1 };
  }`;
  const { jwt } = runLambda(source, 'JWTPopulate', { jwt: { keep: 'yes', nested: { a: 0, b: 2 } } });
  assert.deepEqual(jwt, { keep: 'yes', when: '1970-01-01T00:00:00.000Z', nested: { a: 1 } });
});

test('claim rules match FusionAuth for JWT populate', () => {
  const source = `function populate(jwt) { jwt.sub = 'changed'; jwt.roles = null; jwt.exp = null; delete jwt.applicationId; jwt.added = 1; }`;
  const { jwt } = runLambda(source, 'JWTPopulate', { jwt: { sub: 'u', roles: ['admin'], exp: 10, applicationId: 'a' } });
  assert.deepEqual(jwt, { sub: 'u', exp: 10, applicationId: 'a', added: 1 });
});

test('console output matches FusionAuth formatting', () => {
  const source = `function populate(jwt) {
    console.info('a', 1, ['x', 2], { k: 'v', n: { m: 'w' } }, {});
    console.log();
    console.debug('hidden');
    console.error('bad');
  }`;
  const { logs } = runLambda(source, 'JWTPopulate', { jwt: {} });
  assert.equal(logs.info, 'a1(2)["x", 2]{k: "v", n: {"m": "w"}}{}\n');
  assert.equal(logs.debug, '');
  assert.equal(logs.error, 'bad\n');
  assert.equal(runLambda(source, 'JWTPopulate', { jwt: {} }, { debug: true }).logs.debug, 'hidden\n');
});

test('fetch is synchronous and reads headers without case', () => {
  const source = `function populate(jwt) {
    var response = fetch('https://api.example.com/tier', { method: 'post', headers: { Authorization: 'key' }, body: '{}' });
    response.status = 500;
    jwt.status = response.status;
    jwt.type = response.headers['content-type'];
    jwt.tier = JSON.parse(response.body).tier;
    jwt.hasGet = typeof response.headers.get;
  }`;
  const { jwt, requests } = runLambda(source, 'JWTPopulate', { jwt: {} }, {
    fetch: [{ method: 'POST', url: 'https://api.example.com/tier', response: { body: { tier: 'gold' } } }],
  });
  assert.deepEqual(jwt, { status: 200, type: 'application/json', tier: 'gold', hasGet: 'undefined' });
  assert.deepEqual(requests, [{ url: 'https://api.example.com/tier', method: 'POST', headers: { Authorization: ['key'] }, body: '{}' }]);
});

test('fetch rejects calls FusionAuth rejects', () => {
  const source = `function populate(jwt) {
    var attempts = [
      function () { fetch(); },
      function () { fetch('https://a.example.com', { body: {} }); },
      function () { fetch('https://a.example.com', { headers: { n: 1 } }); },
      function () { fetch('https://unmocked.example.com'); },
    ];
    jwt.threw = attempts.map(function (a) { try { a(); return false; } catch (e) { return true; } });
  }`;
  const { jwt } = runLambda(source, 'JWTPopulate', { jwt: {} }, { fetch: [{ url: /a\.example/, response: {} }] });
  assert.deepEqual(jwt.threw, [true, true, true, true]);
});

test('fetch without a license returns 402', () => {
  const source = `function populate(jwt) { jwt.status = fetch('https://a.example.com').status; }`;
  assert.equal(runLambda(source, 'JWTPopulate', { jwt: {} }, { licensed: false }).jwt.status, 402);
});

test('networkError gives a response with no body', () => {
  const source = `function populate(jwt) { var r = fetch('https://down.example.com'); jwt.result = [r.status, r.body]; }`;
  const { jwt } = runLambda(source, 'JWTPopulate', { jwt: {} }, { fetch: () => networkError() });
  assert.deepEqual(jwt.result, [-1, null]);
});

test('Headers appends to the exact name and reads the first match', () => {
  const source = `function populate(jwt) {
    var h = new Headers({ Accept: 'text/plain' });
    h.Accept = 'text/html';
    h['accept'] = 'application/json';
    jwt.accept = h.ACCEPT;
    jwt.keys = Object.keys(h);
  }`;
  assert.deepEqual(runLambda(source, 'JWTPopulate', { jwt: {} }).jwt, { accept: ['text/plain', 'text/html'], keys: ['Accept', 'accept'] });
});

test('secrets come from context.services', () => {
  const source = `function populate(jwt, user, registration, context) {
    jwt.found = context.services.secrets.get('api-key');
    jwt.missing = String(context.services.secrets.get('nope'));
    jwt.scopes = context.scopes;
  }`;
  const { jwt } = runLambda(source, 'JWTPopulate', { jwt: {} }, { secrets: { 'api-key': 'abc' }, context: { scopes: ['openid'] } });
  assert.deepEqual(jwt, { found: 'abc', missing: 'null', scopes: ['openid'] });
});

test('context fixtures only allow the fields FusionAuth passes the type', () => {
  assert.throws(() => runLambda('function reconcile() {}', 'GoogleReconcile', {}, { context: { a: 1 } }), /context\.a\b/);
  assert.throws(() => runLambda('function populate() {}', 'JWTPopulate', {}, { context: { scopes: [], tenantId: 'x' } }), /context\.tenantId\b/);
});

test('b64GuidToString uses Microsoft GUID byte order', () => {
  const source = `function reconcile(user) { user.id = FusionAuth.ActiveDirectory.b64GuidToString('QuQS3jITvkaM8/3bq+sqBA=='); }`;
  const { user: out } = runLambda(source, 'LDAPConnectorReconcile', { user: {} });
  assert.equal(out.id, 'de12e442-1332-46be-8cf3-fddbabeb2a04');
});

test('top-level state persists between invocations', () => {
  const lambda = loadLambda('var calls = 0; function populate(jwt) { jwt.calls = ++calls; }', 'JWTPopulate');
  lambda.invoke({ jwt: {} });
  assert.equal(lambda.invoke({ jwt: {} }).jwt.calls, 2);
});

test('async lambdas and wrong function names fail', () => {
  assert.throws(() => runLambda('async function populate(jwt) {}', 'JWTPopulate', { jwt: {} }), /synchronous/);
  assert.throws(() => loadLambda('function reconcile() {}', 'JWTPopulate'), /named populate/);
});

test('a lambda can lower exp but not raise it', () => {
  const source = `function populate(jwt) { jwt.exp = jwt.exp + (jwt.sub === 'up' ? 100 : -100); }`;
  assert.equal(runLambda(source, 'JWTPopulate', { jwt: { sub: 'up', exp: 1000 } }).jwt.exp, 1000);
  assert.equal(runLambda(source, 'JWTPopulate', { jwt: { sub: 'down', exp: 1000 } }).jwt.exp, 900);
});

test('token exchange limits aud and scope to what the policy granted', () => {
  const source = `function populate(jwt) { jwt.aud = ['api', 'other']; jwt.scope = 'read write admin'; jwt.fa_uid = 'x'; }`;
  const exchange = { audiences: ['api', 'billing'], scopes: ['read', 'write'] };
  const { jwt } = runLambda(source, 'TokenExchangePopulate', { jwt: { exp: 10 }, exchange });
  assert.deepEqual(jwt, { exp: 10, aud: ['api'], scope: 'read write' });

  const none = runLambda(`function populate(jwt) { jwt.aud = 'other'; jwt.scope = 'admin'; }`, 'TokenExchangePopulate', { jwt: {}, exchange });
  assert.deepEqual(none.jwt, { aud: ['api', 'billing'], scope: 'read write' });
  assert.deepEqual(runLambda(source, 'TokenExchangePopulate', { jwt: {}, exchange: {} }).jwt, {});
});
