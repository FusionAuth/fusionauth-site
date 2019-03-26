#!/usr/bin/env ruby
require 'fileutils'
require 'json'
require 'net/http'
require 'csv'

data_file = "/var/www/collateral/dockerhub-pull-count-raw.csv"
output_file = "/var/www/collateral/dockerhub-pull-count.csv"
url = 'https://hub.docker.com/v2/repositories/fusionauth/fusionauth-app/'
response = JSON.parse(Net::HTTP.get(URI(url)))

total_count = response['pull_count']
star_count = response['star_count']

# Write out a new line to the raw file
File.open(data_file, "a", :encoding => "UTF-8") do |f|
  f.puts "#{Time.now.strftime("%Y%m%d %H%M%S")},#{total_count},#{star_count}"
end

totals = {}
stars = {}

CSV.foreach(data_file) do |row|
  date = row[0][0, 8]
  totals[date] = row[1]
  stars[date] = row[2]
end

File.open(output_file, "w", :encoding => "UTF-8") do |f|

  # Write the header
  f.puts("Date,Total,Today,Stars\n")

  yesterday = 0
  today = 0

  # Write each day sorted
  totals.sort.to_h.each do |date, total|
    today = total.to_i - yesterday
    yesterday = total.to_i
    if today == total.to_i
      today = 0
    end
    f.puts("#{date},#{total},#{today},#{stars[date]}")
  end

  f.puts("Color,#fb8314,#3BAE5A,#8314fb")
  f.puts("Type,line,area,line")
  f.puts("Total,#{total_count},#{today},#{star_count}")

end