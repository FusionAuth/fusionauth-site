import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const groupId = 'a7a1a4d9-6f0e-4b8e-9d34-3d9a6f1f2c11';

function requestConvert(scimGroup) {
  const lambda = loadLambdaFile(new URL('../scim-group-request-converter/role-mapping.js', import.meta.url), 'SCIMServerGroupRequestConverter');
  return lambda.invoke({ group: fixture('scim-group-request-converter/new-group'), members: [], options: {}, scimGroup }).group;
}

function responseConvert(group) {
  const lambda = loadLambdaFile(new URL('./display-name.js', import.meta.url), 'SCIMServerGroupResponseConverter');
  return lambda.invoke({
    scimGroup: fixture('scim-group-response-converter/scim-group'),
    group,
    members: fixture('scim-group-response-converter/members').members,
  }).scimGroup;
}

test('round trips the displayName without the prefix', () => {
  const original = fixture('scim-group-request-converter/scim-group');
  const group = { ...requestConvert(original), id: groupId };
  assert.equal(group.name, 'SCIM: Engineering');
  assert.equal(responseConvert(group).displayName, original.displayName);
});

test('falls back to the group name for groups created in FusionAuth', () => {
  assert.equal(responseConvert({ id: groupId, name: 'Support', data: {} }).displayName, 'Support');
  assert.equal(responseConvert({ id: groupId, name: 'Support' }).displayName, 'Support');
});

test('keeps the members FusionAuth fills in', () => {
  const prefilled = fixture('scim-group-response-converter/scim-group');
  assert.deepEqual(responseConvert({ id: groupId, name: 'Support', data: {} }).members, prefilled.members);
});
