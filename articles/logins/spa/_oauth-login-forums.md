1. The browser requests the forum single-page application from the application backend. This is a standard SSO login that is fully supported by FusionAuth
1. The application backend responds with the HTML, CSS & JavaScript of the application 
1. The browser loads the application and as part of the initialization process, it makes a request to the application backend to see if the user is logged in 
1. The application backend responds with a 404 indicating the user is not logged in
1. The user clicks the login link and the browser navigates away from the single-page application to FusionAuth's OAuth 2 interface. The browser requests the OAuth 2 login page from FusionAuth with a `response_type` of code indicating that it is using the authorization code grant. Additionally, the session cookie that was set during the first login is also sent by the browser to FusionAuth
1. FusionAuth realizes that the user already has a session and is already logged in. Therefore, it returns a redirect to the application backend's OAuth 2 `redirect_uri`. This redirect includes the authorization code from FusionAuth
1. The browser requests the application backend's OAuth `redirect_uri` with the authorization code from FusionAuth
1. The application backend calls FusionAuth's OAuth 2 token endpoint with the authorization code and optionally the `client_secret`
1. FusionAuth verifies the authorization code and `client_secret`. It returns a 200 along with a JWT and refresh token in JSON. **NOTE**: all of this happens without any user interaction, hence the SSO nature of this login