[#-- @ftlvariable name="event" type="io.fusionauth.domain.event.UserLoginSuspiciousEvent" --]
[#setting url_escaping_charset="UTF-8"]
[#if event.type == "UserLoginSuspicious"]
  <p>A suspicious login was made on your account. If this was you, you can safely ignore this email. If this wasn't you, we recommend that you change your password as soon as possible.</p>
[#elseif event.type == "UserLoginNewDevice"]
  <p>A login from a new device was detected on your account. If this was you, you can safely ignore this email. If this wasn't you, we recommend that you change your password as soon as possible.</p>
[#else]
  <p>Suspicious activity has been observed on your account. In order to secure your account, it is recommended to change your password at your earliest convenience.</p>
[/#if]

<p>Device details</p>
<ul>
  <li><strong>Device name:</strong> ${(event.info.deviceName)!'&mdash;'}</li>
  <li><strong>Device description:</strong> ${(event.info.deviceDescription)!'&mdash;'}</li>
  <li><strong>Device type:</strong> ${(event.info.deviceType)!'&mdash;'}</li>
  <li><strong>User agent:</strong> ${(event.info.userAgent)!'&mdash;'}</li>
</ul>

<p>Event details</p>
<ul>
  <li><strong>IP address:</strong> ${(event.info.ipAddress)!'&mdash;'}</li>
  <li><strong>City:</strong> ${(event.info.location.city)!'&mdash;'}</li>
  <li><strong>Country:</strong> ${(event.info.location.country)!'&mdash;'}</li>
  <li><strong>Zipcode:</strong> ${(event.info.location.zipcode)!'&mdash;'}</li>
  <li><strong>Lat/long:</strong> ${(event.info.location.latitude)!'&mdash;'}/${(event.info.location.longitude)!'&mdash;'}</li>
</ul>

- FusionAuth Admin
