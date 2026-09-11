[#ftl/]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="methodId" type="java.lang.String" --]
[#-- @ftlvariable name="twoFactorName" type="java.lang.String" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]

[#import "../../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head title=theme.message("account-two-factor-edit-page-title")/]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.accountMain rowClass="row center" colClass="col-xs-12 col-sm-12 col-md-10 col-lg-8" actionURL="/account/two-factor/" actionText=theme.message("cancel-go-back")]
      [@helpers.accountPanelFull title="${theme.message('edit-two-factor')}" ]
        <fieldset>
          <p class="mt-0 mb-4">${theme.message("{description}edit-two-factor")}</p>

          [@helpers.structuredForm id="two-factor-form" action="${request.contextPath}/account/two-factor/edit" method="POST"; section]
            [#if section == "formFields"]
              [@helpers.hidden name="client_id" /]
              [@helpers.hidden name="tenantId" /]
              [@helpers.hidden name="methodId" /]

              [@helpers.input type="text" name="twoFactorName" id="two-factor-name" label=theme.message("two-factor-name") placeholder="${theme.message('{placeholder}two-factor-name')}" autocapitalize="none" autocorrect="off"/]
            [#elseif section == "buttons"]
              [@helpers.button icon="save" text=theme.message("save")/]
            [/#if]
          [/@helpers.structuredForm]
        </fieldset>
      [/@helpers.accountPanelFull]
    [/@helpers.accountMain]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]

  [/@helpers.body]
[/@helpers.html]
