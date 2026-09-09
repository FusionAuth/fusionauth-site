require 'faker'
require 'csv'
require 'fusionauth/fusionauth_client'

csv = CSV.open("./users.csv","w")
salts_and_hashes = CSV.read("salts_hashes.csv")

rows = []
100.times do |i|
  row = []
  row << Faker::Name.unique.first_name
  row << Faker::Name.unique.last_name
  row << Faker::Internet.unique.email
  row << 24000
  row << 'salted-pbkdf2-hmac-sha256'
  row << salts_and_hashes[i][0]
  row << salts_and_hashes[i][1]

  #rows << row
  csv << row
end

#client = FusionAuth::FusionAuthClient.new(
    #'APIKEY', 
    #'http://localhost:9011'
#)
#
#users = {}
#users['users'] = []
#rows.each do |row|
  #user = {}
  #user["active"] = true
  #user["firstName"] = row[0]
  #user["lastName"] = row[1]
  #user["email"] = row[2]
  #user["factor"] = row[3]
  #user["encryptionScheme"] = row[4]
  #user["salt"] = row[5]
  #user["password"] = row[6]
#
  #users['users'] << user
#end

#client.import_users(users)
