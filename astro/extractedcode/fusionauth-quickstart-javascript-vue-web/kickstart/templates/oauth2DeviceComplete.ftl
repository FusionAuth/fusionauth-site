[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="completedLinks" type="java.util.List<io.fusionauth.domain.provider.PendingIdPLink>" --]
[#-- @ftlvariable name="currentUser" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head title=theme.message("device-title")/]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message("device-form-title")]
      [#if completedLinks?has_content]
        [#if completedLinks?size == 1]
        ${theme.message('completed-link', completedLinks.get(0).identityProviderType)}
        [#elseif completedLinks?size == 2]
        ${theme.message('completed-links', completedLinks.get(0).identityProviderType.name(), completedLinks.get(1).identityProviderType.name())}
        [/#if]
      [/#if]
      <p>
        ${theme.message('device-login-complete')}
      </p>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
