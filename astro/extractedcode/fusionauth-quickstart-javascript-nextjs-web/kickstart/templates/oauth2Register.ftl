[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="collectBirthDate" type="boolean" --]
[#-- @ftlvariable name="devicePendingIdPLink" type="io.fusionauth.domain.provider.PendingIdPLink" --]
[#-- @ftlvariable name="federatedCSRFToken" type="java.lang.String" --]
[#-- @ftlvariable name="fields" type="java.util.List<io.fusionauth.domain.form.FormField>" --]
[#-- @ftlvariable name="hideBirthDate" type="boolean" --]
[#-- @ftlvariable name="identityProviders" type="java.util.Map<java.lang.String, java.util.List<io.fusionauth.domain.provider.BaseIdentityProvider<?>>>" --]
[#-- @ftlvariable name="idpRedirectState" type="java.lang.String" --]
[#-- @ftlvariable name="passwordValidationRules" type="io.fusionauth.domain.PasswordValidationRules" --]
[#-- @ftlvariable name="parentEmailRequired" type="boolean" --]
[#-- @ftlvariable name="pendingIdPLink" type="io.fusionauth.domain.provider.PendingIdPLink" --]
[#-- @ftlvariable name="showCaptcha" type="boolean" --]
[#-- @ftlvariable name="step" type="int" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="totalSteps" type="int" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head title=theme.message("register")]
    <script src="${request.contextPath}/js/identityProvider/InProgress.js?version=${version}"></script>
    [@helpers.alternativeLoginsScript clientId=client_id identityProviders=identityProviders/]
    [#if step == totalSteps]
      [@helpers.captchaScripts showCaptcha=showCaptcha captchaMethod=tenant.captchaConfiguration.captchaMethod siteKey=tenant.captchaConfiguration.siteKey/]
    [/#if]
    <script type="text/javascript">
      document.addEventListener('DOMContentLoaded', () => {
        const uvpaAvailableField = document.querySelector('input[name="userVerifyingPlatformAuthenticatorAvailable"]');
        if (uvpaAvailableField !== null && typeof(PublicKeyCredential) !== 'undefined' && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
          PublicKeyCredential
            .isUserVerifyingPlatformAuthenticatorAvailable()
            .then(result => uvpaAvailableField.value = result);
        }
      });
    </script>
    [#-- Custom <head> code goes here --]
  [/@helpers.head]
  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message("register")]
      [#-- During a linking work flow, optionally indicate to the user which IdP is being linked. --]
      [#if devicePendingIdPLink?? || pendingIdPLink??]
        <p class="mt-0">
        [#if devicePendingIdPLink?? && pendingIdPLink??]
          ${theme.message('pending-links-register-to-complete', devicePendingIdPLink.identityProviderName, pendingIdPLink.identityProviderName)}
        [#elseif devicePendingIdPLink??]
          ${theme.message('pending-link-register-to-complete', devicePendingIdPLink.identityProviderName)}
        [#else]
          ${theme.message('pending-link-register-to-complete', pendingIdPLink.identityProviderName)}
        [/#if]
        [#-- A pending link can be cancled. If we also have a device link in progress, this cannot be canceled. --]
        [#if pendingIdPLink??]
          [@helpers.link url="" extraParameters="&cancelPendingIdpLink=true"]${theme.message("register-cancel-link")}[/@helpers.link]
        [/#if]
        </p>
      [/#if]
      <form action="${request.contextPath}/oauth2/register" method="POST" class="full">
        [@helpers.oauthHiddenFields/]
        [@helpers.hidden name="step"/]
        [@helpers.hidden name="registrationState"/]
        [@helpers.hidden name="parentEmailRequired"/]
        [@helpers.hidden name="userVerifyingPlatformAuthenticatorAvailable"/]

        [#-- Show the Password Validation Rules if there is a field error for 'user.password' --]
        [#if (fieldMessages?keys?seq_contains("user.password")!false) && passwordValidationRules??]
          [@helpers.passwordRules passwordValidationRules/]
        [/#if]

        [#-- Begin Self Service Custom Registration Form Steps --]
        [#if fields?has_content]
          <fieldset>
            [@helpers.hidden name="collectBirthDate"/]
            [#list fields as field]
              [#assign key = field.key]
              [@helpers.customField field key field?is_first field.key /]
              [#if field.confirm]
                [@helpers.customField field "confirm.${key}" false "[confirm]${field.key}" /]
              [/#if]
            [/#list]
            [#-- If this is the last step of the form, optionally show a captcha. --]
            [#if step == totalSteps]
              [@helpers.captchaBadge showCaptcha=showCaptcha captchaMethod=tenant.captchaConfiguration.captchaMethod siteKey=tenant.captchaConfiguration.siteKey/]
            [/#if]
          </fieldset>

          [#if step == totalSteps]
            [@helpers.input id="rememberDevice" type="checkbox" name="rememberDevice" label=theme.message("remember-device") value="true" uncheckedValue="false"]
              <i class="fa fa-info-circle" data-tooltip="${theme.message('{tooltip}remember-device')}"></i>[#t/]
            [/@helpers.input]
            <div class="form-row">
              [@helpers.button icon="key" text=theme.message('register')/]
            </div>
          [#else]
            <div class="form-row">
              [@helpers.button icon="arrow-right" text=theme.message('next')/]
            </div>
          [/#if]
        [#-- End Custom Self Service Registration Form Steps --]
        [#else]
        [#-- Begin Basic Self Service Registration Form --]
        <fieldset>
          [@helpers.hidden name="collectBirthDate"/]
          [#if !collectBirthDate && (!application.registrationConfiguration.birthDate.enabled || hideBirthDate)]
            [@helpers.hidden name="user.birthDate" dateTimeFormat="yyyy-MM-dd"/]
          [/#if]
          [#if collectBirthDate]
            [@helpers.input type="date" name="user.birthDate" id="birthDate" placeholder=theme.message('birthDate') leftAddon="calendar" class="date-picker" required=true/]
          [#else]
            [#if application.registrationConfiguration.loginIdType == 'email']
              [@helpers.input type="text" name="user.email" id="email" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" autofocus=true placeholder=theme.message('email') leftAddon="user" required=true/]
            [#elseif application.registrationConfiguration.loginIdType == 'phoneNumber']
              [@helpers.input type="text" name="user.phoneNumber" id="phoneNumber" autocomplete="mobile" autocapitalize="none" autocorrect="off" spellcheck="false" autofocus=true placeholder=theme.message('phoneNumber') leftAddon="mobile" required=true/]
            [#else]
              [@helpers.input type="text" name="user.username" id="username" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" autofocus=true placeholder=theme.message('username') leftAddon="user" required=true/]
            [/#if]
            [@helpers.input type="password" name="user.password" id="password" autocomplete="new-password" placeholder=theme.message('password') leftAddon="lock" required=true/]
            [#if application.registrationConfiguration.confirmPassword]
              [@helpers.input type="password" name="passwordConfirm" id="passwordConfirm" autocomplete="new-password" placeholder=theme.message('passwordConfirm') leftAddon="lock" required=true/]
            [/#if]
            [#if parentEmailRequired]
              [@helpers.input type="text" name="user.parentEmail" id="parentEmail" placeholder=theme.message('parentEmail') leftAddon="user" required=true/]
            [/#if]
            [#if application.registrationConfiguration.birthDate.enabled ||
            application.registrationConfiguration.firstName.enabled    ||
            application.registrationConfiguration.fullName.enabled     ||
            application.registrationConfiguration.middleName.enabled   ||
            application.registrationConfiguration.lastName.enabled     ||
            application.registrationConfiguration.mobilePhone.enabled  ||
            application.registrationConfiguration.preferredLanguages.enabled ]
              <div class="mt-5 mb-5"></div>
              [#if application.registrationConfiguration.firstName.enabled]
                [@helpers.input type="text" name="user.firstName" id="firstName" placeholder=theme.message('firstName') leftAddon="user" required=application.registrationConfiguration.firstName.required/]
              [/#if]
              [#if application.registrationConfiguration.fullName.enabled]
                [@helpers.input type="text" name="user.fullName" id="fullName" placeholder=theme.message('fullName') leftAddon="user" required=application.registrationConfiguration.fullName.required/]
              [/#if]
              [#if application.registrationConfiguration.middleName.enabled]
                [@helpers.input type="text" name="user.middleName" id="middleName" placeholder=theme.message('middleName') leftAddon="user" required=application.registrationConfiguration.middleName.required/]
              [/#if]
              [#if application.registrationConfiguration.lastName.enabled]
                [@helpers.input type="text" name="user.lastName" id="lastName" placeholder=theme.message('lastName') leftAddon="user" required=application.registrationConfiguration.lastName.required/]
              [/#if]
              [#if application.registrationConfiguration.birthDate.enabled && !hideBirthDate]
                [@helpers.input type="date" name="user.birthDate" id="birthDate" placeholder=theme.message('birthDate') leftAddon="calendar" class="date-picker" required=application.registrationConfiguration.birthDate.required/]
              [/#if]
              [#if application.registrationConfiguration.mobilePhone.enabled]
                [@helpers.input type="text" name="user.mobilePhone" id="mobilePhone" placeholder=theme.message('mobilePhone') leftAddon="phone" required=application.registrationConfiguration.mobilePhone.required/]
              [/#if]
              [#if application.registrationConfiguration.preferredLanguages.enabled]
                [@helpers.locale_select field="" name="user.preferredLanguages" id="preferredLanguages" label=theme.message("preferredLanguage") required=application.registrationConfiguration.preferredLanguages.required /]
              [/#if]
            [/#if]
          [/#if]
          [@helpers.captchaBadge showCaptcha=showCaptcha captchaMethod=tenant.captchaConfiguration.captchaMethod siteKey=tenant.captchaConfiguration.siteKey/]
        </fieldset>

        [@helpers.input id="rememberDevice" type="checkbox" name="rememberDevice" label=theme.message('remember-device') value="true" uncheckedValue="false"]
          <i class="fa fa-info-circle" data-tooltip="${theme.message('{tooltip}remember-device')}"></i>[#t/]
        [/@helpers.input]

        <div class="form-row">
          [@helpers.button icon="key" text=theme.message('register')/]
          <p class="mt-2">[@helpers.link url="/oauth2/authorize"]${theme.message('return-to-login')}[/@helpers.link]</p>
        </div>
        [/#if]
        [#-- End Basic Self Service Registration Form --]

        [#-- Begin Self Service Custom Registration Form Step Counter --]
        [#if step > 0]
          <div class="w-100 mt-3" style="display: inline-flex; flex-direction: row; justify-content: space-evenly;">
            <div class="text-right" style="flex-grow: 1;"> ${theme.message('register-step', step, totalSteps)} </div>
          </div>
        [/#if]
        [#-- End Self Service Custom Registration Form Step Counter --]

        [#-- Identity Provider Buttons (if you want to include these, remove the if-statement) --]
        [#if true]
          [@helpers.alternativeLogins clientId=client_id identityProviders=identityProviders![] passwordlessEnabled=false bootstrapWebauthnEnabled=false idpRedirectState=idpRedirectState federatedCSRFToken=federatedCSRFToken/]
        [/#if]
        [#-- End Identity Provider Buttons --]

      </form>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
