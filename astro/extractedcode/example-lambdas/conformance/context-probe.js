// logs the context fields for the types whose output check.js can't read from a token
function logContext(context) {
  console.info('context: ' + JSON.stringify(Object.keys(context).filter(function (key) { return key !== 'services'; })));
}

function validate(result, user, registration, context) { logContext(context); }
function checkRequired(result, user, registration, context) { logContext(context); }
function policy(result, exchange, context) { logContext(context); }
