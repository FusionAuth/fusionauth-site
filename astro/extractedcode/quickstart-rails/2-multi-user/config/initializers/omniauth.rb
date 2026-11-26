FUSIONAUTH_URL = 'http://localhost:9011'

# the local FusionAuth instance uses http
SWD.url_builder = URI::HTTP

# only accept login requests for the app's own host
OmniAuth.config.allowed_hosts = ['localhost']

# tell OmniAuth how to talk to FusionAuth
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect,
    name: :fusionauth,
    issuer: FUSIONAUTH_URL,
    discovery: true,
    scope: [:openid, :profile, :email],
    pkce: true,
    callback_path: '/oauth-callback',
    client_options: {
      identifier: ENV['FUSIONAUTH_CLIENT_ID'],
      secret: ENV['FUSIONAUTH_CLIENT_SECRET'],
      redirect_uri: ENV['FUSIONAUTH_CALLBACK_URL'],
    }
end
