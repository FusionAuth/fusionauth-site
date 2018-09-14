---
layout: blog-post
title:  "Download counts from Google Cloud Storage"
author: Brian Pontarelli
categories: blog
image: download-count.png
---

Watching real-time Google Analytics is fun but it also doesn't tell us how many people are downloading FusionAuth. Since we are using download count to make sure people are finding FusionAuth and the website is making it easy for them to download and play around with it, I wanted to display our download count on the dashboard we have in the office.

We are storing the FusionAuth downloads in Google Cloud Storage currently and Google doesn't have a simple way retrieve a files download count. Even if they had this, it might not be accessible from an API that would hook up to [https://cyfe.com](https://cyfe.com) (the system we are using for our dashboard). No problem! I'll just write a little script that downloads the Google Cloud Storage access logs and then extracts the download count.

## Google Cloud Storage script
The first step we did to get everything working was to enable Google Storage access logs. We configured this via the CLI and specified a bucket in our Google Cloud Storage to hold the logs. Our bucket for the access logs is called `fusionauth_access_logs`. You'll see how we use this location in our script. 

Here's the script I wrote that downloads the access logs, does a little regex magic and spits the count out to a Cyfe compliant CSV file:

```bash
#!/bin/bash

rm -rf /tmp/fusionauth-access-logs
mkdir /tmp/fusionauth-access-logs
/usr/bin/gsutil -m cp "gs://fusionauth_access_logs/FusionAuthAccesssLog_usage_*" /tmp/fusionauth-access-logs
DATE=$(date +'%Y%m%d')
COUNT=$(grep -E 'fusionauth-app[-_0-9all.]*(deb|rpm|zip)"' /tmp/fusionauth-access-logs/* | wc -l)
echo "${DATE},${COUNT}" >> /var/www/collateral/download-count.csv
```

The first part of the script downloads all of the files that conform to a specific pattern from our access log storage bucket and stores them in the `/tmp/fusionauth-access-logs` directory.

Next, I run a simple group command to extract all of the instances of someone downloading the `fusionauth-app` bundle. My regular expression uses the pattern for our ZIP, DEB and RPM packages.

Finally, using the current date from the `date` command and the count, I append a row to the CSV file that contains this information. The CSV file I'm writing to is accessible at this URL: [https://fusionauth.io/collateral/download-count.csv](https://fusionauth.io/collateral/download-count.csv).

## Deployment and Cyfe

I deployed this script to the `/etc/cron.daily` directory on the server to ensure it runs every day. Ubuntu defaults daily cron jobs to run around 6:25am. Each morning, my script runs and append the daily count to the CSV file.

In Cyfe, I added a **Private URL** widget to my dashboard. This widget uses the **Line Chart** mode with the URL above and refreshes every hour. I set it to every hour because I wasn't sure when Cyfe did updates and didn't want to wait to see each days data. Plus, I might get fancy at some point in the future and enhance this process to update every hour.
  