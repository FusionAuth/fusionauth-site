function convert(scimGroup, group, members) {
  // Un-comment this line to see the group object printed to the event log
  // console.info(JSON.stringify(group, null, 2));

  // Set the outgoing displayName on the SCIM group using the FusionAuth group name.
  scimGroup.displayName = group.name;
}
