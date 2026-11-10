// registers only clients from known hosts and revokes retired ones
var allowedHosts = ['claude.ai', 'chatgpt.com', 'app.piedpiper.com'];
var revokedClientIds = ['https://app.piedpiper.com/oauth/legacy-client.json'];

function evaluate(result, clientMetadata, context) {
  // REVOKE also deletes the client's refresh tokens
  if (revokedClientIds.indexOf(clientMetadata.clientId) !== -1) {
    result.decision = 'REVOKE';
    return;
  }

  if (allowedHosts.indexOf(clientMetadata.clientIdHost) === -1) {
    console.info('Rejected CIMD client ' + clientMetadata.clientId + ' from an unknown host.');
    result.decision = 'DENY';
  }
}
