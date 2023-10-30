function handler(event) {
  var response = event.response;
  var headers = response.headers;

  // Set HTTP security headers
  // Since JavaScript doesn't allow for hyphens in variable names, we use the dict["key"] notation 
  headers['strict-transport-security'] = {value: 'max-age=31536000; includeSubdomains; preload'}; 
  headers['x-content-type-options'] = {value: 'nosniff'}; 
  headers['x-frame-options'] = {value: 'SAMEORIGIN'}; 
  headers['referrer-policy'] = {value: 'origin'};
  headers['permissions-policy'] = {value: "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; battery 'none'; camera 'none'; display-capture 'none'; document-domain 'none'; encrypted-media 'none'; execution-while-not-rendered 'none'; execution-while-out-of-viewport 'none'; fullscreen 'none'; geolocation 'none'; gyroscope 'none'; layout-animations 'none'; legacy-image-formats 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; navigation-override 'none'; oversized-images 'none'; payment 'none'; picture-in-picture 'none'; publickey-credentials-get 'none'; sync-xhr 'none'; usb 'none'; vr 'none'; wake-lock 'none'; screen-wake-lock 'none'; web-share 'none'; xr-spatial-tracking 'none';"};
  headers['feature-policy'] = {value: "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; battery 'none'; camera 'none'; display-capture 'none'; document-domain 'none'; encrypted-media 'none'; execution-while-not-rendered 'none'; execution-while-out-of-viewport 'none'; fullscreen 'none'; geolocation 'none'; gyroscope 'none'; layout-animations 'none'; legacy-image-formats 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; navigation-override 'none'; oversized-images 'none'; payment 'none'; picture-in-picture 'none'; publickey-credentials-get 'none'; sync-xhr 'none'; usb 'none'; vr 'none'; wake-lock 'none'; screen-wake-lock 'none'; web-share 'none'; xr-spatial-tracking 'none';"};
  
  // CORS
  var origin = event.request.headers.origin ? event.request.headers.origin.value : '';
  if (origin === 'https://login.fusionauth.io') {
    headers['access-control-allow-origin'] = {value: 'https://login.fusionauth.io'};
  } else if (origin === 'https://local.fusionauth.io') {
    headers['access-control-allow-origin'] = {value: 'https://local.fusionauth.io'};
  } else if (origin === 'https://account-local.fusionauth.io') {
    headers['access-control-allow-origin'] = {value: 'https://account-local.fusionauth.io'};
  } else {
    headers['access-control-allow-origin'] = {value: 'https://account.fusionauth.io'};
  }
  headers['vary'] = {value: 'Origin'};
  
  // Future headers that we might use at some point
  //headers['content-security-policy'] = { value: "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'"}; 
  //headers['x-xss-protection'] = {value: '1; mode=block'};

  // Return the response to viewers 
  return response;
}