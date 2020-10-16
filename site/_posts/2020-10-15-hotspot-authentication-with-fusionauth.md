---
layout: blog-post
title: Hotspot with FusionAuth authentication
description: Implement authentication and authorization using FusionAuth for allow web surfing at devices behind a firewall
author: Mauro Viola
category: blog
tags: linux python iptables firewall
excerpt_separator: "<!--more-->"
---


# Hotspot with FusionAuth authentication

I've been told this idea is interesting so here we are.  
What is it about?  
Basically, the need is to grant web browsing only to users who have the right (i.e. authenticated). Imagine a campsite, a hotel, or simply a company that wants to provide this service to its visitors. Obviously there must also be an adequate network infrastructure, but that's another problem ...

The proposed solution is a minimal, functional and highly customizable proof of concept.  
I say customizable because you may want to allow Internet use in certain time slots, rather than just for a limited time (for example 5 hours in total), or provide access without authentication to the boss's PC!  
They are just examples but with the appropriate modifications (more or less complex) they are things that can be done.  
The authentication part is handled by FusionAuth (by who else?), while the logins will be performed by a specific script in python.  
I do not deny that there are many other things to say and to know, and there are several ways (even better) to implement what you will soon see: the important thing is to learn something new that can inspire other ideas!

In this tutorial we will see how
- Prepare the test environment
- Install and configure the Linux components we need
- Installing and setting up FusionAuth
- Create the various scripts
- Test everything
- Massively create guest users

Prerequisites
- A couple of virtual or physical machines: the first Linux Centos 8.2 Minimal, the second we will use it to browse the Internet after authentication.
- An Internet connection.
- A minimum of networking and Linux knowledge.

I would say that there is everything. Here we go!


## Prepare the test environment

I specified a version of Centos because there are differences between the various distributions and also between the same versions of a single distribution: the scripts have been tested with the specified version, other versions / distributions may require code changes.  
The use of virtual machines greatly simplifies the preparation and development because it allows, for example, to change the MAC address of a PC or to quickly add and remove network interfaces.  
The PC with Centos will have two network cards: the first connected to the gateway or router so as to allow navigation and the second (or the others if, for example, there are more VLANs to serve) connected to the network of the devices that should be surfing. This is where the network infrastructure comes into play - there may be various access points connected to these physical networks. So, let's make it simple just to understand!  
The other device can be anything: Windows, Linux, macOS ... We only need it for the surfing test.  
All configuration will be done on the Centos PC.


                                              +-------+ 
	+------+     +----------+      +-----------  PC1  |
	|      |     |ens37     |      |          +-------+
    |  GW  -------  Centos  -------+             ...
	|      |     |     ens33|      |          +-------+
	+------+     +----------+      +-----------  PCn  |
                                              +-------+  

    ens33: 192.168.144.254            LAN PC 192.168.144.0/24


In the figure I have named the two network interfaces (ens33 and ens37) and I have reported some IPs. The names of your interfaces may be different and the IPs are not to be replicated: in the scripts I refer to these elements, so I put them in the figure to make them understand the role. Obviously you will have to modify the scripts according to your configuration.  
Let's also assume that there is a DHCP server on the PC network that distributes the ens33 IP as GW for that network, therefore 192.168.144.254.  
In the test phase you can manually set these parameters. DHCP will also need to distribute DNS which can be internal or external.  
Furthermore, the ens37 interface must be set to allow navigation (so it too must be served by a DHCP server or you will have to set it manually, it can be published directly or behind a router and therefore there will be a double NAT).  
Here we are not concerned with device security: PC1 and PCn are connected to the same network with all the implications of the case. If they were connected to the WiFi network, you could activate the separtion client on the access points in order to keep them safe. Do you remember that above I wrote: *"I do not deny that there are many other things to say and to know"*? Here.  
Here we are only concerned with providing internet connectivity ...

Now what we want to achieve is this:

             PC                            Centos
     +---------------+             +-------------------+
     |               |             |                   |
	 |    Browser    ----- (1) ----->   Auth Request   |
     |               |             |        /          |
     |               |             |       /           |
	 |   Auth Code  <----- (2) ------------            |
	 |        \      |             |                   |
	 |         \     |             |   Check access    |
	 |          ---------- (3) -----> token && acquire |
	 |               |             |  IP and Username  |
     |               |             |         |         |
     |               |             |         |         |
     |               |             |         ˅         |
     |               |             |  Create fw rules  |
	 |               |             |                   |
	 +---------------+             +-------------------|
	 

