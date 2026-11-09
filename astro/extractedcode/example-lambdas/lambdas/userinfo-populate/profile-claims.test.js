import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(user, registration) {
  const lambda = loadLambdaFile(new URL('./profile-claims.js', import.meta.url), 'UserInfoPopulate');
  return lambda.invoke({ userInfo: fixture('userinfo-populate/userinfo'), user, registration, jwt: fixture('jwt') }).userInfo;
}

test('adds department and roles, and removes birthdate', () => {
  const userInfo = run(fixture('user'), fixture('registration'));
  assert.equal(userInfo['https://example.com/department'], 'Engineering');
  assert.deepEqual(userInfo['https://example.com/roles'], ['user']);
  assert.equal('birthdate' in userInfo, false);
  assert.equal(userInfo.email, 'richard@example.com');
});

test('leaves out the department claim when the user has none', () => {
  const userInfo = run(fixture('user', { data: {} }), null);
  assert.equal('https://example.com/department' in userInfo, false);
  assert.deepEqual(userInfo['https://example.com/roles'], []);
});
