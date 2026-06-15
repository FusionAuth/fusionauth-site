[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="confirmationRequiredReason" type="java.lang.String" --]
[#-- @ftlvariable name="csrfToken" type="java.lang.String" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#import "_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head title=theme.message("confirmation-required")]
    [#-- Custom <head> code goes here --]
  [/@helpers.head ]
  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message("confirmation-required")]

      [#-- Message specific to the reason the user is being required to confirm.
           - Adding ?no_esc to allow the message to include <br> (line breaks)
       --]
      [#if confirmationRequiredReason?has_content]
        <p> ${theme.message("{description}confirmation-required-${confirmationRequiredReason}")?no_esc} </p>
      [/#if]

      [#-- Generic detail about what to do next --]
      <p class="mb-4">${theme.message("{description}confirmation-required-ignore")}</p>

      <form action="${request.contextPath}/confirmation-required" method="POST" class="full">
        <input type="hidden" name="csrfToken" value="${csrfToken!""}"/>
        [#list request.parameters as key,value]
          [#list value as v]
          <input type="hidden" name="${key!""}" value="${v!""}"/>
          [/#list]
        [/#list]
        <div class="form-row">
          [@helpers.button text=theme.message('continue') /]
        </div>
      </form>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
