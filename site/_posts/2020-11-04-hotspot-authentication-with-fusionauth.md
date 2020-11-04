---
layout: blog-post
title: Controlling a hotspot with FusionAuth authentication
description: Implement authentication and authorization using FusionAuth to allow web surfing at devices behind a firewall
image: blogs/controlling-hotspot/controlling-a-hotspot-with-fusionauth-authentication.png
author: Mauro Viola
category: blog
tags: client-python 
excerpt_separator: "<!--more-->"
---

In this post, the goal is to allow web browsing only for users who have been authenticated. Imagine a campsite, a hotel, or a company that wants to provide this service to its visitors. There should also be adequate network infrastructure, but that's beyond the scope of this post.

The proposed solution is a minimal, functional and highly customizable proof of concept.  

<!--more-->

I say customizable because there are obvious extensions. You may want to allow internet use in certain time slots, rather than just for a limited time or provide access without authentication to the boss's computer! With appropriate modifications they can be done.  

The authentication is handled by FusionAuth (what else?), while the network access is performed by a Python script.  

In this tutorial we will:

- Prepare the test environment
- Install and configure the Linux components we need
- Install and set up FusionAuth
- Create the various scripts
- Test everything
- Create guest users in bulk

## Prerequisites

- A couple of virtual or physical machines: the first running Linux CentOS 8.2 and the second to browse the internet after authentication.
- An internet connection.
- Intermediate levels of networking and Linux knowledge.

Here we go!

## Prepare the test environment

In the prerequisites I specified a version of CentOS because there are differences between the various distributions and also between the same versions of a single distribution; the scripts have been tested with CentOS 8.2. Other versions and distributions could work but may require changes.

The use of virtual machines greatly simplifies the preparation and development because it allows you, for example, to change the MAC address of a computer or to quickly add and remove network interfaces.  

The computer with CentOS will have two network cards: the first connected to the gateway or router, to allow internet access, and the second (or third, fourth and so on if, for example, there are more VLANs to serve) connected to the network of the devices that should be surfing. This is where network infrastructure comes into play. There may also be various access points connected to our CentOS server as well. These can be used to provide access to any devices via a WiFi connection rather than a hardwired connection.

For our example, the second "device" (the second virtual machine in our example) can be running anything: Windows, Android, iOS, Linux, or macOS. We only need it to test internet connectivity. All configuration will be done on the computer running CentOS.

Here's a diagram of the setup and network:

```
Internet Gateway        Gateway Server                Device Network

                                                      +------------+ 
    +------+             +----------+      +-----------  device 1  |
    |      |             |ens37     |      |          +------------+
    |  GW  ---------------  CentOS  -------+               ...
    |      |             |     ens33|      |          +------------+
    +------+             +----------+      +-----------  device n  |
                                                      +------------+  

                    ens33: 192.168.144.254          LAN 192.168.144.0/24
```

In the figure I have named the two network interfaces (`ens33` and `ens37`) on the Gateway Server. I also specified some IP addresses for the Gateway Server and the Device Network. The names of your interfaces will be different, as will the IP addresses. However, in the code I refer to these elements, so I put them in the figure to make clear their roles. You will have to modify the code according to your configuration.  

Let's also assume that there is a DHCP server on the Device Network that distributes the `ens33` IP as a gateway for that network, therefore it has the address `192.168.144.254`.

In the test phase you can manually set these parameters. DHCP will also need to distribute a DNS server IP which can be internal or external.  

Furthermore, the `ens37` interface must be connected to the outside internet. The associated IP address must be served by a DHCP server or you will have to set it manually. It can be published directly or behind a router which will be a double NAT.

In this post, we are only concerned with providing internet connectivity, not with device security: `device 1` and `device n` are connected to the same network with all of the security implications that come along with it. If they were connected to the WiFi network, you could activate client separation on the access points in order to keep different clients separate and more secure. 

We want to achieve is this flow:

```
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
```

That's where you'll end up at the end of this tutorial: with firewalls generated automatically when a user authenticates. When we say firewall rules, we really mean IP routing rules. We'll be using `iptables` later in this guide to configure how traffic is routed between the network interfaces on our Gateway Server. 

## Install and configure needed Linux packages

All of the following commands must be run as `root`.

First, you'll enable SSH if you have not already done so, update the system and install the necessary packages.

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

After running these commands, check for logs in the `/var/log/messages` file to debug any errors.

