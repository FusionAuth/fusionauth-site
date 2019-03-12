---
layout: article
title: Webapp Native Login to backend 
description: An explanation of webapp login using a native login form that submits to the application backend and uses JWTs and refresh tokens in cookies
image: articles/logins.png
---

This workflow is used by web applications using a native login form inside the webapp. This login form `POST`s the user's credentials (email and password) to the backend of the application. The application backend then in turn calls to FusionAuth. Below is a diagram that describes the primary components of this workflow and how they interact. Keep in mind that not every interaction is covered here, just the primary login interactions. At the bottom of the diagram is a discussion of the key steps.

For all of our examples, we use a store and a forum for the same company. The store requires a user to login to view their shopping cart and the forum requires the user to login to view forum posts. We also provide a couple of example attack vectors that hackers could use if portions of the system are compromised. These cases might be theoretical or based on known exploits such as XSS (cross-site scripting).

## Diagram

**Legend**

```text
() --> indicate request/response bodies
{} --> indicate request parameters
[] --> indicate cookies
```

{% include _image.html src="/assets/img/diagrams/logins/webapp/native-login-form-to-application-backend-cookies.svg" alt="Sequence diagram for this login workflow" class="mw-100 mx-auto mb-4 text-center" figure=true %}

## Explanation

1. The browser requests the shopping cart webapp's homepage from the application backend
2. The application backend responds with the HTML, CSS & JavaScript of the homepage
3. The user clicks the login link and the browser requests the login page from the application backend
4. The application backend responds with the HTML, CSS & JavaScript of the login page (including the form)
5. The user inputs their credentials and clicks the submit button. The browser `POST`s the form data to the application backend
6. The application backend calls the Login API in FusionAuth by passing in the credentials it received
7. FusionAuth returns a 200 status code stating that the credentials were okay. It also returns the User object, a JWT and a refresh token in JSON
8. The application backend receives the 200 and returns a redirect to the browser instructing it to navigate to the user's shopping cart. During this step, the JWT and refresh token are written out as HTTP cookies. These cookies are HttpOnly, which prevents JavaScript from accessing them, making them less vulnerable to theft. Additionally, all requests from the browser to the application backend will include the cookies so that the backend can retrieve and use them 
9. The browser requests the user's shopping cart from the application backend and includes the JWT and refresh token cookies
10. The application backend verifies the JWT and then uses the JWT to identify the user. Once the user is identified, the backend looks up the user's shopping cart from the database (or similar location). Finally, the application backend returns the user's shopping cart as HTML, CSS & JavaScript that the browser will render
11. A while later, the user's JWT expires and the user clicks on their shopping cart again. The browser will request the shopping cart from the application backend and will send the JWT and refresh token to the application backend
12. The application backend will verify the JWT and realizes it is expired. Since the browser also sent across the refresh token, the application backend calls the JWT refresh API in FusionAuth with the refresh token.
13. FusionAuth looks up the refresh token and returns a new JWT
14. The application backend will respond with the user's shopping cart HTML, CSS & JavaScript that the browser will render. It also includes the new JWT as a cookie that replaces the old JWT in the browser
15. A while later, the user's refresh token expires and the user clicks on their shopping cart again. The browser will request the shopping cart from the application backend and will send the JWT and refresh token to the application backend
16. The application backend will verify the JWT and realizes it is expired. Since the browser also sent across the refresh token, the application backend calls the JWT refresh API in FusionAuth with the refresh token
17. Since the refresh token has expired, FusionAuth returns a 404 status code
18. Since FusionAuth returned a 404 status code, the application backend returns a redirect to the browser that will send the user to the login page
19. The user can log in the same way they did in steps 5-8
20. The browser requests the forum webapp's homepage from the application backend. This is a standard SSO login, but because of the way this workflow manages cookies and identities, FusionAuth does not provide SSO capabilities automatically
21. The application backend responds with the HTML, CSS & JavaScript of the homepage
22. The user clicks the login link and the browser requests the login page from the application backend
23. The application backend responds with the HTML, CSS & JavaScript of the login page (including the form)
24. The user inputs their credentials and clicks the submit button. The browser `POST`s the form data to the application backend
25. The application backend calls the Login API in FusionAuth by passing in the credentials it received
26. FusionAuth returns a 200 status code stating that the credentials were okay. It also returns the User object, a JWT and a refresh token in JSON
27. The application backend receives the 200 and returns a redirect to the browser instructing it to navigate to the user's posts in the forum. During this step, the JWT and refresh token are written out as HTTP cookies. These cookies are HttpOnly, which prevents JavaScript from accessing them, making them less vulnerable to theft. Additionally, all requests from the browser to the application backend will include the cookies so that the backend can retrieve and use them 
28. The browser requests the user's forum posts from the application backend and includes the JWT and refresh token cookies
29. The application backend verifies the JWT and then uses the JWT to identify the user. Once the user is identified, the backend looks up the user's forum posts from the database (or similar location). Finally, the application backend returns the user's forum posts as HTML, CSS & JavaScript that the browser will render
30. This is an attack vector where the attacker has stolen the user's refresh token. Here, the attacker requests the user's shopping cart with the stolen refresh token and an invalid JWT.
31. The application backend will verify the JWT and realizes it is invalid. Since the browser also sent across the refresh token, the application backend calls the JWT refresh API in FusionAuth with the refresh token.
32. FusionAuth looks up the refresh token and returns a new JWT
33. The application backend will respond to the attacker with the user's shopping cart HTML, CSS & JavaScript. It also includes the new JWT as a cookie that attacker can now use
34. This is an attack vector where the attacker has stolen the user's JWT. Here, the attack requests the user's shopping cart with the stolen JWT.
10. The application backend verifies the JWT and then uses the JWT to identify the user. Once the user is identified, the backend looks up the user's shopping cart from the database (or similar location). Finally, the application backend returns the user's shopping cart as HTML, CSS & JavaScript to the attacker
