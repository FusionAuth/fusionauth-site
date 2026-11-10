// builds the SCIM user from the user, and the enterprise extension from the user.data keys the request converter wrote
var enterpriseSchema = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User';
var enterpriseFields = ['employeeNumber', 'costCenter', 'organization', 'division', 'department'];

function convert(scimUser, user, context) {
  scimUser.active = user.active;
  scimUser.userName = user.username;
  scimUser.name = {
    formatted: user.fullName,
    familyName: user.lastName,
    givenName: user.firstName,
    middleName: user.middleName,
    honorificPrefix: user.data.honorificPrefix,
    honorificSuffix: user.data.honorificSuffix
  };

  // omit empty multi-valued attributes instead of sending entries with no value
  if (user.email) {
    scimUser.emails = [{ primary: true, type: 'work', value: user.email }];
  }
  if (user.mobilePhone) {
    scimUser.phoneNumbers = [{ primary: true, type: 'mobile', value: user.mobilePhone }];
  }

  var enterprise = {};
  enterpriseFields.forEach(function (field) {
    if (user.data[field]) {
      enterprise[field] = user.data[field];
    }
  });
  if (user.data.managerId) {
    enterprise.manager = {
      value: user.data.managerId,
      // the manager is another user, so swap the user Id at the end of this user's location
      $ref: scimUser.meta.location.replace(/[^/]+$/, user.data.managerId),
      displayName: user.data.managerName
    };
  }
  if (Object.keys(enterprise).length === 0) {
    return;
  }
  if (scimUser.schemas.indexOf(enterpriseSchema) === -1) {
    scimUser.schemas.push(enterpriseSchema);
  }
  scimUser[enterpriseSchema] = enterprise;
}
