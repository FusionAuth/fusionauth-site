[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="availableMethods" type="java.util.List<java.lang.String>" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="email" type="java.lang.String" --]
[#-- @ftlvariable name="method" type="java.lang.String" --]
[#-- @ftlvariable name="mobilePhone" type="java.lang.String" --]
[#-- @ftlvariable name="recoveryCodes" type="java.util.List<java.lang.String>" --]
[#-- @ftlvariable name="secret" type="java.lang.String" --]
[#-- @ftlvariable name="secretBase32Encoded" type="java.lang.String" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="user" type="io.fusionauth.domain.User" --]

[#import "../../_helpers.ftl" as helpers/]

[#macro instructions method]
<div class="d-flex">
  <div style="flex-grow: 1;">
    [#if method == "authenticator"]

      [#-- Authenticator Instructions --]
      <p class="mt-0 mb-3">${theme.message("authenticator-enable-step-1", secretBase32Encoded)?no_esc}</p>
      <p>${theme.message("authenticator-enable-step-2")}</p>

    [#elseif method == "email" || method == "sms"]

      [#-- Email or SMS Instructions --]
      <p class="mt-0 mb-3">${theme.message("${method}-enable-step-1", helpers.display(user, (method == "email")?then("email", "mobilePhone")))}</p>

      <form id="two-factor-send-form" action="${request.contextPath}/account/two-factor/enable" method="POST" class="full">
        [@helpers.hidden name="action" value="send" /]
        [@helpers.hidden name="client_id" /]
        [@helpers.hidden name="tenantId" /]
        [@helpers.hidden name="method" /]
        [#-- 'secret' and 'twoFactorSecretBase32' are required for authenticator. --]
        [@helpers.hidden name="secret" /]
        [@helpers.hidden name="secretBase32Encoded" /]

        [#-- Send a code --]
        [#if method == "email"]
          [@helpers.input type="text" id="email" name="email" label="Email" required=true/]
        [#elseif method == "sms"]
          [@helpers.input type="text" id="mobilePhone" name="mobilePhone" label="Mobile phone" required=true/]
        [/#if]

        [@helpers.button icon="arrow-circle-right" color="gray" text="${theme.message('send-one-time-code')}"/]
      </form>
    [/#if]
  </div>

  [#-- QR Code for Authenticator app --]
  [#if method == "authenticator"]
  <div id="qrcode" class="qrcode pl-2"></div>
  [/#if]

</div>
[/#macro]

[@helpers.html]
  [@helpers.head title=theme.message("authenticator-configuration")]
    [#-- JavaScript is used for rendering authenticator QR code --]
    <script src="${request.contextPath}/js/qrcode-min-1.0.js"></script>
    <script src="${request.contextPath}/js/account/EnableTwoFactor.js?version=${version}"></script>
    <script>
      Prime.Document.onReady(function() {
        [#-- These variables will get set by the FreeMarker template. --]
        var params = {
          accountName: '${user.getLogin()}',
          issuer: '${tenant.issuer}',
          secretBase32Encoded: '${secretBase32Encoded}'
        }

        [#-- This object the Enable Two-Factor form --]
        new FusionAuth.Account.EnableTwoFactor(params);
      });
    </script>
  [/@helpers.head]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [#assign textKey = recoveryCodes?has_content?then("done", "go-back")/]
    [#assign actionDirection = recoveryCodes?has_content?then("forward", "back")/]
    [@helpers.accountMain rowClass="row center" colClass="col-xs-12 col-sm-12 col-md-10 col-lg-8" actionURL="/account/two-factor/" actionText=theme.message(textKey) actionDirection=actionDirection]
      [@helpers.accountPanelFull]

        [#-- The first time a user enables a two-factor code, they will be presented with recovery codes. --]
        [#if recoveryCodes?has_content]
          [#-- Display Recovery codes to the user. --]

          <div class="row">
            <div class="col-xs">
              <fieldset>
                <p> ${theme.message("{description}recovery-codes-1", recoveryCodes?size)} </p>
              </fieldset>
              <fieldset>
                <div class="code d-flex" style="justify-content: center; flex-wrap: wrap; gap: 5px 15px;">
                  [#list recoveryCodes as code]<div>${code}</div>[/#list]
                </div>
              </fieldset>
              <fieldset>
                <p> ${theme.message("{description}recovery-codes-2")}  </p>
              </fieldset>
            </div>
          </div>

        [#else]
        [#-- Show the Enable Two-Factor form --]

         <fieldset>
           [#-- Heading --]
           <legend>${theme.message("enable-instructions")}</legend>
           <form class="full">
             [@helpers.select name="method" id="select-method" options=availableMethods label="${theme.message('select-two-factor-method')}" required=true/]
           </form>
         </fieldset>

          [#list availableMethods as method]
            <fieldset class="pb-3" data-method-instructions="${method}">
              [#-- Instructions --]
              [@instructions method/]
            </fieldset>
          [/#list]

          [#-- Enable Two Factor Form --]
          <form id="two-factor-form" action="${request.contextPath}/account/two-factor/enable" method="POST" class="full">
             [@helpers.hidden name="client_id" /]
             [@helpers.hidden name="tenantId" /]
             [@helpers.hidden name="email" /]
             [@helpers.hidden name="method" /]
             [@helpers.hidden name="mobilePhone" /]
             [#-- 'secret' and 'twoFactorSecretBase32' are required for authenticator. --]
             [@helpers.hidden name="secret" /]
             [@helpers.hidden name="secretBase32Encoded" /]
             <fieldset>
               [@helpers.input type="text" name="code" id="verification-code" label=theme.message("verification-code") placeholder="${theme.message('{placeholder}two-factor-code')}" autocapitalize="none"  autocomplete="one-time-code" autocorrect="off" required=true/]
             </fieldset>
             <div class="form-row">
               [@helpers.button icon="save" text=theme.message("enable")/]
             </div>
          </form>
        [/#if]

      [/@helpers.accountPanelFull]
    [/@helpers.accountMain]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]

  [/@helpers.body]
[/@helpers.html]
