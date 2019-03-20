---
layout: article
title: Single-page application native login to FusionAuth 
subtitle: Using JWTs and refresh tokens 
description: An explanation of single-page application login using a native login form that submits directly to FusionAuth and uses server-side sessions plus refresh tokens in cookies
image: articles/logins.png
---

{% capture intro %}
{% include_relative _native-fusionauth-intro.md %}
{% endcapture %}
{{ intro | markdownify }}

## Diagram

**Legend**

```text
() --> indicate request/response bodies
{} --> indicate request parameters
[] --> indicate cookies
```

{% plantuml _diagrams/logins/spa/native-login-form-to-fusionauth-same-domain-jwts-refresh-tokens-cookies.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _native-login-fusionauth.md %}
1. FusionAuth returns a 200 status code stating that the credentials were okay. It also returns a JWT and a refresh token in cookies with the domain of the application. This scenario exists if the developer deploys FusionAuth in the top level domain
1. The browser requests the user's shopping cart via AJAX from the application backend and includes the JWT cookie
1. The application backend verifies the JWT and then uses the JWT to identify the user. Once the user is identified, the backend looks up the user's shopping cart from the database (or similar location). Finally, the application backend returns the user's shopping cart contents (usually as JSON)
1. A while later, the user's JWT expires and the user clicks on their shopping cart again. The browser requests the user's shopping cart via AJAX from the application backend and includes the JWT cookie
1. The application backend responds with a 401, indicating that the JWT has expired
1. The application recognizes that the JWT has expired and makes a request directly to the JWT refresh API in FusionAuth. This request includes the refresh token cookie
1. FusionAuth looks up the refresh token and returns a new JWT in an HttpOnly cookie
1. The browser requests the user's shopping cart via AJAX from the application backend and includes the JWT cookie
1. The application backend verifies the JWT and then uses the JWT to identify the user. Once the user is identified, the backend looks up the user's shopping cart from the database (or similar location). Finally, the application backend returns the user's shopping cart contents (usually as JSON)
1. A while later, the user's JWT and refresh token expire and the user clicks on their shopping cart again. The browser requests the user's shopping cart via AJAX from the application backend and includes the JWT cookie
1. The application backend responds with a 401, indicating that the JWT has expired
1. The application recognizes that the JWT has expired and makes a request directly to the JWT refresh API in FusionAuth. This request includes the refresh token cookie
1. Since the refresh token has expired, FusionAuth returns a 404 status code
1. At this point, the application can allow the user can log in the same way they did above
{% include_relative _native-login-forums-fusionauth.md %}
1. FusionAuth returns a 200 status code stating that the credentials were okay. It also returns a JWT and a refresh token in cookies with the domain of the application. This scenario exists if the developer deploys FusionAuth in the top level domain
1. The browser updates the cookies that store the JWT and refresh token to the new cookie values from FusionAuth for the forums. This clobbers the JWT and refresh token for the store and will force the user to log into the store next time they open that application
1. The browser requests the user's forum posts via AJAX from the application backend and includes the JWT cookie
1. The application backend verifies the JWT and then uses the JWT to identify the user. Once the user is identified, the backend looks up the user's forum posts from the database (or similar location). Finally, the application backend returns the user's forum posts (usually as JSON)
1. This is an attack vector where the attacker has stolen the user's refresh token. Here, the attacker can request directly to the JWT refresh API in FusionAuth since it is the same request the browser is making. The attacker includes the refresh token cookie in the request
1. FusionAuth looks up the refresh token and returns a new JWT
1. The attack requests the user's shopping cart with the JWT
1. The application backend uses the JWT to look up the user's shopping cart. It responds to the attacker with the user's shopping cart (usually as JSON)
{% include_relative _stolen-jwt-refresh-jwt.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is more secure than the other workflows that call FusionAuth directly because the JWT and refresh token are both stored in HttpOnly cookies. The downside of this workflow is that there are no built in SSO capabilities provided by FusionAuth. It forces the developer to build out an SSO solution themselves. 

This workflow requires that FusionAuth be deployed at the top-level domain for the entire organization or that a proxy be used to rewrite the cookies that FusionAuth sends back as part of the Login API so that they are in the correct domain.  

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
* [/api/jwt/refresh](/docs/v1/tech/apis/jwt#refresh-a-jwt)
* [/oauth2/token](/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)