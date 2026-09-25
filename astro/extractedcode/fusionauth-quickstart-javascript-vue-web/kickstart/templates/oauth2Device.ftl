[#ftl/]
[#-- @ftlvariable name="activationComplete" type="boolean" --]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="currentUser" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="devicePendingIdPLink" type="io.fusionauth.domain.provider.PendingIdPLink" --]
[#-- @ftlvariable name="theme" type="io.fusionauth.domain.Theme" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="userCodeLength" type="int" --]
[#-- @ftlvariable name="version" type="java.lang.String" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head title=theme.message("device-title")]
  <script src="${request.contextPath}/js/oauth2/Device.js?version=${version}"></script>
  <script>
    Prime.Document.onReady(function() {
      var form = Prime.Document.queryById('device-form');
      new FusionAuth.OAuth2.Device(form, ${userCodeLength});
    });
  </script>
  <style>
    #user_code_container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }

    #user_code_container > div {
      margin-left: 2px;
      margin-right: 2px;
    }

    #user_code_container input[type="text"] {
      font-size: 30px;
      padding: 5px 0;
      margin-bottom: 5px;
      text-align: center;
      width: 32px;
    }

    #user_code_container input[type="text"] + span {
      font-size: 32px;
    }
  </style>
  [/@helpers.head]
  [@helpers.body]

    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [#-- If a pending link will cause us to exceed our linking limit, the next step will be to logout. --]
    [#assign logoutToContinue = devicePendingIdPLink?? && devicePendingIdPLink.linkLimitExceeded /]

    [@helpers.main title=theme.message("device-form-title")]
      [#setting url_escaping_charset='UTF-8']

      [#-- During a linking work flow, optionally indicate to the user which IdP is being linked. --]
      [#if devicePendingIdPLink?? && !logoutToContinue]
        <p class="mt-0">
          ${theme.message('pending-device-link', devicePendingIdPLink.identityProviderName)}
        </p>
      [/#if]

      [#-- If there is an active SSO session, give the user the option to logout of the SSO session
           that does not belong to them. If a link count has been exceeded provide a logout button.
      --]
      [#if currentUser??]
        <div class="form-row mb-3">
          [#-- You may wish to obfuscate a portion of this value for anonymity.. --]
          [#assign currentLoginId = currentUser.login /]
          [#if logoutToContinue]
            [#-- The user must logout before continuing because the currently logged in user has exceeded the number of allowed links to this IdP. --]
            <p>${theme.message('device-link-count-exceeded-pending-logout', currentLoginId, devicePendingIdPLink.identityProviderName)}</p>
            <p class="pb-3">${theme.message("device-link-count-exceeded-next-step")}</p>
            <div class="row">
              <div class="col-xs">
                [@helpers.logoutLink redirectURI="/oauth2/device"]
                  <button class="blue button w-100" style="height: 35px;"><i class="fa fa-arrow-right"></i> ${theme.message("logout-and-continue")}</button>
                [/@helpers.logoutLink]
              </div>
            </div>
          [#else]
            <p>${theme.message('device-logged-in-as-not-you', currentLoginId)}</p>
            <div class="row">
              <div class="col-xs">
                [@helpers.logoutLink redirectURI="/oauth2/device"]
                  <button class="blue button"><i class="fa fa-arrow-right"></i> ${theme.message("logout-and-continue")}</button>
                [/@helpers.logoutLink]
              </div>
            </div>
          [/#if]
        </div>
      [/#if]

      [#-- Not showing the form if the user must logout first. --]
      [#if !logoutToContinue]
      <form action="${request.contextPath}/oauth2/device" method="POST" id="device-form">
        [@helpers.oauthHiddenFields/]
        <p>${theme.message("userCode")}</p>
        <fieldset>
          <div id="user_code_container">
            [#list 0..<userCodeLength as i]
            <div>
              <label for="user_code_${i}"></label>
              <input type="text" id="user_code_${i}" maxlength="1" [#if i?index == 0]autofocus[/#if] autocomplete="off"/>
              [#if i == (userCodeLength/2)?floor - 1]<span>-</span>[/#if]
            </div>
            [/#list]
            <input type="hidden" name="interactive_user_code" id="interactive_user_code" />
          </div>
        </fieldset>

        <div class="form-row">
          [@helpers.errors field="user_code" /]
        </div>

        <div class="form-row push-top">
          [@helpers.button text=theme.message('submit')/]
        </div>
      </form>
      [/#if]
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
