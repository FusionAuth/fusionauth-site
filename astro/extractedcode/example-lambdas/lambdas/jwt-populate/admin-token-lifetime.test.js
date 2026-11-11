import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(jwt) {
  const lambda = loadLambdaFile(new URL('./admin-token-lifetime.js', import.meta.url), 'JWTPopulate');
  return lambda.invoke({ jwt, user: fixture('user'), registration: fixture('registration') }, { context: { scopes: [] } });
}

test('shortens access tokens for admins to 15 minutes', () => {
  const original = fixture('jwt', { roles: ['admin', 'user'] });
  const { jwt } = run(original);
  assert.equal(jwt.exp, original.iat + 900);
});

test('keeps a shorter configured lifetime', () => {
  const original = fixture('jwt', { roles: ['admin'] });
  original.exp = original.iat + 300;
  assert.equal(run(original).jwt.exp, original.iat + 300);
});

test('leaves other users unchanged', () => {
  const original = fixture('jwt');
  assert.deepEqual(run(original).jwt, original);
});

test('removes an empty roles claim', () => {
  const { jwt } = run(fixture('jwt', { roles: [] }));
  assert.equal('roles' in jwt, false);
  assert.equal(typeof jwt.exp, 'number');
});
