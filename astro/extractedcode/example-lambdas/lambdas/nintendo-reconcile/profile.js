// copies the Nintendo Account profile to the user without overwriting values the user set
function reconcile(user, registration, userInfo, context) {
  user.data = user.data || {};
  user.data.nintendo = {
    id: userInfo.id,
    nickname: userInfo.nickname,
    country: userInfo.country
  };
  if (userInfo.birthday && !user.birthDate) {
    user.birthDate = userInfo.birthday;
  }
  if (userInfo.language && !(user.preferredLanguages && user.preferredLanguages.length)) {
    user.preferredLanguages = [userInfo.language];
  }
}
