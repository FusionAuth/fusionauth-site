// stores the Twitch account on the user and keeps the avatar current
function reconcile(user, registration, userInfo, context) {
  user.data = user.data || {};
  user.data.twitch = {
    id: userInfo.sub,
    login: userInfo.preferred_username,
    emailVerified: userInfo.email_verified === true
  };
  if (userInfo.picture) {
    user.imageUrl = userInfo.picture;
  }
}
