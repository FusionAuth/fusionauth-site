// challenges risky logins and flags the riskiest ones, and keeps the default decision otherwise
function checkRequired(result, user, registration, context) {
  var risk = context.clientRisk && context.clientRisk.status;
  // ImpossibleTravel is the only threat FusionAuth reports to this lambda
  var impossibleTravel = (context.authenticationThreats || []).indexOf('ImpossibleTravel') !== -1;

  if (risk === 'HIGH' || risk === 'MEDIUM' || impossibleTravel) {
    result.required = true;
  }

  // sendSuspiciousLoginEvent only applies to the login action
  if (context.action === 'login' && (risk === 'HIGH' || impossibleTravel)) {
    result.sendSuspiciousLoginEvent = true;
  }
}
