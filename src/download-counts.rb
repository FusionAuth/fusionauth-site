#!/usr/bin/env ruby
require 'fileutils'
require 'json'
require 'net/http'

temp_dir = "/tmp/fusionauth-access-logs"
output_file = "/var/www/collateral/download-count.csv"
ip_hash_file = "/var/www/collateral/ip_to_geo.json"
whitelisted_ip_patterns_file = "/etc/monit/whitelist_ips.regex"

# Load the white regex
whitelisted_ip_patterns = []
File.readlines("#{whitelisted_ip_patterns_file}").each do |l|
  whitelisted_ip_patterns << Regexp::new(l.strip)
end

# Load the IP hash
ip_hash = JSON.parse(File.read(ip_hash_file))

# Copy new access logs
FileUtils.mkdir(temp_dir) unless File.directory?(temp_dir)
# Delete today's logs to ensure we don't miss any since we are only copying ones that do not yet exist
today = Time.now.strftime("%Y_%m_%d")
Dir.glob("#{temp_dir}/FusionAuthAccesssLog_usage_#{today}*").each do |file|
  File.delete(file)
end
`/usr/bin/gsutil -m cp -n "gs://inversoft_access_logs/FusionAuthAccesssLog_usage_*" #{temp_dir} > /dev/null 2>&1`

# Collect the counts
counts = Hash.new(0)
Dir.foreach(temp_dir) do |file|
  if File.file?("#{temp_dir}/#{file}")
    date = file.gsub(/FusionAuthAccesssLog_usage_([0-9]{4})_([0-9]{2})_([0-9]{2}).*/, '\1\2\3')
    File.readlines("#{temp_dir}/#{file}").each do |l|
      begin
        if l =~ /fusionauth-app[-_0-9all.]*(deb|rpm|zip)"/

          # Initialize the counts for this date
          unless counts.has_key? date
            counts[date] = [0, 0, 0]
          end

          # Check to see if the IP is whitelisted
          ip = /"\d+?","(.+?)"/.match(l).captures[0]
          if whitelisted_ip_patterns.find_index { |pattern| pattern.match(ip) } == nil
            if l =~ /deb/
              counts[date][0] = counts[date][0] + 1
            elsif l =~ /rpm/
              counts[date][1] = counts[date][1] + 1
            else
              counts[date][2] = counts[date][2] + 1
            end

            # Initialize the ip_hash for this IP and lookup the Country and City
            unless ip_hash.has_key? ip
              puts "lookup IP #{ip}..."
              ip_response = Net::HTTP.get(URI("https://ipapi.co/#{ip}/json/"))
              ip_json = JSON.parse(ip_response)

              country = ip_json['country_name'] || '?'
              city = ip_json['city'] || '?'
              ip_hash[ip] = "#{country}, #{city}"
            end

          end
        end
      rescue ArgumentError => e
        puts "#{e}, argument #{l}"
      end
    end
  end
end

File.open(output_file, "w", :encoding => "UTF-8") do |f|
  # Write the header
  f.puts("Date,Total,DEB,RPM,Zip\n")

  # Write the counts
  counts.sort.each do |date,count|
    total = count[0] + count[1] + count[2]
    f.puts("#{date},#{total},#{count[0]},#{count[1]},#{count[2]}\n")
  end
  # Add some color to the chart
  f.puts("Color,#47B050,#FF7E0E,#820000,#FFFF00")
  f.puts("Type,area,stackedarea,stackedarea,stackedarea")
end

File.open(ip_hash_file,"w", :encoding => "UTF-8") do |f|
  f.write(ip_hash.to_json)
end