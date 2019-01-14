#!/usr/bin/env ruby
require 'fileutils'
require 'json'
require 'net/http'

output_file = "/var/www/collateral/dockerhub-pull-count.csv"
url = 'https://hub.docker.com/v2/repositories/fusionauth/fusionauth-app/'
response = JSON.parse(Net::HTTP.get(URI(url)))

lines = []
today = Time.now.strftime("%Y%m%d")
total_count = response['pull_count']
star_count = response['star_count']

# Read each line from the file that begins with a date column
File.readlines("#{output_file}").each do |l|
  if /20[1-9]{2}/.match(l) != nil
    lines << l.strip
  end
end

# Add today to the list if it is not there
last_line = lines.last # Get the last dated line
unless last_line != nil and last_line.start_with?(today)
  lines << "#{today},0,#{total_count},#{star_count}"
end

# Calculate the difference from yesterday for pulls and stars
yesterday_count = 0
yesterday_star = 0
if lines.size > 2
  yesterday_line = lines[-2]
  yesterday_count = yesterday_line.split(',')[2]
  yesterday_star = yesterday_line.split(',')[4]
end

today_count = total_count.to_i - yesterday_count.to_i
today_star = star_count.to_i - yesterday_star.to_i

# Update the last entry
lines[-1] = "#{today},#{today_count},#{total_count},#{today_star},#{star_count}"

File.open(output_file, "w", :encoding => "UTF-8") do |f|

  # Write the header
  f.puts("Date,Today,Total Pulls,Today Stars,Total Stars\n")

  # Write each day
  lines.each do |day|
    f.puts(day)
  end

  # Green 90, 170, 92, #5aaa5c
  # Orange 194, 112, 53, #c27035

  # Add some color to the chart
  f.puts("Color,#5AAA5C,#FF7E0E,#820000,#FFFF00")
  f.puts("Cumulative,0,0,0,0,0")
  f.puts("Type,stackedarea,line,stackedarea,line")
  f.puts("Total,#{today_count},#{total_count},#{today_star},#{star_count}")

end