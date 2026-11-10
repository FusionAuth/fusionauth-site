import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(context, required = false) {
  const lambda = loadLambdaFile(new URL('./risk-based.js', import.meta.url), 'MFARequirement');
  return lambda.invoke(
    { result: { required, sendSuspiciousLoginEvent: false }, user: fixture('user'), registration: fixture('registration') },
    { context: fixture('mfa-requirement/context', context) },
  ).result;
}

test('keeps the default decision for a low risk login', () => {
  assert.deepEqual(run({}), { required: false, sendSuspiciousLoginEvent: false });
  assert.deepEqual(run({}, true), { required: true, sendSuspiciousLoginEvent: false });
});

test('challenges a medium risk login without flagging the login', () => {
  assert.deepEqual(run({ clientRisk: { status: 'MEDIUM' } }), { required: true, sendSuspiciousLoginEvent: false });
});

test('challenges and flags a high risk login', () => {
  assert.deepEqual(run({ clientRisk: { status: 'HIGH' } }), { required: true, sendSuspiciousLoginEvent: true });
});

test('challenges and flags impossible travel', () => {
  assert.deepEqual(run({ authenticationThreats: ['ImpossibleTravel'] }), { required: true, sendSuspiciousLoginEvent: true });
});

test('only flags the login action', () => {
  const result = run({ action: 'changePassword', clientRisk: { status: 'HIGH' } });
  assert.deepEqual(result, { required: true, sendSuspiciousLoginEvent: false });
});

test('keeps the default decision when FusionAuth has no risk score', () => {
  assert.deepEqual(run({ clientRisk: { status: 'NOT_AVAILABLE' } }), { required: false, sendSuspiciousLoginEvent: false });
  assert.deepEqual(run({ clientRisk: { status: 'NOT_COMPUTED' } }), { required: false, sendSuspiciousLoginEvent: false });
});
