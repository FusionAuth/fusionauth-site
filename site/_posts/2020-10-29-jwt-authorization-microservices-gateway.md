---
layout: blog-post
title: JWT authorization in a microservices gateway
description: How would
author: Tim Kleier and Matt Anderson
image: blogs/jerry-hopper-story/jerry-talks-gdpr-compliance-arm-images-and-paper-manuals.png
category: blog
tags: client-javascript
excerpt_separator: "<!--more-->"
---

In a recent article, we set up an API gateway with microservices for an eCommerce enterprise. FusionAuth handled our centralized authentication and then we passed user details for authorization to the microservices.

<!--more-->

In this article, we'll build on the [example project](https://github.com/FusionAuth/fusionauth-example-node-services-gateway) from that article, focusing on tightening up security by implementing [JSON Web Token](https://tools.ietf.org/html/rfc7519) (JWT) authorization. This is a critical security concern because we don't want to allow just any application to call our microservices. You may want to re-read the [Centralized Authentication with a Microservices Gateway](/blog/2020/09/15/microservices-gateway/) post to refresh your memory. And we've created a new [sample project](https://github.com/timkleier/fusionauth-example-node-services-gateway-jwtauth) with updated source code based on this article.

Even though we're allowing public access to the Product Catalog, we still want that traffic to come through our gateway application. That will ensure centralized access to our Product Catalog, and our microservices will be more protected.

So here's what we'll do:

* Add the `jsonwebtoken` package to our gateway and microservices
* Utilize FusionAuth's HMAC default signing key to create [signed JWTs](/learn/expert-advice/tokens/building-a-secure-jwt/) for the gateway to pass to the microservices
* Decode that JWT in each of the microservices, using the same signing key, to verifying the request
* For role-based access checks, the gateway will forward the user's signed `access_token` from FusionAuth as an Authorization Bearer token, allowing microservices to verify and determine the caller's roles

## JWT Authorization

JWTs are an industry standard way for securely passing claims between two parties, allowing that information to be verified by the recipient. We're going to use them for the purpose of authorization (authorizing the gateway to access the microservices) as well as passing information (user claims, such as role membership).

