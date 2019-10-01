1. The user inputs their credentials and clicks the submit button. The application `POST`s the form data to the application backend
1. The application backend calls the Login API in FusionAuth by passing in the credentials it received
1. FusionAuth returns a 200 status code stating that the credentials were okay. It also returns the User object, a JWT and a refresh token in JSON
1. The User object, JWT and refresh token are sent back to the application