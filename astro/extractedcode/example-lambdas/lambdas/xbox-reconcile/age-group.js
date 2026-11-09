// stores the gamertag and gives players under 18 a restricted role
function reconcile(user, registration, userInfo, context) {
  var claims = userInfo.DisplayClaims.xui[0];
  user.data = user.data || {};
  user.data.xbox = {
    gamertag: claims.gtg,
    xuid: claims.xid,
    ageGroup: claims.agg
  };
  if (!registration) {
    return;
  }
  // recompute on every login so the role goes away once the player turns 18
  var roles = (registration.roles || []).filter(function (role) {
    return role !== 'restricted';
  });
  if (claims.agg !== 'Adult') {
    roles.push('restricted');
  }
  registration.roles = roles;
}
