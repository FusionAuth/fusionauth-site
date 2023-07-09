var d="/docs/v1/tech";
var a="/articles";
var idp="identity-providers";
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
ip[d+'']=true;
ip[d+'account-management/']=true;
ip[d+'admin-guide/']=true;
ip[d+'advanced-threat-detection/']=true;
ip[d+'apis/']=true;
ip[d+'apis/connectors/']=true;
ip[d+'apis/entity-management/']=true;
ip[d+'apis/identity-providers/']=true;
ip[d+'apis/messengers/']=true;
ip[d+'apis/scim/']=true;
ip[d+'client-libraries/']=true;
ip[d+'connectors/']=true;
ip[d+'core-concepts/']=true;
ip[d+'developer-guide/']=true;
ip[d+'developer-guide/api-gateways/']=true;
ip[d+'email-templates/']=true;
ip[d+'events-webhooks/']=true;
ip[d+'events-webhooks/events/']=true;
ip[d+'example-apps/']=true;
ip[d+'getting-started/']=true;
ip[d+'guides/']=true;
ip[d+idp+'/']=true;
ip[d+idp+'/external-jwt/']=true;
ip[d+idp+'/openid-connect/']=true;
ip[d+idp+'/samlv2-idp-initiated/']=true;
ip[d+idp+'/samlv2/']=true;
ip[d+'installation-guide/']=true;
ip[d+'installation-guide/kubernetes/']=true;
ip[d+'integrations/']=true;
ip[d+'lambdas/']=true;
ip[d+'messengers/']=true;
ip[d+'migration-guide/']=true;
ip[d+'oauth/']=true;
ip[d+'passwordless/']=true;
ip[d+'plugins/']=true;
ip[d+'premium-features/']=true;
ip[d+'premium-features/webauthn/']=true;
ip[d+'reference/']=true;
ip[d+'samlv2/']=true;
ip[d+'themes/']=true;
ip[d+'tutorials/']=true;
ip[d+'tutorials/gating/']=true;
ip[d+'tutorials/two-factor/']=true;
ip['/how-to/']=true;
ip['/quickstarts/']=true;



