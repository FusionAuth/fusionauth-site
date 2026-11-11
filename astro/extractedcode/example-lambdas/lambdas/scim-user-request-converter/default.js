function convert(user, options, scimUser) {
  // Un-comment this line to see the scimUser object printed to the event log
  // console.info(JSON.stringify(scimUser, null, 2));

  // Request options
  // Note, sendSetPasswordEmail is only utilized during a user create request.
  // options.applicationId = null;
  // options.disableDomainBlock = false;
  // options.sendSetPasswordEmail = false;
  // options.skipVerification = false;

  user.active = scimUser.active;
  user.data.honorificPrefix = scimUser.name && scimUser.name.honorificPrefix;
  user.data.honorificSuffix = scimUser.name && scimUser.name.honorificSuffix;
  user.firstName = scimUser.name && scimUser.name.givenName;
  user.fullName = scimUser.name && scimUser.name.formatted;
  user.lastName = scimUser.name && scimUser.name.familyName;
  user.middleName = scimUser.name && scimUser.name.middleName;
  user.password = scimUser.password;
  user.username = scimUser.userName;

  // user.email
  if (scimUser.emails) {
    for (var i = 0; i < scimUser.emails.length; i++) {
      if (scimUser.emails[i].primary) {
        user.email = scimUser.emails[i].value;
      }
    }
  }

  // user.mobilePhone
  if (scimUser.phoneNumbers) {
    for (var j = 0; j < scimUser.phoneNumbers.length; j++) {
      if (scimUser.phoneNumbers[j].primary) {
        user.mobilePhone = scimUser.phoneNumbers[j].value;
      }
    }
  }

  // Handle the Enterprise User extension and other custom extensions
  if (scimUser.schemas) {
    for (var k = 0; k < scimUser.schemas.length; k++) {
      var schema = scimUser.schemas[k];
      if (schema !== 'urn:ietf:params:scim:schemas:core:2.0:User') {
        user.data = user.data || {};
        user.data.extensions = user.data.extensions || {};
        user.data.extensions[schema] = scimUser[schema] || {};
      }
    }
  }
}
