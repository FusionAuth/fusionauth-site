---
layout: blog-post
title: Building a microservices gateway application 
description: Implement authentication and authorization using FusionAuth for a gateway API application that routes to two different microservices.
author: Tim Kleier
image: blogs/theming-advanced-forms/how-to-theme-fusionauths-advanced-registration-forms.png
category: blog
tags: client-javascript
excerpt_separator: "<!--more-->"
---

In this article, we're going to implement authentication and authorization for a gateway API application that routes to two different microservices. FusionAuth will be the auth server for the gateway.

<!--more-->

An API gateway with microservices is a common pattern for enterprise architectures. In this post, we'll pretend we're setting this up for an eCommerce enterprise. Our gateway application is a central API that will control access to a product catalog service and a product inventory service. We'll allow customers to access public endpoints but require authentication for some of the product inventory endpoints.

For this article, we're going to need a running FusionAuth instance and three simple Node/Express applications. You can download the [example project](https://github.com/FusionAuth/fusionauth-example-node-services-gateway) for this article and customize your FusionAuth configuration accordingly, or you can follow along conceptually.

We're going to have four applications running, on the following ports:
* FusionAuth: `9011`
* Gateway Application: `3000`
* Product Catalog Service: `3001`
* Product Inventory Service: `3002`

We're also going to be dealing with authentication and authorization quite a bit, so let's briefly clarify what we mean by these terms.

## Authentication and authorization
Authentication is the verification of a particular user. When a user is logged in, they're saying to the application, "Hey, it's the real John Doe, let me in." The application validates their credentials, and they have access.

In our API gateway, we're going to use FusionAuth, based on the [5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide). We'll talk about specific details when we set up our API gateway application later.

Authorization is the process whereby we verify that a particular user (e.g. John Doe) has access to certain parts of our system (e.g. product inventory). In our eCommerce ecosystem, we're going to require authorization for the product inventory API, but not for the basic product APIs, since we want everyone to access the latter. For the product inventory route, we'll allow users with the "admin" role access.

## Product Catalog service

We'll return to authentication and authorization soon, but let's start building our applications! We're going to start with the services and work our way towards the gateway application.

### Setup

Before you get going, you'll need node installed (code tested with version 14). If you don't have it installed, grab it from [the node website](https://nodejs.org/en/download/).

Clone the [project](https://github.com/FusionAuth/fusionauth-example-node-services-gateway) onto your local computer and `cd` into the directory.

You'll notice three folders corresponding to our applications: `gateway`, `product-catalog`, and `product-inventory`. Go ahead and `cd` into the `product-catalog` application and do the following:

* Run `npm install` to install the dependencies.
* Start the application by running `npm start`. It should be running on port `3001`, which is defined in `bin/www`.

Now that your application is up and running, you should be able to send a request to it and get a response. Run this `curl` command in a separate terminal window and you should get a successful response with an empty list of products (`products: []`):

```shell
curl http://localhost:3001/products
```

Let's open up the hood on this and check out the `routes/index.js` file that gave us our `/products` route.

```javascript
const express = require('express');
const router = express.Router();

router.get('/products', function(req, res, next) {
  res.json('products: []')
});

router.get('/products/:id', function(req, res, next) {
  res.json(`product: ${req.params.id}`)
});

module.exports = router;
```

We've created two basic routes, `/products` and `/products/:id`, so we can get a list of products and a single product. Obviously, for a real microservice, these routes would request the product information from a datastore. For now, the former is returning an empty array `[]` and the latter returns the product id requested.

Try modifying your curl request to add a product ID, and notice that the response will indicate the specific ID you requested.

The Product Catalog service is ready to go!

## Product Inventory service

Open up another terminal window and enter the `product-inventory` folder. Run `npm install` to install needed dependencies.

Here's what our Product Inventory service looks like (in `routes/index.js`):

```javascript
const express = require('express');
const router = express.Router();

router.get('/branches/:id/products', function(req, res, next) {
  const roles = req.headers.roles;
  if (roles && roles.includes('admin')) {
    res.json(`Products for branch #${req.params.id}`);
  } else {
    res.redirect(403, 'http://localhost:3000');
    return;
  }
});

