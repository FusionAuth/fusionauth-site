// records each HYPR login and gives HYPR users a passwordless role
function reconcile(user, registration, context) {
  user.data = user.data || {};
  user.data.hypr = {
    lastLoginInstant: Date.now(),
    loginCount: ((user.data.hypr && user.data.hypr.loginCount) || 0) + 1
  };
  if (!registration) {
    return;
  }
  var roles = registration.roles || [];
  if (roles.indexOf('passwordless') === -1) {
    roles.push('passwordless');
  }
  registration.roles = roles;
}
