The password for the account with phone number ${user.phoneNumber} changed. The request came from IP address ${(event.info.ipAddress)!'unknown'}.
[#if application??]

If you didn't make this change, reset your password:

${baseUrl}/password/forgot?client_id=${application.oauthConfiguration.clientId}&tenantId=${tenant.id}
[#else]

If you didn't make this change, contact support right away.
[/#if]

- FusionAuth Admin
