var indexPages = {
  '/': true,
  '/blog/': true,
  '/community/forum/': true,
  '/docs/': true,
  '/docs/v1/tech/': true,
  '/docs/v1/tech/account-management/': true,
  '/docs/v1/tech/admin-guide/': true,
  '/docs/v1/tech/apis/': true,
  '/docs/v1/tech/apis/connectors/': true,
  '/docs/v1/tech/apis/entity-management/': true,
  '/docs/v1/tech/apis/identity-providers/': true,
  '/docs/v1/tech/apis/messengers/': true,
  '/docs/v1/tech/client-libraries/': true,
  '/docs/v1/tech/connectors/': true,
  '/docs/v1/tech/core-concepts/': true,
  '/docs/v1/tech/email-templates/': true,
  '/docs/v1/tech/events-webhooks/': true,
  '/docs/v1/tech/events-webhooks/events/': true,
  '/docs/v1/tech/example-apps/': true,
  '/docs/v1/tech/guides/': true,
  '/docs/v1/tech/identity-providers/': true,
  '/docs/v1/tech/identity-providers/external-jwt/': true,
  '/docs/v1/tech/identity-providers/openid-connect/': true,
  '/docs/v1/tech/identity-providers/samlv2-idp-initiated/': true,
  '/docs/v1/tech/identity-providers/samlv2/': true,
  '/docs/v1/tech/installation-guide/': true,
  '/docs/v1/tech/installation-guide/kubernetes/': true,
  '/docs/v1/tech/integrations/': true,
  '/docs/v1/tech/lambdas/': true,
  '/docs/v1/tech/messengers/': true,
  '/docs/v1/tech/migration-guide/': true,
  '/docs/v1/tech/oauth/': true,
  '/docs/v1/tech/plugins/': true,
  '/docs/v1/tech/samlv2/': true,
  '/docs/v1/tech/themes/': true,
  '/docs/v1/tech/tutorials/': true,
  '/docs/v1/tech/tutorials/two-factor/': true,
  '/learn/expert-advice/': true,
  '/learn/expert-advice/authentication/': true,
  '/learn/expert-advice/ciam/': true,
  '/learn/expert-advice/dev-tools/': true,
  '/learn/expert-advice/identity-basics/': true,
  '/learn/expert-advice/oauth/': true,
  '/learn/expert-advice/security/': true,
  '/learn/expert-advice/tokens/': true
};
var redirects = {
  '/docs': '/docs/',
  '/docs/v1/tech/apis/consent': '/docs/v1/tech/apis/consents',
  '/docs/v1/tech/common-errors': '/docs/v1/tech/admin-guide/troubleshooting',
  '/docs/v1/tech/installation-guide/configuration-management': '/docs/v1/tech/admin-guide/configuration-management',
  '/docs/v1/tech/installation-guide/monitor': '/docs/v1/tech/admin-guide/monitor',
  '/docs/v1/tech/installation-guide/securing': '/docs/v1/tech/admin-guide/securing',
  '/docs/v1/tech/installation-guide/upgrade': '/docs/v1/tech/admin-guide/upgrade',
  '/docs/v1/tech/guides/auth0-migration': '/docs/v1/tech/migration-guide/auth0',
  '/docs/v1/tech/guides/migration': '/docs/v1/tech/migration-guide/general',
  '/docs/v1/tech/plugins/password-encryptors': '/docs/v1/tech/plugins/custom-password-hashing',
  '/docs/v1/tech/reference/password-encryptors': '/docs/v1/tech/reference/password-hashes',
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
  '/features/password-control': '/features/passwordless',
  '/features/scalability': '/platform/scalable',
  '/features/security-data-compliance': '/security-data-compliance',
  '/features/user-experience': '/platform/customizable',
  '/features/user-management-reporting': '/features/user-management',
  '/gaming': '/industries/gaming-entertainment',
  '/gaming/': '/industries/gaming-entertainment',
  '/kubernetes': '/docs/v1/tech/installation-guide/kubernetes',
  '/learn/expert-advice/identity-basics/avoid-lockin': '/learn/expert-advice/authentication/avoid-lockin',
  '/learn/expert-advice/identity-basics/common-authentication-implementation-risks': '/learn/expert-advice/authentication/common-authentication-implementation-risks',
  '/learn/expert-advice/identity-basics/making-sure-your-auth-system-scales': '/learn/expert-advice/ciam/making-sure-your-auth-system-scales',
  '/learn/expert-advice/identity-basics/value-standards-compliant-authentication': '/learn/expert-advice/oauth/value-standards-compliant-authentication',
  '/podcast': '/',
  '/pricing/cloud/': '/pricing',
  '/pricing/edition/': '/pricing',
  '/pricing/editions/': '/pricing',
  '/resources/auth0-migration': '/auth0-migration',
  '/resources/guide-to-user-data-security': '/learn/expert-advice/security/guide-to-user-data-security',
  '/upgrade/from-homegrown': '/compare',
  '/upgrade/from-open-source': '/compare',
  '/upgrade/from-saas': '/compare'
};
var s3Paths = ['/direct-download', '/license'];
var s3Prefixes = ['/assets/', '/blog/', '/docs/', '/landing/', '/learn/', '/legal/', '/resources/'];

function handler(event) {
  var request = event.request;
  var headers = request.headers;

  // Handle WWW redirect
  if (headers.host && headers.host.value === 'www.fusionauth.io') {
    return {
      statusCode: 301,
      statusDescription: 'Moved',
      headers: {
        'location': { value: 'https://fusionauth.io' }
      }
    };
  }

  // Basic fusionauth:rocks for dev-time to prevent bots from indexing
  if (headers.host && headers.host.value !== 'fusionauth.io' && (!headers.authorization || headers.authorization.value !== 'Basic ZnVzaW9uYXV0aDpyb2Nrcw==')) {
    return {
      statusCode: 401,
      statusDescription: 'Unauthorized',
      headers: {
        'www-authenticate': { value: 'Basic' }
      }
    };
  }

  var uri = request.uri;
  if (uri.endsWith('.html')) {
    return {
      statusCode: 301,
      statusDescription: 'Moved',
      headers: {
        'location': { value: uri.substring(0, uri.length - 5) }
      }
    };
  }

  if (uri.endsWith('/') && !uri.startsWith('//') && removeSlash(uri)) {
    return {
      statusCode: 301,
      statusDescription: 'Moved',
      headers: {
        'location': { value: uri.substring(0, uri.length - 1) }
      }
    };
  }

  var redirect = calculateRedirect(uri);
  if (redirect !== null) {
    return {
      statusCode: 301,
      statusDescription: 'Moved',
      headers: {
        'location': { value: redirect }
      }
    };
  }

  request.uri = calculateURI(uri);
  return request;
}

function removeSlash(uri) {
  return indexPages[uri] !== true && !uri.startsWith('/blog/page');
}

function calculateRedirect(uri) {
  return redirects.hasOwnProperty(uri) ? redirects[uri] : null;
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
      return appendHTML(uri);
    }
  }

  for (i = 0; i < s3Paths.length; i++) {
    if (uri === s3Paths[i]) {
      return appendHTML(uri);
    }
  }

  return uri;
}

