// runs inside the lambda context; installs the globals FusionAuth provides
// the bridge only passes strings across, so every object the lambda sees belongs to its own realm
(function (bridge) {
  'use strict';

  var g = globalThis;

  function display(value, quoteKey, quoteValue) {
    if (typeof value === 'string') {
      return quoteValue ? '"' + value + '"' : value;
    }
    if (Array.isArray(value)) {
      return '(' + value.length + ')[' + value.map(function (v) { return display(v, true, true); }).join(', ') + ']';
    }
    if (value !== null && typeof value === 'object') {
      var keys = Object.keys(value);
      if (keys.length === 0) {
        return '{}';
      }
      return '{' + keys.map(function (k) {
        return (quoteKey ? '"' + k + '"' : k) + ': ' + display(value[k], true, true);
      }).join(', ') + '}';
    }
    return String(value);
  }

  function writer(level) {
    return function () {
      var text = '';
      for (var n = 0; n < arguments.length; n++) {
        text += display(arguments[n], false, false);
      }
      if (arguments.length > 0) {
        bridge.log(level, text + '\n');
      }
    };
  }

  var info = writer('info');
  g.console = { info: info, log: info, debug: writer('debug'), error: writer('error') };

  // names keep their case; assigning to the exact same name appends, lookups return the first match ignoring case
  function headerView(store) {
    function find(name) {
      if (typeof name !== 'string') {
        return undefined;
      }
      var lower = name.toLowerCase();
      return Object.keys(store).find(function (key) { return key.toLowerCase() === lower; });
    }
    return new Proxy(store, {
      get: function (target, name) {
        var key = find(name);
        if (key === undefined) {
          return undefined;
        }
        var values = target[key];
        return values.length === 1 ? values[0] : values.slice();
      },
      set: function (target, name, value) {
        if (typeof name === 'string') {
          target[name] = (Object.hasOwn(target, name) ? target[name] : []).concat([value]);
        }
        return true;
      },
      has: function (target, name) { return find(name) !== undefined; },
      deleteProperty: function () { return true; },
      defineProperty: function () { return true; },
    });
  }

  function readOnly(target) {
    return new Proxy(target, {
      set: function () { return true; },
      deleteProperty: function () { return true; },
      defineProperty: function () { return true; },
    });
  }

  function requireString(value, what) {
    if (typeof value !== 'string') {
      throw new TypeError(what + ' must be a string.');
    }
    return value;
  }

  g.Headers = function Headers(init) {
    if (!new.target) {
      throw new TypeError('Headers must be called with new.');
    }
    var view = headerView({});
    if (Array.isArray(init)) {
      init.forEach(function (pair) {
        if (Array.isArray(pair)) {
          view[requireString(pair[0], 'A header name')] = pair[1];
        }
      });
    } else if (init !== undefined && init !== null) {
      Object.keys(init).forEach(function (key) { view[key] = init[key]; });
    }
    return view;
  };

  g.fetch = function fetch(url, options) {
    var unlicensed = bridge.unlicensed();
    if (unlicensed) {
      var denied = JSON.parse(unlicensed);
      return readOnly({ body: denied.body, headers: headerView(denied.headers), status: denied.status });
    }
    if (arguments.length === 0) {
      throw new TypeError('Invalid call to fetch(). You must supply at least one argument, the first of which must be a URL.');
    }
    var request = { url: requireString(url, 'The fetch() URL'), method: 'GET', headers: {} };
    if (arguments.length >= 2 && options !== undefined && options !== null) {
      if (options.method !== undefined && options.method !== null) {
        request.method = requireString(options.method, 'The fetch() method').toUpperCase();
      }
      var headers = options.headers;
      if (headers !== undefined && headers !== null) {
        Object.keys(headers).forEach(function (key) {
          var value = headers[key];
          var values = Array.isArray(value) ? value : [value];
          request.headers[key] = values.map(function (v) { return requireString(v, 'A header value'); });
        });
      }
      if (options.body !== undefined && options.body !== null) {
        request.body = requireString(options.body, 'The fetch() body');
      }
      ['connectTimeout', 'readTimeout'].forEach(function (name) {
        if (options[name] !== undefined && options[name] !== null) {
          if (typeof options[name] !== 'number') {
            throw new TypeError(name + ' must be a number.');
          }
          request[name] = Math.trunc(options[name]);
        }
      });
    }

    var reply = JSON.parse(bridge.fetch(JSON.stringify(request)));
    if (reply.error) {
      throw new Error(reply.error);
    }
    return readOnly({ body: reply.body, headers: headerView(reply.headers), status: reply.status });
  };

  // GraalJS built-ins that FusionAuth leaves in place; print output goes nowhere a lambda author can see
  g.Graal = readOnly({});
  g.print = function print() {};

  g.FusionAuth = readOnly({
    ActiveDirectory: readOnly({
      b64GuidToString: function (value) {
        return arguments.length === 1 ? bridge.guid(requireString(value, 'The encoded GUID')) : null;
      },
    }),
  });

  var secrets = readOnly({
    get: function (name) {
      if (arguments.length !== 1 || name === null || name === undefined) {
        return null;
      }
      return bridge.secret(requireString(name, 'The secret name'));
    },
  });
  var services = readOnly({ secrets: secrets });

  // captured before the lambda loads, so the lambda can't change how arguments cross over
  var parse = JSON.parse;
  var stringify = JSON.stringify;

  return {
    toLambda: function (json) { return parse(json); },
    fromLambda: function (value) { return stringify(value); },
    context: function (json) {
      var context = parse(json) || {};
      context.services = services;
      return context;
    },
    isThenable: function (value) {
      return value !== null && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    },
  };
})
