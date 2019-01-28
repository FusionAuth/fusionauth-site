#!/usr/bin/env ruby
require 'fileutils'
require 'json'
require 'net/http'

data_file = "/var/www/collateral/dockerhub-pull-count.json"
output_file = "/var/www/collateral/dockerhub-pull-count.csv"
url = 'https://hub.docker.com/v2/repositories/fusionauth/fusionauth-app/'
response = JSON.parse(Net::HTTP.get(URI(url)))
data_json = JSON.parse(File.read data_file)

today = Time.now.strftime("%Y%m%d")
yesterday = (Time.now - (3600 * 24)).strftime("%Y%m%d")
total_count = response['pull_count']
star_count = response['star_count']

# Update totals
data_json['total']['count'] = total_count
data_json['total']['stars'] = star_count

# Create an entry for yesterday if it doesn't exist
if data_json['daily'][yesterday] == nil
  data_json['daily'][yesterday] = {
      count: 0,
      stars: 0,
      total: {
          count: total_count,
          stars: star_count
      }
  }
end

# Create an entry for today if it doesn't exist
if data_json['daily'][today] == nil
  data_json['daily'][today] = {
      count: 0,
      stars: 0,
      total: {
          count: total_count,
          stars: star_count
      }
  }
end

# Calculate the difference from yesterday for pulls and stars
today_count = total_count.to_i - data_json['daily'][yesterday]['total']['count'].to_i
today_star = star_count.to_i - data_json['daily'][yesterday]['total']['stars'].to_i

data_json['daily'][today]['count'] = today_count
data_json['daily'][today]['stars'] = today_star

# Save the JSON file and then write out new CSV
File.open(data_file, "w", :encoding => "UTF-8") do |f|
  f.write(JSON.pretty_generate(data_json))
end

File.open(output_file, "w", :encoding => "UTF-8") do |f|

  # Write the header
  f.puts("Date,Pulls,Stars\n")

  # Write each day sorted
  data_json['daily'].sort.to_h.each do |day, value|
    f.puts("#{day},#{value['count']},#{value['stars']}")
  end

  f.puts("Cumulative,0,0")
  f.puts("Type,stackedarea,line")
  f.puts("Total,#{total_count},#{star_count}")

end