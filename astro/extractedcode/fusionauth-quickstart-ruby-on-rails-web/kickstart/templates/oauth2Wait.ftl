[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="code" type="java.lang.String" --]
[#-- @ftlvariable name="identityProviderId" type="java.util.UUID" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="waitURL" type="java.lang.String" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head title=theme.message("wait-title")]
  <meta http-equiv="Refresh" content="2; url=${waitURL}">
  [/@helpers.head ]

  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message("waiting")]
      <span>${theme.message("complete-external-login")}</span>
      <p class="mt-2">[@helpers.link url="/oauth2/authorize"]${theme.message("return-to-login")}[/@helpers.link]</p>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
