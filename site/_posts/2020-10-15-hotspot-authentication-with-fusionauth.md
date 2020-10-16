---
layout: blog-post
title: Hotspot with FusionAuth authentication
description: Implement authentication and authorization using FusionAuth for allow web surfing at devices behind a firewall
author: Mauro Viola
category: blog
tags: client-python 
excerpt_separator: "<!--more-->"
---

Basically, the goal is to grant web browsing only to users who have the right (i.e. who have been authenticated). Imagine a campsite, a hotel, or simply a company that wants to provide this service to its visitors. Obviously there must also be an adequate network infrastructure, but that's another problem.

The proposed solution is a minimal, functional and highly customizable proof of concept.  

I say customizable because you may want to allow Internet use in certain time slots, rather than just for a limited time (for example 5 hours in total), or provide access without authentication to the boss's computer!  

They are just examples but with the appropriate modifications (some more complex, some less complex) they can be done.  

The authentication part is handled by FusionAuth (who else?), while the logins will be performed by a specific script in python.  

I do not deny that there are many other things to say and to know, and there are several ways (even better) to implement what you will soon see: the important thing is to learn something new that can inspire ideas!

In this tutorial we will see how to:

- Prepare the test environment
- Install and configure the Linux components we need
- Install and set up FusionAuth
- Create the various scripts
- Test everything
- Massively create guest users

## Prerequisites

- A couple of virtual or physical machines: the first running at least Linux CentOS 8.2, the second we will use to browse the Internet after authentication.
- An Internet connection.
- A minimum of networking and Linux knowledge.

I would say that is everything. Here we go!

## Prepare the test environment

I specified a version of CentOS because there are differences between the various distributions and also between the same versions of a single distribution; the scripts have been tested with the specified version. Other versions and distributions may work but may require code changes.  

The use of virtual machines greatly simplifies the preparation and development because it allows, for example, to change the MAC address of a PC or to quickly add and remove network interfaces.  

The PC with CentOS will have two network cards: the first connected to the gateway or router so as to allow navigation and the second (or the others if, for example, there are more VLANs to serve) connected to the network of the devices that should be surfing. This is where the network infrastructure comes into play. There may be various access points connected to these physical networks. So, let's just make it simple to understand!  

The other device can be running anything: Windows, Linux, macOS ... We only need it for the surfing test.  

All configuration will be done on the PC running CentOS.


                                              +-------+ 
  +------+     +----------+      +-----------  PC1  |
  |      |     |ens37     |      |          +-------+
    |  GW  -------  CentOS  -------+             ...
  |      |     |     ens33|      |          +-------+
  +------+     +----------+      +-----------  PCn  |
                                              +-------+  

    ens33: 192.168.144.254            LAN PC 192.168.144.0/24


In the figure I have named the two network interfaces (`ens33` and `ens37`) and I have reported some IPs. The names of your interfaces may be different and the IPs are not to be replicated: in the scripts I refer to these elements, so I put them in the figure to make clear their role. Obviously you will have to modify the scripts according to your configuration.  

Let's also assume that there is a DHCP server on the PC network that distributes the `ens33` IP as a gateway for that network, therefore it has the `192.168.144.254` IP.

In the test phase you can manually set these parameters. DHCP will also need to distribute DNS which can be internal or external.  

Furthermore, the `ens37` interface must be set to allow navigation (TODO not sure I understand) (so it too must be served by a DHCP server or you will have to set it manually, it can be published directly or behind a router and therefore there will be a double NAT).  

Here we are not concerned with device security: PC1 and PCn are connected to the same network with all of the security implications. If they were connected to the WiFi network, you could activate the separation client on the access points in order to keep them safe. Remember that above I wrote: *"I do not deny that there are many other things to say and to know"*? 

Here we are only concerned with providing internet connectivity.

Now what we want to achieve is this:

             PC                            CentOS
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

All of the following commands must be run as `root`.

Activate SSH if you have not already done so, update the system and install the minimum necessary.

