---
layout: blog-post
title: Building a secured API with Ruby On Rails and JWTs
description: We'll build a Rails API and control access to it with JSON Web Tokens (JWTs)
author: Dan Moore
image: blogs/authorization-code-grant-asp-net/securing-asp-net-app-oauth.png
tags: client-ruby
category: blog
excerpt_separator: "<!--more-->"
---

Ruby on Rails is an excellent framework with which to build an API. The ability to quickly jam out code representing your business logic, the ease of creating and modifying data models, and the built in testing support all combine to make building a JSON API in Rails a no brainer. Add in a sleek admin interface built using something like [RailsAdmin](https://github.com/sferik/rails_admin) and you can build custom APIs in no time.

In this tutorial, we're going to build a simple API in Ruby on Rails 6, and then secure the API using using a JSON Web Token (JWT).

<!--more-->

As always, the code is available under an Apache2 license [on GitHub](https://github.com/FusionAuth/fusionauth-example-rails-api), if you'd rather jump ahead and just get the code.

## Prerequisites 

This post assumes you have Ruby and Rails 6 installed. If you don't, we suggest you follow the steps in the [Getting Started with Rails](https://guides.rubyonrails.org/getting_started.html) guide. Other than that we presume nothing about your knowledge of Ruby or Rails.

## Build the API

To build the API, we're going to create a new Rails API application. Using the `--api` switch disables a bunch of functionality we won't use (like views).

```shell
rails new hello_api --api
```

Then, change to that directory. We're now going to add our controller to the routes that Rails knows about. Edit the `config/routes.rb` file and change the contents to 

```ruby
Rails.application.routes.draw do
  resources :messages, only: [:index]
end
```

This controller will be simple. It is just going to return a hardcoded list of messages when a `GET` request is made to the `/messages` path. In a real world application, of course, you would store messages in the database and pull them dynamically using ActiveRecord. But for this tutorial, a hardcoded list will suffice.

Create the controller at `app//messages_controller.rb`. Here are the contents of that class:

```ruby
class MessagesController < ApplicationController
  def index
    messages = []
    messages << "Hello"
    render json: { messages: messages }.to_json, status: :ok
  end
end
```

If you start up your Rails server:

```shell
rails s
```

You should now be able to visit http://localhost:4000/messages and see 

```json
{"messages":["Hello"]}
```

But let's also add a test so that we can make sure future changes don't cause unexpected behavior.

Create the controller test at `test/controllers/messages_controller_test.rb`. Here are the contents of that class:

```ruby
require 'test_helper'

class MessagesTest < ActionDispatch::IntegrationTest
  test "can get messages" do
    get "/messages"
    assert_response :success
  end
  test "can get messages content" do
    get "/messages"
    res = JSON.parse(@response.body)
    assert_equal '{"messages"=>["Hello"]}', res.to_s
  end
end
```

Now we can run our test and make sure that we are getting what we expect:

```shell
$ rails test test/integration/messages_test.rb
Running via Spring preloader in process 15492
Run options: --seed 1452

# Running:

..

Finished in 0.119373s, 16.7542 runs/s, 16.7542 assertions/s.
2 runs, 2 assertions, 0 failures, 0 errors, 0 skips
```

Excellent! Now let's secure the API.

## Secure the API

Let's secure our API now. As a reminder, we're going to use a JWT to secure this API. While you can secure APIs using API keys or Basic Authentication, using a JWT has certain advantages. You can integrate with a number of identity providers that offer OAuth or SAML support. This lets you leverage an existing robust identity management system to control who has access to your API. You can also embed additional information into a JWT, including attributes like roles.

The first step is to write the tests. Let's change the tests to expect a JWT and respond with a `:forbidden` HTTP status when none are provided.

```ruby
class MessagesTest < ActionDispatch::IntegrationTest
  test "can' get messages with no auth" do
    get "/messages"
    assert_response :forbidden
  end
  test "can get messages with header" do
    get "/messages", headers: { "HTTP_AUTHORIZATION" => "Bearer " + build_jwt }
    assert_response :success
  end
  test "expired jwt fails" do
    get "/messages", headers: { "HTTP_AUTHORIZATION" => "Bearer " + build_jwt(-1) }
    assert_response :forbidden
  end
  test "can get messages content" do
    get "/messages", headers: { "HTTP_AUTHORIZATION" => "Bearer " + build_jwt }
    res = JSON.parse(@response.body)
    assert_equal '{"messages"=>["Hello"]}', res.to_s
  end

  def build_jwt(valid_for_minutes = 5)
    exp = Time.now.to_i + (valid_for_minutes*60)
    payload = { "iss": "fusionauth.io",
                "exp": exp,
                "aud": "238d4793-70de-4183-9707-48ed8ecd19d9",
                "sub": "19016b73-3ffa-4b26-80d8-aa9287738677",
                "name": "Dan Moore",
                "roles": ["USER"]
    }

    JWT.encode payload, Rails.configuration.x.oauth.jwt_secret, 'HS256'

  end
end
```

What we're doing here is specifying that the JWT will have an `Authorization` header of the form `Bearer JWT...`, and testing a couple of cases. 

First, let's talk about the JWT. 

[JWTs have claims](https://tools.ietf.org/html/rfc7519#section-4), which are information carried by the JWT. The keys of the JSON payload, such as `iss`, and `name` are claims. Some of these are defined in the JWT RFC. These are called 'registered' claims. Others are registered with the IANA but are not part of the standard; these are 'public' claims. And yet others are entirely defined by the JWT creator; these are 'private' claims. 


```
# ...
  def build_jwt(valid_for_minutes = 5)
    exp = Time.now.to_i + (valid_for_minutes*60)
    payload = { "iss": "fusionauth.io",
                "exp": exp,
                "aud": "238d4793-70de-4183-9707-48ed8ecd19d9",
                "sub": "19016b73-3ffa-4b26-80d8-aa9287738677",
                "name": "Dan Moore",
                "roles": ["USER"]
    }

    JWT.encode payload, Rails.configuration.x.oauth.jwt_secret, 'HS256'
# ...
```

In this code we create a few registered claims that will be useful for our API. `exp` indicates when the JWT will expire. `aud` is an identifier of who/what this JWT is intended for. `sub` is the person or piece of software this JWT applies to--from the RFC: "The claims in a JWT are normally statements about the subject." And `iss` is the identifier for the issuer of the JWT. 

We also add a `name` which is a public claim. And the `roles` which are a private claim, with a meaning undefined outside of our application. Note that because the content of JWTs is not encrypted (unless you take steps to do so), no secrets or private data should be put into a claim.

The last thing we do is encode our JWT with a secret. We use HMAC because in this scenario we control both the issuer of the JWT and the consumer, and so can share a secret reliably between them. If we didn't have a way to share secrets, using an asymmetric key would be a better choice.

For this tutorial, we put the HMAC secret in the environment specific configuration files located at `config/environments/`. For production usage, use whatever you normally would for secrets. You should make the HMAC secret a long string, but don't use the secret key base.

Let's add our authorization code now that our tests fail.

There are two places we could put the code that checks the JWT. We could place it in the Messages controller or we could put it in the Application controller and have authorization enforced for all requests. Since this is an API that is using JWT, and we're presuming all clients will be carrying a JWT, we should protect all our resources. If and when we need to distinguish between different JWT claims, we can refactor. For instance, we may want to have some APIs only accessible for users with the `ADMIN` role. 

Here's the code that we should put in the `app/controllers/application_controller.rb` file:

```ruby
class ApplicationController < ActionController::API
  before_action :require_jwt

  def require_jwt
    token = request.headers["HTTP_AUTHORIZATION"]
    if !token
      head :forbidden
    end
    if !valid_token(token)
      head :forbidden
    end
  end

  private
  def valid_token(token)
    unless token
      return false
    end

    token.gsub!('Bearer ','')
    begin
      decoded_token = JWT.decode token, Rails.configuration.x.oauth.jwt_secret, true
      return true
    rescue JWT::DecodeError

    end
    false
  end
end
```

We look for the JWT in the `AUTHORIZATION` HTTP header. If it doesn't exist, we deny access. If it does, we try to decode it. If it decodes, we treat it as valid.

## Verify claims

All of the registered claims should be checked when we're consuming the JWT. This helps make sure that the JWT is what we expect. Currently we're just testing that it is a valid JWT and that it hasn't expired. Let's do a bit more. We can do this by providing options to the `JWT.decode` method. Instead of:

```ruby
# ...
decoded_token = JWT.decode token, Rails.configuration.x.oauth.jwt_secret, true
# ...
```

```ruby
# ...
decoded_token = JWT.decode token, Rails.configuration.x.oauth.jwt_secret, true, { verify_iss: true, iss: expected_iss, verify_aud: true, aud: expected_aud, algorithm: 'HS256' }
# ...
```

The key part is the options at the end of the JWT `decode` method. By default the `jwt` gem checks the `exp` and `nbf` claims, as well as verifying the signature. If we want our API to verify additional claims, we need to do it ourselves. XXX TODO need to add link to default claims class

We also added some tests, but you can check out the GitHub repository to see that.

## Take it further

If you are interested in further exploring this example, you can make the API more realistic. Create a messages model and have the messages pulled from the database. Change your JWT claims to include a preferred greeting, and prepend that to any messages provided. Add more resources and only allow users with certain roles to access them.

The code is [on GitHub](https://github.com/FusionAuth/fusionauth-example-rails-api).

## Next steps

You'll notice we never actually specified where the JWT is coming from. We just generated one using the `jwt` gem. In general, JWTs are provided by software which authenticates the user. Integrating in a user identity store such as FusionAuth is what we'll tackle next.

