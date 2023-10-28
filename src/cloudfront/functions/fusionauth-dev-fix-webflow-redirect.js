function handler(event) {
    var response = event.response;
    var location = response.headers.location
    if (response.statusCode === 301 || response.statusCode === 302) {
        response.headers.location = { value: location.value.replace(/webflow.fusionauth.dev/g, 'fusionauth.dev') };
    }

    return response;
}