```shell
service sshd start
chkconfig --level 345 sshd on
yum upgrade
yum update
yum install nano wget tar zip rsyslog httpd -y
systemctl enable rsyslog
systemctl start rsyslog
cd /var/log/
```

After running these, check for the presence of the messages file to debug any error messages.

Next, set the correct parameters for the cards that need a static IP. To do so, go to the network scripts directory: `cd /etc/sysconfig/network-scripts`. For each card where it is necessary set the correct values, something similar to:

```
BOOTPROTO=static
IPADDR=192.168.144.133
PREFIX=24
```

Do not set the `DNS` and `gw` values for the NICs that will serve the PCs.
If there is more `gw`, delete them, leaving only the necessary one (TODO not sure I understand), using the command

```shell
ip route
```

Use the the appropriate parameters, paying attention to the fact that for the interfaces which were in DHCP, before a system restart, you will have the route but then it will disappear with the static IP.

Enable ipv4 packet forwarding:

```shell
echo 'net.ipv4.ip_forward = 1' > /etc/sysctl.d/01-ipv4.conf
```

Disable the firewall (with firewall active by default there are complications, we will activate what we need later):

```shell
systemctl disable firewalld
```

In `/etc/sysctl.conf` add the line that disables the console error notification of dropped packets, otherwise there will be a confusing amount of output on the screen:

```
kernel.printk = 4 1 1 7
```

Disable selinux by editing `/etc/sysconfig/selinux` and setting the first value to `disabled`. Restart CentOS to ensure this is disabled. Check if it has actually been disabled by running `sestatus`.

Also check that the deleted `gw` do not reappear. In this case it is possible that a network interface is still configured by DHCP.  

Make sure you can access the Internet from this machine: you will have to download several packages and in any case it will be this system that will allow access to the various PCs. If you can't surf from here, the others computers won't be able to either.

## Installing and setting up FusionAuth

Now we need to install FusionAuth and its components.

Install postgresql and configure the password:

```shell
yum -y install https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
dnf -qy module disable postgresql
dnf -y install postgresql12 postgresql12-server
/usr/pgsql-12/bin/postgresql-12-setup initdb
systemctl enable --now postgresql-12
su - postgres
psql -c "alter user postgres with password 'myComplexPassword'"
exit
```

Edit `/var/lib/pgsql/12/data/pg_hba.conf`. Search for the first occurrence of `127.0.0.1` and edit it by putting `"md5"` at the end of the line instead of `"ident"`.

Restart postgreSQL when you are back at the shell prompt:

```shell
systemctl restart postgresql-12
```

Now verify that the database works by connecting:

```shell
psql -U postgres -W -h 127.0.0.1 -p 5432
```

Enter your password. If you connect successfully, run `exit` to return to the prompt.

We are now ready to set up python!

```shell
yum install python3.8 redhat-rpm-config python38-devel -y
```
  
Then install these libraries:

```shell
pip3 install fusionauth-client
pip3 install getmac 
pip3 install pyyaml
```

Let's not forget FusionAuth.

```shell
sh -c "curl -fsSL https://raw.githubusercontent.com/FusionAuth/fusionauth-install/master/install.sh | sh"
```

Now start it and wait:

```shell
service fusionauth-app start
```

From a PC start a browser specifying the URL based on the IP of our CentOS machine to complete configuring FusionAuth. Something like `http://192.168.144.133:9011`.

You can find the IP addresses with the command

```shell
ip addr
```

Complete the setup procedure and enter "postgres" for the root database user and the password you chose earlier for the root database user password.

Wait for the set up to complete and then create the FusionAuth admin user, accepting the license.

pic TBD


Now that you are logged in as the FusionAuth administrator, navigate to "Applications". Create the application (using a name of something like WEBAuth). In the OAuth section set the redirect link for authorized post login users to be the same IP with a port of 8080. For example: `http://192.168.144.133:8080`.

This URL will also need to be set in the python scripts. Warning! It must be identical! Both here and in python scripts: if it ends with `/` here it must end with `/` in the .py scripts. Port 8080 is set in the python script; change it in both places if you want to use a different port.

