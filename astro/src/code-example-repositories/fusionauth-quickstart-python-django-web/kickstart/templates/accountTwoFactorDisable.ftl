[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="method" type="java.lang.String" --]
[#-- @ftlvariable name="methodId" type="java.lang.String" --]
[#-- @ftlvariable name="email" type="java.lang.String" --]
[#-- @ftlvariable name="mobilePhone" type="java.lang.String" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="user" type="io.fusionauth.domain.User" --]

[#import "../../_helpers.ftl" as helpers/]

[#macro instructions method]
<div class="d-flex">
  <div style="flex-grow: 1;">
    [#if method == "authenticator"]
      <p class="mt-0 mb-3">${theme.message("authenticator-disable-step-1")}</p>
    [#elseif method == "email" || method == "sms"]
      <p class="mt-0 mb-3">${theme.message("${method}-disable-step-1", (method == "email")?then(email, mobilePhone))}</p>
      <form id="send-two-factor-form" action="${request.contextPath}/account/two-factor/disable" method="POST" class="full">
        [@helpers.hidden name="action" value="send" /]
        [@helpers.hidden name="client_id" /]
        [@helpers.hidden name="tenantId" /]
        [@helpers.hidden name="methodId" /]
        [#-- Send a code --]
        [@helpers.button icon="arrow-circle-right" color="gray" text="${theme.message('send-one-time-code')}"/]
      </form>
    [/#if]
  </div>
</div>
[/#macro]

[@helpers.html]
  [@helpers.head title=theme.message("authenticator-configuration")/]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.accountMain rowClass="row center" colClass="col-xs-12 col-sm-12 col-md-10 col-lg-8" actionURL="/account/two-factor/" actionText=theme.message("cancel-go-back")]
        [@helpers.accountPanelFull]

          <fieldset class="pb-3">
            [#-- Heading --]
            <legend>${theme.message("disable-instructions")}</legend>

            [#-- Instructions --]
            [@instructions method/]

            <p class="mt-4">
              <strong>${theme.message('note')}</strong> ${theme.message('{description}two-factor-recovery-code-note')}
            </p>
          </fieldset>

          <form id="two-factor-form" action="${request.contextPath}/account/two-factor/disable" method="POST" class="full">
            [@helpers.hidden name="client_id" /]
            [@helpers.hidden name="tenantId" /]
            [@helpers.hidden name="methodId" /]

            <fieldset>
              [@helpers.input type="text" name="code" id="verification-code" label=theme.message("verification-code") placeholder="${theme.message('{placeholder}two-factor-code')}" autofocus=true autocapitalize="none"  autocomplete="one-time-code" autocorrect="off" required=true/]
            </fieldset>

            <div class="form-row">
              [@helpers.button icon="save" text=theme.message("disable")/]
            </div>
          </form>
       [/@helpers.accountPanelFull]
    [/@helpers.accountMain]

    [@helpers.footer]
       [#-- Custom footer code goes here --]
    [/@helpers.footer]

  [/@helpers.body]
[/@helpers.html]