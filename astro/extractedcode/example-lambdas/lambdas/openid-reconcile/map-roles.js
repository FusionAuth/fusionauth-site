// maps a customer's role names to your application's role names
var roleMap = {
  administrator: 'admin',
  dev: 'developer',
  ba: 'business_analyst'
};

function reconcile(user, registration, jwt, id_token, tokens, context) {
  // a missing roles claim leaves the registration roles unchanged
  if (!jwt.roles) {
    return;
  }

  // some identity providers send a single role as a string
  var customerRoles = Array.isArray(jwt.roles) ? jwt.roles : [jwt.roles];
  registration.roles = customerRoles
    .map(function (role) {
      return roleMap[role];
    })
    .filter(Boolean);
}
