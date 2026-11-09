import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(exchange) {
  const lambda = loadLambdaFile(new URL('./exchanger-rules.js', import.meta.url), 'TokenExchangePolicy');
  return lambda.invoke(
    { result: {}, exchange: fixture('token-exchange-policy/exchange', exchange) },
    { context: { tenantId: '25682162-333d-4fef-8145-b7406772012b' } },
  ).result;
}

test('grants the allowed scopes for the exchanger audience', () => {
  assert.deepEqual(run({}), { decision: 'ALLOW', granted: { aud: ['email-service'], scope: ['email:send'], expires_in: 300 } });
});

test('denies an unknown exchanger', () => {
  const result = run({ clientId: 'reporting-service' });
  assert.equal(result.decision, 'DENY');
  assert.equal(result.denial.error_code, 'unauthorized_client');
});

test('denies an audience the exchanger may not call', () => {
  const result = run({ requestedAudiencesAndResources: ['invoice-service'] });
  assert.equal(result.decision, 'DENY');
  assert.equal(result.denial.error_code, 'invalid_target');
});

test('grants only read scopes and a short lifetime for an external token', () => {
  const result = run({
    clientId: 'billing-service',
    requestedAudiencesAndResources: ['invoice-service'],
    requestedScopes: ['invoice:read', 'invoice:write'],
    subjectTokenValidationStatus: 'BEST_EFFORT',
  });
  assert.deepEqual(result.granted, { aud: ['invoice-service'], scope: ['invoice:read'], expires_in: 60 });
});
