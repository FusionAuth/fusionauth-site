[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="availableMethodsMap" type="java.util.Map<java.lang.String, io.fusionauth.domain.TwoFactorMethod>" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="methodId" type="java.lang.String" --]
[#-- @ftlvariable name="recoverCodesAvailable" type="int" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="twoFactorId" type="java.lang.String" --]
[#-- @ftlvariable name="version" type="java.lang.String" --]
[#import "../_helpers.ftl" as helpers/]

[#macro methodOption id method]
 <div class="form-row" >
   <label>
     <input type="radio" name="methodId" value="${id}" [#if id = methodId!'']checked[/#if]>
     [#if method.method == "email"]
       <span>${theme.message("two-factor-method-email")}</span>
       <span>
        [#assign index = method.email?index_of("@")/]
        ${theme.message('two-factor-get-code-at-email', method.email?substring(0, index + 2))}
       </span>
     [#elseif method.method == "authenticator"]
       &nbsp;<span>${theme.message("two-factor-method-authenticator")}</span>
        <span>
         ${theme.message('two-factor-get-code-at-authenticator')}
        </span>
     [#elseif method.method == "sms"]
        <span>${theme.message('two-factor-method-sms')}</span>
        <span>
          ${theme.message('two-factor-get-code-at-sms', method.mobilePhone?substring(method.mobilePhone?length - 2))}
        </span>
     [#else]
        ${theme.optionalMessage(method.method)}
     [/#if]
     </label>
 </div>
[/#macro]

[#macro recoveryCodeOption]
<div class="form-row">
  <label>
    <input type="radio" name="methodId" value="recoveryCode" [#if "recoveryCode" == methodId!'']checked[/#if]>
       <span>${theme.message('two-factor-recovery-code')}</span>
       <span>
         ${theme.message('two-factor-use-one-of-n-recover-codes', recoverCodesAvailable)}
       </span>
  </label>
</div>
[/#macro]

[@helpers.html]
  [@helpers.head]
    [#-- Custom <head> code goes here --]
  [/@helpers.head]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message('two-factor-challenge-options')]
      [#setting url_escaping_charset='UTF-8']
      <form id="2fa-form" action="${request.contextPath}/oauth2/two-factor-methods" method="POST" class="full">

        [@helpers.oauthHiddenFields/]
        [@helpers.hidden name="twoFactorId"/]

        [#-- Panel description --]
        ${theme.message('{description}two-factor-methods-selection')}

        [#-- Available methods --]
        <fieldset class="mt-3 hover radio-items">

          [#list availableMethodsMap as id, method]
             [@methodOption id method/]
          [/#list]

          [#-- Optionally show an option for recovery codes. A recovery code can always be used to login, so selecting this is not
               required to allow the user to enter a recovery code. But it is a cue to the user that they have this option.
               Feel free to remove it if you do not want to show it, it will not affect the user's ability to use a recovery code.
           --]
          [#if recoverCodesAvailable gt 0]
            [@recoveryCodeOption/]
          [/#if]

          [#-- Show the methodId error here sinc we will have more than one radio button. This can be moved to suit you. --]
          [@helpers.errors "methodId"/]
        </fieldset>

        [#-- Continue to the next step to enter your code. --]
        [@helpers.button text=theme.message('continue')/]
      </form>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
