#!/usr/bin/env ruby

require_relative 'config/environment'
require 'json'
require 'securerandom'

puts "Starting user export for Devise users..."
puts "Found #{User.count} users to export"

users_data = User.all.map do |user|
  puts "Exporting user: #{user.email}"

  # Parse bcrypt hash according to FusionAuth requirements:
  # Example: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
  # Should be split to:
  # factor: 10
  # salt: N9qo8uLOickgx2ZMRZoMye (first 22 chars after factor)
  # password: IjZAgcfl7p92ldGxad68LJZdL17lhWy (remaining chars)

  bcrypt_factor = 10  # default
  bcrypt_salt = ""
  bcrypt_password = ""

  if user.encrypted_password&.match(/^\$2[aby]\$(\d+)\$(.+)$/)
    bcrypt_factor = $1.to_i
    salt_and_hash = $2

    bcrypt_salt = salt_and_hash[0, 22]
    bcrypt_password = salt_and_hash[22..-1]
  end

  user_data = {
    email: user.email,
    username: user.email,
    password: bcrypt_password,
    encryptionScheme: "bcrypt",
    factor: bcrypt_factor,
    salt: bcrypt_salt,
    passwordChangeRequired: false,
    verified: user.respond_to?(:confirmed?) ? user.confirmed? : true,
    active: true,
    registrations: [
      {
        id: SecureRandom.uuid,
        applicationId: "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e",
        verified: user.respond_to?(:confirmed?) ? user.confirmed? : true,
        roles: ["user"]
      }
    ],
    data: {
      source_system: "devise",
      original_user_id: user.id,
      locked_at: user.respond_to?(:locked_at) ? user.locked_at : nil,
      confirmation_token: user.respond_to?(:confirmation_token) ? user.confirmation_token : nil,
      last_sign_in_ip: user.respond_to?(:last_sign_in_ip) ? user.last_sign_in_ip : nil,
      current_sign_in_ip: user.respond_to?(:current_sign_in_ip) ? user.current_sign_in_ip : nil
    }
  }

  user_data
end

# Write to file with proper FusionAuth format
export_data = { users: users_data }
filename = "users_export.json"
File.write(filename, JSON.pretty_generate(export_data))

puts ""
puts "Export completed successfully!"
puts "File saved as: #{filename}"
puts "Total users exported: #{users_data.count}"
