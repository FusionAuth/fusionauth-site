import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(scimGroup) {
  const lambda = loadLambdaFile(new URL('./default.js', import.meta.url), 'SCIMServerGroupRequestConverter');
  return lambda.invoke({ group: fixture('scim-group-request-converter/new-group'), members: [], options: {}, scimGroup });
}

test('names the group with the SCIM displayName', () => {
  assert.equal(run(fixture('scim-group-request-converter/scim-group')).group.name, 'Engineering');
});

test('adds a member for each SCIM member with the $ref in data', () => {
  const { members } = run(fixture('scim-group-request-converter/scim-group'));
  assert.deepEqual(members, [
    { userId: '902c246b-6245-4190-8e05-00816be7344a', data: { $ref: 'https://login.piedpiper.com/api/scim/resource/v2/Users/902c246b-6245-4190-8e05-00816be7344a' } },
    { userId: 'b1f3a6d2-4c1e-4a8b-9f0e-2d7c5e8a9b10', data: { $ref: 'https://login.piedpiper.com/api/scim/resource/v2/Users/b1f3a6d2-4c1e-4a8b-9f0e-2d7c5e8a9b10' } },
  ]);
});

test('adds no members when the SCIM group has none', () => {
  const scimGroup = fixture('scim-group-request-converter/scim-group');
  delete scimGroup.members;
  assert.deepEqual(run(scimGroup).members, []);
});
