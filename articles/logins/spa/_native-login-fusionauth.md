1. The browser requests the shopping cart single-page application from the application backend
1. The application backend responds with the HTML, CSS & JavaScript of the application
1. The browser loads the application and as part of the initialization process, it makes a request to the application backend to see if the user is logged in 
1. The application backend responds with a 404 indicating the user is not logged in
1. The application renders the login form
1. The user inputs their credentials and clicks the submit button. The browser AJAX `POST`s the form data directly to the Login API in FusionAuth