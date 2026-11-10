// on the second form step, requires FusionAuth as the future auth provider when the user named a current one
function validate(result, user, registration, context) {
  if (context.step === 2 && user.data && user.data.currentAuth && user.data.futureAuth !== 'FusionAuth') {
    // the theme defines the message for this code
    result.errors.fieldErrors['user.data.futureAuth'] = [{ code: '[invalid]user.data.futureAuth' }];
  }
}
