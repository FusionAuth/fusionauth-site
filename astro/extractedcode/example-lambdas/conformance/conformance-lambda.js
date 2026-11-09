// records how the runtime behaves into a claim, so the harness and a real FusionAuth can be compared
var invocations = 0;

function populate(jwt, user, registration, context) {
  var url = 'http://localhost:9011/.well-known/openid-configuration';
  var o = { jwtKeys: Object.keys(jwt).sort() };

  function attempt(fn) {
    try {
      var value = fn();
      return value === undefined ? 'ok' : String(value);
    } catch (e) {
      return 'threw';
    }
  }

  o.globals = ['require', 'process', 'setTimeout', 'setInterval', 'URL', 'URLSearchParams', 'TextEncoder', 'atob', 'btoa',
    'crypto', 'Buffer', 'structuredClone', 'Java', 'Polyglot', 'Graal', 'print', 'fetch', 'Headers', 'FusionAuth', 'console']
    .map(function (name) { return name + ':' + typeof globalThis[name]; });
  o.console = ['info', 'log', 'debug', 'error', 'warn', 'trace'].map(function (name) { return name + ':' + typeof console[name]; });
  o.es = [typeof [].at, typeof [].toSorted, typeof [].findLast, typeof Object.groupBy, typeof ''.replaceAll, typeof Intl];

  var secrets = context.services.secrets;
  o.secrets = [
    secrets.get('conformance-secret'),
    String(secrets.get('missing-secret')),
    String(secrets.get()),
    String(secrets.get(null)),
    attempt(function () { return secrets.get(42); }),
  ];

  o.guid = FusionAuth.ActiveDirectory.b64GuidToString('QuQS3jITvkaM8/3bq+sqBA==');

  var r = fetch(url);
  o.fetch = {
    status: r.status,
    body: typeof r.body,
    keys: Object.keys(r).sort(),
    caseInsensitive: r.headers['content-type'] === r.headers['CONTENT-TYPE'],
    contentType: typeof r.headers['Content-Type'],
    missingHeader: String(r.headers['x-not-a-header']),
    extras: [typeof r.headers.get, typeof r.json, typeof r.ok, typeof r.text],
    readOnly: attempt(function () { r.status = 1; return r.status; }),
    addedHeader: attempt(function () { r.headers['X-Added'] = 'yes'; return r.headers['x-added']; }),
    issuer: typeof JSON.parse(r.body).issuer,
  };

  o.network = attempt(function () {
    var n = fetch('http://localhost:1/', { connectTimeout: 500 });
    return n.status + ':' + (n.body === null ? 'null' : typeof n.body);
  });

  o.invalid = [
    attempt(function () { fetch(); }),
    attempt(function () { fetch(42); }),
    attempt(function () { fetch(url, { method: 5 }); }),
    attempt(function () { fetch(url, { headers: { 'X-Number': 1 } }); }),
    attempt(function () { fetch(url, { body: {} }); }),
    attempt(function () { fetch(url, { method: 'get', headers: { 'X-Many': ['a', 'b'] } }); }),
  ];

  var h = new Headers({ Accept: 'text/plain' });
  h['accept'] = 'application/json';
  h.Accept = 'text/html';
  o.headers = { accept: h.ACCEPT, keys: Object.keys(h) };

  o.user = {
    memberships: Array.isArray(user.memberships) ? user.memberships.map(function (m) { return typeof m.groupId; }) : typeof user.memberships,
    insertInstant: typeof user.insertInstant, birthDate: user.birthDate, registration: registration === null ? 'null' : typeof registration };
  o.context = { keys: Object.keys(context).sort(), scopes: context.scopes, services: typeof context.services, get: typeof secrets.get };
  o.invocations = ++invocations;

  console.info('conformance ', 1, ' ', true, ' ', null, ' ', undefined, ' ', ['x', 2], ' ', { k: 'v', n: { m: 'w' } }, ' ', {});

  jwt.conformance = o;
  jwt.dateClaim = new Date(0);
  jwt.undefinedClaim = undefined;
  jwt.functionClaim = function () {};
  jwt.nullClaim = null;
  jwt.roles = null;
  jwt.sub = 'changed';
  jwt.exp = null;
  delete jwt.applicationId;
}
