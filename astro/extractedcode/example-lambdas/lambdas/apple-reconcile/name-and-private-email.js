// saves the name Apple sends on the first login and flags Apple private relay addresses
function reconcile(user, registration, idToken, context) {
  // apple sends the name only on the first login, so later logins keep the saved name
  if (idToken.user && idToken.user.name) {
    user.firstName = idToken.user.name.firstName || user.firstName;
    user.lastName = idToken.user.name.lastName || user.lastName;
    user.fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.fullName;
  }

  // apple sends this claim as a string or a boolean
  user.data = user.data || {};
  user.data.applePrivateEmail = String(idToken.is_private_email) === 'true';
}
