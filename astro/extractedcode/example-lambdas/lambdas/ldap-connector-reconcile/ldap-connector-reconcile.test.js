import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLambdaFile } from '../../harness/index.js';
import { fixture } from '../../fixtures/index.js';

// FusionAuth builds a new user for each LDAP login
function run(file, userAttributes) {
  const lambda = loadLambdaFile(new URL(file, import.meta.url), 'LDAPConnectorReconcile');
  return lambda.invoke({ user: { active: false, data: {} }, userAttributes }).user;
}

test('maps OpenLDAP attributes and groups', () => {
  const user = run('./openldap.js', fixture('ldap-connector-reconcile/openldap'));
  assert.equal(user.id, '6f1d2a4e-8b3c-4d5e-9f60-718293a4b5c6');
  assert.equal(user.active, true);
  assert.equal(user.username, 'rhendricks');
  assert.equal(user.email, 'richard@example.com');
  assert.equal(user.fullName, 'Richard Hendricks');
  assert.deepEqual(user.registrations, [{ applicationId: 'replace-with-your-application-id', roles: ['user', 'admin'] }]);
});

test('reads a single group as a string and ignores unknown groups', () => {
  const one = run('./openldap.js', fixture('ldap-connector-reconcile/openldap', { memberOf: 'CN=Admins,OU=Groups,DC=example,DC=com' }));
  assert.deepEqual(one.registrations[0].roles, ['admin']);
  const none = run('./openldap.js', fixture('ldap-connector-reconcile/openldap', { memberOf: ['cn=sales,ou=groups,dc=example,dc=com'] }));
  assert.deepEqual(none.registrations[0].roles, []);
  const { memberOf, ...attributes } = fixture('ldap-connector-reconcile/openldap');
  assert.deepEqual(run('./openldap.js', attributes).registrations[0].roles, []);
});

test('maps Active Directory attributes and converts the objectGUID', () => {
  const user = run('./active-directory.js', fixture('ldap-connector-reconcile/active-directory'));
  assert.equal(user.id, 'de12e442-1332-46be-8cf3-fddbabeb2a04');
  assert.equal(user.username, 'rhendricks');
  assert.equal(user.email, 'richard@example.com');
  assert.equal(user.firstName, 'Richard');
  assert.equal(user.lastName, 'Hendricks');
  assert.deepEqual(user.registrations[0].roles, ['user', 'admin']);
});

test('requires the binary form of objectGUID', () => {
  const { 'objectGUID;binary': guid, ...attributes } = fixture('ldap-connector-reconcile/active-directory');
  assert.throws(() => run('./active-directory.js', { ...attributes, objectGUID: 'not binary' }));
});
