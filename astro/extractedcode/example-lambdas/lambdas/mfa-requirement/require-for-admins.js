// always challenges admins and members of the mfa_required group
var mfaRequiredGroupId = 'replace-with-your-mfa-group-id';
var adminRoles = ['admin', 'billing-admin'];

function checkRequired(result, user, registration, context) {
  var inGroup = (user.memberships || []).some(function (membership) {
    return membership.groupId === mfaRequiredGroupId;
  });

  // registration is null when the request has no application or the user isn't registered
  var roles = (registration && registration.roles) || [];
  var isAdmin = roles.some(function (role) {
    return adminRoles.indexOf(role) !== -1;
  });

  if (inGroup || isAdmin) {
    result.required = true;
  }
}
