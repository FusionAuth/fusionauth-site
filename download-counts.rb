#!/usr/bin/env ruby
require 'fileutils'

temp_dir = "/tmp/fusionauth-access-logs"
output_file = "/var/www/collateral/download-count.csv"
whitelisted_ip_patterns_file = "/etc/monit/whitelist_ips.regex"

# Load the white regex
whitelisted_ip_patterns = []
File.readlines("#{whitelisted_ip_patterns_file}").each do |l|
  whitelisted_ip_patterns << Regexp::new(l.strip)
end


# Clean up the existing access logs
FileUtils.rm_rf(temp_dir)
FileUtils.mkdir(temp_dir)
`/usr/bin/gsutil -m cp "gs://inversoft_access_logs/FusionAuthAccesssLog_usage_*" #{temp_dir} > /dev/null 2>&1`

# Collect the counts
counts = Hash.new(0)
Dir.foreach(temp_dir) do |file|
  if File.file?("#{temp_dir}/#{file}")
    date = file.gsub(/FusionAuthAccesssLog_usage_([0-9]{4})_([0-9]{2})_([0-9]{2}).*/, '\1\2\3')
    File.readlines("#{temp_dir}/#{file}").each do |l|
      if l =~ /fusionauth-app[-_0-9all.]*(deb|rpm|zip)"/

        if not counts.has_key? date
          counts[date] = [0,0,0]
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
        end
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