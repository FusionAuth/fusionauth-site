// stores the Steam profile on the user and keeps the avatar current
function reconcile(user, registration, userInfo, context) {
  var player = userInfo.response.players[0];
  user.data = user.data || {};
  user.data.steam = {
    steamId: player.steamid,
    profileUrl: player.profileurl
  };
  if (player.avatarfull) {
    user.imageUrl = player.avatarfull;
  }
  // private profiles leave out realname and loccountrycode
  if (player.realname && !user.fullName) {
    user.fullName = player.realname;
  }
  if (player.loccountrycode) {
    user.data.steam.countryCode = player.loccountrycode;
  }
}
