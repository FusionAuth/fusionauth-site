// rejects logins from past due accounts, except to the billing portal so the user can still pay
var billingApplicationId = 'replace-with-your-billing-application-id';

function validate(result, user, registration, context) {
  if (!user.data || user.data.accountStatus !== 'pastDue') {
    return;
  }

  if (registration && registration.applicationId === billingApplicationId) {
    return;
  }

  result.errors.generalErrors = [{
    code: '[LoginRestricted]',
    message: 'Account is past due, please contact accounts payable.'
  }];
}
