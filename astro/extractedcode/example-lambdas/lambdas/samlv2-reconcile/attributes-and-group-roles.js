// fills in the profile from SAML attributes and assigns roles from the groups attribute
var claims = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/';
var groupRoles = {
  'Analytics Admins': 'admin',
  'Analytics Users': 'viewer'
};

function reconcile(user, registration, samlResponse, context) {
  var attributes = samlResponse.assertion.attributes || {};

  // every attribute value is a list, even when the attribute has one value
  function first(name) {
    var values = attributes[name];
    return values && values.length > 0 ? values[0] : null;
  }

  user.firstName = first(claims + 'givenname') || user.firstName;
  user.lastName = first(claims + 'surname') || user.lastName;

  registration.data = registration.data || {};
  registration.data.department = first('department') || registration.data.department;

  // a missing groups attribute leaves the registration roles unchanged
  if (attributes.groups) {
    registration.roles = attributes.groups
      .map(function (group) {
        return groupRoles[group];
      })
      .filter(Boolean);
  }
}