Set the the logout URL to `http://192.168.144.133` which is the address of the Apache Server that will respond immediately after logout, so as to represent the login mask (TODO not sure I understand) at logout.  

Apache can run on this CentOS server, but it is not mandatory to use Apache or that it is on this server. Don't forget, the IPs I use may be different from yours; make the appropriate changes.

pic TBD

Save this application.  

Now "view" the application from the list (the green magnifying glass), to get various information you will need about this application; scroll down to the OAuth Configuration section: take note of the `Client ID` (which is the same as the application ID) and the `Client Secret`; these values will need to be set in the python script.

pic TBD

Navigate to "Settings", then "API Keys" and create a key with default values. Record the value of the key, as it will also have to be set in the python scripts.

Set the correct Timezone by going to "Settings" then "System" then to the "Reports" tab and updating the "Report timezone" value.

Next, create a test user in FusionAuth. Navigate to "Users" then click "Add" (the green plus). It is not necessary to specify an email address. Uncheck "Send email to setup password". Make sure you set a "Username" and "Password". Save the new user.

It is not necessary to add a registration. We'll only be checking if a user can authenticate, not if they are authorized. If you had different levels of users (perhaps a premium and entry level membership) you might want to create different applications and check for authorization.

While you're at it get the tenant ID by going to "Tenants" and looking for the "Id" value. You'll need this if you want to bulk create users.

You are well underway!

## Create the various scripts

Now create the file `/root/checkAccess.py`. In the declaration section, you'll want to replace the API key, Client ID and Client Secret parameters obtained above.

You must also set the interface and IP of the interface on the gateway network (not the IP of the gateway but of the CentOS interface on the gateway network).

Here's the declaration section excerpted, but of course please replace the values with those of your FusionAuth and network configuration:

```python
# ...
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
# ...
```

Let's look at the rest of `checkAccess.py`, but first, note that I allow external DNS access in the script. You may want to avoid this if you have internal DNS.  Here's the script: 

```python
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
  #          imagine that the various guest users (see specific script for the creation) can navigate only until the next reset of the rules.
  #          we do not want to be able to surf more days with the same coupon: therefore after accessing the user must be deleted (or deactivated).
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
```

The script accepts the redirect request from FusionAuth. To do this, it must always be active in the background because it must remain listening. If you don't run the script, nothing will happen after authentication.  

The script exchanges the `code` handed to it after a successful authentication for a token. If this succeeds, it is a valid login and the script proceeds to create the rules on the firewall via iptables commands to open up access to the device from which the request originated:

```python
# ...
authCode=parameters.get("code")
# ...
client_response = client.exchange_o_auth_code_for_access_token(authCode,applicationID,redirectURL,clientSecret)
if client_response.was_successful():
  print(client_response.success_response)
# ...
```

We also get the username because you may want to activate timed browsing or simply deactivate it immediately after logging in, so that it is not possible to share the credentials provided:

```python
# ...
jsonResponse=json.loads(str(client_response.success_response).replace("\'", "\""))        
userId= jsonResponse['userId']
userInfo=client.retrieve_user(userId)
userInfoStr= str(userInfo.success_response).replace("\'", "\"")
userInfoJson = yaml.load(userInfoStr, Loader=yaml.FullLoader)
userName = userInfoJson['user']['username']
userName = userName.lower()
# ...
```

The script must be run as root, since it has to execute `iptables` commands. Therefore, please read and understand the code. Just start it via rc.local or you can start it manually for testing. You could also run this script via a user who had sudo access and could only run `iptables`.

Now you have to create the script that prepares and restores the rules, preventing authenticated users from continuing to browse, if you want this behavior. For example, if you launch it at midnight you will reset the permissions and users will have to authenticate again.  

Note that at logout, which you can perform by accessing the appropriate URL, the script does not delete the rule that allows that device to browse. This function could be implemented so that those who log out stop consuming browsing time, if this is the your purpose. This is left as an exercise for the reader.

Create `/root/clearRules.sh` with the following content. Remember to set the internet connected interface in the script, the `gwInterface` variable.

