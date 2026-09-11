[#ftl/]
[#-- @ftlvariable name="allLogoutURLs" type="java.util.Set<java.lang.String>" --]
[#-- @ftlvariable name="registeredLogoutURLs" type="java.util.Set<java.lang.String>" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#import "../_helpers.ftl" as helpers/]

[#-- You may adjust the duration that we wait before completing the logout. --]
[#assign logoutDurationInSeconds = 2 /]

[@helpers.html]
  [@helpers.head title=theme.message("logout-title")/]
  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message("logging-out")]
      <div class="progress-bar" >
        <div style="animation-duration: ${logoutDurationInSeconds + 1}s; animation-timing-function: ease-out;">
        </div>
      </div>
    [/@helpers.main]

    [#-- Use allLogoutURLs to call the logout URL of all applications in the tenant, or use registeredLogoutURLs to log out of just the applications the user is currently registered.
        Note, that just because a user does not currently have a registration, does not neccessarily mean the user does not hold a session with an application. It is possible the user has been un-registered
        recently, or an application may have created a session for a user regardless of their registration. In most cases it is safest to simply call all applications and ensure that the Single Logout
        URL can handle logout requests for users that may or may not have a session with that application.
     --]
    [#list allLogoutURLs![] as logoutURL]
      <iframe src="${logoutURL}" style="width:0; height:0; border:0; border:none;"></iframe>
    [/#list]
    <form action="${request.contextPath}/samlv2/logout/complete" method="POST">
      [@helpers.hidden name="binding"/]
      [@helpers.hidden name="RelayState"/]
      [@helpers.hidden name="SAMLRequest"/]
      [@helpers.hidden name="Signature"/]
      [@helpers.hidden name="SigAlg"/]
      [@helpers.hidden name="tenantId"/]
    </form>
    <script type="text/javascript">
      [#-- Allow enough time for each iframe to load and make a request to the SAML logout endpoints. --]
      setTimeout(function() {
        document.forms[0].submit();
      }, ${logoutDurationInSeconds * 1000});
    </script>
    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]