Next, set the correct parameters for the network interfaces to assign them both a static IP. To do so, go to the network scripts directory: `cd /etc/sysconfig/network-scripts`. For each interface with a static IP, set the correct values, something similar to:

```
BOOTPROTO=static
IPADDR=192.168.144.133
PREFIX=24
```

Do not set any `DNS` or `GATEWAY` values for the `ens33` network interface. This might seem counterintuitive, but don't worry, we'll be using code to connect the Device Network to the Internet Gateway below. Additionally, if there are more gateways configured on the system, we'll need to remove them from the networking subsystem. This simplifies our network configuration. You could have more than one, but it is beyond the scope of this tutorial. You can remove them using the command:

```shell
ip route <args>
```

Make certain that you use the correct arguments for this command. Pay attention to the fact that for the interfaces which were in DHCP before a system restart, you will have the route but then it will disappear when the system is configured with the static IP and restarted.

Next, we need to enable ipv4 packet forwarding:

```shell
echo 'net.ipv4.ip_forward = 1' > /etc/sysctl.d/01-ipv4.conf
```

And finally we need to disable the firewall. Using the default firewall settings will cause numerous issues with our solution. Instead, we will enable specific firewall rules (via iptables) later in the guide with our Python code. Here's how you disable the firewall:

```shell
systemctl disable firewalld
```

Now that our network configuration is finished, we need to disable console error notification of dropped packets, otherwise there will be a confusing amount of output on the system. To disable console errors, add this line to the `/etc/sysctl.conf` file: 

```
kernel.printk = 4 1 1 7
```

Next, disable `selinux` by editing `/etc/sysconfig/selinux` and setting the first value to `disabled`. Restart CentOS to ensure this is disabled. Check if it has actually been disabled by running `sestatus`.

Also check that the deleted `GATEWAY` entries do not reappear. If they do, it is possible that a network interface is still configured by DHCP.  

Make sure you can still access the internet from the Gateway Server machine at this point. This will ensure that the `ens37` network interface still has a GATEWAY defined and it correctly connects to the Internet Gateway. This is necessary because you still need to download several packages. Plus, this is the server that will allow the Device Network access to the Internet. If you can't surf from here, none of the devices in the Device Network will be able to either.

## Installing and setting up FusionAuth

Now we need to install FusionAuth and its components. 

Install PostgreSQL and configure the password:

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

Edit `/var/lib/pgsql/12/data/pg_hba.conf`. Search for the first occurrence of `127.0.0.1` and edit it by putting `"md5"` at the end of the line instead of `"ident"`. This will allow password authentication for a postgresql super user.

Restart PostgreSQL when you are back at the shell prompt:

```shell
systemctl restart postgresql-12
```

Now verify that the database works by connecting:

```shell
psql -U postgres -W -h 127.0.0.1
```

Enter your password. If you connect successfully, type `exit` to return to the prompt. We are now ready to set up Python!

```shell
yum install python3.8 redhat-rpm-config python38-devel -y
```
  
Then install these Python libraries:

```shell
pip3 install fusionauth-client
pip3 install getmac 
pip3 install pyyaml
```

Let's not forget FusionAuth. You can use any of the [supported installation methods](/docs/v1/tech/installation-guide/). I'll use the Quick Install method via the `install.sh` script like this:

```shell
sh -c "curl -fsSL https://raw.githubusercontent.com/FusionAuth/fusionauth-install/master/install.sh | sh"
```

Now start it and wait:

```shell
systemctl start fusionauth-app
```

From a PC start a browser specifying the URL with the IP of our CentOS machine and the port of `9011` to complete configuring FusionAuth. This will look something like `http://192.168.144.133:9011`.

You can find the IP address with the command:

```shell
ip addr
```

Complete the set up and enter `postgres` for the root database user and the password you chose earlier for the root database user password. Wait for the set up to complete and then create the FusionAuth admin user, accepting the license.

{% include _image.liquid src="/assets/img/blogs/hotspot-with-fusionauth/setup-wizard.png" alt="The setup wizard screen." class="img-fluid" figure=false %}

