[#setting url_escaping_charset="UTF-8"]
To change your password click on the following link.
<p>
  [#-- The optional 'state' map provided on the Forgot Password API call is exposed in the template as 'state'.
       If we have an application context, append the client_id to ensure the correct application theme when applicable.
  --]
  [#assign url = "http://localhost:9011/password/change/${changePasswordId}?client_id=${(application.oauthConfiguration.clientId)!''}&tenantId=${user.tenantId}" /]
  [#list state!{} as key, value][#if key != "tenantId" && key != "client_id" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]
  <a href="${url}">${url}</a>
</p>
- FusionAuth Admin
