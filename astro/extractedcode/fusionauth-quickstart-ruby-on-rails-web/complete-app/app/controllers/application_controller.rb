class ApplicationController < ActionController::Base

   before_action :authenticate_user!
   before_action :redirect_non_localhost!

   def authenticate_user!
     redirect_to '/' unless session[:user]
   end

   def redirect_non_localhost!
    # Ensure we're on the same hostname/url registered as the callback URL in FA
    redirect_to('http://localhost:3000', allow_other_host: true) unless request.host == "localhost"
   end
end
