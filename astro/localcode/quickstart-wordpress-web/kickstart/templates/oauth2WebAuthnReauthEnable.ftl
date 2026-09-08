[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="currentUser" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="webAuthnCredentials" type="java.util.List<io.fusionauth.domain.WebAuthnCredential>" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head]
    <script src="${request.contextPath}/js/FormHelper.js?version=${version}"></script>
    <script src="${request.contextPath}/js/WebAuthnHelper.js?version=${version}"></script>
    <script src="${request.contextPath}/js/oauth2/OAuth2WebAuthnLogin.js?version=${version}"></script>
    <script src="${request.contextPath}/js/oauth2/OAuth2WebAuthnRegistration.js?version=${version}"></script>
    <script>
      Prime.Document.onReady(function() {
        new OAuth2WebAuthnRegistration(document.getElementById("webauthn-register-form"));
        new OAuth2WebAuthnLogin(
          document.querySelector('form[id="webauthn-login-form"]'),
          document.querySelector('input[type="hidden"][name="webAuthnLoginRequest"]')
        );
      });
    </script>
  [/@helpers.head]

  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]
    [@helpers.main title=theme.message("no-password")]
      [#setting url_escaping_charset='UTF-8']
      <fieldset>
        <p>${theme.message("{description}webauthn-reauth")}</p>
        <form id="webauthn-login-form" action="${request.contextPath}/oauth2/webauthn-reauth-enable" method="POST" class="full">
          [@helpers.oauthHiddenFields/]
          [@helpers.hidden name="webAuthnLoginRequest"/]
          [@helpers.hidden name="workflow" value="reauthentication"/]

          [#if webAuthnCredentials?has_content]
          <p><em>${theme.message("{description}webauthn-reauth-existing-credential")}</em></p>
          <fieldset class="mt-3 hover push-bottom">
            [#list webAuthnCredentials![] as credential]
             <button class="chunky-wide-submit" name="credentialId" value="${credential.id}">
                <span>
                  <span>${helpers.display(credential, "displayName")}</span>
                  <span class="sub-text">
                    ${theme.message("last-used")}
                    ${theme.formatZoneDateTime(credential.lastUseInstant, theme.message("date-format"), zoneId)}</span>
                </span>
                <i class="fa fa-chevron-right"></i>
              </button>
            [/#list]
          </fieldset>
          [/#if]

          <fieldset>
            [@helpers.input id="doNotAskAgain" type="checkbox" name="doNotAskAgain" label=theme.message('dont-ask-again') value="true" uncheckedValue="false"/]
            <div class="form-row">
              [@helpers.button icon="check" name="action" value="skip" text=theme.message("not-now") /]
            </div>
          </fieldset>

        </form>

        [#-- Description for adding a new credential during login. --]
        <p>
          <em>
          [#if webAuthnCredentials?has_content]
            ${theme.message("or")} ${theme.message("{description}webauthn-reauth-add-credential")?uncap_first}
          [#else]
            ${theme.message("{description}webauthn-reauth-add-credential")}
          [/#if]
          </em>
        </p>

        <form id="webauthn-register-form" action="${request.contextPath}/oauth2/webauthn-reauth-enable" method="POST" class="full" data-start-registration-action="/oauth2/ajax/webauthn/start-registration">
          [@helpers.oauthHiddenFields/]
          [@helpers.hidden name="webAuthnRegisterRequest"/]
          [@helpers.hidden name="workflow" value="reauthentication"/]

          <fieldset>
            [#-- Default the displayName on initial render if not alread set. --]
            [#if !(displayName??) && request.method == "GET"]
              [#global displayName = theme.message('unnamed')/]
            [/#if]

            [@helpers.input type="text" name="displayName" id="displayName" label="${theme.message('display-name')}" autocomplete="off" autofocus=true required=true/]
          </fieldset>

          <div class="form-row">
            [@helpers.button icon="key" name="action" value="register" text=theme.message("register") /]
          </div>

        </form>
      </fieldset>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
