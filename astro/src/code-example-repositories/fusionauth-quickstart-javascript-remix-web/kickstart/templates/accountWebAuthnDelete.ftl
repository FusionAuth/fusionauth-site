[#ftl/]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="credential" type="io.fusionauth.domain.WebAuthnCredential" --]

[#import "../../_helpers.ftl" as helpers/]

[#macro row name value]
<tr>
  <td class="top"> ${name} ${theme.message("propertySeparator")} </td>
  <td> ${value} </td>
</tr>
[/#macro]

[@helpers.html]
  [@helpers.head title=theme.message("delete-webauthn-passkey")]
    [#-- Custom head/script code goes here --]
  [/@helpers.head]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.accountMain rowClass="row center" colClass="col-xs-12 col-sm-12 col-md-10 col-lg-8" actionURL="/account/webauthn/" actionText=theme.message("go-back")]
      [@helpers.accountPanelFull]
        <fieldset>
          <legend>${theme.message("delete-webauthn-passkey")}</legend>
          <p><em>${theme.message("{description}delete-webauthn-passkey")}</em></p>

          <table class="properties">
            <tbody>
              [@row name=theme.message("name") value=helpers.display(credential, "displayName") /]
              [@row name=theme.message("identifier") value=helpers.display(credential, "name") /]
              [@row name=theme.message("id") value=helpers.display(credential, "id") /]
              [@row name=theme.message("created") value=theme.formatZoneDateTime(credential.insertInstant, theme.message('date-time-format'), zoneId) /]
              [@row name=theme.message("last-used") value=theme.formatZoneDateTime(credential.lastUseInstant, theme.message('date-time-format'), zoneId) /]
              [@row name=theme.message("relying-party-id") value=helpers.display(credential, "relyingPartyId") /]
              [@row name=theme.message("signature-count") value=helpers.display(credential, "signCount") /]
            </tbody>
          </table>
        </fieldset>

        <form id="webauthn-form" action="${request.contextPath}/account/webauthn/delete" method="POST">
          [@helpers.hidden name="id"/]
          [@helpers.hidden name="client_id"/]
          [@helpers.hidden name="tenantId"/]

          <div class="form-row">
            [@helpers.button icon="trash" color="red" text=theme.message("delete")/]
          </div>
        </form>
      [/@helpers.accountPanelFull]
    [/@helpers.accountMain]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]


