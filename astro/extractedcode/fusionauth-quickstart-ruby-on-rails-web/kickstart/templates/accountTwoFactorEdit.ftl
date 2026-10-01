[#ftl/]
[#setting url_escaping_charset="UTF-8"]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="method" type="io.fusionauth.domain.TwoFactorMethod" --]
[#-- @ftlvariable name="methodId" type="java.lang.String" --]
[#-- @ftlvariable name="user" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]

[#import "../../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head title=theme.message("account-two-factor-edit-page-title")/]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.accountMain rowClass="row center" colClass="col-xs-12 col-sm-12 col-md-10 col-lg-8" actionURL="/account/two-factor/?client_id=${client_id}&tenantId=${tenantId!''}" actionText=theme.message("go-back")]
        [@helpers.accountPanelFull]

           <fieldset>
             <legend>${theme.message("edit-two-factor")}</legend>
             <p><em>${theme.message("{description}edit-two-factor")}</em></p>

             <form action="${request.contextPath}/account/two-factor/edit" method="POST" class="full">
               [@helpers.hidden name="client_id" /]
               [@helpers.hidden name="methodId" /]
               [@helpers.hidden name="tenantId" /]

               [@helpers.input type="text" name="twoFactorName" id="twoFactorName" label=theme.message("two-factor-name") placeholder=theme.message("{placeholder}two-factor-name") value=(method.name!'') required=true/]

               <div class="form-row mt-3">
                 [@helpers.button text=theme.message("submit")/]
               </div>
             </form>

           </fieldset>

      [/@helpers.accountPanelFull]
    [/@helpers.accountMain]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
