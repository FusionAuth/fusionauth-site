[#ftl/]
[#setting url_escaping_charset="UTF-8"]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="user" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="webAuthnCredentials" type="java.util.List<io.fusionauth.domain.WebAuthnCredential>" --]

[#import "../../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head title=theme.message("passkeys")]
    <script src="${request.contextPath}/js/WebAuthnHelper.js?version=${version}"></script>
    <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (!WebAuthnHelper.isWebAuthnSupported()) {
        document.getElementById("no-webauthn-support").classList.remove('hidden');
      }
    });
    </script>
  [/@helpers.head]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.accountMain rowClass="row center" colClass="col-xs-12 col-sm-12 col-md-10 col-lg-8" actionURL="/account/" actionText=theme.message("go-back")]
      [@helpers.accountPanelFull]

        <fieldset>
          <legend>${theme.message("passkeys")}</legend>
          <p><em>${theme.message("{description}webauthn-passkeys")}</em></p>
          <p id="no-webauthn-support" class="hidden">
            <em>
              <strong>${theme.message("warning")}${theme.message("propertySeparator")}</strong>
              <span>${theme.message("no-webauthn-support")}</span>
            </em>
          </p>

          <table class="hover">
            <thead>
              <tr>
                <th>${theme.message("display-name")}</th>
                <th>${theme.message("created")}</th>
                <th>${theme.message("last-used")}</th>
                <th class="action">${theme.message("action")}</th>
              </tr>
            </thead>
            <tbody>
              [#list webAuthnCredentials![] as cred]
              <tr>
                <td>${helpers.display(cred, "displayName")}</td>
                <td>${theme.formatZoneDateTime(cred.insertInstant, theme.message('date-time-format'), zoneId)}</td>
                <td>${theme.formatZoneDateTime(cred.lastUseInstant, theme.message('date-time-format'), zoneId)}</td>
                <td class="action">
                  <a href="${request.contextPath}/account/webauthn/delete/${cred.id}?client_id=${client_id}&tenantId=${tenantId!''}" data-tooltip="${theme.message('delete-webauthn-passkey')}" title="${theme.message('delete-webauthn-passkey')}" class="small-square button red" >
                    <i class="fa fa-trash"></i>
                  </a>
                </td>
              </tr>
              [#else]
                <tr>
                  <td colspan="5">${theme.message("no-webauthn-passkeys")}</td>
                </tr>
              [/#list]
            </tbody>
          </table>

          <div class="form-row mt-3">
            <a class="blue button" href="${request.contextPath}/account/webauthn/add?client_id=${client_id}&tenantId=${tenantId!''}">
              <i class="fa fa-plus"></i> ${theme.message("add-webauthn-passkey")}
            </a>
          </div>

        </fieldset>
      [/@helpers.accountPanelFull]
    [/@helpers.accountMain]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
