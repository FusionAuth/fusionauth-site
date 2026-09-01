[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="requiredScopes" type="java.util.List<io.fusionauth.domain.ApplicationOAuthScope>" --]
[#-- @ftlvariable name="optionalScopes" type="java.util.List<io.fusionauth.domain.ApplicationOAuthScope>" --]
[#-- @ftlvariable name="theme" type="io.fusionauth.domain.Theme" --]
[#-- @ftlvariable name="unknownScopes" type="java.util.List<java.lang.String>" --]

[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head]
    [#-- Custom <head> code goes here --]
  [/@helpers.head]
  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message('consent-required')]
      <p>${theme.message('consent-required-intro', application.name?esc?markup_string)?no_esc}${theme.message("propertySeparator")}</p>

      <form action="${request.contextPath}/oauth2/consent" method="POST" class="full consent-prompt">
        [@helpers.oauthHiddenFields/]

        [#list requiredScopes as scope]
          [@helpers.scopeConsentField application=application scope=scope type="required" /]
        [/#list]

        [#list optionalScopes as scope]
          [@helpers.scopeConsentField application=application scope=scope  type="optional" /]
        [/#list]

        [#list unknownScopes as scope]
          [@helpers.scopeConsentField application=application scope=scope type="unknown" /]
        [/#list]

        <div class="form-row">
          <hr>
          [#if optionalScopes?has_content]
            <p>${theme.message('scope-consent-optional')}</p>
          [/#if]
          <p>${theme.message('scope-consent-agreement', application.name)}</p>
        </div>

        <div class="form-row">
          [@helpers.button icon="key" name="action" value="allow" text=theme.message('allow') /]
          [@helpers.button icon="reply" color="gray" name="action" value="cancel" text=theme.message('cancel') /]
        </div>
      </form>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
