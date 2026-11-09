// asks an external authorization service whether to allow the exchange, and denies when the service can't answer
function policy(result, exchange, context) {
  var response = fetch('https://authz.example.com/api/exchange', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + context.services.secrets.get('authz-api-key'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tenantId: context.tenantId,
      exchanger: exchange.clientId,
      subject: exchange.subjectTokenClaims.sub,
      audiences: exchange.requestedAudiencesAndResources,
      scopes: exchange.requestedScopes
    })
  });

  if (response.status !== 200) {
    console.error('The authorization service returned status ' + response.status + '.');
    deny(result, 'invalid_request', 'The exchange could not be authorized.');
    return;
  }

  // expects {"allowed": true, "aud": [...], "scope": [...], "expires_in": 300}
  var decision = JSON.parse(response.body);
  if (!decision.allowed) {
    deny(result, 'unauthorized_client', decision.reason || 'The authorization service denied the exchange.');
    return;
  }

  result.decision = 'ALLOW';
  result.granted = {
    aud: decision.aud,
    scope: decision.scope,
    expires_in: decision.expires_in
  };
}

function deny(result, code, description) {
  result.decision = 'DENY';
  result.denial = { error_code: code, error_description: description };
}
