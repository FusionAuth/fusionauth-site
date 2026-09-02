[#setting url_escaping_charset="UTF-8"]
[#if event.type == "UserLoginSuspicious"]
A suspicious login was made on your account. If this was you, you can safely ignore this message. If this wasn't you, we recommend that you change your password as soon as possible.
[#elseif event.type == "UserLoginNewDevice"]
A login from a new device was detected on your account. If this was you, you can safely ignore this message. If this wasn't you, we recommend that you change your password as soon as possible.
[#else]
Suspicious activity has been observed on your account. In order to secure your account, it is recommended to change your password at your earliest convenience.
[/#if]

Device details

* Device name: ${(event.info.deviceName)!'-'}
* Device description: ${(event.info.deviceDescription)!'-'}
* Device type: ${(event.info.deviceType)!'-'}
* User agent: ${(event.info.userAgent)!'-'}

Event details

* IP address: ${(event.info.ipAddress)!'-'}
* City: ${(event.info.location.city)!'-'}
* Country: ${(event.info.location.country)!'-'}
* Zipcode: ${(event.info.location.zipcode)!'-'}
* Lat/long: ${(event.info.location.latitude)!'-'}/${(event.info.location.longitude)!'-'}

- FusionAuth Admin
