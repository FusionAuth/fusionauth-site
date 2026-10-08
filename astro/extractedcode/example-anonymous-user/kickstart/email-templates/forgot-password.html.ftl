[#setting url_escaping_charset="UTF-8"]
[#if state.anon_user??]
To set your password click on the following link.
[#else]
To change your password click on the following link.
[/#if]
<p>
  [#-- The optional 'state' map provided on the Forgot Password API call is exposed in the template as 'state' --]
  [#assign url = "http://localhost:9011/password/change/${changePasswordId}?tenantId=${user.tenantId}" /]
  [#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]
  <a href="${url}">${url}</a>
</p>
- FusionAuth Admin
