import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const companyIdp = { id: 'replace-with-your-identity-provider-id', name: 'Pied Piper Okta', type: 'OpenIDConnect' };
const employee = fixture('user', { email: 'Richard@PiedPiper.com' });

function run(user, context) {
  const lambda = loadLambdaFile(new URL('./require-sso.js', import.meta.url), 'LoginValidation');
  return lambda.invoke(
    { result: { errors: { fieldErrors: {}, generalErrors: [] } }, user, registration: fixture('registration') },
    { context },
  );
}

test('rejects an employee password login', () => {
  const { result, logs } = run(employee, { authenticationType: 'PASSWORD' });
  assert.equal(result.errors.generalErrors[0].code, '[SSORequired]');
  assert.match(logs.info, /PASSWORD login for employee/);
});

test('rejects an employee login through another identity provider', () => {
  const google = { id: '82339786-3dff-42a6-aac6-1f1ceecb6c46', name: 'Google', type: 'Google' };
  const { result } = run(employee, { authenticationType: 'GOOGLE', identityProvider: google });
  assert.equal(result.errors.generalErrors[0].code, '[SSORequired]');
});

test('allows an employee login through the company identity provider', () => {
  const { result } = run(employee, { authenticationType: 'OPENID_CONNECT', identityProvider: companyIdp });
  assert.deepEqual(result.errors.generalErrors, []);
});

test('allows the MFA step of a company identity provider login', () => {
  const { result } = run(employee, { authenticationType: 'OPENID_CONNECT' });
  assert.deepEqual(result.errors.generalErrors, []);
});

test('rejects an employee passwordless login', () => {
  const { result } = run(employee, { authenticationType: 'PASSWORDLESS' });
  assert.equal(result.errors.generalErrors[0].code, '[SSORequired]');
});

test('allows a password login for anyone else', () => {
  const { result } = run(fixture('user'), { authenticationType: 'PASSWORD' });
  assert.deepEqual(result.errors.generalErrors, []);
});

test('allows a user without an email address', () => {
  const { result } = run(fixture('user', { email: undefined, username: 'richard' }), { authenticationType: 'PASSWORD' });
  assert.deepEqual(result.errors.generalErrors, []);
});