If you are going to make the code changes, clone the [example project](https://github.com/FusionAuth/fusionauth-example-node-services-gateway), otherwise feel free to follow along conceptually. TBD final github repo??

In your gateway application, install `jsonwebtoken`:

```shell
npm install jsonwebtoken
```

Next we'll head over to FusionAuth to get our key for signing the JWT.

### Signing
By signing JWTs using FusionAuth's default signing key, we're effectively limiting access to applications that have the key, thus allowing private microservices to ensure the incoming message is from a trusted caller, the gateway in this case.

In this case, because we control all the microservices, we'll use a symmetric signing algorithm, such as HMAC. We could also use a public/private signing algorithm, such as RSA, which would be less performant but wouldn't require us to share a secret between the signer of the JWT and its consumers.

To access your FusionAuth default signing key, go to **Settings > Key Master**, click on the magnifying glass next to the key with the name "Default signing key", then reveal it and copy the value of the "Secret".

{% include _image.liquid src="/assets/img/blogs/microservices-jwt-auth/signing-key-secret.png" alt="Finding the JWT signing key value." class="img-fluid" figure=false %}

Now we add this value as a variable to the gateway application (in `/routes/index.js`) and require the `jsonwebtoken` library:

*NOTE:* In production applications, avoid storing secrets in code. Instead, use a separate secrets store and obtain the secret from that store at runtime. Such an effort is left as an exercise for the reader.

```javascript
const jwtSigningKey = '[Default Signing Key]';
const jwt = require('jsonwebtoken');
```

Next, we'll add a function at the end of that file to get the gateway bearer token for forwarding to the microservices. In this case, we are setting the token to expire in 10 minutes. This is a common duration of the JWT, but you may want to reduce it for security concerns, as described in FusionAuth's article on [Revoking JWTs & JWT Expiration](https://fusionauth.io/learn/expert-advice/tokens/revoking-jwts/).

```javascript
function getGatewayBearerToken(req) {
  var token = jwt.sign({ data: req.url }, jwtSigningKey, { expiresIn: '10m', subject: 'gateway', issuer: req.get('host') });
  return 'Bearer ' + token;
}
```

`getGatewayBearerToken()` creates a bearer token valid for ten minutes and utilizes our public signing key. It's how we will provide secure, general access between the gateway and microservices which don't require any further authorization. All this JWT is guaranteeing is that the request for the API came through the gateway.

## Gateway Router Integration
For the Product Catalog routes, we'll use `getGatewayBearerToken()` to prepare the bearer token and attach the result as a Bearer token in the `authorization` header.

```javascript
router.get('/products', function(req, res, next) {
  const bearerToken = getGatewayBearerToken(req);
  const options = {
    url: `${productUrl}/products`,
    headers: { authorization: bearerToken }
  };
  request(options).pipe(res);
});
```

We'll want to do this for all other routes as well, but won't show that in this post.

## Microservice JWT Integration

We're now ready for the microservices to handle the bearer token passed in the header. As each microservice will need to handle the tokens in the same way, it makes sense to create a package utility that can be shared by each microservice.

### Authorization Middleware

Here we'll just cover the contents of the utility, as the [package creation](https://docs.npmjs.com/creating-node-js-modules) is a little out of scope for this article. For convenience, we've included this in a `shared` folder in the [sample project](https://github.com/timkleier/fusionauth-example-node-services-gateway-jwtauth).

```javascript
const jwt = require('jsonwebtoken');

module.exports = function(options) {
  return function(req, res, next) {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        console.log('Authorization header missing. Denying request.')
        handleUnauthorized(res, options);
        return;
      }

      const bearer = authorization.split(' ');
      if (!bearer || bearer.length != 2) {
        console.log('Bearer header value malformed. Denying request.')
        handleUnauthorized(res, options);
        return;
      }

      token = bearer[1];
      if (!token) {
        console.log('Token not provided. Denying request.')
        handleUnauthorized(res, options);
        return;
      }

      const decoded_token = jwt.verify(token, options.jwtSigningKey);
      req.session.roles = decoded_token.roles;

    } catch(err) {
      console.error(err);
      handleUnauthorized(res, options);
      return;
    }

    next();
  }
};

function handleUnauthorized(res, options) {
  if (options.loginRedirectUrl) {
    res.redirect(options.loginRedirectUrl)
  }
  else {
    res.status(401).json({
      status: 401,
      message: 'UNAUTHORIZED'
    })
  }
}
```

We're exporting a function that looks for the `Authorization` header key coming from the gateway. It goes through the following steps:
1. Find the `authorization` header
1. Split the value it finds (giving us `Bearer` and the token)
1. Grab the token portion
1. Verify and decode the token using the `jwtSigningKey`

If all those steps are successful, we'll end up with a decoded token. And if there were roles included, they will be added to `req.session`. For any errors in the process, the `handleUnauthorized` function will redirect to the login page and/or respond with a `401: UNAUTHORIZED`.

We're getting a bit ahead of ourselves in optionally handling roles, but for correct authorization in the Product Inventory service, roles will be helpful.

### Product Catalog Integration
We have our `authorizationMiddleware` in place, and it's pretty simple to integrate it into the Product Catalog microservice (in `app.js`):

```javascript
const { JWT_SIGNING_KEY, LOGIN_REDIRECT_URL } = process.env;
var authorizationMiddleware = require('authorization-middleware'); // assuming it's packaged under that name

// ...
app.use(authorizationMiddleware({ jwtSigningKey: JWT_SIGNING_KEY, loginRedirectUrl: LOGIN_REDIRECT_URL }));
app.use('/', indexRouter);
//...
```
Note that we're using the `authorizationMiddleware` prior to the `indexRouter`, which will ensure the middleware is applied to all our routes.

Remember that we're using the `jwtSigningKey` to verify the JWT has been signed with the FusionAuth default signing key. Above, we manually pasted the string in, but here we've implemented it as an environment variable. This is better than hard-coding the key in code.

In your local environment, you can add your `JWT_SIGNING_KEY` to your `bash_profile` or export it to your environment:
```shell
export JWT_SIGNING_KEY=[Default Signing Key]
```

## Product Inventory Integration
The Product Inventory service endpoint, `/branches/:id/product` has role-based access, so we're going to rework our gateway to pass the user role, which is included in the response we got from the FusionAuth OAuth login flow. Before hopping over to the gateway application to make that change, let's first make changes in the Product Inventory service.

Follow the same steps above for adding the `authorizationMiddleware` to `app.js`, but do so in the Product Inventory service. Then we'll just need to slightly modify the `routes/index.js` file:

```javascript
//...
router.get('/branches/:id/products', function(req, res, next) {
  const roles = req.session.roles; // this used to be req.headers.roles

  if (roles && roles.includes('admin')) {
    res.json(`Products for branch #${req.params.id}`);
  } else {
    res.redirect(403, 'http://localhost:3000');
    return;
  }
});
//...
```

We're making this change, in getting roles from `req.headers.roles` to `req.session.roles`, because our `authorizationMiddleware` takes the decoded token and puts the roles object onto `req.session`. This is appropriate as the roles are more closely linked to the user's session than with any specific request to our service.

That's all we need to do in the Product Inventory service, but we'll need to make some changes to our gateway application to ensure it's passing the roles inside the JWT.

In the gateway application, edit `routes/index.js` and make these changes:

```javascript
//...
// Updates to the existing product inventory route
router.get('/branches/:id/products', checkAuthentication, function(req, res, next) {
  const bearerToken = getUserBearerToken(req);
  const options = {
    url: `http://localhost:3002/branches/${req.params.id}/products`,
    headers: { authorization: bearerToken }
  };
  request(options).pipe(res);
});

