---
layout: blog-post
title: How to securely implement OAuth in Ruby on Rails 
description: A detailed overview of securely integrating an Ruby on Rails application with an OAuth provider using the OAuth Authorization Code Grant  
author: Brett Guy 
image: blogs/fusionauth-example-angular/oauth-angular-fusionauth.png
category: blog
tags: client-ruby
excerpt_separator: "<!--more-->"
---

In this tutorial, we'll walk through setting up a basic Ruby on Rails app to securely authenticate with an OAuth2 server using the authorization code grant.

<!--more-->

Many Rails applications traditionally handle authentication, authorization, and user-management within the framework itself. With FusionAuth, we are able to separate those concerns from our application.
At the same time, we get the benefit of a complete identity solution capable of handling registration, login, MFA, passwordless, SSO, social-logins, and much more.


At the end of this tutorial, you will have a working Ruby on Rails application that leverages FusionAuth to authenticate its users.

## Prerequisites
- Rails 6
- Docker (optional but preferred for installing FusionAuth)

## Setting up FusionAuth
In this tutorial we will use Docker for quick setup:
```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

(Check out the [Download FusionAuth page](https://fusionauth.io/download) for other installation options.)

Once your Docker container is up, it should be running at [localhost:9011](http://localhost:9011). Navigate there and finish the setup steps. 
When those are completed, login as the administrator that you just created. Now we are ready to rock!

First things first. A [FusionAuth Application](https://fusionauth.io/docs/v1/tech/core-concepts/applications/) is simply something a user can log into.
As such, we want to create a new application for our Rails app.

### Create an Application
Select `Applications` from the left nav bar. Then click the green plus sign in the upper-right hand corner to add a new application.
We will want to configure a few pieces of important information:
* **Name** (Required): A display name for our application. Enter `fusionauth-rails-app`.
* **Authorized redirect URL's**: Found under the `Oauth` tab. This URL tells FusionAuth where to redirect to after a user successfully authenticates. 
* **Logout URL**: Also found under the `Oauth` tab. This URL tells FusionAuth where to redirect to when a user logs out.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/edit-application.png" alt="Edit Application" class="img-fluid" figure=false %}

### Create a User
For this example, we will manually create a user. Click on `Users` in the left-nav bar and then click the green plus sign in the upper-right hand corner to add a new user.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/create-user.png" alt="Create User" class="img-fluid" figure=false %}

Configure the following attributes and then save the new user:
* **Email**
* **Password and Confirm**: Toggle `Send email to setup password` to off and manually enter a password for the user.

### Register the User
Looking good! Now we have our new application and a user. The last thing we want to do is `register` the user with our `application`.
Again, navigate to the `Users` page, find our newly created user, and click the `Manage` button.

Click on the `Add Registration` button, select the Rails application we created, and save.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/user-registered.png" alt="User Registered" class="img-fluid" figure=false %}

## Build the Rails Application
Lets get started building a very basic Rails application to demonstrate authentication with FusionAuth.

We are going to start by creating a new Rails application.
```bash
rails new rails-fusionauth-app
```



### Configuration
Before we go any further, there are some critical `Application` attributes we will need from our FusionAuth configuration so that our Rails app knows how to successfully communicate with it.
Specifically:
* `client_id`
* `client_secret`
* `Authorized redirect URL's`
* `Logout URL`

You can recall, these can be found under the `OAuth` tab when modifying an application in FusionAuth.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/edit-application.png" alt="Edit Application" class="img-fluid" figure=false %}

### Routes
For this app, we are going to setup three routes:
* **welcome page**: Our root page or `view`. 
* **oauth2-callback** endpoint: Receiver of the redirect after logging into FusionAuth.
* **logout** endpoint: Receiver of the redirect after logging out of FusionAuth.

```ruby
Rails.application.routes.draw do
  root to: 'welcome#index'
  get '/oauth2-callback', to: 'oauth#oauth_callback'
  get '/logout', to: 'oauth#destroy'
end
```

### Authenticating and Logging Out 
We will start off with a very basic welcome view that contains a link for a user to login to the application.

```ruby
# app/views/welcome/index.html.erb

<p>Welcome user! Please <%= link_to 'Log In', @login_url %></p>
```

