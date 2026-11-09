// reproduces the application MFA login policy and trust policy, as a starting point for custom rules
function checkRequired(result, user, registration, context) {
  var policies = context.policies || {};
  // the application policy overrides the tenant policy when set
  var loginPolicy = policies.applicationLoginPolicy || policies.tenantLoginPolicy;
  var methods = (user.twoFactor && user.twoFactor.methods) || [];

  var required = false;
  if (loginPolicy === 'Required') {
    // FusionAuth makes a user with no method enroll one
    required = true;
  } else if (loginPolicy === 'Enabled') {
    required = methods.length > 0;
  }

  result.required = required && !hasValidTrust(context);
}

// true when an existing MFA trust lets the user skip the challenge
function hasValidTrust(context) {
  var trustPolicy = (context.policies && context.policies.applicationMultiFactorTrustPolicy) || 'Any';
  var trust = context.mfaTrust;
  if (trustPolicy === 'None' || !trust) {
    return false;
  }

  if (trust.expirationInstant && trust.expirationInstant <= Date.now()) {
    return false;
  }

  // 'This' only honors a trust from the current application
  if (trustPolicy === 'This') {
    return !!context.application && trust.applicationId === context.application.id;
  }
  return true;
}
