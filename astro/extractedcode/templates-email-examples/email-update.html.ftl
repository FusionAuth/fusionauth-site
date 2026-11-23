<p>
[#if previousEmail??]
  The email address for your account changed from ${previousEmail} to ${user.email}.
[#else]
  The email address ${user.email} was added to your account.
[/#if]
</p>
<p>
  If you didn't make this change, contact support right away.
</p>
- FusionAuth Admin
