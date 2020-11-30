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

Many Rails applications traditionally handle authentication, authorization, and user-management within the framework itself. There are many fine strategies for implementing auth whether it be homegrown or using a handy gem like [devise](https://github.com/heartcombo/devise). 
With FusionAuth however, we are able to [separate our auth concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) from our application. Right away, we can scale our user base independent of our main application. As we build new applications or integrate with other platforms, 
we now have one centralized place to tackle our authentication and authorization needs. Finally, with FusionAuth we get the benefit of a complete identity solution capable of satisfying most auth requirements such as SSO, MFA, social-login.

At the end of this tutorial, you will have a working Ruby on Rails application that completes the OAuth2 flow leveraging FusionAuth to authenticate its users. 

It is worth mentioning that we walked through securing a Ruby on Rails API with JWTs [in a previous post](https://fusionauth.io/blog/2020/06/11/building-protected-api-with-rails-and-jwt/) where we dove into 
the composition of a JWT with regards to user authorization. In the following post, we will be both a JWT provider and consumer.
Note that while we will be decoding the access token we receive from FusionAuth, we will not be getting into the specifics of claims as it relates to user authorization in this example.

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
* **Authorized redirect URL's**: Found under the `OAuth` tab. This URL tells FusionAuth where to redirect to after a user successfully authenticates. 
* **Logout URL**: Also found under the `OAuth` tab. This URL tells FusionAuth where to redirect to when a user logs out.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/add-application.png" alt="Creating a new Application in FusionAuth." class="img-fluid" figure=false %}

### Create a User
For this example, we will manually create a user. Click on `Users` in the left-nav bar and then click the green plus sign in the upper-right hand corner to add a new user.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/create-user.png" alt="Creating a new User in FusionAuth." class="img-fluid" figure=false %}

Configure the following attributes and then save the new user:
* **Email**
* **Password and Confirm**: Toggle `Send email to setup password` to off and manually enter a password for the user.

### Register the User
Looking good! Now we have our new application and a user. The last thing we want to do is `register` the user with our `application`.
Again, navigate to the `Users` page, find our newly created user, and click the `Manage` button.

Click on the `Add Registration` button, select the Rails application we created, and save.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/user-registered.png" alt="The Manage User page in FusionAuth." class="img-fluid" figure=false %}

## Build the Rails Application
Lets get started building a very basic Rails application to demonstrate authentication with FusionAuth.

Create a new Rails application.
```bash
rails new rails-fusionauth-app
```

Our `Gemfile` will use a few additional dependencies so go ahead and add them before we get started.
```ruby
gem 'jwt'
gem 'oauth'
```

Install dependencies
```bash
bundle install
```

### Configuration
Before we go any further, there are some critical `Application` attributes we will need from our FusionAuth configuration so that our Rails app knows how to successfully communicate with it.
Specifically:
* `client_id`
* `client_secret`
* `Authorized redirect URL's`
* `Logout URL`

You can recall, these can be found under the `OAuth` tab when modifying an application in FusionAuth.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/edit-application.png" alt="The OAuth tab in the Edit Application page of FusionAuth." class="img-fluid" figure=false %}

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

It should look something like this when rendered.
{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/home.png" alt="The example Home screen for the Rails application." class="img-fluid" figure=false %}

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


I decided that I wanted to utilize my environment to set my `client_id`, `client_secret` and `idp_url` (identity provider url) using `development.rb`.
```ruby
  # OAuth configuration
  config.x.oauth.client_id = "my-client-id"
  config.x.oauth.client_secret = "my-super-secret-oauth-secret"
  config.x.oauth.idp_url = "http://localhost:9011/"
```

Additionally, I added the following to `ApplicationController` such that my child classes have access.
```ruby
  protected

  def idp_url
    Rails.configuration.x.oauth.idp_url
  end

  def client_id
    Rails.configuration.x.oauth.client_id
  end

  def client_secret
    Rails.configuration.x.oauth.client_secret
  end
```

Now it's time to actually implement the OAuth callback. 

```ruby
# app/controllers/oauth_controller.rb

class OauthController < ApplicationController
  def initialize
    @redirect_uri = "http://localhost:3000/oauth2-callback"
  end

  # The OAuth callback
  def oauth_callback
    code = params[:code]

    # Create an OAuth2 client to communicate with the auth server
    client = OAuth2::Client.new(client_id,
                                client_secret,
                                site: idp_url,
                                token_url: '/oauth2/token')

    # Make a call to exchange the authorization_code for an access_token
    token = client.auth_code.get_token(params[:code],
                                       'redirect_uri': @redirect_uri)

    # Set the token on the user session
    session[:user_jwt] = { value: token.to_hash[:access_token], httponly: true }

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

Kick the tires and light the fires
```
rails s
```

Navigating to `http://localhost:3000`

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/home.png" alt="The example Home screen for the Rails application." class="img-fluid" figure=false %}

Login to the Application

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/fa-login.png" alt="The FusionAuth login page." class="img-fluid" figure=false %}

We made it! We are logged in and our application knows who we are.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/logged-in.png" alt="The example Home screen when logged-in to the Rails application." class="img-fluid" figure=false %}

Logout.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/logging-out.png" alt="The FusionAuth logging out page." class="img-fluid" figure=false %}

## Next Steps
Now that we have the OAuth flow working, our foundation is set to expand as needed. Here are a few ideas to tackle next:
* Add and assign user roles such that functionality in our Rails application can be shown or hidden accordingly.
* Customize the FusionAuth login page with a look and feel of our application including a logo.
* Add a "Login with Google" or "Login with Facebook" social login.

## What did we learn?
Using the Authorization Code grant in Rails lets you use any OAuth compatible identity provider to secure your application. The example code can be found on Github [here](https://github.com/FusionAuth/fusionauth-rails-app). 

Happy coding!
