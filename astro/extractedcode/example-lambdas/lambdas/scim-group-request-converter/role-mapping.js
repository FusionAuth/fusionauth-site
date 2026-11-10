// application role Ids that members of each SCIM group receive; replace with role Ids from your applications
var roleIdsByGroup = {
  'Engineering': ['replace-with-engineering-role-id'],
  'Sales Reps': ['replace-with-sales-role-id', 'replace-with-crm-role-id']
};

function convert(group, members, options, scimGroup, context) {
  // prefix the name so a SCIM group can't collide with a group created in FusionAuth
  group.name = 'SCIM: ' + scimGroup.displayName;
  group.data.scimDisplayName = scimGroup.displayName;

  options.roleIds = roleIdsByGroup[scimGroup.displayName] || [];

  (scimGroup.members || []).forEach(function (member) {
    if (!member.value) {
      return;
    }
    members.push({
      userId: member.value,
      data: {
        $ref: member['$ref']
      }
    });
  });
}
