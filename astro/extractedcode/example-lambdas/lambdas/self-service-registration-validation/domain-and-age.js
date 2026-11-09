// only lets people with a company email address register, and requires a minimum age
var allowedDomains = ['piedpiper.com', 'hooli.com'];
var minimumAge = 18;

function validate(result, user, registration, context) {
  // the lambda runs for every step, so only check fields on the current step
  var keys = context.fields.map(function (field) {
    return field.key;
  });

  if (keys.indexOf('user.email') !== -1 && user.email) {
    var domain = user.email.slice(user.email.lastIndexOf('@') + 1).toLowerCase();
    if (allowedDomains.indexOf(domain) === -1) {
      result.errors.fieldErrors['user.email'] = [{
        code: '[notAllowedDomain]user.email',
        message: 'Register with your company email address.'
      }];
    }
  }

  if (keys.indexOf('user.birthDate') !== -1 && user.birthDate && ageOn(user.birthDate, new Date()) < minimumAge) {
    result.errors.fieldErrors['user.birthDate'] = [{
      code: '[tooYoung]user.birthDate',
      message: 'You must be at least ' + minimumAge + ' years old to register.'
    }];
  }
}

// birthDate is a YYYY-MM-DD string
function ageOn(birthDate, date) {
  var parts = birthDate.split('-').map(Number);
  var age = date.getUTCFullYear() - parts[0];
  var month = date.getUTCMonth() + 1;
  if (month < parts[1] || (month === parts[1] && date.getUTCDate() < parts[2])) {
    age--;
  }
  return age;
}
