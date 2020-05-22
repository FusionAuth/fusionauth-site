---
layout: blog-post
title: Building a secured API with Ruby On Rails and JWTs
description: We'll build a Rails API and control access to it with JSON Web Tokens (JWTs)
author: Dan Moore
image: blogs/authorization-code-grant-asp-net/securing-asp-net-app-oauth.png
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

What we're doing here is specifying that the JWT will have an `Authorization` header of the form `Bearer JWT...`, and testing a couple of cases. Let's add our authorization code now that our tests fail.

There are two places we could put the code that checks the JWT. We could place it in the Messages controller or we could put it in the Application controller and have authorization enforced for all requests. Since this is an API that is using JWT, and we're presuming all clients will be carrying a JWT, we should protect all our resources. If and when we need to distinguish between different JWT claims, we can refactor. For instance, we may want to have some APIs only accessible for users with the `ADMIN` role.

Here's the code that we should put in the `app/controllers/application_controller.rb` file:

```ruby

```

## Verify issuer


## Take it further

Make the API more complicated. Create a messages model and have the messages pulled from the database. Change your JWT claims to include a preferred greeting, and prepend that to any messages provided.

## Next steps

Let's get a JWT from an identity provider next.

root 