## Install and configure the Linux components we need

All of the following commands must be run as root

Activate SSH if you have not already done so, update the system and install the minimum necessary.

	service sshd start
	chkconfig --level 345 sshd on
	yum upgrade
	yum update
	yum install nano wget tar zip rsyslog httpd -y
	systemctl enable rsyslog
	systemctl start rsyslog
	cd /var/log/
Check for the presence of the messages file for any error messages.

Set the correct parameters for the cards that must have a static IP

	cd /etc/sysconfig/network-scripts
and for each card where it is necessary set the correct values similarly to:

	BOOTPROTO=static
	IPADDR=192.168.144.133
	PREFIX=24

Do not set DNS, and gw for the NICs that will serve the PCs.
If there are more gw, delete them, leaving only the necessary one, using the command

	ip route
with the appropriate parameters (attention that for the interfaces that were in DHCP, before a system restart, you will have the route but then it will disappear with static IP).

Enable ipv4 packet forwarding:

	echo 'net.ipv4.ip_forward = 1' > /etc/sysctl.d/01-ipv4.conf

Disable the firewall (with firewall active by default there are complications, we will activate what we need point by point):

	systemctl disable firewalld

in /etc/sysctl.conf
add the line that disables the console error notification of drop packets, otherwise there will be confusion on the screen:

kernel.printk = 4 1 1 7

Diable selinux:

	nano /etc/sysconfig/selinux
bringing the first value to disabled
Restart Centos.

Run

	sestatus
to check if it has actually been disabled.

Also check that the deleted gw do not reappear: in this case it is possible that a network interface is still in DHCP.  
Make sure you can access the Internet from this machine: you will have to download several packages and in any case it will be this system that will allow access to the various PCs, if you can't surf from here, neither will the others.

## Installing and setting up FusionAuth

Now we need to install FusionAuth and its components.
Install postgresql and configure the password:

	yum -y install https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
	dnf -qy module disable postgresql
	dnf -y install postgresql12 postgresql12-server
	/usr/pgsql-12/bin/postgresql-12-setup initdb
	systemctl enable --now postgresql-12
	su - postgres
	psql -c "alter user postgres with password 'myComplexPassword'"
	exit
	nano /var/lib/pgsql/12/data/pg_hba.conf
	
Search for the first occurrence of 127.0.0.1 and edit it by putting "md5" at the end of the line instead of "ident".
At the prompt continue with

	systemctl restart postgresql-12

Now verify that the DB works with:

	psql -U postgres -W -h 127.0.0.1 -p 5432
Enter the password, if you connect execute

	exit

We are now ready for Python!

	yum install python3.8 redhat-rpm-config python38-devel -y
	
Then install these:

	pip3 install fusionauth-client
	pip3 install getmac 
	pip3 install pyyaml

And FusionAuth?

	sh -c "curl -fsSL https://raw.githubusercontent.com/FusionAuth/fusionauth-install/master/install.sh | sh"
Now start it and wait...
	service fusionauth-app start

From a PC start a browser specifying the URL based on the IP of our Centos machine, so you will start the wizard, ex: 

http://192.168.144.133:9011
you can get the IPs with the command

	ip addr

Complete the procedure and set as user "postgres" and the password you chose earlier.  
Wait for it to complete and then create the admin user, accepting the license.


Now that you are logged in as administrator: in the menu choose Applications, create the application (name eg WEBAuth), in the Oauth section set the redirect link for the authorized post login users (click on ADD), ex: http://192.168.144.133:8080  
This URL will also need to be set in the python scripts. Attention it must be identical! Both here and in python scripts: if it ends with / it must end with / also in .py (here it does not end with /). Port 8080 is set in the python script and so you can possibly change it.  
In the logout URL set http://192.168.144.133
which is the Apache Server that will respond immediately after logout, so as to re-present the login mask at logout.  
Apache will work on this Centos, but it is not mandatory to use it or that it is on this server. I remind you that the IPs I use may be different from yours: make the appropriate changes.

Save this application.  
Now choose "view" on the right, to get various information you need about this application; go down in the OAuth Configuration section: take note of the clientId (which is appID) and clientSecret, they will need to be set in the python script.

