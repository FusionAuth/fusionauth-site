import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const groupsApi = {
  url: 'http://localhost:9012/api/group',
  response: {
    body: {
      groups: [
        { id: 'a7a1a4d9-6f0e-4b8e-9d34-3d9a6f1f2c11', name: 'Engineering' },
        { id: '5a1d3c0e-2b8f-4f6a-9c1e-7d2b3a4f5e60', name: 'Sales' },
      ],
    },
  },
};
const secrets = { 'fusionauth-api-key': 'test-api-key' };

function run(user, fetch = [groupsApi]) {
  const lambda = loadLambdaFile(new URL('./group-names.js', import.meta.url), 'JWTPopulate', { fetch, secrets });
  return lambda.invoke({ jwt: fixture('jwt'), user, registration: fixture('registration') }, { context: { scopes: [] } });
}

test('adds the names of the groups the user belongs to', () => {
  const { jwt, requests } = run(fixture('user'));
  assert.deepEqual(jwt.groups, ['Engineering']);
  assert.equal(requests[0].headers.Authorization[0], 'test-api-key');
});

test('skips the API call when the user has no groups', () => {
  const { jwt, requests } = run(fixture('user', { memberships: [] }));
  assert.deepEqual(jwt.groups, []);
  assert.equal(requests.length, 0);
});

test('issues the token without groups when the API call fails', () => {
  const { jwt, logs } = run(fixture('user'), [{ url: groupsApi.url, response: { status: 401 } }]);
  assert.deepEqual(jwt.groups, []);
  assert.match(logs.error, /status 401/);
});
