Your account has been created and you must set up a password. Click on the following link to set up your password.
<p>
  [#assign url = "${baseUrl}/password/change/${changePasswordId}?client_id=${(application.oauthConfiguration.clientId)!''}&tenantId=${user.tenantId}" /]
  <a href="${url?html}">
    ${url?html}
  </a>
</p>
- FusionAuth Admin
