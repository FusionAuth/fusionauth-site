// makes the admin resource read-only for every client
var readOnlyResources = ['https://mcp.piedpiper.com/admin'];

function evaluate(result, clientMetadata, context) {
  if (readOnlyResources.indexOf(context.resource) === -1) {
    return;
  }

  // filter the scopes instead of setting them to null, which FusionAuth treats as DENY
  result.scopes = result.scopes.filter(function (scope) {
    return scope.name.slice(-6) !== ':write';
  });
}
