var d="/docs/v1/tech";
var a="/articles";
var ex="/learn/expert-advice";
var idp="/identity-providers";
var bc="/blog/category";
var bac="/blog/archive/category";

var ip = {};
ip['/']=true;
ip[a+'/']=true;
ip[a+'/authentication/']=true;
ip[a+'/ciam/']=true;
ip[a+'/gaming-entertainment/']=true;
ip[a+'/identity-basics/']=true;
ip[a+'/login-authentication-workflows/']=true;
ip[a+'/oauth/']=true;
ip[a+'/security/']=true;
ip[a+'/tokens/']=true;
ip['/blog/']=true;
ip['/community/forum/']=true;
ip['/dev-tools/']=true;
ip['/docs/']=true;
ip['/docs/quickstarts/']=true;
ip[d+'/']=true;
ip[d+'/account-management/']=true;
ip[d+'/admin-guide/']=true;
ip[d+'/advanced-threat-detection/']=true;
ip[d+'/apis/']=true;
ip[d+'/apis/connectors/']=true;
ip[d+'/apis/entity-management/']=true;
ip[d+'/apis/identity-providers/']=true;
ip[d+'/apis/messengers/']=true;
ip[d+'/apis/scim/']=true;
ip[d+'/client-libraries/']=true;
ip[d+'/connectors/']=true;
ip[d+'/core-concepts/']=true;
ip[d+'/developer-guide/']=true;
ip[d+'/developer-guide/api-gateways/']=true;
ip[d+'/email-templates/']=true;
ip[d+'/events-webhooks/']=true;
ip[d+'/events-webhooks/events/']=true;
ip[d+'/example-apps/']=true;
ip[d+'/getting-started/']=true;
ip[d+'/guides/']=true;
ip[d+idp+'/']=true;
ip[d+idp+'/external-jwt/']=true;
ip[d+idp+'/openid-connect/']=true;
ip[d+idp+'/samlv2-idp-initiated/']=true;
ip[d+idp+'/samlv2/']=true;
ip[d+'/installation-guide/']=true;
ip[d+'/installation-guide/kubernetes/']=true;
ip[d+'/integrations/']=true;
ip[d+'/lambdas/']=true;
ip[d+'/messengers/']=true;
ip[d+'/migration-guide/']=true;
ip[d+'/oauth/']=true;
ip[d+'/passwordless/']=true;
ip[d+'/plugins/']=true;
ip[d+'/premium-features/']=true;
ip[d+'/premium-features/webauthn/']=true;
ip[d+'/reference/']=true;
ip[d+'/samlv2/']=true;
ip[d+'/themes/']=true;
ip[d+'/tutorials/']=true;
ip[d+'/tutorials/gating/']=true;
ip[d+'/tutorials/two-factor/']=true;
ip['/how-to/']=true;
ip['/quickstarts/']=true;
ip['/blog/latest/']=true;

