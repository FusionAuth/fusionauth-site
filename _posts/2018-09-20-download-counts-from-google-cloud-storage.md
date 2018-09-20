---
layout: blog-post
title:  "Download counts from Google Cloud Storage"
author: Brian Pontarelli
categories: blog
image: download-count.png
---

Watching real-time Google Analytics is fun but it wasn't telling us how many people are downloading FusionAuth. Since we are using download count to make sure people are finding FusionAuth and the website is making it easy for them to download and play around with it, I wanted to display our download count on the dashboard we have in the office.

We are storing the FusionAuth downloads in Google Cloud Storage currently and Google doesn't have a simple way retrieve a files download count. Even if they had this, it might not be accessible from an API that would hook up to [https://cyfe.com](https://cyfe.com) (the system we are using for our dashboard). No problem! I'll just write a little script that downloads the Google Cloud Storage access logs and then extracts the download count.

## Google Cloud Storage script

The first step we did to get everything working was to enable Google Storage access logs. We configured this via the CLI and specified a bucket in our Google Cloud Storage to hold the logs. Our bucket for the access logs is called `fusionauth_access_logs`. You'll see how we use this location in our script. 

Here's the Ruby script I wrote that downloads the access logs, does a little regex magic and spits the count out to a Cyfe compliant CSV file:

```ruby
#!/usr/bin/env ruby
require 'fileutils'

temp_dir = "/tmp/fusionauth-access-logs"
output_file = "/var/www/collateral/download-count.csv"
whitelisted_ip_patterns_file = "/etc/whitelist_ips.regex"

# Load the white regex
whitelisted_ip_patterns = []
File.readlines("#{whitelisted_ip_patterns_file}").each do |l|
  whitelisted_ip_patterns << Regexp::new(l.strip)
end


# Clean up the existing access logs
FileUtils.rm_rf(temp_dir)
FileUtils.mkdir(temp_dir)
`/usr/bin/gsutil -m cp "gs://fusionauth_access_log/FusionAuthAccesssLog_usage_*" #{temp_dir} > /dev/null 2>&1`

# Collect the counts
counts = Hash.new(0)
Dir.foreach(temp_dir) do |file|
  if File.file?("#{temp_dir}/#{file}")
    date = file.gsub(/FusionAuthAccesssLog_usage_([0-9]{4})_([0-9]{2})_([0-9]{2}).*/, '\1\2\3')
    File.readlines("#{temp_dir}/#{file}").each do |l|
      if l =~ /fusionauth-app[-_0-9all.]*(deb|rpm|zip)"/

        # Check to see if the IP is whitelisted
        ip = /"\d+?","(.+?)"/.match(l).captures[0]
        if whitelisted_ip_patterns.find_index { |pattern| pattern.match(ip) } == nil
          counts[date] = counts[date] + 1
        end
      end
    end
  end
end

File.open(output_file, "w", :encoding => "UTF-8") do |f|
  # Write the header
  f.puts("Date,Download count\n")

  # Write the counts
  counts.sort.each do |date,count|
    f.puts("#{date},#{count}\n")
  end
end
```

_`download-counts.rb`_
{: .mt-0 .text-right}

The first part of the script downloads all of the files that conform to a specific pattern from our access log storage bucket and stores them in the `/tmp/fusionauth-access-logs` directory.

Next, I iterate over each access log file and determine the date of the file. The date is in the file name, so I extract it using a regular expression. This gives me the date as a string in the for `YYYYMMDD`. This date string becomes the key into a hash where I store the counts for that day. Notice that my hash is initialized using a default value of `0`. In Ruby, the default value will be returned for any hash position that is not defined. This makes it simple to do counting without checking for missing hash keys. 

Then for each file, I read each line of the file and determine if the line is a download or not. I do this using another regular expression based on the file name I'm looking for. In this case, the files I'm interested in are the bundles for the `fusionauth-app` package. My expression ensures that the ZIP, DEB or RPM package is in the name as well. If the line matches, I increment the count for that date.

As you can see I'm also filtering out downloads using an IP whitelist and a regular expression, we do a lot of testing and I don't want to those to count towards our final metric. This part of the script may or may not be use to everyone.

Finally, I write all the header row and the counts out to the CSV file. The CSV file I'm writing to is accessible at this URL: [https://fusionauth.io/collateral/download-count.csv](https://fusionauth.io/collateral/download-count.csv).

## Deployment and Cyfe

I deployed this script to the `/etc/cron.hourly` directory on the server to ensure it runs every hour. Ubuntu defaults hourly jobs to run at 17 minutes after the hour. Each hour my script runs and rebuilds the CSV file. 

**Pro-tip**: Because Cron will use `run-parts` to execute the script you'll need to ensure you remove the file extension because the `.` (dot) is not allowed by `run-parts`. You may only use ASCII upper, lower, digits, underscores or hyphens, so the file extension that includes a dot is out. If you fail to do so, Cron will quietly fail and not run your script. Ask me how I know.

In Cyfe, I added a **Private URL** widget to my dashboard. This widget uses the **Line Chart** mode with the URL above and refreshes every hour. This will pick up any changes made to the CSV file on the server. The nice part of about this setup is that I can see as downloads increase during the day since the server is continually updating the CSV file. I'm assuming that Cyfe might not handle UTC correctly and that Google Cloud Storage uses UTC, so my script might need some updates to fix that, but otherwise this works nicely.

Enjoy.
  