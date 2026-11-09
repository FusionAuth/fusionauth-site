// adds the user's subscription tier from a billing API, and falls back to basic when the API fails
function populate(jwt, user, registration, context) {
  var response = fetch('https://billing.example.com/api/customers/' + encodeURIComponent(user.id), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + context.services.secrets.get('billing-api-key')
    },
    connectTimeout: 1000,
    readTimeout: 1500
  });

  // a status of -1 means FusionAuth could not reach the API
  if (response.status !== 200) {
    console.error('Could not read the billing tier for user ' + user.id + '. The billing API returned status ' + response.status + '.');
    jwt['https://example.com/tier'] = 'basic';
    return;
  }

  jwt['https://example.com/tier'] = JSON.parse(response.body).tier || 'basic';
}
