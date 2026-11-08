[#ftl/]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#-- @ftlvariable name="theme" type="io.fusionauth.domain.Theme" --]
[#import "_helpers.ftl" as helpers/]

[@helpers.html]
[@helpers.head title="FusionAuth"/]
[@helpers.body]
  [@helpers.header]
    [#-- Custom header code goes here --]
  [/@helpers.header]

   [#if theme.type != "simple"]
      [@helpers.main title="" rowClass="row center-xs" colClass="col-xs-12 col-sm-12 col-md-10 col-lg-10 col-xl-9"]
          <div class="p-3 pb-5">
            <div style="width: 180px;">
              <img src="/images/logo-gray.svg">
            </div>
            <br />
            <a href="http://localhost:3000/account" style="background: linear-gradient(to bottom right, palegreen, forestgreen);
              color: white;
              padding: 10px;
              margin: 20px;
              border-radius: 5px;
              text-align: center;
              width: 160px;
              display: inline-block;
              text-decoration: none;">
              Changebank
            </a>
            <a href="http://localhost:3001/account" style="background: linear-gradient(to bottom right, skyblue, navy);
              color: white;
              padding: 10px;
              margin: 20px;
              border-radius: 5px;
              text-align: center;
              width: 160px;
              display: inline-block;
              text-decoration: none;">
              Changeinsurance
            </a>
          </div>
      [/@helpers.main]
    [/#if]

  [@helpers.footer]
    [#-- Custom footer code goes here --]
  [/@helpers.footer]
[/@helpers.body]
[/@helpers.html]
