// removes write access and shortens the lifetime of tokens for the reporting service
var maxLifetimeInSeconds = 300;

function populate(jwt, exchange, context) {
  if ((exchange.audiences || []).indexOf('reporting-service') === -1) {
    return;
  }

  var readOnly = (exchange.scopes || []).filter(function (scope) {
    return scope.slice(-6) !== ':write';
  });
  // an empty scope makes FusionAuth restore the granted scopes, so leave the claim alone
  if (readOnly.length > 0) {
    jwt.scope = readOnly.join(' ');
  }

  // FusionAuth ignores a later exp, so only shorten the lifetime
  if (jwt.exp > jwt.iat + maxLifetimeInSeconds) {
    jwt.exp = jwt.iat + maxLifetimeInSeconds;
  }
}
