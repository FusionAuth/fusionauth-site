import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile, networkError } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const url = 'https://authz.example.com/api/exchange';
const tenantId = '25682162-333d-4fef-8145-b7406772012b';

function run(fetch) {
  const lambda = loadLambdaFile(new URL('./external-authz.js', import.meta.url), 'TokenExchangePolicy', {
    fetch,
    secrets: { 'authz-api-key': 'test-authz-key' },
  });
  return lambda.invoke({ result: {}, exchange: fixture('token-exchange-policy/exchange') }, { context: { tenantId } });
}

test('allows what the service grants', () => {
  const body = { allowed: true, aud: ['email-service'], scope: ['email:send'], expires_in: 120 };
  const { result, requests } = run([{ method: 'POST', url, response: { body } }]);
  assert.deepEqual(result, { decision: 'ALLOW', granted: { aud: ['email-service'], scope: ['email:send'], expires_in: 120 } });
  assert.equal(requests[0].headers.Authorization[0], 'Bearer test-authz-key');
  assert.deepEqual(JSON.parse(requests[0].body), {
    tenantId,
    exchanger: 'todo-service',
    subject: '00000000-0000-0000-0000-000000000002',
    audiences: ['email-service'],
    scopes: ['email:send', 'email:read'],
  });
});

test('passes the service reason to the client on a denial', () => {
  const { result } = run([{ url, response: { body: { allowed: false, reason: 'todo-service may not act for this user.' } } }]);
  assert.deepEqual(result, { decision: 'DENY', denial: { error_code: 'unauthorized_client', error_description: 'todo-service may not act for this user.' } });
});

test('denies when the service returns an error', () => {
  const { result, logs } = run([{ url, response: { status: 503 } }]);
  assert.equal(result.denial.error_code, 'invalid_request');
  assert.match(logs.error, /status 503/);
});

test('denies when the service is unreachable', () => {
  const { result, logs } = run(() => networkError());
  assert.equal(result.decision, 'DENY');
  assert.match(logs.error, /status -1/);
});
