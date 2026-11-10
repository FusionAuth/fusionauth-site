// replaces the default attributes with the names a service provider expects, and leaves out empty values
function populate(samlResponse, user, registration, context) {
  var attributes = {};

  function add(name, values) {
    values = values.filter(function (value) {
      return value !== undefined && value !== null && value !== '';
    });
    if (values.length > 0) {
      attributes[name] = values;
    }
  }

  add('User.Email', [user.email]);
  add('User.FirstName', [user.firstName]);
  add('User.LastName', [user.lastName]);
  add('User.Department', [user.data.department]);
  add('User.Groups', registration && registration.roles ? registration.roles : []);

  samlResponse.assertion.attributes = attributes;
}
