[#ftl/]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="webAuthnCredentials" type="java.util.List<io.fusionauth.domain.WebAuthnCredential>" --]
[#import "../_helpers.ftl" as helpers/]

[#-- Contents of the passkey button --]
[#macro passKey user]
  [#if user.name??]
    ${user.name}
  [#elseif user.uniqueUsername??]
    ${user.uniqueUsername}
  [#else]
    ${helpers.display(user, "loginId")}
  [/#if]
[/#macro]

[@helpers.html]
  [@helpers.head]
    <script src="${request.contextPath}/js/FormHelper.js?version=${version}"></script>
    <script src="${request.contextPath}/js/oauth2/OAuth2WebAuthnLogin.js?version=${version}"></script>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        new OAuth2WebAuthnLogin(
          document.querySelector('form[id="webauthn-login-form"]'),
          document.querySelector('input[type="hidden"][name="webAuthnRequest"]')
        );
      });
    </script>
  [/@helpers.head]

  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]
    [@helpers.main title=theme.message("login-with-passkey")]
      [#setting url_escaping_charset='UTF-8']
        <form id="webauthn-login-form" action="${request.contextPath}/oauth2/webauthn-reauth" method="POST" class="full">
          [@helpers.oauthHiddenFields/]
          [@helpers.hidden name="webAuthnRequest" /]
          [@helpers.hidden name="workflow" value="reauthentication"/]
          [@helpers.hidden name="userVerifyingPlatformAuthenticatorAvailable" /]

          <p><em>${theme.message("webauthn-reauth-select-passkey")}</em></p>
          <fieldset class="mt-3 hover push-bottom">
          [#list webAuthnCredentials![] as credential]
            <button class="chunky-wide-submit" name="credentialId" value="${credential.id}">
              <span>
                <span>[@passKey users(credential.userId)/]</span>
                <span class="sub-text">${helpers.display(credential, "displayName")}</span>
              </span>
              <i class="fa fa-chevron-right"></i>
            </button>
          [/#list]
          </fieldset>

          <p><em>${theme.message("webauthn-reauth-return-to-login")}</em></p>

          [@helpers.input id="rememberDevice" type="checkbox" name="rememberDevice" label=theme.message("remember-device") value="true" uncheckedValue="false"]
            <i class="fa fa-info-circle" data-tooltip="${theme.message('{tooltip}remember-device')}"></i>[#t/]
          [/@helpers.input]

          <div class="form-row">
            <p class="mt-2">[@helpers.link url="/oauth2/authorize" extraParameters="&skipWebAuthnReauth=true"]${theme.message("return-to-normal-login")}[/@helpers.link]</p>
          </div>
        </form>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