module.exports = router;
```

In this service, we've just got one route, to get products for a specific store or branch. Notice, however, that we're allowing access (or denying it) based on the inclusion of an `admin` role in the `roles` header. The API gateway application will be responsible for passing this data to our Product Inventory service.

If you were to start the service--go ahead and do so with `npm start`--and send a request to `http://localhost:3002/branches/1/products`, you should receive a 403. You can simulate a successful response by adding a `roles` header with a value of `admin`:

```shell
curl -i -H "Accept: application/json" -H "Content-Type: application/json" -H "roles: admin" http://localhost:3002/branches/1/products
```

We've got our Product Inventory service up and running, with authorization to ensure that only admins can access a list of products for a branch. Doing an authorization check at the service level allows us to granularly implement authorization.

### API-level authentication

A quick note on API-level authentication. We're implementing centralized authentication through the API gateway, and we want only that gateway to have access to these microservices. You could do this at the network level, or with some form of API-level authentication, like an [API Key](https://microservice-api-patterns.org/patterns/quality/qualityManagementAndGovernance/APIKey). It's a little much for us to cover in this article, but it's definitely something you'll want to implement before launching your microservices into production.

## The gateway application

Now that we've got our Product Catalog and Product Inventory services running on ports `3001` and `3002`, we're ready to tackle the API gateway application.

