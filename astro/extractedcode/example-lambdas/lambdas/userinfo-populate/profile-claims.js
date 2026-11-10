// adds the user's department and roles, and removes the birthdate claim
function populate(userInfo, user, registration, jwt, context) {
  userInfo['https://example.com/department'] = user.data.department || null;
  userInfo['https://example.com/roles'] = registration ? registration.roles || [] : [];
  userInfo.birthdate = null;
}
