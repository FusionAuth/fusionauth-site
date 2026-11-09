// challenges risky logins and flags the riskiest ones, and keeps the default decision otherwise
var challengeThreats = ['ImpossibleTravel', 'UnrecognizedDevice', 'RecentPasswordChange', 'SuspiciousUserAgent'];

function checkRequired(result, user, registration, context) {
  var threats = context.authenticationThreats || [];
  var risk = context.clientRisk && context.clientRisk.status;

  var threatened = threats.some(function (threat) {
    return challengeThreats.indexOf(threat) !== -1;
  });

  if (risk === 'HIGH' || risk === 'MEDIUM' || threatened) {
    result.required = true;
  }

  // sendSuspiciousLoginEvent only applies to the login action
  if (context.action === 'login' && (risk === 'HIGH' || threats.indexOf('ImpossibleTravel') !== -1)) {
    result.sendSuspiciousLoginEvent = true;
  }
}
