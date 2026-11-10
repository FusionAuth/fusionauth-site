// limits admin access tokens to 15 minutes, and removes the roles claim when the user has no roles
function populate(jwt, user, registration, context) {
  if (!jwt.roles || jwt.roles.length === 0) {
    jwt.roles = null;
    return;
  }

  if (jwt.roles.indexOf('admin') !== -1) {
    jwt.exp = Math.min(jwt.exp, jwt.iat + 15 * 60);
  }
}