var rd = {};
rd[bac+'/announcement']=bc+'/news';
rd[bac+'/article']=bc+'/education';
rd[bac+'/comparison']=bc+'/compare';
rd[bac+'/community-story']=bc+'/community';
rd[bac+'/features']=bc+'/product';
rd[bac+'/tutorial']=bc+'/tutorial';
rd['/cognito']=d+'/migration-guide/cognito';
rd['/cognito/']=d+'/migration-guide/cognito';
rd[a+'/oauth/what-is-oauth']=a+'/oauth/modern-guide-to-oauth';
rd[d+'/admin-guide/release-notifications']=d+'/admin-guide/releases';
rd[d+'/apis/consent']=d+'/apis/consents';
rd[d+'/common-errors']=d+'/admin-guide/troubleshooting';
rd[d+'/guides/auth0-migration']=d+'/migration-guide/auth0';
rd[d+'/guides/migration']=d+'/migration-guide/general';
rd[d+'/guides/passwordless']=d+'/passwordless/magic-links';
rd[d+'/guides/webauthn']=d+'/passwordless/webauthn-passkeys';
rd[d+'/installation-guide/configuration-management']=d+'/admin-guide/configuration-management';
rd[d+'/installation-guide/monitor']=d+'/admin-guide/monitor';
rd[d+'/installation-guide/securing']=d+'/admin-guide/securing';
rd[d+'/installation-guide/upgrade']=d+'/admin-guide/upgrade';
rd[d+'/passwordless/webauthn']=d+'/passwordless/webauthn-passkeys';
rd[d+'/plugins/password-encryptors']=d+'/plugins/custom-password-hashing';
rd[d+'/reference/password-encryptors']=d+'/reference/password-hashes';
rd[d+'/reactor']=d+'/admin-guide/licensing';
rd[d+'/reactor/']=d+'/admin-guide/licensing';
rd[d+'/troubleshooting']=d+'/admin-guide/troubleshooting';
rd[d+'/tutorials/gate-accounts-until-verified']=d+'/tutorials/gating/gate-accounts-until-user-email-verified';
rd[d+'/tutorials/migrate-users']=d+'/migration-guide/tutorial';
rd[d+'/tutorials/setting-up-user-account-lockout']=d+'/tutorials/gating/setting-up-user-account-lockout';
rd[d+'/tutorials/two-factor/authenticator-app']=d+'/tutorials/two-factor/authenticator-app-pre-1-26';
rd[d+'/tutorials/two-factor/twilio-push']=d+'/tutorials/two-factor/twilio-push-pre-1-26';
rd[d+'/tutorials/integrate-angular']= '/docs/quickstarts/quickstart-javascript-angular-web';
rd[d+'/tutorials/integrate-python-django']= '/docs/quickstarts/quickstart-python-django-web';
rd[d+'/tutorials/integrate-python-flask']= '/docs/quickstarts/quickstart-python-flask-web';
rd[d+'/tutorials/integrate-ruby-rails']= '/docs/quickstarts/quickstart-ruby-rails-web';
rd[d+'/tutorials/integrate-dotnet']= '/docs/quickstarts/quickstart-dotnet-web';
rd[d+'/tutorials/integrate-java-spring']= '/docs/quickstarts/quickstart-springboot-web';
rd[d+'/tutorials/integrate-react']= '/docs/quickstarts/quickstart-javascript-react-web';
rd['/features/architecture']='/platform/built-for-developers';
rd['/features/advanced-registration-forms']='/platform/registration-forms';
rd['/features/breached-password-detection']='/features/authentication';
rd['/features/built-for-developers']='/platform/built-for-developers';
rd['/features/connectors']='/features/authentication';
rd['/features/scalability']='/platform/scalable';
rd['/features/security-data-compliance']='/security-data-compliance';
rd['/features/user-experience']='/platform/customizable';
rd['/features/user-management-reporting']='/features/user-management';
rd['/gaming']='/industries/gaming-entertainment';
rd['/gaming/']='/industries/gaming-entertainment';
rd['/kubernetes']=d+'/installation-guide/kubernetes/';
rd[ex+'/authentication/gaming-identity-provider-needs']=a+'/gaming-entertainment/gaming-identity-provider-needs';
rd[ex+'/authentication/login-authentication-workflows']=a+'/login-authentication-workflows/authentication-workflows-overview';
rd[ex+'/authentication/login-authentication-workflows/']=a+'/login-authentication-workflows/authentication-workflows-overview';
rd[ex+'/dev-tools/jwt-debugger']='/dev-tools/jwt-decoder';
rd[ex+'/identity-basics/avoid-lockin']=a+'/authentication/avoid-lockin';
rd[ex+'/identity-basics/common-authentication-implementation-risks']=a+'/authentication/common-authentication-implementation-risks';
rd[ex+'/identity-basics/making-sure-your-auth-system-scales']=a+'/ciam/making-sure-your-auth-system-scales';
rd[ex+'/identity-basics/value-standards-compliant-authentication']=a+'/oauth/value-standards-compliant-authentication';
rd[ex+'/tokens/anatomy-of-jwt']=a+'/tokens/jwt-components-explained';
rd[ex+'/tokens/jwt-authentication-token-components-explained']=a+'/tokens/jwt-components-explained';
rd['/podcast']='/';
rd['/pricing/cloud/']='/pricing';
rd['/pricing/edition']='/pricing';
rd['/pricing/edition/']='/pricing';
rd['/pricing/editions']='/pricing';
rd['/pricing/editions/']='/pricing';
rd['/products/identity-user-management/ciam-vs-iam']=ex+'/ciam/ciam-vs-iam';
rd['/resources/auth0-migration']='/auth0-migration';
rd['/resources/guide-to-user-data-security']=ex+'/security/guide-to-user-data-security';
rd['/upgrade/from-homegrown']='/compare';
rd['/upgrade/from-open-source']='/compare';
rd['/upgrade/from-saas']='/compare';

