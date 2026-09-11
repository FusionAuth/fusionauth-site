[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="method" type="io.fusionauth.domain.TwoFactorMethod" --]
[#-- @ftlvariable name="methodId" type="java.lang.String" --]
[#-- @ftlvariable name="showResendOrSelectMethod" type="boolean" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="trustComputer" type="boolean" --]
[#-- @ftlvariable name="twoFactorId" type="java.lang.String" --]
[#-- @ftlvariable name="version" type="java.lang.String" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head]
    [#-- Custom <head> code goes here --]
    <script src="${request.contextPath}/js/oauth2/TwoFactor.js?version=${version}"></script>
    <script>
      Prime.Document.onReady(function() {
        new FusionAuth.OAuth2.TwoFactor();
      });
    </script>
  [/@helpers.head]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message("two-factor-challenge")]
      [#setting url_escaping_charset='UTF-8']
      <form id="2fa-form" action="${request.contextPath}/oauth2/two-factor" method="POST" class="full">
        [@helpers.input type="text" name="code" id="code" autocapitalize="none" autocomplete="one-time-code" autocorrect="off" autofocus=true leftAddon="lock" placeholder=theme.message("code")/]

        [@helpers.oauthHiddenFields/]
        [@helpers.hidden name="methodId"/]
        [@helpers.hidden name="twoFactorId"/]
        [@helpers.hidden name="userVerifyingPlatformAuthenticatorAvailable"/]
        <fieldset>
          <div class="form-row">
            <label>
              <input type="checkbox" name="trustComputer" [#if trustComputer]checked[/#if]/>
              [#assign trustInDays = (tenant.externalIdentifierConfiguration.twoFactorTrustIdTimeToLiveInSeconds / (24 * 60 * 60))?string("##0")/]
              [#if (application.externalIdentifierConfiguration.twoFactorTrustIdTimeToLiveInSeconds)??]
                [#assign trustInDays = (application.externalIdentifierConfiguration.twoFactorTrustIdTimeToLiveInSeconds / (24 * 60 * 60))?string("##0")/]
              [/#if]
              ${theme.message('trust-computer', trustInDays)}
              <i class="fa fa-info-circle" data-tooltip="${theme.message('{tooltip}trustComputer')}"></i>[#t/]
            </label>
          </div>
        </fieldset>
        <div class="form-row">
          [@helpers.button text=theme.message("verify")/]
        </div>

        [#-- If more than one option was available, allow the user to change their mind, or go back and request another code. --]
        [#if showResendOrSelectMethod]
           <div class="form-row mt-4 mb-0">
            [@helpers.link url="/oauth2/two-factor-methods" extraParameters="&twoFactorId=${twoFactorId?url}&methodId=${(methodId?url)!''}&selectMethod=true"]
              <i class="fa fa-arrow-left"></i>
              ${theme.message("two-factor-select-method")}
            [/@helpers.link]
           </div>
        [/#if]

      </form>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
