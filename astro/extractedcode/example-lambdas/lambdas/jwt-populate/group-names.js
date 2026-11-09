// adds the names of the user's groups to the access token
function populate(jwt, user, registration, context) {
  var groupIds = user.memberships.map(function (membership) {
    return membership.groupId;
  });
  if (groupIds.length === 0) {
    jwt.groups = [];
    return;
  }

  var response = fetch('http://localhost:9012/api/group', {
    method: 'GET',
    headers: {
      'Authorization': context.services.secrets.get('fusionauth-api-key')
    }
  });

  // issue the token without groups instead of failing the login
  if (response.status !== 200) {
    console.error('Could not read groups. The Groups API returned status ' + response.status + '.');
    jwt.groups = [];
    return;
  }

  jwt.groups = JSON.parse(response.body).groups
    .filter(function (group) {
      return groupIds.indexOf(group.id) !== -1;
    })
    .map(function (group) {
      return group.name;
    });
}