//...
// adding a function similar to getGatewayBearerToken()
function getUserBearerToken(req) {
  return 'Bearer ' + req.session.access_token;
}
```

When forwarding the request to the Product Inventory service, we want to send the original `access_token` generated by FusionAuth during login, as we'll need to authorize based on the user role. It has already been signed, so we just need to send it as the `authorization` header bearer token.

We'll need to complete one more step in order to allow admin access to the Product Inventory route. In FusionAuth, click on "Applications", then the "Manage Roles" icon on the Gateway application. Add a new role called "admin".

{% include _image.liquid src="/assets/img/blogs/microservices-jwt-auth/adding-role.png" alt="Adding a new role to an existing application." class="img-fluid" figure=false %}

Then click on "Users", find the user you created, and under the "Registrations" tab, click the "Edit" icon on the Gateway application. Check the box next to "admin" and save. This grants the "admin" role to this user.

{% include _image.liquid src="/assets/img/blogs/microservices-jwt-auth/giving-user-admin-role.png" alt="Giving an existing user a new role." class="img-fluid" figure=false %}

The next time you log in to FusionAuth and access the `/branches/:id/products` route, you will be authorized and receive the expected response from the Product Inventory service.

If we needed to have multiple tenants, each with a different set of users, we'd want to add a tenant under the "Tenants" tab. However, for this example, let's keep everything in a single tenant.

## Session Housekeeping

If you try multiple requests across the services, you may notice you're getting responses indicated you're unauthorized due to the session id changing. This is becaue the private services are responding with their own session cookie, which is overriding the one from the gateway. The fix for this is simple; you'll just need to add a unique name to the `expressSession` in the gateway and each of our microservices.

In the gateway, modify `app.js`:

```javascript
//...
app.use(expressSession({name: 'fa.gw.sid', resave: false, saveUninitialized: false, secret: 'fusionauth-node-example'}));
//...
```

All we've done is give the `expressSession` a unique name, this one representing FusionAuth ("fa"), the gateway ("gw"), and session id ("sid"). Do the same in each of the services and the `access_token` won't be compromised.

## Go further

While this tutorial explains how to integrate JWT based authorization into your microservices environment, there are additional steps you could take to make the application better.

* Extract all secrets to environment variables or a secrets manager.
* Instead of using the shared HMAC secret, use a public private key with the RSA algorithm to ensure you don't need to share any secrets. In this case, you'll want to have FusionAuth generate all the JWTs, so set up an anonymous user to allow access for the public APIs.
* Benchmark the difference for multiple invocations with JWT auth and the API key used previously to understand the performance implications.

## Wrapping Up

We've successfully implemented JWT authorization, utilizing the pre-signed FusionAuth `access_token` for role-based access to the Product Inventory service, and creating our own signed JWT for a generic but private connection between the gateway and the Product Catalog service.

There are a number of other ways we could have done this, but FusionAuth's default signing key and the simplicity of working with JWTs made this a pretty straightforward means by which to add a layer of security to our gateway and microservices.
