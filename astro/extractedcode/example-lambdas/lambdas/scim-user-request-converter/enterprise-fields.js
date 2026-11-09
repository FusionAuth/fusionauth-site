// copies SCIM core and enterprise attributes to the user, with enterprise fields as top-level user.data keys
var enterpriseSchema = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User';
var enterpriseFields = ['employeeNumber', 'costCenter', 'organization', 'division', 'department'];

// the primary entry, or the first entry when the client marks none as primary
function preferred(entries) {
  if (!entries || entries.length === 0) {
    return undefined;
  }
  var primary = entries.filter(function (entry) {
    return entry.primary;
  });
  return (primary[0] || entries[0]).value;
}

function convert(user, options, scimUser, context) {
  // register every provisioned user with the employee portal application
  options.applicationId = 'replace-with-your-employee-portal-application-id';

  var name = scimUser.name || {};
  // SCIM clients may omit active, so treat a missing value as active
  user.active = scimUser.active !== false;
  user.username = scimUser.userName;
  user.password = scimUser.password;
  user.email = preferred(scimUser.emails);
  user.mobilePhone = preferred(scimUser.phoneNumbers);
  user.firstName = name.givenName;
  user.middleName = name.middleName;
  user.lastName = name.familyName;
  user.fullName = name.formatted;
  user.data.honorificPrefix = name.honorificPrefix;
  user.data.honorificSuffix = name.honorificSuffix;

  var enterprise = scimUser[enterpriseSchema];
  if (!enterprise) {
    return;
  }
  enterpriseFields.forEach(function (field) {
    if (enterprise[field]) {
      user.data[field] = enterprise[field];
    }
  });
  if (enterprise.manager && enterprise.manager.value) {
    user.data.managerId = enterprise.manager.value;
    user.data.managerName = enterprise.manager.displayName;
  }
}
