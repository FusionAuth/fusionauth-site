1. The browser requests the shopping cart single-page application from the application backend
1. The application backend responds with the HTML, CSS & JavaScript of the application
1. The browser loads the application and as part of the initialization process, it makes a request to the application backend to see if the user is logged in 
1. The application backend responds with a 404 indicating the user is not logged in
1. The user clicks the login link and the browser navigates away from the single-page application to FusionAuth's OAuth 2 interface. The browser requests the OAuth 2 login page from FusionAuth with a `response_type` of code indicating that it is using the authorization code grant
1. FusionAuth responds with the HTML, CSS & JavaScript of the login page (including the form)
1. The user inputs their credentials and clicks the submit button. The browser `POST`s the form data to FusionAuth
1. FusionAuth returns a redirect to the application backend's OAuth 2 `redirect_uri`. This redirect includes the authorization code from FusionAuth. Also, this response includes a session id for the FusionAuth OAuth 2 interface as an HTTP cookie. This cookie is HttpOnly, which prevents JavaScript from accessing it, making it less vulnerable to theft
1. The browser requests the application backend's OAuth `redirect_uri` with the authorization code from FusionAuth 
1. The application backend calls FusionAuth's OAuth 2 token endpoint with the authorization code and optionally the `client_secret`
1. FusionAuth verifies the authorization code and `client_secret`. It returns a 200 along with a JWT and refresh token in JSON