[#-- FusionAuth sends this message to the previous phone number and to the new one --]
[#if (event.previousLoginId)?? && (event.newLoginId)??]
The phone number for your account changed from ${event.previousLoginId} to ${event.newLoginId}.
[#elseif (event.previousLoginId)??]
The phone number ${event.previousLoginId} was removed from your account.
[#else]
The phone number for your account changed.
[/#if]
If you didn't make this change, contact support right away.

- FusionAuth Admin
