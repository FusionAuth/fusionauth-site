#!/usr/bin/env ruby
require 'fileutils'
require 'json'
require 'net/http'
require 'set'

def to_int_month(month)
  case month
  when "Jan"
    return 1
  when "Feb"
    return 2
  when "Mar"
    return 3
  when "Apr"
    return 4
  when "May"
    return 5
  when "Jun"
    return 6
  when "Jul"
    return 7
  when "Aug"
    return 8
  when "Sep"
    return 9
  when "Oct"
    return 10
  when "Nov"
    return 11
  else
    return 12
  end
end

log_dir = "/var/log/apache2"
output_file = "/var/www/collateral/resource-download-count.csv"
# ip_hash_file = "/var/www/collateral/ip_to_geo.json"
whitelisted_ip_patterns_file = "/etc/monit/whitelist_ips.regex"

# Load the white regex
whitelisted_ip_patterns = []
File.readlines("#{whitelisted_ip_patterns_file}").each do |l|
  whitelisted_ip_patterns << Regexp::new(l.strip)
end

# Load the IP hash
# ip_hash = JSON.parse(File.read(ip_hash_file))

# Collect the counts
counts = Hash.new(0)
resources = Set.new
Dir.foreach(log_dir) do |file|
  if file.start_with?("access.log") && File.file?("#{log_dir}/#{file}")

    if file.end_with?(".gz")
      infile = open("#{log_dir}/#{file}")
      gz = Zlib::GzipReader.new(infile)
      lines = gz.readlines
    else
      lines = File.readlines("#{log_dir}/#{file}")
    end

    lines.each do |l|
      if l =~ /GET \/resources\/.+?\.pdf/

        # Pull the date apart
        index = l.index(" - - ")
        date_raw = l[index + 6, 27]
        day = date_raw[0, 2]
        month = to_int_month(date_raw[3, 3])
        year = date_raw[7, 4]
        date = "#{month}/#{day}/#{year}"

        # Initialize the counts for this date and resource
        resource = /\/resources\/(.+?).pdf/.match(l).captures[0].gsub(/fusionauth-vs-/, '')
        resources.add(resource)
        unless counts.has_key? date
          counts[date] = Hash.new(0)
          unless counts[date].has_key? resource
            counts[date][resource] = 0
          end
        end

        # Check to see if the IP is whitelisted
        ip = l[0, index]
        if whitelisted_ip_patterns.find_index { |pattern| pattern.match(ip) } == nil
          counts[date][resource] = counts[date][resource] + 1

          # Initialize the ip_hash for this IP and lookup the Country and City
          # unless ip_hash.has_key? ip
          #   puts "lookup IP #{ip}..."
          #   ip_response = Net::HTTP.get(URI("https://ipapi.co/#{ip}/json/"))
          #   ip_json = JSON.parse(ip_response)
          #
          #   country = ip_json['country_name'] || '?'
          #   city = ip_json['city'] || '?'
          #   ip_hash[ip] = "#{country}, #{city}"
          # end

        end
      end
    end
  end
end

File.open(output_file, "w", :encoding => "UTF-8") do |f|
  # Write the header
  f.print("Date,Total")
  resources.each do |resource|
    f.print(",#{resource}")
  end
  f.print("\n")

  # Write the counts
  counts.sort.each do |date, count|
    total = 0
    resources.each do |resource|
      total = total + count[resource]
    end
    f.print("#{date},#{total}")

    resources.each do |resource|
      f.print(",#{count[resource]}")
    end
    f.print("\n")
  end

  # Add some color to the chart
  # f.puts("Color,#47B050,#FF7E0E,#820000,#FFFF00")
  f.print("Type,area")
  resources.each do
    f.print(",stackedarea")
  end
end

# File.open(ip_hash_file,"w", :encoding => "UTF-8") do |f|
#   f.write(ip_hash.to_json)
# end