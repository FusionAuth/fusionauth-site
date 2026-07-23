[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="formConfigured" type="boolean" --]
[#-- @ftlvariable name="multiFactorAvailable" type="boolean" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="user" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="webauthnAvailable" type="boolean" --]

[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head title=theme.message("account")]
    [#-- Custom header code goes here --]
    <script src="${request.contextPath}/js/ui/Main.js?version=${version}"></script>
  [/@helpers.head]
  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [#assign actionURLs = multiFactorAvailable?then(["/account/two-factor/"], [])/]
    [#assign actionURLs = actionURLs + webauthnAvailable?then(["/account/webauthn/"], [])/]

    [#assign actionTexts = multiFactorAvailable?then([theme.message("manage-two-factor")], [])/]
    [#assign actionTexts = actionTexts + webauthnAvailable?then([theme.message("manage-webauthn-passkeys")], [])/]

    [@helpers.accountMain rowClass="row center" colClass="col-xs-12 col-sm-12 col-md-10 col-lg-8" actionURL=actionURLs actionText=actionTexts actionDirection="forward"]
      [@helpers.accountPanel title="" tenant=tenant user=user action="view" showEdit=formConfigured]
         <div class="row" style="border-bottom: 0;">
            <div class="col-xs-12 col-md-12">
              [#-- Example landing page. This can be customized and different values can be displayed from the user. --]
              <dl class="horizontal">
                <dt>${theme.message("user.email")}</dt>
                 <dd>
                   [#if user.verified ] <i data-tooltip="Email has been verified" class="green-text md-text fa fa-check"></i> [/#if]
                   ${helpers.display(user, "email")}
                 </dd>
              </dl>
              <dl class="horizontal">
                 <dt>${theme.message("user.phoneNumber")}</dt>
                 <dd>${fusionAuth.phone_format(user.phoneNumber!"\x2013")}</dd>
              </dl>
            </div>
          </div>
      [/@helpers.accountPanel]
    [/@helpers.accountMain]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
