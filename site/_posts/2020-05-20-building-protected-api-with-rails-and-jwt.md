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

In this tutorial, we're going to build a simple API in Ruby on Rails 6, and then secure the API using using a JSON Web Token.

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

## Take it further

Make the API more complicated. Create a messages model and have the messages pulled from the database. Change your JWT claims to include a preferred greeting, and prepend that to any messages provided.

## Next steps


