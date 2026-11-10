// returns the group name the SCIM client sent, without the prefix the request converter added
function convert(scimGroup, group, members, context) {
  scimGroup.displayName = (group.data && group.data.scimDisplayName) || group.name;
}
