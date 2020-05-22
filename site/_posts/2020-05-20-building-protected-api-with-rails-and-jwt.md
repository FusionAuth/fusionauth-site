---
layout: blog-post
title: Securing a Ruby on Rails API with JWTs
description: We'll build a Rails API and control access to it with JSON Web Tokens (JWTs)
author: Dan Moore
image: blogs/authorization-code-grant-asp-net/securing-asp-net-app-oauth.png
tags: client-ruby
category: blog
excerpt_separator: "<!--more-->"
---

Ruby on Rails is a modern web framework, but also is a great way to build an API. The ability to quickly jam out code representing your business logic, the ease of creating and modifying data models, and the built-in testing support all combine to make building a JSON API in Rails a no brainer. Add in a sleek admin interface built using something like [RailsAdmin](https://github.com/sferik/rails_admin) and using Rails you can build and manage APIs easily. 

But you don't typically want just anyone to access your API. You want to ensure the right people and applications are doing so. In this tutorial, we're going to build an API in Ruby on Rails 6, and secure it using using JSON Web Tokens (JWTs).

<!--more-->

As always, the code is available under an Apache2 license [on GitHub](https://github.com/FusionAuth/fusionauth-example-rails-api), if you'd rather jump ahead.

## Prerequisites 

This post assumes you have Ruby and Rails 6 installed. If you don't, we suggest you follow the steps in the [Getting Started with Rails](https://guides.rubyonrails.org/getting_started.html) guide. Other than that we presume nothing about your knowledge of Ruby or Rails.

## Build the API

To build the API, we're going to create a new Rails application. Using the `--api` switch disables a bunch of functionality we won't need (like views).

```shell
rails new hello_api --api
```

Change to the created directory. We're now going to add our controller to the routes file. Edit the `config/routes.rb` file and change the contents to:

```ruby
Rails.application.routes.draw do
  resources :messages, only: [:index]
end
```

The `Messages` controller won't be too complicated. It returns a hardcoded list of messages when a `GET` request is made to the `/messages` path. In a real world application, of course, you would store messages in the database and pull them dynamically using ActiveRecord. But for this tutorial, a hardcoded list suffices.

Create the controller at `app/controllers/messages_controller.rb`. Here is what the class looks like:

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

You should now be able to visit `http://localhost:4000/messages` and see some messages:

```json
{"messages":["Hello"]}
```

But let's add a test so future changes don't cause unexpected behavior. Create the controller test at `test/controllers/messages_controller_test.rb`. Here are the contents of that class:

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

Excellent! We have a working API which returns well formed JSON! Rails even takes care of setting the `Content-Type` header to `application/json; charset=utf-8`. Now let's secure the API.

## Secure the API

Now, let's secure our API. As a reminder, we're going to use a JWT to secure this API. While you can secure Rails APIs using [a variety of methods](https://edgeguides.rubyonrails.org/action_controller_overview.html#http-authentications), using a JWT has advantages. You can integrate with a number of identity providers that offer OAuth or SAML support, which allows you to leverage an existing robust identity management system to control API access. You can also embed additional metadata into a JWT, including attributes like roles.

The first step to changing this API is to write tests. Let's change them to sometimes provide a JWT and expect `:forbidden` HTTP statuses when the JWT doesn't meet our expectations.

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

What we're doing here is writing a test that specifies the JWT will be in the `Authorization` header of any requests. Let's look more closely at the JWT. 

[JWTs have claims](https://tools.ietf.org/html/rfc7519#section-4) basically information embedded in the JWT. The keys of the JSON payload we build in the `build_jwt` function, such as `iss` and `name`, are claims. Some of these are defined in the JWT RFC. These are 'registered' claims. Others are recorded with the IANA but are not part of the standard; these are 'public' claims. And yet others are added to the payload by the JWT creator; these are 'private' claims. 


```ruby
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

Above, we create registered claims that our API may examine. `exp` indicates when the JWT will expire. `aud` is an identifier of who or what this JWT is intended for (the "audience"). `sub` is the person or piece of software this JWT applies to--to quote the RFC: "The claims in a JWT are normally statements about the subject." `iss` is an identifier for the issuer of the JWT. 

We also add the `name` public claim. `roles` are a private claim with a meaning undefined outside of our application. Note that because the content of JWTs is not typically encrypted, claims should contain no secrets or private data.

The last thing we do is encode our JWT. This signs it, adds needed metadata and creates the URL encoded version. Here's what one of the JWTs generated by `build_jwt` looks like:

```
eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJmdXNpb25hdXRoLmlvIiwiZXhwIjoxNTkwMTgxNjE5LCJhdWQiOiIyMzhkNDc5My03MGRlLTQxODMtOTcwNy00OGVkOGVjZDE5ZDkiLCJzdWIiOiIxOTAxNmI3My0zZmZhLTRiMjYtODBkOC1hYTkyODc3Mzg2NzciLCJuYW1lIjoiRGFuIE1vb3JlIiwicm9sZXMiOlsiVVNFUiJdfQ.P7KXBV8fNElGGr1McKIMQbU7-mZPMxv8tw5AbufZgr0
```

We use the HMAC signature algorithm because in this tutorial we control both the issuer of the JWT and the consumer--our API. We can therefore share a secret reliably between them. If we didn't have a good way to share secrets, using an asymmetric key would be a wiser choice.

For this tutorial, we put the HMAC secret in the environment configuration files. For production usage, use your normal secrets management solution. You should make the HMAC secret a long string, but don't use the secret key base.

Let's add our authorization code now that our tests fail because they are expecting certain unauthorized requests to return `:forbidden`.

There are two places we could put the code that checks the JWT. We could add it to the `Messages` controller. Or we could add it to `Application` controller. This latter choice would enforce authorization for all requests. Since we are building an API that should never be accessed without authorization, we should protect all our resources. If and when we need to distinguish between different claims (for instance, we may want to have some APIs only accessible for users with the `ADMIN` role), we can refactor and move the JWT examination code to different controllers.

Here's the authorization code for the `app/controllers/application_controller.rb` file:

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
      Rails.logger.warn "Error decoding the JWT: "+ e.to_s
    end
    false
  end
end
```

We look for the JWT in the `AUTHORIZATION` HTTP header. If it doesn't exist, we deny access. If it does, we try to decode it. If it decodes without raising an exception, it is a valid JWT.

## Verify claims

But really, what does valid mean? That's something you can define on an application by application basis. The `jwt` gem provides a baseline of default validation: [it checks the `exp` and `nbf` claims](https://github.com/jwt/ruby-jwt/blob/master/lib/jwt/default_options.rb), as well as verifying the signature. 

But for this application, we need to be extra sure. After all, if our messages fell into the wrong hands, who knows what could happen?

So let's verify more claims are as they should be when we are decoding the JWT. We can do this by providing options to the `JWT.decode` method. Instead of:

```ruby
# ...
decoded_token = JWT.decode token, Rails.configuration.x.oauth.jwt_secret, true
# ...
```

```ruby
# ...
expected_iss = 'fusionauth.io'
expected_aud = '238d4793-70de-4183-9707-48ed8ecd19d9'
# ...
decoded_token = JWT.decode token, Rails.configuration.x.oauth.jwt_secret, true, { verify_iss: true, iss: expected_iss, verify_aud: true, aud: expected_aud, algorithm: 'HS256' }
# ...
```

The key part is the options at the end of the JWT `decode` method, which specify which claims we want to verify. If there were private claims that we wanted to check, we'd need to do that as well. Again, while we are guaranteed by the HMAC signature that the contents of the JWT are exactly what they were when it was created, we aren't guaranteed that the contents will remain unexamined. So add private claims, but in general JWTs should contain a bare minimum, just enough data to allow their consumers to know how to retrieve the additional data needed.

We also added some tests, but you can check out the GitHub repository to see them.

## Take it further

If you are interested in further extending this example, make the API more realistic. Create a `Messages` model and have them stored in the database. Change your claims to include a preferred greeting, and prepend that to any messages provided. Add more API endpoints and only allow users with certain roles to access them.

The code is [on GitHub](https://github.com/FusionAuth/fusionauth-example-rails-api) for your perusal.

## Next steps

You'll notice we never specified where the JWT was coming from. We just generated one using the `jwt` gem. In general, JWTs are provided after user authentication. Integrating in a user identity store such as FusionAuth is what we'll tackle next.

