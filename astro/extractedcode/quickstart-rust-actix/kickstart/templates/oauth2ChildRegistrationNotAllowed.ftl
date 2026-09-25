[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head]
    [#-- Custom <head> code goes here --]
  [/@helpers.head]
  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message("provide-parent-email")]
      <form action="child-registration-not-allowed" method="POST" class="full">
        [@helpers.hidden name="client_id"/]
        [@helpers.hidden name="tenantId"/]
        <p>
          ${theme.message("child-registration-not-allowed")}
        </p>
        <fieldset>
          [@helpers.input type="text" name="parentEmail" id="parentEmail" placeholder=theme.message("parentEmail") leftAddon="user" required=true/]
        </fieldset>

        <div class="form-row">
          [@helpers.button icon="left-arrow" text=theme.message("submit")/]
        </div>
      </form>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
