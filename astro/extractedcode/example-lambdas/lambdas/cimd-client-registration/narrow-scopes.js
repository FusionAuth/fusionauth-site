// gives less trusted clients read-only scopes and no contact scopes, and rechecks them more often
var readOnlyHosts = ['chatgpt.com'];

function evaluate(result, clientMetadata, context) {
  if (readOnlyHosts.indexOf(clientMetadata.clientIdHost) === -1) {
    return;
  }

  // filter the scopes instead of setting them to null, which FusionAuth treats as DENY
  result.scopes = result.scopes.filter(function (scope) {
    return scope.name.slice(-6) !== ':write';
  });
  result.providedScopePolicy.phone.enabled = false;
  result.providedScopePolicy.address.enabled = false;
  // FusionAuth raises a value below 900 to 900
  result.ttlInSeconds = 900;
}
