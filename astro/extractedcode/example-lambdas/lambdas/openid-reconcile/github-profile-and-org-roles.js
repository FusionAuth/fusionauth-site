// fills in the profile from GitHub and assigns roles based on the user's GitHub organizations
function reconcile(user, registration, jwt, id_token, tokens, context) {
  user.imageUrl = jwt.avatar_url || user.imageUrl;
  user.fullName = jwt.name || user.fullName;
  registration.username = jwt.login;

  user.data = user.data || {};
  if (jwt.company) {
    // github prefixes organization names with @
    user.data.company = jwt.company.replace(/^@/, '');
  }
  if (jwt.location) {
    user.data.location = jwt.location;
  }

  // requires the read:org scope
  var response = fetch('https://api.github.com/user/orgs', {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + tokens.access_token
    }
  });

  // keep the current roles instead of failing the login
  if (response.status !== 200) {
    console.error('Could not read GitHub organizations. GitHub returned status ' + response.status + '.');
    return;
  }

  var orgRoles = { 'piedpiper': 'employee', 'piedpiper-admins': 'admin' };
  registration.roles = JSON.parse(response.body)
    .map(function (org) {
      return orgRoles[org.login];
    })
    .filter(Boolean);
}
