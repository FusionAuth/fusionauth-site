#!/usr/bin/env ruby
require 'fileutils'
require 'json'
require 'net/http'

output_file = "/var/www/collateral/dockerhub-pull-count.csv"
url = 'https://hub.docker.com/v2/repositories/fusionauth/fusionauth-app/'
uri = URI(url)
response = Net::HTTP.get(uri)
image = JSON.parse(response)

File.open(output_file, "w", :encoding => "UTF-8") do |f|
  # Write the header
  f.puts("Pulls,Stars\n")
  f.puts("#{image['pull_count']},#{image['star_count']}\n")
end