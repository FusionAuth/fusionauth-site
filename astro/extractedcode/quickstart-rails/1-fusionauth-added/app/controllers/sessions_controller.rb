class SessionsController < ApplicationController
  skip_before_action :require_login

  def new
  end

  def create
    session[:user] = { 'id' => request.env['omniauth.auth'].uid }
    redirect_to root_path
  end

  def destroy
    # Clear the local Rails session
    reset_session

    # Redirect to FusionAuth to clear the SSO session
    redirect_to "#{FUSIONAUTH_URL}/oauth2/logout?#{{ client_id: ENV['FUSIONAUTH_CLIENT_ID'] }.to_query}",
                allow_other_host: true
  end
end
