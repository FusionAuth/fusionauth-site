function populate(jwt, user, registration) {
  jwt.message = 'Hello World!';
  var roles = registration && registration.roles ? registration.roles : [];
  jwt.permissions = [];
  if (roles.includes('admin')) {
    jwt.permissions.push('all');
  } else if (roles.includes('editor')) {
    jwt.permissions.push('read', 'write');
  } else if (roles.includes('viewer')) {
    jwt.permissions.push('read');
  }
}
