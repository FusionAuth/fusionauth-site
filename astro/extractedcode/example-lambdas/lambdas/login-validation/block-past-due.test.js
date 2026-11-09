import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const billingApplicationId = 'replace-with-your-billing-application-id';
const pastDue = { plan: 'pro', accountStatus: 'pastDue' };

function run(user, registration = fixture('registration')) {
  const lambda = loadLambdaFile(new URL('./block-past-due.js', import.meta.url), 'LoginValidation');
  return lambda.invoke(
    { result: { errors: { fieldErrors: {}, generalErrors: [] } }, user, registration },
    { context: { authenticationType: 'PASSWORD' } },
  );
}

test('rejects a past due account', () => {
  const { result } = run(fixture('user', { data: pastDue }));
  assert.deepEqual(result.errors.generalErrors, [{ code: '[LoginRestricted]', message: 'Account is past due, please contact accounts payable.' }]);
});

test('lets a past due account log in to the billing portal', () => {
  const { result } = run(fixture('user', { data: pastDue }), fixture('registration', { applicationId: billingApplicationId }));
  assert.deepEqual(result.errors.generalErrors, []);
});

test('rejects a past due account that has no registration for the application', () => {
  const { result } = run(fixture('user', { data: pastDue }), null);
  assert.equal(result.errors.generalErrors[0].code, '[LoginRestricted]');
});

test('allows an account in good standing', () => {
  const { result } = run(fixture('user'));
  assert.deepEqual(result.errors.generalErrors, []);
});
