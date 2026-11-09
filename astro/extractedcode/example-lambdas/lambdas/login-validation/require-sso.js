// makes employees log in through the company identity provider instead of with local credentials
var employeeDomain = 'piedpiper.com';
var companyIdentityProviderId = 'replace-with-your-identity-provider-id';
var localLoginTypes = ['PASSWORD', 'PASSWORDLESS', 'ONE_TIME_PASSWORD'];

function validate(result, user, registration, context) {
  var email = (user.email || '').toLowerCase();
  if (email.slice(-(employeeDomain.length + 1)) !== '@' + employeeDomain) {
    return;
  }

  // the MFA step of an IdP login has the IdP's type but no identityProvider
  var otherIdentityProvider = context.identityProvider && context.identityProvider.id !== companyIdentityProviderId;
  if (localLoginTypes.indexOf(context.authenticationType) === -1 && !otherIdentityProvider) {
    return;
  }

  console.info('Rejected a ' + context.authenticationType + ' login for employee ' + user.id + '.');
  result.errors.generalErrors = [{
    code: '[SSORequired]',
    message: 'Log in with Pied Piper single sign-on.'
  }];
}
