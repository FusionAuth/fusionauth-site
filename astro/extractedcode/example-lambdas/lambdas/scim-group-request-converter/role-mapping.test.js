import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

function run(scimGroup) {
  const lambda = loadLambdaFile(new URL('./role-mapping.js', import.meta.url), 'SCIMServerGroupRequestConverter');
  return lambda.invoke({ group: fixture('scim-group-request-converter/new-group'), members: [], options: {}, scimGroup });
}

test('prefixes the group name and keeps the SCIM displayName in data', () => {
  const { group } = run(fixture('scim-group-request-converter/scim-group'));
  assert.equal(group.name, 'SCIM: Engineering');
  assert.equal(group.data.scimDisplayName, 'Engineering');
});

test('assigns the roles mapped to the group name', () => {
  assert.deepEqual(run(fixture('scim-group-request-converter/scim-group')).options.roleIds, ['replace-with-engineering-role-id']);
  assert.equal(run(fixture('scim-group-request-converter/scim-group', { displayName: 'Sales Reps' })).options.roleIds.length, 2);
});

test('assigns no roles to an unmapped group', () => {
  assert.deepEqual(run(fixture('scim-group-request-converter/scim-group', { displayName: 'Marketing' })).options.roleIds, []);
});

test('adds members and skips members without a value', () => {
  const scimGroup = fixture('scim-group-request-converter/scim-group');
  scimGroup.members.push({ display: 'Unknown' });
  const { members } = run(scimGroup);
  assert.deepEqual(members.map((member) => member.userId), [
    '902c246b-6245-4190-8e05-00816be7344a',
    'b1f3a6d2-4c1e-4a8b-9f0e-2d7c5e8a9b10',
  ]);
  assert.equal(members[0].data.$ref, scimGroup.members[0].$ref);
});

test('adds no members when the SCIM group has none', () => {
  const scimGroup = fixture('scim-group-request-converter/scim-group');
  delete scimGroup.members;
  assert.deepEqual(run(scimGroup).members, []);
});
