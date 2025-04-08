[#if user.verified]
Pro tip, your email has already been verified, but feel free to complete the verification process to verify your verification of your email address.
[/#if]

[#-- When a one-time code is provided, you will want the user to enter this value interactively using a form. In this workflow the verificationId
     is not shown to the user and instead the one-time code must be paired with the verificationId which is usually in a hidden form field. When the two
     values are presented together, the email address can be verified --]
[#if verificationOneTimeCode??]
To complete your email verification enter this code into the email verification form.

${verificationOneTimeCode}
[#else]
To complete your email verification click on the following link.

http://localhost:9011/email/verify/${verificationId}?client_id=${(application.oauthConfiguration.clientId)!''}&postMethod=true&tenantId=${user.tenantId}
[/#if]

- FusionAuth Admin