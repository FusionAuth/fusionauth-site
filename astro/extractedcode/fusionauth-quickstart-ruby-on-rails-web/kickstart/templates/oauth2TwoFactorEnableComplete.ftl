[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="currentUser" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="recoveryCodes" type="java.util.List<java.lang.String>" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="version" type="java.lang.String" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head]
    [#-- Custom <head> code goes here --]
  [/@helpers.head]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message("two-factor-recovery-codes")]
      [#setting url_escaping_charset='UTF-8']
      <form action="${request.contextPath}/oauth2/two-factor-enable-complete" method="POST" class="full">
        [@helpers.oauthHiddenFields/]
        <p class="mt-0"> ${theme.message("{description}oauth2-recovery-codes-1")} </p>
        <fieldset>
          <div class="code d-flex" style="justify-content: center; flex-wrap: wrap; gap: 5px 15px;">
            [#list recoveryCodes as code]<div>${code}</div>[/#list]
          </div>
          <p> ${theme.message("{description}oauth2-recovery-codes-2")}  </p>
        </fieldset>
        <div class="form-row">
          [@helpers.button text=theme.message("done")/]
        </div>
      </form>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
