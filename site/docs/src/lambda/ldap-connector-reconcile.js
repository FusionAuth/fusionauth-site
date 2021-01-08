// This is an example LDAP Connector reconcile, modify this to your liking.
function reconcile(user, userAttributes) {

  // Un-comment this line to see the userAttributes object printed to the event log
  // console.info(JSON.stringify(userAttributes, null, 2));

  // This assumes the 'uid' attribute is a string form of a UUID in the format
  // `8-4-4-4-12`. It will be necessary to ensure an attribute is returned by your LDAP
  // connection that can be used for the FusionAuth user Id.
  user.id = userAttributes.uid;
  user.active = true;
  
  // if migrating users, tag them by uncommenting the below lines
  // user.data = {};
  // user.data.migrated = true;

  user.email = userAttributes.mail;
  user.fullName = userAttributes.cn;

  // In this example, the registration is hard coded, you may also build this
  // dynamically based upon the returned LDAP attributes.
  user.registrations = [{
    applicationId: "5d562fea-9ba9-4d5c-b4a3-e57bb254d6db",
    roles = ['user', 'admin']
  }];

}