Now that you are logged in as the FusionAuth administrator, navigate to "Applications". Create an application (we'll use the name "WEBAuth"). In the OAuth section set the redirect link for authorized post login users to be the same IP with a port of 8080. For example: `http://192.168.144.133:8080`.

This URL will also need to be set in the Python scripts. Warning! It must be identical! Both here and in Python scripts: if it ends with `/` here it must end with `/` in the `.py` scripts.

Set the logout URL to `http://192.168.144.133` which is the address of the Apache server. We'll set this up later, but it will serve up a static html file to make logging in and out easier. Apache can run on this CentOS server, but it is not mandatory to use Apache, as all it is doing is serving up that html file with convenient links. You could use NGinx or any other web server you prefer. Don't forget, the IPs I use may be different from yours; make the appropriate changes.

{% include _image.liquid src="/assets/img/blogs/hotspot-with-fusionauth/adding-application.png" alt="Adding the WEBAuth application." class="img-fluid" figure=false %}

Save this application by clicking the blue disk icon.  

Now view the application from the list (the green magnifying glass), to get various information you will need about this application. Scroll down to the OAuth Configuration section and take note of the `Client ID` (which is the same as the application ID) and the `Client Secret`. These values will need to be set in the Python script covered below.

{% include _image.liquid src="/assets/img/blogs/hotspot-with-fusionauth/client-id-and-client-secret.png" alt="Finding the Client ID and Client Secret." class="img-fluid" figure=false %}

Navigate to "Settings", then "API Keys" and create a key. Note the value of the key, as it will also have to be set in the Python scripts.

Set the correct Timezone by going to "Settings" then "System" then to the "Reports" tab and updating the "Report timezone" value.

Next, create a test user in FusionAuth. Navigate to "Users" then click "Add" (the green plus). It is not necessary to specify an email address. Uncheck "Send email to setup password". Make sure you set a "Username" and "Password". Save the new user.

{% include _image.liquid src="/assets/img/blogs/hotspot-with-fusionauth/adding-user.png" alt="Adding a test user." class="img-fluid" figure=false %}

It is not necessary to add a registration for this user. We'll only be checking if a user can authenticate, not if they are authorized for a particular FusionAuth application or have a role. If you had different levels of users, such as a premium and entry level membership, you could create different roles and check for authorization in the Python script.

While you're at it, get the tenant ID by going to "Tenants" and looking for the "Id" value. You'll need this if you have multiple Tenants in FusionAuth (which it supports nicely) and need to call any of the FusionAuth APIs.

You are well underway!

## Create the network control scripts allowing internet access for authenticated users

Create `/root/checkAccess.py` which is the Python script that will receive an authenticated user and make the changes to the firewall (iptables routing rules). Note that I allow external DNS access in the script. You may want to avoid this if you have internal DNS.  Here are the contents of the `/root/checkAccess.py` script: 

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
clientSecret='2sRxJ1BXglI2TwptwpJ--b-PI6xu3ArUK9LnmViAKWs'
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

In the declaration section, replace the `apiKey`, `applicationID`, and `clientSecret` variables with the values you collected from FusionAuth above. You must also set the interface name and IP of the `ens37` network interface on the Gateway Server (not the IP of the `ens33` interface which services the Device Network). This is the network interface that will provide access to the Internet Gateway.

Here's the declaration section, but of course please replace the values with those of your FusionAuth and network configuration:

```python
# ...
##############################################################
# Declaration Section
##############################################################
apiKey='yfEzL94JXNFKotLzH75My-s96Bh4oTb9-wkhXe--iUs'
applicationID='4616f048-dd20-47cc-b7a0-33b2c0f237f6'
clientSecret='2sRxJ1BXglI2TwptwpJ--b-PI6xu3ArUK9LnmViAKWs'
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

The script accepts the redirect request from FusionAuth. It must always be active in the background. If the script isn't running, nothing will happen after the user authenticates.  

The script exchanges the `code` handed to it after a successful authentication for a token. If this exchange succeeds, it is a valid login and the script proceeds to create the rules on the firewall via `iptables` commands. Use these commands to open up internet access to the device from which the request originated:

```python
# ...
authCode=parameters.get("code")
# ...
client_response = client.exchange_o_auth_code_for_access_token(authCode,applicationID,redirectURL,clientSecret)
if client_response.was_successful():
  print(client_response.success_response)
# ... open up internet access
```

We also retrieve the username because you may want to activate timed browsing or simply deactivate the account immediately after the user logs in, to prevent sharing of credentials:

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

The script must be run as `root`, since it has to execute `iptables` commands. Therefore, please read and understand the code. Start it via `rc.local` or start it manually for testing. You could also run this script via a user who had sudo access and could only run `iptables` if you didn't want to run it as `root`.

Note that at logout, which you can perform by accessing the appropriate URL, our Python script does not delete the rule that allows that device to browse. This function could be implemented so that those who log out stop consuming bandwidth. This is left as an exercise for the reader.

Next, I recommend creating a script that restores the original `iptables` routing rules. This prevents authenticated users from continuing to browse forever, if you want to prevent that. For example, if you run this script at midnight you will reset the permissions and users will have to authenticate again.

Create the file `/root/clearRules.sh` with the content below. Remember to set the `ens37` network interface information in the script if yours is different (the `gwInterface` variable).

You could also modify the script to allow permanent access to certain computers, such as a campsite host or your boss. You'd do this by opening, with the appropriate rules, the ports needed (such as WiFi and RJ45) for the MAC addresses of those PCs. 

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
iptables -w -A OUTPUT  -j LOG  --log-level info --log-prefix "OUTPUT -- DENY " # TODO should it be output?
iptables -w -A INPUT   -j LOG  --log-level info --log-prefix "INPUT -- DENY "
iptables -w -A FORWARD -j LOG  --log-level info --log-prefix "FORWARD -- DENY "
iptables -w -N clientRule
iptables -w -A clientRule  -j ACCEPT
```

Make sure you make this script executable: `chmod +x clearRules.sh`.

Ensure it will be started at boot (by adding it to `rc.local`) and put it in the crontab to run every day at midnight as well. This resets your network config to a nice known state regularly.

### Set up a web server 

Setting up apache is optional, but helpful. In testing, it becomes tedious to log out and then re-enter the URL to return to the login page. Let's create a static html page with the needed URL to make this process easier. Go to the `/var/www/html` directory.

Create an `index.html` file and place the following HTML in it. Replace the `client_id` with your value from the FusionAuth application details page. Also remember to change the IP address (in all four places) and possibly the port 8080 (this is the redirect URL you set in FusionAuth).  

This file automatically redirects any visitors to the authentication page without having to write the full URL in the browser each time.

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

Finally start apache and make sure it also starts on system boot.

```shell
systemctl start httpd
systemctl enable httpd
```

## Test everything

You are ready to prove everything works! 

Run the `/root/clearRules.sh` script, this will reset all previous rules, and whoever is logged in will have to do it again. 

1. Start the Python script: `python3 /root/checkAccess.py`. This script will remain running, waiting for the redirects after login (until you press CTRL-C to terminate it).
1. Now open a browser on the second machine. It must have the IP of the CentOS machine as a gateway (remember to set the DNS as well if you want). Try to visit a website; you won't be able to. Now go to the CentOS URL: `http://192.168.144.133` and the redirect to the FusionAuth login screen will occur. If the redirect doesn't work, it means that the `index.html` page has an issue. Double check that it was created correctly. If necessary, manually enter the login URL of the FusionAuth OAuth login for the WEBAuth application (you can get this URL from the FusionAuth admin UI by clicking on the green view button for the Application).
1. Log in with the test user you created earlier. The post login outcome should be "Access granted!"
1. You should now be able to browse freely.
1. If you change the MAC Address or IP of this device you will see that navigation is not allowed. By changing back to the original values it will work again.
1. If you run the `clearRules.sh` script you will not be able to navigate until you authenticate again.

Perfect!

## Bulk create guest users

You may want to create many users at once. If you were providing access to campsite guests, you'd provide them paper tickets to allow them to login. This is a working example of user creation with some rough edges, similar to the other scripts. 

After running this script, you will get a file with the list of credentials of users created in FusionAuth, which you can print through a mail merge. Remember that once they have logged in you should also disable or delete the user otherwise anyone with a voucher will have access in the future. You disable accounts by having an admin user modify them in the FusionAuth admin UI, or using the FusionAuth API to automatically disable the user as soon as the `iptables` commands are run. The latter functionality is also left as an exercise for the reader.

This script avoids ambiguous characters in the generation of credentials to avoid user confusion. Make sure you update it with your API key, application id (which is the same as the `Client ID`) and tenant id, if needed.

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

print ('This script generates a list of guest users on FuzionAuth for internet access.')
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

In this tutorial we have seen many things. We have worked on Linux, with `iptables`, with FusionAuth, with Apache, with Python, and with networks. It was an interdisciplinary tutorial that should help you learn how to leverage FusionAuth for new use cases such as granting access to WiFi at a facility (such as a campground).  

I hope you enjoyed it. If you have any comments or questions, please post them below. Happy coding!

