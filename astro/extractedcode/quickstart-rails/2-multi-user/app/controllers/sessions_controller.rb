class SessionsController < ApplicationController
  skip_before_action :require_login

  def new
  end

  def create
    # OmniAuth validates the ID token and puts the user's details in info
    auth = request.env['omniauth.auth']
    full_name = "#{auth.info.first_name} #{auth.info.last_name}".strip

    session[:user] = {
      'id' => auth.uid,
      'email' => auth.info.email,
      'name' => full_name.presence || auth.info.email || 'User',
    }
    redirect_to root_path
  end

  def destroy
    # Clear the local Rails session
    reset_session

    # Redirect to FusionAuth to clear the SSO session
    redirect_to "#{FUSIONAUTH_URL}/oauth2/logout?#{{
      client_id: ENV['FUSIONAUTH_CLIENT_ID'],
      post_logout_redirect_uri: 'http://localhost:3000/login',
    }.to_query}", allow_other_host: true
  end
end
