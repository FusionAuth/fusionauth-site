// maps Active Directory attributes to the user and AD groups to application roles
var applicationId = 'replace-with-your-application-id';
var rolesByGroup = {
  'cn=engineering,ou=groups,dc=example,dc=com': 'user',
  'cn=domain admins,cn=users,dc=example,dc=com': 'admin'
};

function reconcile(user, userAttributes, context) {
  // request objectGUID;binary, not objectGUID, to receive the Base64 value
  user.id = FusionAuth.ActiveDirectory.b64GuidToString(userAttributes['objectGUID;binary']);
  user.active = true;
  user.username = userAttributes.sAMAccountName;
  user.email = userAttributes.userPrincipalName;
  user.firstName = userAttributes.givenName;
  user.lastName = userAttributes.sn;

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
