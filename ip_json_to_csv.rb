#!/usr/bin/env ruby
require 'fileutils'
require 'json'

# Convert our IP To City JSON file into CSV so I can upload it into a Google Map

ip_hash_file = "/var/www/collateral/ip_to_geo.json"
output_file = "/var/www/collateral/ip_to_geo.csv"

# Load the IP hash
ip_hash = JSON.parse(File.read(ip_hash_file))

File.open(output_file, "w", :encoding => "UTF-8") do |f|
  # Write the header
  f.puts("IP,City\n")

  # Write the counts
  ip_hash.keys.each do |ip|
    city = ip_hash[ip]
    unless city == "?, ?"
      f.puts("#{ip},\"#{ip_hash[ip]}\"\n")
    end
  end
end