Go to Settings (left menu, API Keys), and create a key with default values, take note of the value of the key, it will also have to be set in the python scripts.
Still in Settings, System, Reports, set the correct Timezone.

Create a test user in FusionAuth now:
in the Users menu click on Add, it is not necessary to specify an email address, then remove the "Send email setup password", set Username and Password. Save.  
It is not necessary to add a registration.  
While you're at it, check the user's properties, and get the tenantID (you can also find it elsewhere): you might need it if you want to create users massively.

Now create the file `/root/checkAccess.py`
with the appropriate content that you find in the script section: in the declarative section, replace the API key, clientID and Secret parameters obtained previously from the FusionAuth data.  
You must also set the interface and IP of the interface on the gateway network (not of the gateway but of the Centos interface on the gateway network).

I remind you that you need these 4 parameters to modify the python file, shown here for example:

RedirectURL:		http://192.168.144.133:8080  
ClientID/appID: 	acc665d4-f27b-41fc-98c8-31a4c58840c0  
Secret: 			gOXRp2e1DQcjPpMt4a2W2SFJJzQPKZsXCnxOgOiZRes  
Api Key: 			vejsUNw4mwLs_QLqifo0JVcHJRqA85VjiQYlYiKqRQY  


You are well underway!

## Create the various scripts

