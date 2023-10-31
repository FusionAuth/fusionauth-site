function handler(event) {
  var response = event.response;
  if (response.statusCode !== 999) {
    response.headers.foobar = { value: 'baz' };
    return response;
  }
  var uri = event.request.uri;
  if (uri.endsWith('.html')) {
    response.statusCode = 301;
    response.headers.location = { value: uri.substring(0, uri.length - 5) + '/' };
  } else if (!uri.endsWith('/')) {
    response.statusCode = 301;
    response.headers.location = { value: uri + '/' };
  }
  return response;
}
