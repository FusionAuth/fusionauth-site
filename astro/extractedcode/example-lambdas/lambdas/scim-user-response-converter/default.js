function convert(scimUser, user) {
  // Un-comment this line to see the user object printed to the event log
  // console.info(JSON.stringify(user, null, 2));

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

  scimUser.phoneNumbers = [{
    primary: true,
    value: user.mobilePhone,
    type: "mobile"
  }];

  scimUser.emails = [{
    primary: true,
    value: user.email,
    type: "work"
  }];

  // Optionally return any custom extensions stored in user.data
  if (user.data && user.data.extensions) {
    for (var extension in user.data.extensions) {
      if (scimUser.schemas.indexOf(extension) === -1) {
        scimUser.schemas.push(extension);
      }
      scimUser[extension] = user.data.extensions[extension];
    }
  }
}
