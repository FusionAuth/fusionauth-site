// adds the exchanger's department, the request intent, and the user's organization to the token
function populate(jwt, exchange, context) {
  var data = exchange.entity.data || {};
  if (data.department) {
    jwt['https://piedpiper.com/department'] = data.department;
  }

  // intent is undefined when the request leaves it out
  if (exchange.intent) {
    jwt['https://piedpiper.com/intent'] = exchange.intent;
  }

  // FusionAuth copies only a few claims from the subject token, so carry custom claims over here
  var orgId = exchange.subjectToken['https://piedpiper.com/org_id'];
  if (orgId) {
    jwt['https://piedpiper.com/org_id'] = orgId;
  }
}
