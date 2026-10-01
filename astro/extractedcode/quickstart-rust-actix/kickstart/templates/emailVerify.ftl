[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="showCaptcha" type="boolean" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="verificationId" type="java.lang.String" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head]
    [@helpers.captchaScripts showCaptcha=showCaptcha captchaMethod=tenant.captchaConfiguration.captchaMethod siteKey=tenant.captchaConfiguration.siteKey/]
  [/@helpers.head]
  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message("email-verification-form-title")]
      [#-- FusionAuth automatically handles errors that occur during email verification and outputs them in the HTML --]
      <form action="${request.contextPath}/email/verify" method="POST" class="full">
        [@helpers.hidden name="captcha_token"/]
        [@helpers.hidden name="client_id"/]
        [@helpers.hidden name="tenantId"/]
        <p>
          ${theme.message("email-verification-form")}
        </p>
        <fieldset class="push-less-top">
          [@helpers.input type="text" name="email" id="email" autocapitalize="none" autofocus=true autocomplete="on" autocorrect="off" placeholder="${theme.message('email')}" leftAddon="user"/]
          [@helpers.captchaBadge showCaptcha=showCaptcha captchaMethod=tenant.captchaConfiguration.captchaMethod siteKey=tenant.captchaConfiguration.siteKey/]
        </fieldset>
        <div class="form-row">
          [@helpers.button text=theme.message("submit")/]
        </div>
      </form>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
