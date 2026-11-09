// stores the Epic account and the platforms linked to it
function reconcile(user, registration, userInfo, context) {
  var account = userInfo[0];
  user.data = user.data || {};
  user.data.epic = {
    accountId: account.accountId,
    displayName: account.displayName,
    linkedPlatforms: (account.linkedAccounts || []).map(function (linked) {
      return linked.identityProviderId;
    })
  };
  // keep a language the user already chose
  if (account.preferredLanguage && !(user.preferredLanguages && user.preferredLanguages.length)) {
    user.preferredLanguages = [account.preferredLanguage];
  }
}
