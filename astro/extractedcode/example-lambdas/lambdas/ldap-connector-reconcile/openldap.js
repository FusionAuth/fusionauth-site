// maps OpenLDAP attributes to the user and LDAP groups to application roles
var applicationId = 'replace-with-your-application-id';
var rolesByGroup = {
  'cn=engineering,ou=groups,dc=example,dc=com': 'user',
  'cn=admins,ou=groups,dc=example,dc=com': 'admin'
};

function reconcile(user, userAttributes, context) {
  // entryUUID is an operational attribute, so add it to the requested attributes
  user.id = userAttributes.entryUUID;
  user.active = true;
  user.username = userAttributes.uid;
  user.email = userAttributes.mail;
  user.fullName = userAttributes.cn;

  // uncomment to tag users while migrating
  // user.data = { migrated: true };

  // one value arrives as a string, several as an array
  var groups = [].concat(userAttributes.memberOf || []);
  var roles = [];
  groups.forEach(function (dn) {
    var role = rolesByGroup[dn.toLowerCase()];
    if (role && roles.indexOf(role) === -1) {
      roles.push(role);
    }
  });
  user.registrations = [{ applicationId: applicationId, roles: roles }];
}
