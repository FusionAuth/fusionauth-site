1. The browser requests the forum webapp's homepage from the application backend. This is a standard SSO login, but because of the way this workflow manages cookies and identities, FusionAuth does not provide SSO capabilities automatically
1. The application backend responds with the HTML, CSS & JavaScript of the homepage
1. The user clicks the login link and the browser requests the login page from the application backend
1. The application backend responds with the HTML, CSS & JavaScript of the login page (including the form)
1. The user inputs their credentials and clicks the submit button. The browser `POST`s the form data to the application backend
1. The application backend calls the OAuth token endpoint in FusionAuth by passing in the credentials it received plus a `grant_type` of `password`, which indicates it is using the resource owner's grant in FusionAuth's OAuth 2 backend 
1. FusionAuth returns a 200 status code stating that the credentials were okay. It also returns a JWT and a refresh token in JSON