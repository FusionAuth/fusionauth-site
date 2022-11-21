---
layout: post
title:  "Adding a messenger to FusionAuth using Twilio"
date:   2022-11-21 05:39:12 -0600
categories: jekyll update
---
![FusionAuth logo](/site/assets/img/blogs/Assets-Twilio-Integration/0.png){:class="img-fluid" figure=false }


One of the spicier features of FusionAuth's multi factor authentication is the ability to login using an SMS push messages  to your mobile phone. But how do we this in our settings? Fear not, for this blog post is here to help. You'll need a Twilio trial account with a number set up (we'll do this together)

# <font size =10>Twilio Setup</font>
![Twilio Page login](/site/assets/img/blogs/Assets-Twilio-Integration/Twilio.png){: class="img-fluid" figure=false}

Head over to [Twilio](https://www.twilio.com/) and create an account. Once you're all setup we're going to scroll down and take a look at Account Info. Note the Account SID and Auth Token. We're going to use these later to connect our FusionAuth account.  

![Twilio SID info](/site\assets\img\blogs\Assets-Twilio-Integration\TwilioSID.png){: class="img-fluid" figure=false }

Next in the box above there is an option to get a number. This one is part of the free trial account and will be assigned as long as you're under the free trial. After you click the button, you'll see your number under your account info. Take note of this as well as we'll use this in our FusionAuth setup later. 

## <font size =10>FusionAuth + Twilio = 🗨️</font>

We'll open FusionAuth and navigate to Settings. From there to the Messengers configuration. 

In the corner you'll see a + sign with a dropdown menu. Choose add a Twilio Messenger. Note there are options for Generic and Kafka messengers as well if those fit better into your program.

![Twilio add to Messengers](/site\assets\img\blogs\Assets-Twilio-Integration\AddTwilio3.png){: class="img-fluid" figure=false }

From here we're going to name our Messenger. I chose Twilio but any name will do. Next we'll add our Account SID, Auth Token, and phone number that we noted earlier from our Twilio account information. Once that's done you can enter your phone number to send a test txt to make sure everything is integrated. From there hit save and your messenger will be ready to use in your FusionAuth tenants. 

![Twilio Info input](/site\assets\img\blogs\Assets-Twilio-Integration\TwilioInfo.png)

Lets navigate to the Tenants configuration and the scroll down to SMS settings. Click enabled and the messenger option will appear. From here you can choose the messenger that we just set up.   

![Tenants](/site\assets\img\blogs\Assets-Twilio-Integration\SMSsetting.png)

And there you have it! Twilio integrated into your FusionAuth, ready to be used in your multi factor authentication. 

![Txt img](/site\assets\img\blogs\Assets-Twilio-Integration\SMS.jpg){: width="300" }


