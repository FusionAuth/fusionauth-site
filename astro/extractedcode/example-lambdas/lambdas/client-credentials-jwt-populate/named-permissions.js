// adds permissions named by target entity, and the recipient's tier from entity data
function populate(jwt, recipientEntity, targetEntities, permissions, context) {
  var named = [];
  Object.keys(permissions).forEach(function (targetId) {
    var target = targetEntities[targetId];
    var name = target ? target.name : targetId;
    permissions[targetId].forEach(function (permission) {
      named.push(name + ':' + permission);
    });
  });

  jwt['https://example.com/permissions'] = named.sort();
  jwt['https://example.com/tier'] = (recipientEntity.data && recipientEntity.data.tier) || 'standard';
}
