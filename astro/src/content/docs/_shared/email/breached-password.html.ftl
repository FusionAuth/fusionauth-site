[#setting url_escaping_charset="UTF-8"]
<p>This password was found in the list of vulnerable passwords, and is no longer secure.</p>

<p>In order to secure your account, it is recommended to change your password at your earliest convenience.</p>

<p>Follow this link to change your password.</p>

<a href="http://localhost:9011/password/forgot?client_id=${(application.oauthConfiguration.clientId)!''}&email=${user.email?url}&tenantId=${user.tenantId}">
  http://localhost:9011/password/forgot?client_id=${(application.oauthConfiguration.clientId)!''}&email=${user.email?url}&tenantId=${user.tenantId}
</a>

- FusionAuth Admin