Here you find the python script for `checkAccess.py`
Note that I allow external DNS access in the script, you may want to avoid this if you have internal DNS.  
Basically the script accepts post login requests that come (or should come) from FusionAuth. To do this, it must always be active in the background because it must remain listening. If you don't run the script, nothing will happen after authentication.  
The script analyzes the authcode and if it is valid proceeds to create the rules on the firewall to allow navigation to the device from which the request originated.  
I also get the username because you may want to activate timed browsing or simply deactivate it immediately after logging in, so that it is not possible to share the credentials provided (guest users, just to understand).  
The script must be run as root, since it has to execute iptables commands. Just start it via rc.local, you can obviously start it manually.


	#script checkAccess.py: check the token: reply on port TCP 8080. You must execute it at the boot time!
	from fusionauth.fusionauth_client import FusionAuthClient
	from http.server import BaseHTTPRequestHandler, HTTPServer
	from urllib.parse import urlparse, parse_qs
	import urllib.parse
	from datetime import datetime
	from getmac import get_mac_address
	import os
	import json
	import yaml
	import sys

	##############################################################
	# Declaration Section
	##############################################################
	apiKey='yfEzL94JXNFKotLzH75My-s96Bh4oTb9-wkhXe--iUs'
	applicationID='4616f048-dd20-47cc-b7a0-33b2c0f237f6'
	clientSecret='_fqMFnS54PnFmVTKTcprS5ioxHy2QRvxYSArezeKPd8'
	redirectURL='http://192.168.144.133:8080'

	GWInterface='ens37'
	gwIPInterface='192.168.43.254'

	client = FusionAuthClient(apiKey, 'http://127.0.0.1:9011')
	logoutUrl='http://192.168.144.133:9011/oauth2/logout?client_id=' + applicationID
	##############################################################
	# End of Declaration Section
	##############################################################

	class GetHandler(BaseHTTPRequestHandler):
		def do_GET(self):
			parsed_path = urlparse(self.path)
			result=''
			if parsed_path.query.find('code')>-1:
				parameters = dict(urllib.parse.parse_qs(parsed_path.query))
				ipClient = self.client_address[0]
				macClient = get_mac_address(ip=ipClient)
				authCode=parameters.get("code")
				print (datetime.now())
				print ('code: ' + str(authCode))
				print ('IP: ' + str(ipClient))
				print ('MAC: ' + str(macClient))
				client_response = client.exchange_o_auth_code_for_access_token(authCode,applicationID,redirectURL,clientSecret)
				if client_response.was_successful():
					print(client_response.success_response)
					result = '<p style="color:green">Access granted!.</p> <a href="' + logoutUrl + '">Logout</a>'

					cmd='/usr/sbin/iptables -w -t nat -A POSTROUTING -s ' + str(ipClient) + ' -o ' + GWInterface + ' -j SNAT --to-source ' + gwIPInterface
					os.system(cmd)

					cmd='/usr/sbin/iptables -w -A INPUT -m mac --mac-source ' + str(macClient) + ' -m conntrack --ctstate NEW -p tcp -m tcp --dport 80 -j clientRule'
					os.system(cmd)

					cmd='/usr/sbin/iptables -w -A INPUT -m mac --mac-source ' + str(macClient) + ' -m conntrack --ctstate NEW -p tcp -m tcp --dport 443 -j clientRule'
					os.system(cmd)

					cmd='/usr/sbin/iptables -w -A INPUT -m mac --mac-source ' + str(macClient) + ' -m conntrack --ctstate NEW -p tcp -m tcp --dport 53 -j clientRule'
					os.system(cmd)

					cmd='/usr/sbin/iptables -w -A INPUT -m mac --mac-source ' + str(macClient) + ' -m conntrack --ctstate NEW -p udp -m udp --dport 53 -j clientRule'
					os.system(cmd)

					cmd='/usr/sbin/iptables -w -A FORWARD -m mac --mac-source ' + str(macClient) + ' -m conntrack --ctstate NEW -p tcp -m tcp --dport 80 -j clientRule'
					os.system(cmd)

					cmd='/usr/sbin/iptables -w -A FORWARD -m mac --mac-source ' + str(macClient) + ' -m conntrack --ctstate NEW -p tcp -m tcp --dport 443 -j clientRule'
					os.system(cmd)

					cmd='/usr/sbin/iptables -w -A FORWARD -m mac --mac-source ' + str(macClient) + ' -m conntrack --ctstate NEW -p tcp -m tcp --dport 53 -j clientRule'
					os.system(cmd)

					cmd='/usr/sbin/iptables -w -A FORWARD -m mac --mac-source ' + str(macClient) + ' -m conntrack --ctstate NEW -p udp -m udp --dport 53 -j clientRule'
					os.system(cmd)

	#########################################################################
	#              pay attention!
	#              below we try to acquire the user's username to make any considerations.
	#              but if the authentication was performed via SAML, the username may not be there and at some point this code will fail and you will get an "Access DENIED!"
	#########################################################################	
					jsonResponse=json.loads(str(client_response.success_response).replace("\'", "\""))				
					userId= jsonResponse['userId']
					userInfo=client.retrieve_user(userId)
					userInfoStr= str(userInfo.success_response).replace("\'", "\"")
					userInfoJson = yaml.load(userInfoStr, Loader=yaml.FullLoader)
					userName = userInfoJson['user']['username']
					userName = userName.lower()
					print ("Authenticated user: " + userName)
					if userName.startswith('gst-'):
						print ("Guest user identified! Now you need to delete it. This part is left to the reader ...")
	#########################################################################
	#                  part not implemented! not essential at the moment.
	#					imagine that the various guest users (see specific script for the creation) can navigate only until the next reset of the rules.
	#					we do not want to be able to surf more days with the same coupon: therefore after accessing the user must be deleted (or deactivated).
	#########################################################################
					sys.stdout.flush()

				else:
					print(client_response.error_response)
					result = '<p style="color:red">Access DENIED!</p> <a href="' + logoutUrl + '">Retry</a>'
					sys.stdout.flush()

			message1 = [
					'<html>',
					'<head>',
					'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">',
					'<title>Result of access to the ACME Hotspot</title>',
					'</head>',
					'<body>',
					result,
					'</body>',
					'</html>'
					]

			message1.append('')
			message2 = ''.join(message1)
			self.send_response(200)
			self.end_headers()
			self.wfile.write(message2.encode(encoding='utf_8'))
			return

	if __name__ == '__main__':
			from http.server import BaseHTTPRequestHandler, HTTPServer
			server = HTTPServer(('0.0.0.0', 8080), GetHandler)
			print('Starting server, use <Ctrl-C> to stop')
			server.serve_forever()




Now you have to create the script that prepares and restores the rules, preventing authenticated users from continuing to browse, if you want this behavior: for example, if you launch it at midnight you will reset the permissions and users will have to authenticate again.  
Note that at logout (which you can perform by accessing the appropriate URL), it does not delete the rule that allows you to browse: this function could be implemented so that those who log out stop consuming browsing time, if this is the your purpose.

