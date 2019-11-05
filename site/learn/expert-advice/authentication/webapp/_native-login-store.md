1. The browser requests the shopping cart webapp's homepage from the application backend
1. The application backend responds with the HTML, CSS & JavaScript of the homepage
1. The user clicks the login link and the browser requests the login page from the application backend
1. The application backend responds with the HTML, CSS & JavaScript of the login page (including the form)
1. The user inputs their credentials and clicks the submit button. The browser `POST`s the form data to the application backend
1. The application backend calls the Login API in FusionAuth by passing in the credentials it received
1. FusionAuth returns a 200 status code stating that the credentials were okay. It also returns the User object, a JWT and a refresh token in JSON