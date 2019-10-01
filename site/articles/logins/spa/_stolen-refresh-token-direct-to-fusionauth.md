1. This is an attack vector where the attacker has stolen the user's refresh token. Here, the attacker can request directly to the JWT refresh API in FusionAuth since it is the same request the browser is making. The attacker includes the refresh token cookie in the request
1. FusionAuth looks up the refresh token and returns a new JWT
1. The attacker requests the user's shopping cart with the JWT
1. The application backend uses the JWT to look up the user's shopping cart. It responds to the attacker with the user's shopping cart (usually as JSON)