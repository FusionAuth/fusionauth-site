import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const accountStep = [{ key: 'user.email' }, { key: 'user.password' }];
const profileStep = [{ key: 'user.firstName' }, { key: 'user.birthDate' }];

// birth dates relative to today, so the result doesn't depend on the clock
function yearsAgo(years, days = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  // subtract the year as text so Feb 29 doesn't roll over to Mar 1
  return String(date.getUTCFullYear() - years).padStart(4, '0') + date.toISOString().slice(4, 10);
}

function run(user, fields, step = 1) {
  const lambda = loadLambdaFile(new URL('./domain-and-age.js', import.meta.url), 'SelfServiceRegistrationValidation');
  return lambda.invoke(
    { result: { errors: { fieldErrors: {}, generalErrors: [] } }, user, registration: fixture('registration') },
    { context: { fields, form: { id: 'b4d6f8a1-3e5c-4b7d-9a2f-1c8e6d4b2a93', name: 'Employee Registration' }, step, stepIndex: step - 1, totalSteps: 2 } },
  ).result.errors.fieldErrors;
}

test('rejects an email address outside the allowed domains', () => {
  const errors = run(fixture('user', { email: 'richard@example.com' }), accountStep);
  assert.equal(errors['user.email'][0].code, '[notAllowedDomain]user.email');
});

test('accepts an allowed domain in any case', () => {
  assert.deepEqual(run(fixture('user', { email: 'Richard@PiedPiper.com' }), accountStep), {});
});

test('rejects a user under the minimum age', () => {
  const errors = run(fixture('user', { birthDate: yearsAgo(18, 1) }), profileStep, 2);
  assert.equal(errors['user.birthDate'][0].code, '[tooYoung]user.birthDate');
  assert.equal(errors['user.birthDate'][0].message, 'You must be at least 18 years old to register.');
});

test('accepts a user on their 18th birthday', () => {
  assert.deepEqual(run(fixture('user', { birthDate: yearsAgo(18) }), profileStep, 2), {});
});

test('only checks fields on the current step', () => {
  const user = fixture('user', { email: 'richard@example.com', birthDate: yearsAgo(10) });
  assert.deepEqual(Object.keys(run(user, accountStep)), ['user.email']);
  assert.deepEqual(Object.keys(run(user, profileStep, 2)), ['user.birthDate']);
});

test('skips a birth date the user left blank', () => {
  assert.deepEqual(run(fixture('user', { birthDate: undefined }), profileStep, 2), {});
});