Before we dive into the code, let's briefly discuss why we're creating our own gateway as opposed to using something like [Apigee](https://apigee.com/about/cp/api-gateway) or [Amazon's API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html). We certainly could go that route, but in creating our own gateway, we have ultimate flexibility. There's an additional benefit of gaining an understanding of exactly what a gateway application is doing.

Our gateway application is straightforward and lightweight. It primarily functions as a router, directing requests to the appropriate service. But, because it's a gateway to our distributed services, it's the perfect spot for centralized user-level auth checks.

### Centralized authentication

Centralizing authentication is a common pattern because authentication is primarily just a check to ensure the following:

* The user is logged in
* The user is who they say they are

In the context of separate services in an eCommerce domain, we want to have this centralized authentication so one check in the gateway gives a user access to the services, assuming their credentials check out. We'll use FusionAuth for authenticating each of our routes before we forward them over to the right service.

### FusionAuth Setup

Open up yet another terminal window, enter the `gateway` director, and run `npm install`.

Head over to the [5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) for FusionAuth. During setup, the application that you configure will be linked to our gateway application, so you can name it "Gateway".

Update the `routes/index.js` in the `gateway` directory with your FusionAuth application's client ID and secret and `views/index.pug` with your client ID. Then start the application by running `npm start`.

This application will be our gateway (hence the name) to our services, so at this point, we should access our services only through the gateway application. Run the `curl` command for `/products`, but do so on port `3000`, which will hit our gateway application.

```shell
curl http://localhost:3000/products
```
Now we're funneling traffic through our gateway application and forwarding it over to the Product Catalog service. You can verify this by opening the terminal window for the running Product Catalog service and checking the logs. You should see the request we just sent hitting that server: 

```
GET /products 200
```

### Routes

Let's go through the gateway application's `routes/index.js` file step by step. We start by requiring necessary files and setting up a `FusionAuthClient`. We also include a handy authentication middleware, which we'll use on our routes.

```
// ...
const request = require('request');
const express = require('express');
const router = express.Router();
const {FusionAuthClient} = require('@fusionauth/typescript-client');
const clientId = [YOUR_CLIENT_ID];
const clientSecret = [YOUR_CLIENT_SECRET];
const client = new FusionAuthClient('noapikeyneeded', 'http://localhost:9011');
const checkAuthentication = require('../middleware');
// ...
```

Our gateway application, along with our services, are based off the [fusionauth-example-node](https://github.com/FusionAuth/fusionauth-example-node) project, which gives us a basic UI (at the root) for interacting with FusionAuth. We also have a route for our OAuth redirect:

```javascript
// ...
/* GET home page. */
router.get('/', function (req, res, next) {
  const stateValue = Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
  req.session.stateValue = stateValue
  res.render('index', {user: req.session.user, stateValue: stateValue, title: 'FusionAuth Example'});
});

/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function (req, res, next) {
  // This code stores the user in a server-side session
  const stateFromServer = req.query.state;
  if (stateFromServer !== req.session.stateValue) {
    console.log("State doesn't match. uh-oh.");
    console.log("Saw: "+stateFromServer+ ", but expected: "+req.session.stateValue);
    res.redirect(302, '/');
    return;
  }
  client.exchangeOAuthCodeForAccessToken(req.query.code,
                                         clientId,
                                         clientSecret,
                                         'http://localhost:3000/oauth-redirect')
      .then((response) => {
        console.log(response.response.access_token);
        return client.retrieveUserUsingJWT(response.response.access_token);
      })
      .then((response) => {
        req.session.user = response.response.user;
      })
      .then((response) => {
        res.redirect(302, '/');
      }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});
});
// ...
```

At this point, with your gateway server running, you should be able to go to `http://localhost:3000` in your browser and see this:

{% include _image.liquid src="/assets/img/blogs/node-microservices-gateway/login-screen.png" alt="The login screen for the gateway server." class="img-fluid" figure=false %}

If we've got our setup working right, you should be able to click "Login". Login to FusionAuth with the user you set up previously. You'll see a "Hello [your name]" message.

This UI wouldn't be necessary in a typical usage of an API gateway application, but it's an easy, visual way for us to demonstrate a successful OAuth login.

Looking at the remainder of our `routes/index.js` file, we've got routes that will forward to our Product Catalog and Product Inventory services.

```javascript
// ...
/* PRODUCT CATALOG ROUTES */
const productUrl = 'http://localhost:3001';

router.get('/products', function(req, res, next) {
  request(`${productUrl}/products`).pipe(res);
});

router.get('/products/:id', function(req, res, next) {
  request(`${productUrl}/products/${req.params.id}`).pipe(res);
});
// ...
```

These routes are completely public and don't require endpoint-level authentication, as we want customers and employees alike to be able to view products. We want them to buy something, right? The routes forward over to the product catalog service on port 3001. However, if there was ever part of the catalog that required protection, we've built the infrastructure.

Now for the product inventory route, to retrieve products at a branch:

```javascript
// ...
/* PRODUCT INVENTORY ROUTES */
router.get('/branches/:id/products', checkAuthentication, function(req, res, next) {
  const user = req.session.user;
  const options = {
    url: `http://localhost:3002/branches/${req.params.id}/products`,
    headers: { roles: user.registrations[0].roles }
  };
  request(options).pipe(res);
});
// ...
```

This route forwards over to our Product Inventory service. The `checkAuthentication` middleware can be used in any route where we want to check that the user is authenticated; it sends the user back to the root URL if they aren't logged in.

Using your browser (to leverage our OAuth credentials present because we signed in), go to `http://localhost:3000/branches/1/products`. This works because the user you setup in the [5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) has an `admin` role in FusionAuth, and we're passing that role as a header to the Product Inventory service.

## Conclusion

We've covered a lot in this article. Our goal was to create a basic eCommerce ecosystem with an API gateway application and two microservices, a Product Catalog service and a Product Inventory service.

For our API gateway, we leverage FusionAuth for centralized authentication and authorization. We then created forwarding routes to our two services, with the ability to pass roles to the services. And in the services themselves, we implemented the ability to allow or deny requests at the endpoint level based on the user's role.

If you wanted to explore this further, you could:

* Add more users and roles; for example, a `branch-manager` role which can view the products for a certain branch.
* Build out a products and branches tables.
* Build an application to display available products.

Happy coding!
