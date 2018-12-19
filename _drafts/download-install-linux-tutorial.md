---
layout: blog-post
title: Download and Install FusionAuth Tutorial - Linux
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories:
- Passport
- Tutorials
- Resources
tags:
- Passport
- code
- Identity Management
- tutorial
- video
---
<p><img class="aligncenter size-full wp-image-8208" src="" alt="Download and Install FusionAuth Main" width="1200" height="591"></p>
<p>Designed to save developer time and effort, there are only a few simple steps to download and install FusionAuth in your test or production environment. The following tutorial will explain how to install FusionAuth on a Linux system and be up and running in just a few minutes. This is one aspect that makes FusionAuth unique. Most existing identity technologies have a complex hierarchy of realms, principals, and distinguished names that restricts where they can be installed and requires extensive configuration. FusionAuth will install and run on a wide variety of systems including:</p>
<p><!--more--></p>
<ul>
<li>Linux - all distributions (64-bit)</li>
<li>Mac OS X 10.8 (Mountain Lion) or newer</li>
<li>Windows Server 2008 SP2 (64-bit) w/ Windows Management Framework 3.0 or newer</li>
<li>Windows Server 2008 R2 (64-bit) w/ Windows Management Framework 3.0 or newer</li>
<li>Windows 7 SP1 (64-bit) w/ Windows Management Framework 3.0 or newer</li>
</ul>
<p>We will share tutorials for these systems in the near future, but please contact us at dev@fusionauth.io if you need help before they are released.</p>
<h2>Get Started</h2>
<p>Before you start installing onto Linux, do a quick check on your system to make sure it meets the minimum requirements. You will need:</p>
<ul>
<li>A 64-bit linux build of an RPM or Debian-based distribution.</li>
<li>A MySQL or PostgreSQL database</li>
</ul>
<p>Refer to the latest documentation on <a href="https://fusionauth.io/docs/v1/tech/" target="_blank" rel="noopener">fusionauth.io/docs</a> for minimum versions. If you don't yet have a database installed, do this first before you continue.</p>
<h2>Download and Install FusionAuth</h2>
<p>Start by going to fusionauth.io and logging into your account. (Use the <a href="/blog/2018/03/06/using-the-passport-setup-wizard/" target="_blank" rel="noopener">FusionAuth Setup Wizard</a> to establish your account.) On your accounts page you will see your licenses. On the right side select the Download button. This will take you to the product download page. In this example we are installing onto Ubuntu Linux, so we will download the Debian packages.</p>
<p><img class="aligncenter size-full wp-image-8209" src="" alt="Download and Install FusionAuth Downloads" width="1200" height="591"></p>
<p>FusionAuth is comprised of two web services, the FusionAuth backend and FusionAuth search engine. The FusionAuth Backend bundle provides access to the API and the web-based user interface. The search engine is required by FusionAuth and provides full-text search uses Elasticsearch. In this video we will download and install both services.</p>
<p><img class="aligncenter size-full wp-image-8210" src="" alt="Download and Install FusionAuth Search" width="1200" height="591"></p>
<p>We will be using <a href="https://www.gnu.org/software/wget/" target="_blank" rel="noopener">Wget</a> to download the packages. If you do not have the command line tool Wget available you may optionally download the packages via a browser and transfer them to the target system.</p>
<p>First, you’ll want to right-click on the file and copy the destination to your clipboard. Then, paste it at the end of your Wget command. Once you have the backend bundle downloaded, repeat the same steps for the search engine files.</p>
<p><img class="aligncenter size-full wp-image-8211" src="" alt="Download and Install FusionAuth Install Code" width="1200" height="591"></p>
<p>Next, you will need to install the two packages that you just downloaded. I am using the "dpkg -i" command to install backend and search engine. Finally, you will need to start these services. <strong>IMPORTANT: Start the FusionAuth Search Engine before the FusionAuth back end.</strong></p>
<h2>Complete the FusionAuth Setup</h2>
<p>Now that both services have been started. You will complete the setup using the browser. In your browser you will navigate to the IP address or hostname of the server where you installed FusionAuth. This may be localhost if you are installing locally. By default FusionAuth Backend will be listening on port 9011 so we will add that to the address. When the page loads you will be prompted for your license key.</p>
<p><img class="aligncenter size-full wp-image-8212" src="" alt="Download and Install FusionAuth Maintenance" width="1200" height="591"></p>
<p>If you do not have the key handy, you can find it on your FusionAuth account page.</p>
<p><img class="aligncenter size-full wp-image-8213" src="" alt="Download and Install FusionAuth Get Key" width="1200" height="591"></p>
<p>Once the key is verified you will be prompted to complete the database configuration in order to finish the setup. If you need any help with these steps, you can refer to our<a href="/docs/1.x/tech/getting-started/" target="_blank" rel="noopener"> installation documentation</a> at fusionauth.io, or feel free to email dev@fusionauth.io.</p>
<h2>Video: Download and Install FusionAuth - Linux</h2>
<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/T0-XFawW7Xs?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="allowfullscreen"></iframe></div>
<h2>Learn More About FusionAuth</h2>
<p>FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available on the market. More than a login tool, we provide registration, data search, user segmentation and advanced user management across applications. <a href="https://goo.gl/kk4igG">Find out more about FusionAuth</a> and sign up for a free trial today.</p>
<p style="text-align: center;"><a class="orange-button-material small w-button" href="https://goo.gl/kk4igG">Try FusionAuth</a></p>