To begin the login process, we will want to construct a URL to make an [Authorization Code Grant Request](https://fusionauth.io/docs/v1/tech/oauth/endpoints/#authorization-code-grant-request).
This URL is composed of the `client_id`, `client_secret`, and `redirect_uri` values from our application configuration. 

We will also construct the URL used to make a [Logout](https://fusionauth.io/docs/v1/tech/oauth/endpoints/#logout) request.

```ruby
# app/controllers/welcome_controller.rb

class WelcomeController < ApplicationController
  def initialize
    @login_url = 'http://localhost:9011/oauth2/authorize?client_id=799b3fe1-4a52-494f-a13a-b97b1377e073&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth2-callback'
    @logout_url = 'http://localhost:9011/oauth2/logout?client_id=799b3fe1-4a52-494f-a13a-b97b1377e073'
  end
end
```

Now it's time to actually implement the OAuth callback. 

(Note: I utilize `development.rb` for my config properties)
```ruby
# app/controllers/oauth_controller.rb

class OauthController < ApplicationController
  def initialize
    @client_id = Rails.configuration.x.oauth.client_id
    @client_secret = Rails.configuration.x.oauth.client_secret
    @identity_provider_url = Rails.configuration.x.oauth.idp_url
    @redirect_uri = "http://localhost:3000/oauth2-callback"
  end

  def oauth_callback
    code = params[:code]
    query = { code: code,
              grant_type: "authorization_code",
              client_id: @client_id,
              client_secret: @client_secret,
              redirect_uri: @redirect_uri }.to_query

    response = RestClient.post("#{@identity_provider_url}oauth2/token?" << query, {})
    token = JSON.parse(response.body)["access_token"]
    session[:user_jwt] = {value: token, httponly: true}
    redirect_to root_path
  end

  def destroy
    reset_session
    redirect_to root_path
  end
end
```
In summary, `oauth_callback` does a few things:
1. It handles the redirect following FusionAuth authentication receiving an `authorization code`.
2. It makes an additional call to exchange the authorization code for an access token.
3. Saves the `access token` (JWT) on the session to indicate that the user has successfully authenticated.

When a user clicks on the `Login` link, they will be presented with a login form from FusionAuth.
Upon successful authentication, the FusionAuth redirects back to the Rails app along with an `authorization_code`. This is where we pick up in the `oauth_callback` method.

The next step will be to exchange our authorization code for an access token.
While we are authenticated, it is not sufficient access to access a user's resources. For that, we will make an additional [code exchange](https://fusionauth.io/docs/v1/tech/oauth/endpoints/#complete-the-authorization-code-grant-request) request. 

We receive the access token encoded as a `JWT`. Finally, we save the JWT on the user session and redirect to the Welcome page. 

The `logout` callback is much simpler. Similar to `oauth_callback` in the way that it receives the authorize redirect, our `destroy` method receives the logout redirect.
Receiving the redirect tells us that the user has been logged out of FusionAuth and we are safe to clear the user's session in Rails.

### Polishing up our Rails session
Now that we have the functionality to authenticate users as well as log them out of FusionAuth, we will want to complete the same cycle on our Rails app.

There are numerous ways to handle user sessions in Rails, but for this example, I decided to create helper methods accessible to all sub-classes of ApplicationController.

`current_user` looks for a user jwt on the session. If it exists, it decodes the JWT and retrieves user's email address.
If it does not exist, this means the user has logged out or their session has expired.

```ruby
# app/controllers/application_controller.rb

class ApplicationController < ActionController::Base
  helper_method :current_user
  helper_method :logged_in?

  def current_user
    if session[:user_jwt]
      token = session[:user_jwt]
      decoded = TokenService.decode(token["value"])
      decoded.first["email"]
    end

  end

  def logged_in?
    current_user.present?
  end

end
```

```ruby
# app/services/token_service.rb

class TokenService
  def self.decode(token)
    JWT.decode(
        token,
        nil,
        false,
        {algorithm: 'HS256'})
  end
end
```

## Putting it all together
Before running the Rails server, make sure to add the following dependencies to your Gemfile.
```
gem 'jwt'
gem 'rest-client'
```
Install dependencies
```
bundle install
```

Kick the tires and light the fires
```
rails s
```

Navigating to `http://localhost:3000`

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/home.png" alt="Home" class="img-fluid" figure=false %}

Login to the Application

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/fa-login.png" alt="FusionAuth Login" class="img-fluid" figure=false %}

We made it!

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/logged-in.png" alt="Logged In" class="img-fluid" figure=false %}

All done. Time to logout.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/logging-out.png" alt="Logging Out" class="img-fluid" figure=false %}

## Next Steps
Self service registration? FusionAuth can do that. MFA? Yes indeed! By integrating with FusionAuth, we can continue to enhance identity management for our users. 

## What did we learn?
Using the Authorization Code grant in Rails lets you use any OAuth compatible identity provider to secure your application. The example code can be found on Github [here](https://github.com/FusionAuth/fusionauth-rails-app). 

Happy coding!
