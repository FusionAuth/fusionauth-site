// lets each exchanger call one audience with a fixed set of scopes, and limits tokens from external issuers
var rules = {
  'todo-service': { audience: 'email-service', scopes: ['email:send'] },
  'billing-service': { audience: 'invoice-service', scopes: ['invoice:read', 'invoice:write'] }
};

function policy(result, exchange, context) {
  var rule = rules[exchange.clientId];
  if (!rule) {
    deny(result, 'unauthorized_client', 'This client may not exchange tokens.');
    return;
  }

  if (exchange.requestedAudiencesAndResources.indexOf(rule.audience) === -1) {
    deny(result, 'invalid_target', 'The requested audience is not permitted for this client.');
    return;
  }

  // BEST_EFFORT means the subject token came from an external issuer
  var external = exchange.subjectTokenValidationStatus !== 'AUTHORITATIVE';
  var scopes = exchange.requestedScopes.filter(function (scope) {
    return rule.scopes.indexOf(scope) !== -1 && (!external || scope.slice(-5) === ':read');
  });

  result.decision = 'ALLOW';
  result.granted = {
    aud: [rule.audience],
    scope: scopes,
    expires_in: external ? 60 : 300
  };
}

function deny(result, code, description) {
  result.decision = 'DENY';
  result.denial = { error_code: code, error_description: description };
}
