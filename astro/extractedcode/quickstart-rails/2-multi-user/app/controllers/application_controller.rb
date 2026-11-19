class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  # require authentication to access
  before_action :require_login

  private

  def require_login
    redirect_to '/login' unless session[:user]
  end
end
