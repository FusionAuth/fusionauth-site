// records the arguments, then changes every claim, so check.js can compare what FusionAuth keeps with what the harness keeps
// check.js appends: var alsoChange = [...claim names that may be missing from the input];
function populate(claims) {
  var others = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
  var context = arguments[arguments.length - 1];
  var callerContext = {};
  Object.keys(context).forEach(function (key) {
    if (key !== 'services') {
      callerContext[key] = context[key];
    }
  });
  var probe = { input: JSON.parse(JSON.stringify(claims)), others: JSON.parse(JSON.stringify(others)), context: JSON.parse(JSON.stringify(callerContext)) };

  function changed(value) {
    if (typeof value === 'string') return value + '-changed';
    if (typeof value === 'number') return value - 1;
    if (typeof value === 'boolean') return !value;
    if (Array.isArray(value)) return value.concat(['changed']);
    if (value && typeof value === 'object') return Object.assign({}, value, { changed: true });
    return 'changed';
  }

  Object.keys(claims).concat(alsoChange).forEach(function (name) {
    claims[name] = changed(claims[name]);
  });
  claims.probeAdded = 'added';
  claims.probeNull = null;
  claims.probe = probe;
}
