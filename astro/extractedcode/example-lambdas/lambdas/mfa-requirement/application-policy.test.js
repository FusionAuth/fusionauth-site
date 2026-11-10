import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const applicationId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
const withMethod = fixture('user', { twoFactor: { methods: [{ id: 'KLRT', method: 'authenticator' }], recoveryCodes: [] } });
// far from now in both directions, so the result doesn't depend on the clock
const trust = (expirationInstant, trustApplicationId = applicationId) => ({
  applicationId: trustApplicationId, expirationInstant, id: 'f1e2d3c4-b5a6-4978-8a6b-5c4d3e2f1a0b', userId: withMethod.id,
});
const future = 4102444800000;
const past = 946684800000;

function run(user, policies, mfaTrust) {
  const lambda = loadLambdaFile(new URL('./application-policy.js', import.meta.url), 'MFARequirement');
  return lambda.invoke(
    { result: { required: false, sendSuspiciousLoginEvent: false }, user, registration: fixture('registration') },
    { context: fixture('mfa-requirement/context', { policies, mfaTrust }) },
  ).result.required;
}

test('Required always challenges, even without a method', () => {
  assert.equal(run(fixture('user'), { applicationLoginPolicy: 'Required' }), true);
});

test('Enabled challenges only users with a method', () => {
  assert.equal(run(fixture('user'), { applicationLoginPolicy: 'Enabled' }), false);
  assert.equal(run(withMethod, { applicationLoginPolicy: 'Enabled' }), true);
});

test('Disabled never challenges', () => {
  assert.equal(run(withMethod, { applicationLoginPolicy: 'Disabled' }), false);
});

test('falls back to the tenant policy', () => {
  assert.equal(run(withMethod, { tenantLoginPolicy: 'Enabled' }), true);
});

test('a current trust skips the challenge, and an expired trust does not', () => {
  assert.equal(run(withMethod, { applicationLoginPolicy: 'Enabled' }, trust(future)), false);
  assert.equal(run(withMethod, { applicationLoginPolicy: 'Enabled' }, trust(past)), true);
});

test('the This trust policy honors only a trust from the same application', () => {
  const policies = { applicationLoginPolicy: 'Enabled', applicationMultiFactorTrustPolicy: 'This' };
  assert.equal(run(withMethod, policies, trust(future)), false);
  assert.equal(run(withMethod, policies, trust(future, '3c219e58-ed0e-4b18-ad48-f4f92793ae32')), true);
});

test('the None trust policy ignores any trust', () => {
  const policies = { applicationLoginPolicy: 'Enabled', applicationMultiFactorTrustPolicy: 'None' };
  assert.equal(run(withMethod, policies, trust(future)), true);
});
