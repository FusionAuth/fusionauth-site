[#-- this email goes to the existing account, so don't show details about the new signup --]
<p>
  Someone tried to create an account with a login Id that already belongs to your account. FusionAuth didn't create the account.
</p>
[#if application??]
<p>
  If you tried to sign up and forgot your password, reset your password:
  [#assign url = "${baseUrl}/password/forgot?client_id=${application.oauthConfiguration.clientId}&tenantId=${tenant.id}" /]
  <a href="${url?html}">${url?html}</a>
</p>
[/#if]
- FusionAuth Admin
