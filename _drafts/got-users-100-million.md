---
layout: blog-post
title: Got Users? How About 100 Million of Them?
author: Daniel DeGroff
excerpt_separator: "<!--more-->"
categories:
- Strategies
- Products
- Passport
tags:
- user registration
- load test
- call of duty
---
<p><img class="aligncenter wp-image-7390 size-full" title="got users?" src="" alt="got users passport database" width="455" height="169"></p>
<h2>FusionAuth User Registration Hits 100,000,000 in Load Test</h2>
<p><span style="font-weight: 400;">Did you know that each time you log into Facebook, check your email or fire up Candy Crush, a software engineer has thought about user registration and authentication. Hopefully she has thought a lot about it. For example, what happens if Call of Duty goes offline for maintenance and then six million users try to log back in at the same time? It could take days for users to get back online if peak loads aren’t planned for. </span></p>
<p>Our CleanSpeak product filters billions of messages in any given month, so when we started developing FusionAuth a few years ago we spent a lot of time thinking about scale and performance.</p>
<p><!--more--></p>
<p>One way we design for performance is by running load tests during our development cycles to ensure our database indexes are optimized and to confirm we don’t have any poor performing code paths. By stressing our software we are able to measure its response and determine behavior.</p>
<p>Our load tests are run on very modest hardware and stock database configurations so that our metrics are not an unrealistic best case result, but rather the minimum you can obtain when running on bare metal. Our test system is nearly 10 years old with only an upgraded disk drive. Here are the system specifications:</p>
<ul>
<li>Dell PowerEdge 1950 (2007)</li>
<li>CPU: Dual Intel Xeon L5320 1.8GHz (Discontinued in 2009)</li>
<li>Front Side Bus: 1066 MHz</li>
<li>RAM: 12GB (Only 1 GB assigned to Java VM running FusionAuth)</li>
<li>Disk: Intel 5xx SATA SSD</li>
</ul>
<h2>The Results</h2>
<p><span style="font-weight: 400;">To date we’ve registered 100 million users without any significant reduction in performance. We’re running about 400 new user registrations per second, roughly 1.4 million user registrations per hour. Once a user is registered subsequent logins are much faster at about 1000 per second which comes out to about 3.6 million per hour.</span></p>
<p><span style="font-weight: 400;">The latest </span><a href="https://www.census.gov/quickfacts/"><span style="font-weight: 400;">census data</span></a><span style="font-weight: 400;"> we have shows that the US population is approximately 321 million. 23% of that total population is under 18 years of age. This works out to be about 73 million people under the age of 18 living in this country.</span></p>
<p>This means that every single person in the United States under the age of 18 could register for your new game or application using FusionAuth and you’d still be well under the load that we are testing.</p>
<p><span style="font-weight: 400;">According to an </span><a href="http://venturebeat.com/2014/11/24/call-of-duty-advanced-warfare-by-the-big-numbers/"><span style="font-weight: 400;">infographic published by Activision in 2014</span></a><span style="font-weight: 400;">, the online multiplayer franchise Call of Duty had over 125 million total users. Call of Duty  is an exceptionally popular game, so this is a number that few titles will ever reach. Nevertheless, to put user registrations per second into perspective, FusionAuth would allow you to grow a title from launch to a staggering 125 million registered users in just over a weekend. I am quite sure that if your application actually grew that quickly the rest of your infrastructure would fail spectacularly. But rest assured, FusionAuth will be just fine.</span></p>
<p>The throughput we have achieved in FusionAuth is a number that we don’t expect anyone to ever legitimately require. However, the more distance we can put between what we can achieve and what our most demanding clients require, the less chance we will encounter issues in the field.</p>
<p>FusionAuth’s proven performance and ability to scale, as seen through our load test results, will power high volume applications with ease. Let us help you reach 100,000,000 users.</p>
<p>Learn more about FusionAuth <a href="/products/user-database-sso">here</a>.</p>