// order matters
var redirectsByPrefix = [
  ['/learn/expert-advice/dev-tools', '/dev-tools'],
  ['/learn/expert-advice/authentication/spa', '/articles/login-authentication-workflows/spa'],
  ['/learn/expert-advice/authentication/mobile', '/articles/login-authentication-workflows/mobile'],
  ['/learn/expert-advice/authentication/webapp', '/articles/login-authentication-workflows/webapp'],
  ['/learn/expert-advice', '/articles']
]

// order matters
var redirectsByRegex = [
  ['^/blog/(category|tag|author)/([^/]*)$', '$&/'],
  ['/blog/archive/tag/', '/blog/tag/'],
  ['/blog/\\d\\d\\d\\d/\\d\\d/\\d\\d/', '/blog/']
]

var s3Paths = ['/direct-download', '/license'];
var s3Prefixes = ['/assets/', '/blog/', '/docs/', '/landing/', '/learn/', '/legal/', '/resources/', '/how-to/', '/articles/', '/dev-tools/', '/quickstarts/'];

function handler(event) {
  var req = event.request;
  var hdrs = req.headers;

  if (hdrs.host && hdrs.host.value === 'www.fusionauth.io') {
    return redir('https://fusionauth.io');
  }

  // fusionauth:rocks
  if (hdrs.host && hdrs.host.value !== 'fusionauth.io' && (!hdrs.authorization || hdrs.authorization.value !== 'Basic ZnVzaW9uYXV0aDpyb2Nrcw==')) {
    return {
      statusCode: 401,
      statusDescription: 'Unauthorized',
      headers: {
        'www-authenticate': { value: 'Basic' }
      }
    };
  }

  var uri = req.uri;
  if (uri.endsWith('.html')) {
    return redir(uri.substring(0, uri.length - 5));
  }

  if (uri.endsWith('/') && !uri.startsWith('//') && removeSlash(uri)) {
    return redir(uri.substring(0, uri.length - 1));
  }

  if (!uri.endsWith('/') && ip[uri + '/'] === true) {
    return redir(uri + '/');
  }

  var redirect = calculateRedirect(uri);
  if (redirect !== null) {
    return redir(redirect);
  }

  req.uri = calculateURI(uri);
  return req;
}

function removeSlash(uri) {
  return ip[uri] !== true && (!uri.startsWith('/blog') || (uri.match('^/blog/[\\w\\d-]*/$') && !uri.match('^/blog/latest/$'))) &&
      redirectsByPrefix.find(e => uri.startsWith(e[0])) === undefined;
}

function calculateRedirect(uri) {
  var result = rd.hasOwnProperty(uri) ? rd[uri] : null;

  if (result === null) {
    var prefix_replacement = redirectsByPrefix.find(e => uri.startsWith(e[0]));

    if (prefix_replacement !== undefined) {
      result = uri.replace(prefix_replacement[0], prefix_replacement[1]);
    }
  }

  if (result === null) {
    redirectsByRegex.forEach(function (regexValueArray) {
      var regex = new RegExp(regexValueArray[0], "g");
      var value = regexValueArray[1];
      if (regex.test(uri)) {
        result = uri.replace(regex, value);
      }
    });
  }

  return result;
}

function appendHTML(uri) {
  var slashIndex = uri.lastIndexOf('/');
  var dotIndex = uri.indexOf('.', slashIndex);
  if (slashIndex < uri.length - 1 && dotIndex < 0) {
    uri = uri + '.html';
  }
  return uri;
}

function calculateURI(uri) {
  var i;
  for (i = 0; i < s3Prefixes.length; i++) {
    if (uri.startsWith(s3Prefixes[i])) {
      return uri.endsWith('/') ? uri + 'index.html' : appendHTML(uri);
    }
  }

  for (i = 0; i < s3Paths.length; i++) {
    if (uri === s3Paths[i]) {
      return appendHTML(uri);
    }
  }

  return uri;
}

function redir(loc) {
  return {statusCode:301,statusDescription:'Moved',headers:{'location':{value: loc}}}
}
