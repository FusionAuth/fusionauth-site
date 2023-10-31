var d="/docs/v1/tech";
var a="/articles";
var ex="/learn/expert-advice";
var idp="/identity-providers";
var bc="/blog/category";
var bac="/blog/archive/category";
var t="/tutorials/";
var f="/features/";
var dq="/docs/quickstarts/"
var at="/authentication/"
var ib="/identity-basics/"
var pe="/pricing/edition";

var ip = {};
ip['/']=true;
ip[a+'/']=true;
ip[a+at]=true;
ip[a+'/ciam/']=true;
ip[a+'/gaming-entertainment/']=true;
ip[a+ib]=true;
ip[a+'/login-authentication-workflows/']=true;
ip[a+'/oauth/']=true;
ip[a+'/security/']=true;
ip[a+'/tokens/']=true;
ip['/blog/']=true;
ip['/community/forum/']=true;
ip['/dev-tools/']=true;
ip['/docs/']=true;
ip[dq]=true;
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
ip[d+t]=true;
ip[d+t+'gating/']=true;
ip[d+t+'two-factor/']=true;
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
rd[d+t+'gate-accounts-until-verified']=d+t+'gating/gate-accounts-until-user-email-verified';
rd[d+t+'migrate-users']=d+'/migration-guide/tutorial';
rd[d+t+'setting-up-user-account-lockout']=d+t+'gating/setting-up-user-account-lockout';
rd[d+t+'two-factor/authenticator-app']=d+t+'two-factor/authenticator-app-pre-1-26';
rd[d+t+'two-factor/twilio-push']=d+t+'two-factor/twilio-push-pre-1-26';
rd[d+t+'integrate-angular']= dq+'quickstart-javascript-angular-web';
rd[d+t+'integrate-python-django']= dq+'quickstart-python-django-web';
rd[d+t+'integrate-python-flask']= dq+'quickstart-python-flask-web';
rd[d+t+'integrate-ruby-rails']= dq+'quickstart-ruby-rails-web';
rd[d+t+'integrate-dotnet']= dq+'quickstart-dotnet-web';
rd[d+t+'integrate-java-spring']= dq+'quickstart-springboot-web';
rd[d+t+'integrate-react']= dq+'quickstart-javascript-react-web';
rd[d+t+'integrate-expressjs']= dq+'quickstart-javascript-express-web';
rd[f+'architecture']='/platform/built-for-developers';
rd[f+'advanced-registration-forms']='/platform/registration-forms';
rd[f+'breached-password-detection']=f+'authentication';
rd[f+'built-for-developers']='/platform/built-for-developers';
rd[f+'connectors']=f+'authentication';
rd[f+'scalability']='/platform/scalable';
rd[f+'security-data-compliance']='/security-data-compliance';
rd[f+'user-experience']='/platform/customizable';
rd[f+'user-management-reporting']=f+'user-management';
rd['/gaming']='/industries/gaming-entertainment';
rd['/gaming/']='/industries/gaming-entertainment';
rd['/kubernetes']=d+'/installation-guide/kubernetes/';
rd[ex+at+'/gaming-identity-provider-needs']=a+'/gaming-entertainment/gaming-identity-provider-needs';
rd[ex+at+'/login-authentication-workflows']=a+'/login-authentication-workflows/authentication-workflows-overview';
rd[ex+at+'/login-authentication-workflows/']=a+'/login-authentication-workflows/authentication-workflows-overview';
rd[ex+'/dev-tools/jwt-debugger']='/dev-tools/jwt-decoder';
rd[ex+ib+'avoid-lockin']=a+at+'/avoid-lockin';
rd[ex+ib+'common-authentication-implementation-risks']=a+at+'/common-authentication-implementation-risks';
rd[ex+ib+'making-sure-your-auth-system-scales']=a+'/ciam/making-sure-your-auth-system-scales';
rd[ex+ib+'value-standards-compliant-authentication']=a+'/oauth/value-standards-compliant-authentication';
rd[ex+'/tokens/anatomy-of-jwt']=a+'/tokens/jwt-components-explained';
rd[ex+'/tokens/jwt-authentication-token-components-explained']=a+'/tokens/jwt-components-explained';
rd['/podcast']='/';
rd['/pricing/cloud/']='/pricing';
rd[pe]='/pricing';
rd[pe+'/']='/pricing';
rd[pe+'s']='/pricing';
rd[pe+'s/']='/pricing';
rd['/products/identity-user-management/ciam-vs-iam']=ex+'/ciam/ciam-vs-iam';
rd['/resources/auth0-migration']='/auth0-migration';
rd['/resources/guide-to-user-data-security']=ex+'/security/guide-to-user-data-security';
rd['/upgrade/from-homegrown']='/compare';
rd['/upgrade/from-open-source']='/compare';
rd['/upgrade/from-saas']='/compare';

// order matters
var redirectsByPrefix = [
  [ex+'/dev-tools', '/dev-tools'],
  [ex+at+'spa', '/articles/login-authentication-workflows/spa'],
  [ex+at+'mobile', '/articles/login-authentication-workflows/mobile'],
  [ex+at+'webapp', '/articles/login-authentication-workflows/webapp'],
  [ex, '/articles']
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