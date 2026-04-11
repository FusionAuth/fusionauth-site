[#-- When a one-time code is provided, you will want the user to enter this value interactively using a form. In this workflow the verificationId
     is not shown to the user and instead the one-time code must be paired with the verificationId which is usually in a hidden form field. When the two
     values are presented together, the phone number can be verified --]
[#if verificationOneTimeCode??]
Verification code: ${verificationOneTimeCode}
[#else]
To complete your phone number verification click on the following link.

http://localhost:9011/phone/verify/${verificationId}?client_id=${(application.oauthConfiguration.clientId)!''}&tenantId=${tenant.id}
[/#if]

- FusionAuth Admin
