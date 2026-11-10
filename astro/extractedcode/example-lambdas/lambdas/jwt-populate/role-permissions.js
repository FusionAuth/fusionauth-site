// maps application roles to permissions, and adds the user's plan as a namespaced claim
var permissionsByRole = {
  admin: ['reports:read', 'reports:write', 'users:manage'],
  editor: ['reports:read', 'reports:write'],
  user: ['reports:read']
};

function populate(jwt, user, registration, context) {
  var roles = registration && registration.roles ? registration.roles : [];
  var permissions = [];
  roles.forEach(function (role) {
    (permissionsByRole[role] || []).forEach(function (permission) {
      if (permissions.indexOf(permission) === -1) {
        permissions.push(permission);
      }
    });
  });

  jwt.permissions = permissions;
  jwt['https://example.com/plan'] = user.data.plan || 'free';
}
