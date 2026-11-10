// adds the OpenID Connect locale claim from the registration or user language, with a default
function populate(jwt, user, registration, context) {
  var languages = registration && registration.preferredLanguages && registration.preferredLanguages.length > 0
    ? registration.preferredLanguages
    : user.preferredLanguages || [];

  // FusionAuth stores en_US, the claim uses the BCP 47 form en-US
  jwt.locale = (languages[0] || 'en_US').replace('_', '-');
}
