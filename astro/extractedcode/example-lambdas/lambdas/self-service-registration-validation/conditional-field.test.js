import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(data, step = 2) {
  const lambda = loadLambdaFile(new URL('./conditional-field.js', import.meta.url), 'SelfServiceRegistrationValidation');
  return lambda.invoke(
    { result: { errors: { fieldErrors: {}, generalErrors: [] } }, user: fixture('user', { data }), registration: fixture('registration') },
    { context: { fields: [{ key: 'user.data.currentAuth' }, { key: 'user.data.futureAuth' }], step, stepIndex: step - 1, totalSteps: 2 } },
  ).result.errors.fieldErrors;
}

test('rejects a future provider other than FusionAuth', () => {
  assert.deepEqual(run({ currentAuth: 'BadAuth', futureAuth: 'AuthTwo' }), { 'user.data.futureAuth': [{ code: '[invalid]user.data.futureAuth' }] });
});

test('accepts FusionAuth as the future provider', () => {
  assert.deepEqual(run({ currentAuth: 'BadAuth', futureAuth: 'FusionAuth' }), {});
});

test('skips the check when the user named no current provider', () => {
  assert.deepEqual(run({ futureAuth: 'AuthTwo' }), {});
});

test('skips the check on the first step', () => {
  assert.deepEqual(run({ currentAuth: 'BadAuth', futureAuth: 'AuthTwo' }, 1), {});
});
