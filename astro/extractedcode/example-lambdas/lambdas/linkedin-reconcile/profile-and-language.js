// fills in the profile from either LinkedIn response format and sets the preferred language
function reconcile(user, registration, linkedInUser, context) {
  // openid connect apps send given_name, legacy profile api apps send localizedFirstName
  user.firstName = linkedInUser.given_name || linkedInUser.localizedFirstName || user.firstName;
  user.lastName = linkedInUser.family_name || linkedInUser.localizedLastName || user.lastName;
  user.imageUrl = linkedInUser.picture || user.imageUrl;

  // locale is a string such as en-US, or an object such as { language: 'en', country: 'US' }
  var locale = linkedInUser.locale;
  var language = typeof locale === 'string' ? locale.split(/[-_]/)[0] : locale && locale.language;

  // keep a language the user already chose
  if (language && (!user.preferredLanguages || user.preferredLanguages.length === 0)) {
    user.preferredLanguages = [language];
  }
}
