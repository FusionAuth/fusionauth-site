// fills in the profile, the full-size profile image, and the location from Twitter
function reconcile(user, registration, twitterUser, context) {
  user.fullName = twitterUser.name || user.fullName;

  // remove the _normal suffix from any image type to get the original size, and skip the placeholder image
  if (twitterUser.profile_image_url_https && !twitterUser.default_profile_image) {
    user.imageUrl = twitterUser.profile_image_url_https.replace(/_normal(\.\w+)$/, '$1');
  }

  // users can change the screen name, so use the value for display only
  registration.username = twitterUser.screen_name;

  if (twitterUser.location) {
    user.data = user.data || {};
    user.data.location = twitterUser.location;
  }
}
