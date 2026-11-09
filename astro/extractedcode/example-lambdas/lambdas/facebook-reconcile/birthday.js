// fills in the profile and handles the partial birthdays Facebook returns
function reconcile(user, registration, facebookUser, context) {
  user.firstName = facebookUser.first_name || user.firstName;
  user.middleName = facebookUser.middle_name || user.middleName;
  user.lastName = facebookUser.last_name || user.lastName;
  user.fullName = facebookUser.name || user.fullName;

  // skip the gray placeholder image
  if (facebookUser.picture && facebookUser.picture.data && !facebookUser.picture.data.is_silhouette) {
    user.imageUrl = facebookUser.picture.data.url;
  }

  // facebook sends MM/DD/YYYY, MM/DD, or YYYY, depending on what the user shares
  var parts = (facebookUser.birthday || '').split('/');
  user.data = user.data || {};
  if (parts.length === 3) {
    user.birthDate = parts[2] + '-' + parts[0] + '-' + parts[1];
  } else if (parts.length === 2) {
    user.data.birthday = parts[0] + '-' + parts[1];
  } else if (/^\d{4}$/.test(parts[0])) {
    user.data.birthYear = Number(parts[0]);
  }
}
