[#-- this email goes to the existing account, so don't show details about the new signup --]
Someone tried to create an account with a login Id that already belongs to your account. FusionAuth didn't create the account.

[#if application??]
If you tried to sign up and forgot your password, reset your password:

${baseUrl}/password/forgot?client_id=${application.oauthConfiguration.clientId}&tenantId=${tenant.id}

[/#if]
- FusionAuth Admin
