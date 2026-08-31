[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="currentUser" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="fields" type="java.util.Map<java.lang.Integer, java.util.List<io.fusionauth.domain.form.FormField>>" --]
[#-- @ftlvariable name="user" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="passwordSet" type="boolean" --]

[#import "../_helpers.ftl" as helpers/]

[#function generateSectionLabel sectionNumber tenantId]
  [#--  Tenant specific, not tenant specific, then default --]
  [#local sectionLabel = theme.optionalMessage("[${tenantId}]{self-service-form}${sectionNumber}")/]
  [#local resolvedLabel = sectionLabel != "[${tenantId}]{self-service-form}${sectionNumber}"/]
  [#if !resolvedLabel]
    [#local sectionLabel = theme.optionalMessage("{self-service-form}${sectionNumber}")/]
    [#local resolvedLabel = sectionLabel != "{self-service-form}${sectionNumber}"/]
  [/#if]
  [#if !resolvedLabel]
    [#return ""/]
  [#else]
    [#return sectionLabel /]
  [/#if]
[/#function]

[@helpers.html]
  [@helpers.head title=theme.message("account")/]
  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
      <script src="${request.contextPath}/js/ui/Main.js?version=${version}"></script>
    [/@helpers.header]

    [@helpers.accountMain rowClass="row center" colClass="col-xs-12 col-sm-12 col-md-10 col-lg-8" actionURL="/account/" actionText=theme.message("cancel-go-back")]
      [@helpers.accountPanel title="" tenant=tenant user=currentUser action="edit" showEdit=true]
       <div class="row" style="border-bottom: 0;">
        <div class="col-xs-12 col-md-12">
          <form action="${request.contextPath}/account/edit" method="POST" class="full" id="user-form">
            [@helpers.hidden name="client_id" /]
            [@helpers.hidden name="tenantId" /]
            [#if fields?has_content]
              <fieldset>
                [#list fields as fieldKey, fieldValues]

                  [#-- Section labels  --]
                  [#assign sectionNumber = fieldKey + 1/]
                  [#assign sectionLabel = generateSectionLabel(sectionNumber, tenantId) /]
                  [#if sectionLabel?has_content]
                    <legend> ${sectionLabel} </legend>
                  [/#if]

                  [#list fieldValues as field]
                    [#if field.key == "user.password"]
                      [@helpers.passwordField field=field
                                              showCurrentPasswordField=(passwordSet && application.formConfiguration.selfServiceFormConfiguration.requireCurrentPasswordOnPasswordChange)/]
                    [#else]
                      [#assign key = field.key]
                      [@helpers.customField field key field?is_first field.key /]

                      [#if field.confirm]
                        [@helpers.customField field "confirm.${key}" false "[confirm]${field.key}" /]
                      [/#if]
                    [/#if]
                  [/#list]
                [/#list]
              </fieldset>
            [/#if]
            <div class="form-row">
              [@helpers.button icon="save" text=theme.message("submit")/]
            </div>
          </form>
        </div>
       </div>
      [/@helpers.accountPanel]
    [/@helpers.accountMain]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
