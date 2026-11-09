import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(exchange) {
  const lambda = loadLambdaFile(new URL('./carry-claims.js', import.meta.url), 'TokenExchangePopulate');
  return lambda.invoke({ jwt: fixture('token-exchange-populate/jwt'), exchange: fixture('token-exchange-populate/exchange', exchange) }).jwt;
}

test('adds the department, intent, and organization claims', () => {
  const jwt = run({});
  assert.equal(jwt['https://piedpiper.com/department'], 'Engineering');
  assert.equal(jwt['https://piedpiper.com/intent'], 'export-report');
  assert.equal(jwt['https://piedpiper.com/org_id'], '8f7e6d5c-4b3a-4291-8f0e-1d2c3b4a5968');
  assert.equal(jwt.sub, '00000000-0000-0000-0000-000000000002');
});

test('leaves out claims with no value', () => {
  const exchange = fixture('token-exchange-populate/exchange');
  const jwt = run({
    entity: { ...exchange.entity, data: {} },
    intent: undefined,
    subjectToken: { sub: exchange.subjectToken.sub },
  });
  assert.deepEqual(jwt, fixture('token-exchange-populate/jwt'));
});
