// registers only known clients, revokes retired ones, and rejects requests that look automated
var allowedHosts = ['claude.ai', 'chatgpt.com', 'app.piedpiper.com'];
var revokedClientIds = ['https://app.piedpiper.com/oauth/legacy-client.json'];
var blockingThreats = ['BotDetected', 'BlocklistedIp'];

function evaluate(result, clientMetadata, context) {
  // REVOKE also deletes the client's refresh tokens
  if (revokedClientIds.indexOf(clientMetadata.clientId) !== -1) {
    result.decision = 'REVOKE';
    return;
  }

  // threats are only present with Advanced Threat Detection
  var threats = context.authenticationThreats || [];
  var threat = threats.filter(function (name) {
    return blockingThreats.indexOf(name) !== -1;
  })[0];
  if (threat) {
    console.info('Rejected CIMD client ' + clientMetadata.clientId + ' because of ' + threat + '.');
    result.decision = 'DENY';
    return;
  }

  if (allowedHosts.indexOf(clientMetadata.clientIdHost) === -1) {
    console.info('Rejected CIMD client ' + clientMetadata.clientId + ' from an unknown host.');
    result.decision = 'DENY';
  }
}
