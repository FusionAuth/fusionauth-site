import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

const groupId = 'a7a1a4d9-6f0e-4b8e-9d34-3d9a6f1f2c11';

function requestConvert(scimGroup) {
  const lambda = loadLambdaFile(new URL('../scim-group-request-converter/default.js', import.meta.url), 'SCIMServerGroupRequestConverter');
  return lambda.invoke({ group: fixture('scim-group-request-converter/new-group'), members: [], options: {}, scimGroup }).group;
}

function responseConvert(group) {
  const lambda = loadLambdaFile(new URL('./default.js', import.meta.url), 'SCIMServerGroupResponseConverter');
  return lambda.invoke({
    scimGroup: fixture('scim-group-response-converter/scim-group'),
    group,
    members: fixture('scim-group-response-converter/members').members,
  }).scimGroup;
}

test('round trips the displayName through both converters', () => {
  const original = fixture('scim-group-request-converter/scim-group');
  assert.equal(responseConvert({ ...requestConvert(original), id: groupId }).displayName, original.displayName);
});

test('keeps the attributes and members FusionAuth fills in', () => {
  const prefilled = fixture('scim-group-response-converter/scim-group');
  const scimGroup = responseConvert({ id: groupId, name: 'Engineering', data: {} });
  assert.deepEqual(scimGroup, { ...prefilled, displayName: 'Engineering' });
});