var redirects = {
  '/cognito': '/docs/v1/tech/migration-guide/cognito',
  '/cognito/': '/docs/v1/tech/migration-guide/cognito',
  '/docs/v1/tech/admin-guide/release-notifications': '/docs/v1/tech/admin-guide/releases',
  '/docs/v1/tech/apis/consent': '/docs/v1/tech/apis/consents',
  '/docs/v1/tech/common-errors': '/docs/v1/tech/admin-guide/troubleshooting',
  '/docs/v1/tech/guides/auth0-migration': '/docs/v1/tech/migration-guide/auth0',
  '/docs/v1/tech/guides/migration': '/docs/v1/tech/migration-guide/general',
  '/docs/v1/tech/guides/passwordless': '/docs/v1/tech/passwordless/magic-links',
  '/docs/v1/tech/guides/webauthn': '/docs/v1/tech/passwordless/webauthn-passkeys',
  '/docs/v1/tech/installation-guide/configuration-management': '/docs/v1/tech/admin-guide/configuration-management',
  '/docs/v1/tech/installation-guide/monitor': '/docs/v1/tech/admin-guide/monitor',
  '/docs/v1/tech/installation-guide/securing': '/docs/v1/tech/admin-guide/securing',
  '/docs/v1/tech/installation-guide/upgrade': '/docs/v1/tech/admin-guide/upgrade',
  '/docs/v1/tech/passwordless/webauthn': '/docs/v1/tech/passwordless/webauthn-passkeys',
  '/docs/v1/tech/plugins/password-encryptors': '/docs/v1/tech/plugins/custom-password-hashing',
  '/docs/v1/tech/reference/password-encryptors': '/docs/v1/tech/reference/password-hashes',
  '/docs/v1/tech/reactor': '/docs/v1/tech/admin-guide/licensing',
  '/docs/v1/tech/reactor/': '/docs/v1/tech/admin-guide/licensing',
  '/docs/v1/tech/troubleshooting': '/docs/v1/tech/admin-guide/troubleshooting',
  '/docs/v1/tech/tutorials/gate-accounts-until-verified': '/docs/v1/tech/tutorials/gating/gate-accounts-until-user-email-verified',
  '/docs/v1/tech/tutorials/migrate-users': '/docs/v1/tech/migration-guide/tutorial',
  '/docs/v1/tech/tutorials/setting-up-user-account-lockout': '/docs/v1/tech/tutorials/gating/setting-up-user-account-lockout',
  '/docs/v1/tech/tutorials/two-factor/authenticator-app': '/docs/v1/tech/tutorials/two-factor/authenticator-app-pre-1-26',
  '/docs/v1/tech/tutorials/two-factor/twilio-push': '/docs/v1/tech/tutorials/two-factor/twilio-push-pre-1-26',
  '/features/architecture': '/platform/built-for-developers',
  '/features/advanced-registration-forms': '/platform/registration-forms',
  '/features/breached-password-detection': '/features/authentication',
  '/features/built-for-developers': '/platform/built-for-developers',
  '/features/connectors': '/features/authentication',
  '/features/scalability': '/platform/scalable',
  '/features/security-data-compliance': '/security-data-compliance',
  '/features/user-experience': '/platform/customizable',
  '/features/user-management-reporting': '/features/user-management',
  '/gaming': '/industries/gaming-entertainment',
  '/gaming/': '/industries/gaming-entertainment',
  '/kubernetes': '/docs/v1/tech/installation-guide/kubernetes/',
  '/learn/expert-advice/authentication/gaming-identity-provider-needs': '/articles/gaming-entertainment/gaming-identity-provider-needs',
  '/learn/expert-advice/authentication/login-authentication-workflows': '/articles/login-authentication-workflows/authentication-workflows-overview',
  '/learn/expert-advice/authentication/login-authentication-workflows/': '/articles/login-authentication-workflows/authentication-workflows-overview',
  '/learn/expert-advice/dev-tools/jwt-debugger': '/dev-tools/jwt-decoder',
  '/learn/expert-advice/identity-basics/avoid-lockin': '/articles/authentication/avoid-lockin',
  '/learn/expert-advice/identity-basics/common-authentication-implementation-risks': '/articles/authentication/common-authentication-implementation-risks',
  '/learn/expert-advice/identity-basics/making-sure-your-auth-system-scales': '/articles/ciam/making-sure-your-auth-system-scales',
  '/learn/expert-advice/identity-basics/value-standards-compliant-authentication': '/articles/oauth/value-standards-compliant-authentication',
  '/learn/expert-advice/tokens/anatomy-of-jwt': '/articles/tokens/jwt-components-explained',
  '/learn/expert-advice/tokens/jwt-authentication-token-components-explained': '/articles/tokens/jwt-components-explained',
  '/podcast': '/',
  '/pricing/cloud/': '/pricing',
  '/pricing/edition': '/pricing',
  '/pricing/edition/': '/pricing',
  '/pricing/editions': '/pricing',
  '/pricing/editions/': '/pricing',
  '/products/identity-user-management/ciam-vs-iam': '/learn/expert-advice/ciam/ciam-vs-iam',
  '/resources/auth0-migration': '/auth0-migration',
  '/resources/guide-to-user-data-security': '/learn/expert-advice/security/guide-to-user-data-security',
  '/upgrade/from-homegrown': '/compare',
  '/upgrade/from-open-source': '/compare',
  '/upgrade/from-saas': '/compare'
};

// order matters
var redirectsByPrefix = [
  ['/learn/expert-advice/dev-tools', '/dev-tools'],
  ['/learn/expert-advice/authentication/spa', '/articles/login-authentication-workflows/spa'],
  ['/learn/expert-advice/authentication/mobile', '/articles/login-authentication-workflows/mobile'],
  ['/learn/expert-advice/authentication/webapp', '/articles/login-authentication-workflows/webapp'],
  ['/learn/expert-advice', '/articles']
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
  return ip[uri] !== true && !uri.startsWith('/blog/page') && !uri.startsWith('/blog/archive') &&
    redirectsByPrefix.find(e => uri.startsWith(e[0])) === undefined;
}

function calculateRedirect(uri) {
  var result = redirects.hasOwnProperty(uri) ? redirects[uri] : null;

  if (result === null) {
    var prefix_replacement = redirectsByPrefix.find(e => uri.startsWith(e[0]));

    if (prefix_replacement !== undefined) {
      result = uri.replace(prefix_replacement[0], prefix_replacement[1]);
    }
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
