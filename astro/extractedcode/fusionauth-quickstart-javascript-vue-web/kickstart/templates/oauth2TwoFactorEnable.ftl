[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="availableMethods" type="java.util.List<java.lang.String>" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="currentUser" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="method" type="io.fusionauth.domain.TwoFactorMethod" --]
[#-- @ftlvariable name="methodId" type="java.lang.String" --]
[#-- @ftlvariable name="showResendOrSelectMethod" type="boolean" --]
[#-- @ftlvariable name="secret" type="java.lang.String" --]
[#-- @ftlvariable name="secretBase32Encoded" type="java.lang.String" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="trustComputer" type="boolean" --]
[#-- @ftlvariable name="twoFactorId" type="java.lang.String" --]
[#-- @ftlvariable name="version" type="java.lang.String" --]
[#import "../_helpers.ftl" as helpers/]

[#macro instructions method]
  [#if method == "authenticator"]

    [#-- Authenticator Instructions --]
    <p class="mt-0 mb-3" style="justify-content: center;">${theme.message("oauth2-authenticator-enable-step-1")}</p>
    [#-- QR Code for Authenticator app --]
    [#if method == "authenticator"]
      [#-- This is initialized using qrcode-*.js by the element Id --]
      <div id="qrcode" class="d-flex" style="justify-content: center;"></div>
    [/#if]

  [#elseif method == "email" || method == "sms"]

    [#-- Email or SMS Instructions --]
    <p class="mt-0 mb-3">${theme.message("oauth2-${method}-enable-step-1")}</p>

    <form id="send-two-factor-form" action="${request.contextPath}/oauth2/two-factor-enable" method="POST" class="full">
      [@helpers.oauthHiddenFields/]
      [@helpers.hidden name="action" value="send" /]
      [@helpers.hidden name="method" /]
      [#-- 'secret' and 'twoFactorSecretBase32' are required for authenticator. --]
      [@helpers.hidden name="secret" /]
      [@helpers.hidden name="secretBase32Encoded" /]
      [@helpers.hidden name="twoFactorId"/]

      [#-- Send a code --]
      [#if method == "email"]
        [@helpers.input type="text" id="email" name="email" label="Email" required=true/]
      [#elseif method == "sms"]
        [@helpers.input type="text" id="mobilePhone" name="mobilePhone" label="Mobile phone" required=true/]
      [/#if]

      [@helpers.button icon="arrow-circle-right" color="gray" text="${theme.message('send-one-time-code')}"/]
    </form>
  [/#if]
[/#macro]

[@helpers.html]
  [@helpers.head]
    [#-- JavaScript is used for rendering authenticator QR code --]
    <script src="${request.contextPath}/js/qrcode-min-1.0.js"></script>
    <script src="${request.contextPath}/js/oauth2/OAuth2TwoFactorEnable.js?version=${version}"></script>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        [#-- These variables will get set by the FreeMarker template. --]
        const accountName = '${currentUser.getLogin()}';
        const issuer = '${tenant.issuer}';
        const secretBase32Encoded = '${secretBase32Encoded}';

        [#-- This object the Enable Two-Factor form --]
        new OAuth2TwoFactorEnable(
            document.getElementById('enable-two-factor-form'),
            document.getElementById('send-two-factor-form'),
            document.getElementById('qrcode'),
            // https://github.com/google/google-authenticator/wiki/Key-Uri-Format
            'otpauth://totp/' + encodeURIComponent(issuer) + '%3A' + encodeURIComponent(accountName) + '?issuer=' + encodeURIComponent(issuer) + '&secret=' + secretBase32Encoded
        );
      });
    </script>
    [#-- Custom <head> code goes here --]
  [/@helpers.head]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message("enable-instructions")]
      [#setting url_escaping_charset='UTF-8']
         [#-- Heading --]
         <form class="full">
           [#-- The 'select-method' id is used to detect value changes in OAuth2TwoFactorEnable.js --]
           [@helpers.select name="method" id="select-method" options=availableMethods label="${theme.message('select-two-factor-method')}" required=true/]
         </form>

        [#list availableMethods as method]
          <fieldset class="pb-3" data-method-instructions="${method}">
            [#-- Instructions --]
            [@instructions method/]
          </fieldset>
        [/#list]

        [#-- Enable Two Factor Form --]
        <form id="enable-two-factor-form" action="${request.contextPath}/oauth2/two-factor-enable" method="POST" class="full">
          [@helpers.oauthHiddenFields/]
           [@helpers.hidden name="email" /]
           [@helpers.hidden name="method" /]
           [@helpers.hidden name="mobilePhone" /]
           [#-- 'secret' and 'twoFactorSecretBase32' are required for authenticator. --]
           [@helpers.hidden name="secret" /]
           [@helpers.hidden name="secretBase32Encoded" /]
           [@helpers.hidden name="twoFactorId"/]
           <fieldset>
             [@helpers.input type="text" name="code" id="verification-code" label=theme.message("verification-code") placeholder="${theme.message('{placeholder}two-factor-code')}" autocapitalize="none"  autocomplete="one-time-code" autocorrect="off" required=true/]
           </fieldset>
           <div class="form-row">
             [@helpers.button icon="save" text=theme.message("enable")/]
           </div>
        </form>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]

  [/@helpers.body]
[/@helpers.html]
