// fills in the profile and gives users from your Google Workspace domain the employee role
function reconcile(user, registration, idToken, context) {
  // keep the saved value when google leaves a claim out
  user.firstName = idToken.given_name || user.firstName;
  user.lastName = idToken.family_name || user.lastName;
  user.fullName = idToken.name || user.fullName;
  user.imageUrl = idToken.picture || user.imageUrl;

  // hd is only present for google workspace accounts
  var roles = registration.roles || [];
  if (idToken.hd === 'example.com' && roles.indexOf('employee') === -1) {
    roles.push('employee');
  }
  registration.roles = roles;
}
