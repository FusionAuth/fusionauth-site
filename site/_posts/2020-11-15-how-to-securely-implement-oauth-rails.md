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

Many Rails applications traditionally handle authentication, authorization, and user-management within the framework itself. There are many strategies for implementing, including using a handy gem like [devise](https://github.com/heartcombo/devise). 
With FusionAuth however, we are able to [separate our auth concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) from our application. Right away, we can scale our user base independently of our main application. As we build new applications or integrate with other platforms, 
we now have one centralized place to handle our authentication and authorization needs.

Why does that matter? Imagine that my company already has an existing identity provider and that I need to integrate my new application with it. Perhaps I have many applications that I need to integrate with my identity provider.  
Maybe I am a startup and want to offload all user management including the functionality and security concerns that come along with it to FusionAuth. By having all of our user management
concerns handled in one place, we can focus on the requirements of our application independently. 

Finally, with FusionAuth we get the benefit of a complete identity solution capable of satisfying most auth requirements such as SSO, MFA, and social-login.

At the end of this tutorial, you will have a working Ruby on Rails application that completes the OAuth2 flow leveraging FusionAuth to authenticate its users. 

The code is available under an Apache2 license [on Github](https://github.com/FusionAuth/fusionauth-example-rails-oauth).

It is worth mentioning that we walked through securing a Ruby on Rails API with JWTs [in a previous post](https://fusionauth.io/blog/2020/06/11/building-protected-api-with-rails-and-jwt/) where we dove into 
the composition of a JWT with regards to user authorization. In the following post, we will use the same process of securing our web application by validating a JWT that will be provided by the authentication process.

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

If you prefer to install FusionAuth locally, see the [5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide/) to get up and running.  

Once you have FusionAuth installed, it should be running at [localhost:9011](http://localhost:9011). Navigate there and finish the setup steps. 
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

### Issuer and Signing Key

There are two more attributes we want to configure in FusionAuth. The first attribute is the named issuer value used to sign tokens. We will use this value when 
verifying the access token during login. To do this, navigate to `Tenants` on the left navigation bar and then click the `Edit` button that corresponds
to `Default` tenant. Set the `issuer` field under the `General` tab.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/issuer.png" alt="The Edit Tenant page where the issuer field is set." class="img-fluid" figure=false %}

The second attribute is the HMAC signing key that is used to encode the token. Navigate to `Settings > Key Master` from the left navigation bar. 
Then click on the `View` button that corresponds to the `Default Signing Key`. From here, `click to reveal` the key and copy it to a safe location. 
We will need this value to successfully decode the token in our application.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/secret.png" alt="The Edit Tenant page where the issuer field is set." class="img-fluid" figure=false %}

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

I decided that I wanted to utilize my environment to set my `client_id`, `client_secret`, `idp_url` (identity provider url), and `redirect_uri` values using `development.rb`.
We will set an environment variable that contains our HMAC secret that will be used to decode the token recieved in the authentication process.
```ruby
  # OAuth configuration
  config.x.oauth.client_id = "my-client-id"
  config.x.oauth.client_secret = "my-super-secret-oauth-secret"
  config.x.oauth.idp_url = "http://localhost:9011/"
  config.x.oauth.redirect_uri = "http://localhost:3000/oauth2-callback"
  config.x.oauth.hmac = ENV['HMAC_SECRET']
```

Additionally, I added the following to `ApplicationController` such that our subclasses inherit the corresponding environment values.
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

  def redirect_uri
    Rails.config.x.oauth.redirect_uri
  end
```

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

### Authenticating with FusionAuth
We will start off with a very basic welcome view that contains a link for a user to login to the application.

```ruby
# app/views/welcome/index.html.erb

<p>Welcome user! Please <%= link_to 'Log In', @login_url %></p>
```

It should look something like this when rendered.
{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/home.png" alt="The example Home screen for the Rails application." class="img-fluid" figure=false %}

To begin the login process, we will want to construct a URL to make an [Authorization Code Grant Request](https://fusionauth.io/docs/v1/tech/oauth/endpoints/#authorization-code-grant-request).
This URL is composed of the `client_id`, `client_secret`, and `redirect_uri`. The `client_id` and `client_secret` parameters identify the application that we are logging into and are generated when we create the application in FusionAuth. The `redirect_uri` parameter
indicates where to redirect upon a successful request. The `redirect_uri` value must exist as an `Authorized redirect URL` on the application configuration in FusionAuth for the request to be successful. This is why we initially set this value when creating the application.

We will also construct the URL used to make a [Logout](https://fusionauth.io/docs/v1/tech/oauth/endpoints/#logout) request. Again, recall that we also configured this on the application in FusionAuth.

```ruby
# app/controllers/welcome_controller.rb

class WelcomeController < ApplicationController
  def index
    build_login_url
    build_logout_url
  end

  private

  def build_login_url
    query = {
        client_id: client_id,
        client_secret: client_secret,
        response_type: "code",
        redirect_uri: redirect_uri
    }.to_query

    @login_url = "#{idp_url}oauth2/authorize?#{query}"
  end

  def build_logout_url
    query = { client_id: client_id }.to_query
    @logout_url= "#{idp_url}oauth2/logout?#{query}"
  end
end
```

Next, we want to implement the controller to handle the OAuth callback. 
In summary, `oauth_callback` does a few things:
1. Handles the redirect following FusionAuth authentication receiving an `authorization code`.
2. Executes a request back to FusionAuth to exchange the authorization code for an access token.
3. Decodes and validates the claims on the received access token.
4. Saves the `access token` (JWT) on the session to indicate that the user has successfully authenticated.

When a user clicks on the `Login` link, they will be presented with a login form from FusionAuth.
Upon successful authentication, FusionAuth redirects back to the Rails app along with an `authorization_code` as described above.
This is where we pick up in the `oauth_callback` method.

The next step in the OAuth flow will be to exchange our authorization code for an access token.
For that, we will make an additional [code exchange](https://fusionauth.io/docs/v1/tech/oauth/endpoints/#complete-the-authorization-code-grant-request) request. 
Using the [`oauth2`](https://github.com/oauth-xx/oauth2) gem, we construct a client and then make the request passing the authorization code and 
redirect URI.

```ruby
# Create an OAuth2 client to communicate with the auth server
client = OAuth2::Client.new(client_id,
                            client_secret,
                            site: idp_url,
                            token_url: '/oauth2/token')

# Make a call to exchange the authorization_code for an access_token
response = client.auth_code.get_token(params[:code],
                                      'redirect_uri': redirect_uri)

# Extract the access token from the response
token = response.to_hash[:access_token]
```

We receive the access token encoded as a `JWT`. 
We now want to decode the JWT and verify claims. For this example, we validate the `aud` and `iss` claims that 
reflect the application `client_id` and token issuer respectively. Recall that we configured the issuer value earlier in FusionAuth. 

```ruby
# Decode the token
begin
  decoded = TokenDecoder.new(token, client_id).decode
rescue
  head :forbidden
  return
end
```

The TokenDecoder class decodes the JWT, verifies the HMAC secret, and validates claims.

```ruby
class TokenDecoder

  def initialize(token, aud)
    @token = token
    @aud = aud
    @iss = 'fusionauth.io'
  end

  def decode
    begin
      JWT.decode(
          @token,
          Rails.configuration.x.oauth.hmac,
          true,
          {
              verify_iss: true,
              iss: @iss,
              verify_aud: true,
              aud: @aud,
              algorithm: 'HS256'})
    rescue JWT::VerificationError
      puts "verification error"
      raise
    rescue JWT::DecodeError
      puts "bad stuff happened"
      raise
    end
  end
end
```

Finally, we set the token on the user session and redirect back to our Welcome page concluding our `oauth_callback` method. 
The entire class now looks like the following.

```ruby
# app/controllers/oauth_controller.rb

class OauthController < ApplicationController
  # The OAuth callback
  def oauth_callback
    # Create an OAuth2 client to communicate with the auth server
    client = OAuth2::Client.new(client_id,
                                client_secret,
                                site: idp_url,
                                token_url: '/oauth2/token')

    # Make a call to exchange the authorization_code for an access_token
    response = client.auth_code.get_token(params[:code],
                                          'redirect_uri': redirect_uri)

    # Extract the access token from the response
    token = response.to_hash[:access_token]

    # Decode the token
    begin
      decoded = TokenDecoder.new(token, client_id).decode
    rescue
      head :forbidden
      return
    end

    # Set the token on the user session
    session[:user_jwt] = {value: decoded, httponly: true}

    redirect_to root_path
  end

  def destroy
    reset_session
    redirect_to root_path
  end
end
```

### Logging out

The `logout` callback is much simpler. Similar to `oauth_callback` in the way that it receives the authorize redirect, our `destroy` method receives the logout redirect.
Receiving the redirect tells us that the user has been logged out of FusionAuth and we are safe to clear the user's session in Rails.

### Polishing up our Rails session
Now that we have the functionality to authenticate users as well as log them out of FusionAuth, we will want to complete the same cycle on our Rails app.

There are numerous ways to handle user sessions in Rails, but for this example, I decided to create helper methods accessible to all sub-classes of ApplicationController.

`current_user` looks for a user JWT on the session. If it exists and the email has been verified, it retrieves the user's email address from the JWT.
If it does not exist, this means the user has logged out or their session has expired.

```ruby
# app/controllers/application_controller.rb

class ApplicationController < ActionController::Base
  helper_method :current_user
  helper_method :logged_in?

  def current_user
    if session[:user_jwt]
      token = session[:user_jwt]["value"].first

      if token && token["email_verified"]
        @email = token["email"]
      else
        head :forbidden
        return
      end
    end
  end

  def logged_in?
    current_user.present?
  end

end
```

## Putting it all together

It's time to make our Ruby on Rails OAuth flow a reality by walking through an example login. 
Before starting up the Rails server, be sure to set `HMAC_SECRET` with the `default signing key` value in your environment making it accessible to our development configuration. 

Kick the tires and light the fires! Fire up our Rails server.
```
rails s
```

Navigating to `http://localhost:3000`

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/home.png" alt="The example Home screen for the Rails application." class="img-fluid" figure=false %}

Login to the Application

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/fa-login.png" alt="The FusionAuth login page." class="img-fluid" figure=false %}

We made it! We are logged in and our application knows who we are.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/logged-in.png" alt="The example Home screen when logged-in to the Rails application." class="img-fluid" figure=false %}

Let us now assume that we are now done interacting with the application and are ready to log out by navigating to the corresponding URL.

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-rails/logging-out.png" alt="The FusionAuth logging out page." class="img-fluid" figure=false %}

## Next Steps
Now that we have the OAuth flow working, our foundation is set to expand as needed. Here are a few ideas to tackle next:
* Add and assign user roles such that functionality in our Rails application can be shown or hidden accordingly.
* Customize the FusionAuth login page with a look and feel of our application including a logo.
* Add a "Login with Google" or "Login with Facebook" social login.

## What did we learn?
Using the Authorization Code grant in Rails lets you use any OAuth compatible identity provider to secure your application. The example code can be found on Github [here](https://github.com/FusionAuth/fusionauth-example-rails-oauth). 

Happy coding!
