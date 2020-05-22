[#setting url_escaping_charset="UTF-8"]
You have requested to log into FusionAuth using this email address. If you do not recognize this request please ignore this email.

[#-- The optional 'state' map provided on the Start Passwordless API call is exposed in the template as 'state' --]
[#assign url = "http://localhost:9011/oauth2/passwordless/${code}?tenantId=${user.tenantId}" /]
[#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]

${url}

- FusionAuth Admin
