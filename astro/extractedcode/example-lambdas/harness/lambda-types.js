// function name and arguments in call order for each lambda type
// mutable: FusionAuth keeps changes the lambda makes to the argument
// context: the fields FusionAuth passes in context besides services, which a test can supply as a fixture
// reservedClaims: changes to these claims are discarded; keepWhenNull: claims that setting null can't remove
// capExp: a lambda can lower exp but not raise it; narrowToExchange: aud and scope are limited to what the policy granted
const m = (name) => ({ name, mutable: true });
const i = (name) => ({ name, mutable: false });

const jwtReserved = ['act', 'amr', 'auth_time', 'authenticationType', 'cnf', 'fa_uid', 'gty', 'iat', 'sub', 'tid', 'tty'];

const reconcile = (third) => ({ fn: 'reconcile', args: [m('user'), m('registration'), i(third)] });

export const lambdaTypes = {
  JWTPopulate: { fn: 'populate', args: [m('jwt'), i('user'), i('registration')], context: ['application', 'scopes'], reservedClaims: jwtReserved, keepWhenNull: ['exp'], capExp: true },
  ClientCredentialsJWTPopulate: {
    fn: 'populate',
    args: [m('jwt'), i('recipientEntity'), i('targetEntities'), i('permissions')],
    reservedClaims: ['act', 'amr', 'aud', 'authenticationType', 'cnf', 'exp', 'gty', 'iat', 'permissions', 'sub', 'tid', 'tty', 'use'],
  },
  UserInfoPopulate: {
    fn: 'populate',
    args: [m('userInfo'), i('user'), i('registration'), i('jwt')],
    reservedClaims: ['email', 'email_verified', 'phone_number_verified', 'sub', 'tid'],
  },
  SAMLv2Populate: { fn: 'populate', args: [m('samlResponse'), i('user'), i('registration')] },

  OpenIDReconcile: { fn: 'reconcile', args: [m('user'), m('registration'), i('jwt'), i('id_token'), i('tokens')] },
  SAMLv2Reconcile: reconcile('samlResponse'),
  AppleReconcile: reconcile('idToken'),
  GoogleReconcile: reconcile('idToken'),
  ExternalJWTReconcile: reconcile('jwt'),
  FacebookReconcile: reconcile('facebookUser'),
  TwitterReconcile: reconcile('twitterUser'),
  LinkedInReconcile: reconcile('linkedInUser'),
  HYPRReconcile: { fn: 'reconcile', args: [m('user'), m('registration')] },
  EpicGamesReconcile: reconcile('userInfo'),
  NintendoReconcile: reconcile('userInfo'),
  SonyPSNReconcile: reconcile('userInfo'),
  SteamReconcile: reconcile('userInfo'),
  TwitchReconcile: reconcile('userInfo'),
  XboxReconcile: reconcile('userInfo'),
  LDAPConnectorReconcile: { fn: 'reconcile', args: [m('user'), i('userAttributes')] },

  SCIMServerGroupRequestConverter: { fn: 'convert', args: [m('group'), m('members'), m('options'), i('scimGroup')] },
  SCIMServerGroupResponseConverter: { fn: 'convert', args: [m('scimGroup'), i('group'), i('members')] },
  SCIMServerUserRequestConverter: { fn: 'convert', args: [m('user'), m('options'), i('scimUser')] },
  SCIMServerUserResponseConverter: { fn: 'convert', args: [m('scimUser'), i('user')] },

  LoginValidation: { fn: 'validate', args: [m('result'), i('user'), i('registration')], context: ['authenticationType', 'identityProvider'] },
  SelfServiceRegistrationValidation: { fn: 'validate', args: [m('result'), i('user'), i('registration')], context: ['fields', 'form', 'step', 'stepIndex', 'totalSteps'] },
  MFARequirement: {
    fn: 'checkRequired',
    args: [m('result'), i('user'), i('registration')],
    context: ['accessToken', 'action', 'application', 'authenticationThreats', 'authenticationType', 'clientRisk', 'eventInfo', 'mfaTrust', 'policies'],
  },

  TokenExchangePolicy: { fn: 'policy', args: [m('result'), i('exchange')], context: ['tenantId'] },
  TokenExchangePopulate: {
    fn: 'populate',
    args: [m('jwt'), i('exchange')],
    reservedClaims: ['act', 'amr', 'applicationId', 'auth_time', 'authenticationType', 'client_id', 'cnf', 'gty', 'iat', 'iss', 'jti', 'may_act', 'sid', 'sub', 'tid', 'tty'],
    keepWhenNull: ['exp'],
    capExp: true,
    narrowToExchange: true,
  },
  CimdClientRegistration: { fn: 'evaluate', args: [m('result'), i('clientMetadata')], context: ['authenticationThreats', 'eventInfo', 'resource'] },
};
