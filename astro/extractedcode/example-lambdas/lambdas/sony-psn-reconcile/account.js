// stores the PSN account and gives sub accounts a restricted role
function reconcile(user, registration, userInfo, context) {
  user.data = user.data || {};
  user.data.psn = {
    onlineId: userInfo.online_id,
    accountUuid: userInfo.user_uuid,
    country: userInfo.country_code,
    subAccount: userInfo.is_sub_account === true
  };
  if (userInfo.language_code && !(user.preferredLanguages && user.preferredLanguages.length)) {
    user.preferredLanguages = [userInfo.language_code];
  }
  if (!registration) {
    return;
  }
  // PlayStation sub accounts belong to children and stay sub accounts until a parent upgrades them
  var roles = (registration.roles || []).filter(function (role) {
    return role !== 'restricted';
  });
  if (userInfo.is_sub_account === true) {
    roles.push('restricted');
  }
  registration.roles = roles;
}