So: create `/root/clearRules.sh` with the following content, it will have to be started at boot (rc.local) and put in the crontab every day at midnight.  
Remember to set the internet connected interface in the script.  
Please note that if you want you could modify the script to allow permanent access to the boss, opening - with the appropriate rules - the ports needed only for the MAC Address of his PC (eg WiFi and RJ45).


	gwInterface="ens37"
	iptables -F
	iptables -F -t nat
	iptables -w -P OUTPUT  DROP
	iptables -w -P INPUT   DROP
	iptables -w -P FORWARD DROP
	iptables -w -A INPUT   -m conntrack --ctstate ESTABLISHED -j ACCEPT
	iptables -w -A OUTPUT  -m conntrack --ctstate ESTABLISHED -j ACCEPT
	iptables -w -A FORWARD -m conntrack --ctstate ESTABLISHED -j ACCEPT
	iptables -w -A INPUT  ! -i $gwInterface -p tcp -m tcp  --dport 22  -m conntrack --ctstate NEW,ESTABLISHED -j  ACCEPT
	iptables -w -A OUTPUT -p tcp -m tcp  --sport 22  -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
	iptables -w -I INPUT ! -i $gwInterface -m conntrack --ctstate NEW  -p tcp --dport 8080 -j ACCEPT
	iptables -w -I INPUT ! -i $gwInterface -m conntrack --ctstate NEW  -p tcp --dport 80 -j ACCEPT
	iptables -w -I INPUT ! -i $gwInterface -m conntrack --ctstate NEW -p tcp --dport 9011 -j ACCEPT
	iptables -w -I OUTPUT -p icmp -j ACCEPT
	iptables -w -A INPUT -i lo -j ACCEPT
	iptables -w -A OUTPUT -o lo -j ACCEPT
	IPaddress=($(ip addr | grep 'inet ' | awk {'print $2'} | cut -d "/" -f 1))
	for i in "${IPaddress[@]}"
	do
		iptables -w -A INPUT -s $i -m conntrack --ctstate NEW  -j ACCEPT
	done
	iptables -w -A OUTPUT -m conntrack --ctstate NEW -j ACCEPT
	iptables -w -A OUTPUT  -j LOG  --log-level info --log-prefix "OUPUT -- DENY "
	iptables -w -A INPUT   -j LOG  --log-level info --log-prefix "INPUT -- DENY "
	iptables -w -A FORWARD -j LOG  --log-level info --log-prefix "FORWARD -- DENY "
	iptables -w -N clientRule
	iptables -w -A clientRule  -j ACCEPT

Finally, grant execution permissions

	chmod +x clearRules.sh


### Last part!

This part (the Apache part) is optional, but it can help. In testing, it becomes boring to log out and then re-enter the url to return to the login page.

	cd /var/www/html/

Create `index.html` and enter the following content, replacing the AppID with the one present in the FusionAuth application details, also remember to change the IP (in 4 places) and possibly the port 8080 (the URL you set in FusionAuth, with or without /, remember?).  
This will be the file that allows you to automatically redirect to the authentication page without having to write the full AppID URL each time.


	<!DOCTYPE html>
	<html>
	  <head>
		<meta http-equiv="Refresh" content="0; url='http://192.168.144.133:9011/oauth2/authorize?client_id=acc665d4-f27b-41fc-98c8-31a4c58840c0&response_type=code&redirect_uri=http%3A%2F%2F192.168.144.133%3A8080'" />
	  </head>
	  <body>
		<p>Please go to   
		<a href="http://192.168.144.133:9011/oauth2/authorize?client_id=acc665d4-f27b-41fc-98c8-31a4c58840c0&response_type=code&redirect_uri=http%3A%2F%2F192.168.144.133%3A8080">Login</a>
		</p>
	  </body>
	</html>


Finally start apache

	systemctl start httpd
	systemctl enable httpd

## Test everything

You are ready to prove everything works!
Apache is already running.
Run the `/root/clearRules.sh` script, this will reset all previous rules, and whoever logged in will have to do it again. Remember to run it on system boot and periodically via crontab.
1. Start the python script with
`python3 /root/checkAccess.py`
which will remain running waiting for the various redirect post login of the browser (or for you to press CTRL-C to terminate it).
2. Now open a browser on the second test machine that must have the IP of the Centos machine as a gateway (remember to set the DNS as well as you want). Try to surf - you won't be able to. Now go to the Centos IP: http://192.168.144.133 the redirect to FusionAuth will start. If the redirect doesn't work, it means that index.html has some problem - check it again. If necessary, manually enter the URL for authentication of the WEBAuth app.
3. Log in with the test user created earlier. The post login outcome should be "Access granted!"
4. You should now be able to browse freely.
5. If you change MAC Address or IP to this device you will see that navigation is not allowed. By resetting the originals it will work again.
6. If you run the `clearRules.sh` script you will not be able to navigate until the next new authentication.

