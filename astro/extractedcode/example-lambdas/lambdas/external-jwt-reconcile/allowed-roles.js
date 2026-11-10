// fills in the profile from an external JWT and accepts only the roles your application allows
function reconcile(user, registration, jwt, context) {
  user.firstName = jwt.given_name || user.firstName;
  user.lastName = jwt.family_name || user.lastName;
  user.imageUrl = jwt.picture || user.imageUrl;

  registration.data = registration.data || {};
  registration.data.issuer = jwt.iss;

  // a missing roles claim leaves the registration roles unchanged
  if (!jwt.roles) {
    return;
  }

  // never grant a role just because the other system sent it
  var allowedRoles = ['viewer', 'editor'];
  var roles = Array.isArray(jwt.roles) ? jwt.roles : [jwt.roles];
  registration.roles = roles.filter(function (role) {
    return allowedRoles.indexOf(role) !== -1;
  });
}