You could modify the script to allow permanent access to the certain computers, such as the campsite host or your boss. You'd do this by opening, with the appropriate rules, the ports needed (such as WiFi and RJ45) for the MAC addresses of certain PCs. 

```shell
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
```

Make sure you chmod this script correctly so that it can be executed. 

```
chmod +x clearRules.sh
```

Make sure it will be started at boot (add it to `rc.local`) and put it in the crontab to run every day at midnight. 

### Set up a web server 

Setting up apache is optional, but helpful. In testing, it becomes tedious to log out and then re-enter the url to return to the login page. Let's create a static html page with the needed URL to make this process easier.

```shell
cd /var/www/html/
```

Create an `index.html` file and place the following HTML in it. Replace the `client_id`  with your value from the FusionAuth application details page. Also remember to change the IP address (in 4 places) and possibly the port 8080 (the redirect URL you set in FusionAuth, with or without the trailing `/`, remember?).  

This will be the file that allows you to automatically redirect to the authentication page without having to write the full URL each time.

```html
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
```

Finally start apache and make sure it starts up on system boot.

```shell
systemctl start httpd
systemctl enable httpd
```

## Test everything

You are ready to prove everything works! 

Apache is already running.

Run the `/root/clearRules.sh` script, this will reset all previous rules, and whoever is logged in will have to do it again. 

1. Start the python script: `python3 /root/checkAccess.py`. This script will remain running waiting for the various redirect post login of the browser (until you to press CTRL-C to terminate it).
1. Now open a browser on the second machine. It must have the IP of the CentOS machine as a gateway (remember to set the DNS as well if you want). Try to visit a website - you won't be able to. Now go to the CentOS IP: http://192.168.144.133 and the redirect to the FusionAuth login screen will happen. If the redirect doesn't work, it means that the `index.html` page has an issue. Double check that it was created correctly. If necessary, manually enter the URL for authentication of the WEBAuth app.
1. Log in with the test user you created earlier. The post login outcome should be "Access granted!"
1. You should now be able to browse freely.
1. If you change MAC Address or IP of this device you will see that navigation is not allowed. By changing back to the original values it will work again.
1. If you run the `clearRules.sh` script you will not be able to navigate until you authenticate again.

Perfect!

## Bulk create guest users

You may want to create many users at once. If you were providing access to campsite guests, you'd provide them paper tickets to allow them to login. This script does just that.  

This is a working example with some rough edges, similar to the other scripts. Just a warning.

After running this script, you will get a file with the list of credentials (which you can print through a mail merge for example) of users created in FusionAuth. Remember that once they have logged in you should also disable or delete the user otherwise with a voucher you will allow access in the future. You can do this by having an admin user modify them in the administrative user interface after they've logged in, or using the FusionAuth API to automatically disable the user as soon as the iptable commands are run. The latter functionality is also left as an exercise for the reader.

This script avoids ambiguous characters in the generation of credentials to avoid user confusion. Make sure you update it with your API key, application id (same as the `Client ID`) and tenant id, if needed.

```python
from fusionauth.fusionauth_client import FusionAuthClient
from datetime import datetime
import sys
import random
import string
  
api_key=<your api key>

def get_random_string(length):
  sample_letters = 'abcdefghimnpqrstuvzxykjy23456789ABCDEFGHLMNPQRSTUVZWYJKX'
  result_str = ''.join((random.choice(sample_letters) for i in range(length)))
  return result_str

def get_random_number(length):
  sample_letters = '23456789'
  result_str = ''.join((random.choice(sample_letters) for i in range(length)))
  return result_str

######################################################################################################
client = FusionAuthClient(api_key, 'http://127.0.0.1:9011')
application_id='5ef574b6-6929-427b-8f39-ec82ffc4e15b'
# if you have one tenant, it is not needed
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
```

## Conclusion

In this tutorial we have seen many things. We have worked on Linux, with iptables, with FusionAuth, with Apache, with Python, with networks. It was an interdisciplinary tutorial. It's a proof of concept so I didn't make everything too elegant, but it's a good starting point on which to expand.  

I hope you enjoyed it.  

If you have any comments or questions, please post them below.