Perfect!

## Massively create guest users

You may want to mass create users to provide tickets to users. This script does just that.  
I haven't paid much attention to writing solid code (not even before to tell the truth), take that as a working example.  
At the end you will get a file with the list of credentials (which you can print through a mail merge for example) of all the users who have been created in FusionAuth during this execution. Remember that once you have logged in you should also disable or delete the user otherwise with a voucher you will allow him access for an indefinite period, because he can reuse or share the credentials.  
As you can see, I also avoided using ambiguous characters in the generation of credentials: the interpretation of this data is a long-standing problem for many users.


	from fusionauth.fusionauth_client import FusionAuthClient
	from datetime import datetime
	import sys
	import random
	import string

	def get_random_string(length):
		sample_letters = 'abcdefghimnpqrstuvzxykjy23456789ABCDEFGHLMNPQRSTUVZWYJKX'
		result_str = ''.join((random.choice(sample_letters) for i in range(length)))
		return result_str

	def get_random_number(length):
		sample_letters = '23456789'
		result_str = ''.join((random.choice(sample_letters) for i in range(length)))
		return result_str

	######################################################################################################
	client = FusionAuthClient('xnXyXn7ZRWi-2OW983MyjjydsknfigcSTzQ96WYGT24', 'http://127.0.0.1:9011')
	application_id='5ef574b6-6929-427b-8f39-ec82ffc4e15b'
	#if you have more tenant, it is not needed
	tenant_id='a2541956-b963-bec0-7d6b-1d5d4359e621'
	######################################################################################################

	print ('This script generates a list of guest users on FuzionAuth for Internet access.')
	print ('You will be asked for a number from which to generate the user which will have')
	print ('the form gst-xxxxxx with xxxxxx numeric.')
	print ('Now you will be asked which number to start the generation from and for how')
	print ('many, so check which is the last ID you generated earlier.')

	print ('At the end a short report will be generated and a file called list_guests.csv')
	print ('which will contain the list of users and passwords for the mail merge of the')
	print ('coupons.')


	startAt = input("What number do I start from? ")
	total = input("How many users should I generate? ")

	try:
		startNum = int(startAt)
		totalNum = int(total)
	except ValueError:
		print("You have not entered valid numbers.")
		sys.exit(1)

	print ('')
	finalNum=startNum+totalNum-1

	print ('I will start from gst-' + str(startNum).zfill(6))
	print ('and I will end with gst-' + str(finalNum).zfill(6))
	print ('for a total number of users: ' + str(total))

	print ('')
	conferma = input("Would you like to proceed?  (y/n) ")
	if conferma.lower() != 'y':
		print ('Operation canceled!')
		sys.exit(1)

	print ('Generating in progress. Wait for...')

	list = ''
	for x in range(totalNum):
		pwd = '' + get_random_string(8) + '-' + get_random_number(2)
		username = 'gst-' + str(x+startNum).zfill(6)
		user_registration_request = {
			'registration': {
				'applicationId': application_id
			},
			'user': {
				'tenantId' : tenant_id,
				'password': pwd,
				'firstName': 'User guest',
				'lastName': '---',
				'twoFactorEnabled': False,
				'username': username
			},
			'sendSetPasswordEmail': False,
			'skipVerification': False
		}

		client_response = client.register(user_registration_request)
		if client_response.was_successful():
			list = list + username + ',' + pwd + '\r\n'
		else:
			print ('Error ' + str(client_response.error_response))

	try:
		text_file = open("/tmp/list_guests.csv", "wt")
		n = text_file.write(list)
		text_file.close()
		if n == 0:
			print ("File list_guest.csv is zero bytes!")
		else:
			print ("File list_guests.csv generated successfully.")
	except ValueError:
		print("It was not possible to write the file list_guests.csv!")
		sys.exit(1)


## Conclusions

In this tutorial we have seen many things, different than usual I guess.  
We have worked on Linux, with ipTables, with FusionAuth, with Apache, with Python, with networks. It was an interdisciplinary tutorial.  
It's a proof of concept so I didn't go too much for the subtle, but it's a good starting point to expand.  

I hope you enjoyed it.  
If you have any comments or questions, please post them below.

