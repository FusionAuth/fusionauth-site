<p>
  The password for ${user.email} changed. The request came from IP address ${(event.info.ipAddress)!'unknown'}.
</p>
<p>
[#if application??]
  If you didn't make this change, reset your password:
  [#assign url = "${baseUrl}/password/forgot?client_id=${application.oauthConfiguration.clientId}&tenantId=${tenant.id}" /]
  <a href="${url?html}">${url?html}</a>
[#else]
  If you didn't make this change, contact support right away.
[/#if]
</p>
- FusionAuth Admin
