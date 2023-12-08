const specialCapsMap = {
  'oauth': 'OAuth',
  'oidc': 'OIDC',
  'saml': 'SAML',
  'samlv2': 'SAMLv2',
  'api': 'API',
  'apis': 'APIs',
  'sdk': 'SDK',
  'sdks': 'SDKs',
  'scim': 'SCIM',
  'spa': 'SPA',
}
export const specialCaps = (target: string) => target
    .split(' ')
    .map(target => specialCapsMap[target.toLowerCase()] || target)
    .join(' ');