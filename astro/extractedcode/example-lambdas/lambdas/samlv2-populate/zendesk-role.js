// sends one Zendesk role, admin before agent, and no role for end users
function populate(samlResponse, user, registration, context) {
  var roles = registration && registration.roles ? registration.roles : [];
  if (roles.indexOf('admin') !== -1) {
    samlResponse.assertion.attributes.role = ['admin'];
  } else if (roles.indexOf('agent') !== -1) {
    samlResponse.assertion.attributes.role = ['agent'];
  }
}
