require 'net/http'
require 'uri'
require 'openssl'
require 'optparse'
require 'json'

# option handling
options = {}

# default options
options[:outputfile] = "forgerock-user-export.json"
options[:forgerockbaseurl] = "https://cdk.example.com/"
options[:forgerockrealm] = "realms/root/realms/alpha/"

options[:forgerockusername] = "postmanAdminUser"
options[:forgerockuserpassword] = "Password1234!"
options[:forgerockclientid] = "postmanAdminClient"
options[:forgerockclientsecret] = "Password1234!"

OptionParser.new do |opts|
  opts.banner = "Usage: forgerock-export.rb [options]"

  opts.on("-o", "--output-file OUTPUT_FILE", "The name and location of the output file to write.") do |outputfile|
    options[:outputfile] = outputfile
  end

  opts.on("-b", "--base-url BASE_URL", "The base url for the Forgerock instance.") do |baseurl|
    options[:forgerockbaseurl] = baseurl
  end

  opts.on("-r", "--realm REALM", "The Forgerock realm the client belongs to.") do |realm|
    options[:forgerockrealm] = realm
  end

  opts.on("-u", "--user-name USER_NAME", "The user name of the api user.") do |username|
    options[:forgerockusername] = username
  end

  opts.on("-p", "--user-password USER_PASSWORD", "The password for the api user.") do |password|
    options[:forgerockuserpassword] = password
  end

  opts.on("-c", "--client-id CLIENT_ID", "The client id of the application to use for the authentication.") do |clientid|
    options[:forgerockclientid] = clientid
  end

  opts.on("-s", "--client-secret", "The client secret for the application to use for authentication.") do |clientsecret|
    options[:forgerockclientsecret] = clientsecret
  end

  opts.on("-h", "--help", "Prints this help.") do
    puts opts
    exit
  end
end.parse!

#get access_token
uri = URI.parse(options[:forgerockbaseurl] + "am/oauth2/" + options[:forgerockrealm] + "/access_token")
request = Net::HTTP::Post.new(uri)
request.content_type = "application/x-www-form-urlencoded"

request.set_form_data({
  'grant_type' => 'password',
  'username' => options[:forgerockusername],
  'password' => options[:forgerockuserpassword],
  'scope' => 'fr:idm:*',
  'client_id' => options[:forgerockclientid],
  'client_secret' => options[:forgerockclientsecret]
})


req_options = {
  use_ssl: uri.scheme == "https",
  verify_mode: OpenSSL::SSL::VERIFY_NONE,
}

response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(request)
end

response_body = JSON.parse(response.body)
access_token = response_body['access_token']

#get user info
#update fields to return desired fields
uri = URI(options[:forgerockbaseurl] + "openidm/managed/user")
params = {
  :_fields => 'mail,userName,sn,givenName,telephoneNumber,favoriteColor,password',
  :_prettyPrint => 'true',
  :_queryFilter => 'true',
}
uri.query = URI.encode_www_form(params)

request = Net::HTTP::Get.new(uri)
request['Authorization'] = 'Bearer ' + access_token

req_options = {
  use_ssl: uri.scheme == 'https',
  verify_mode: OpenSSL::SSL::VERIFY_NONE
}
response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(request)
end

response_body = JSON.parse(response.body)

File.write(options[:outputfile] , JSON.pretty_generate(response_body))
