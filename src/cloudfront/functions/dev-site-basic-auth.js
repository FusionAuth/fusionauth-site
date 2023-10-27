function handler(event) {
  var req = event.request;
  var hdrs = req.headers;

  // fusionauth:rocks
  if (hdrs.host && hdrs.host.value !== 'fusionauth.io' && hdrs.host.value !== 'fusionauth.dev'
    && (!hdrs.authorization || hdrs.authorization.value !== 'Basic ZnVzaW9uYXV0aDpyb2Nrcw==')) {
    return {
      'statusCode': 401,
      'statusDescription': 'Unauthorized',
      'headers': {
        'www-authenticate': { 'value': 'Basic' }
      }
    };
  }
  return req;
}
