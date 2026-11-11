import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(exchange, jwt) {
  const lambda = loadLambdaFile(new URL('./narrow-for-reporting.js', import.meta.url), 'TokenExchangePopulate');
  return lambda.invoke({
    jwt: fixture('token-exchange-populate/jwt', jwt),
    exchange: fixture('token-exchange-populate/exchange', exchange),
  }).jwt;
}

test('removes write scopes and caps the lifetime at five minutes', () => {
  const jwt = run({});
  assert.equal(jwt.scope, 'reports:read');
  assert.equal(jwt.exp - jwt.iat, 300);
});

test('keeps a lifetime that is already shorter', () => {
  const iat = 1794236676;
  assert.equal(run({}, { exp: iat + 60 }).exp, iat + 60);
});

test('leaves the scope alone when only write scopes were granted', () => {
  assert.equal(run({ scopes: ['reports:write'] }, { scope: 'reports:write' }).scope, 'reports:write');
});

test('leaves tokens for other audiences unchanged', () => {
  const jwt = run({ audiences: ['email-service'] }, { aud: ['email-service'] });
  assert.deepEqual(jwt, fixture('token-exchange-populate/jwt', { aud: ['email-service'] }));
});
