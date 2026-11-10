import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { lambdaTypes } from './lambda-types.js';

export { lambdaTypes };

const sandboxSource = readFileSync(new URL('./sandbox.js', import.meta.url), 'utf8');

// same text FusionAuth returns, including the whitespace
function errorBody(message) {
  return `{\n  "generalErrors": [{\n    "code": "[LambdaFetchRequestFailed]",\n    "message": "${message}"\n  }]\n}\n`;
}

function errorResponse(status, message) {
  return JSON.stringify({ status, headers: { 'Content-Type': ['application/json; charset=utf-8'] }, body: errorBody(message) });
}

// a fetch mock response for a request that never reaches a server
export function networkError() {
  return { status: -1, headers: {}, body: null };
}

function normalizeResponse(response) {
  const headers = {};
  for (const [name, value] of Object.entries(response.headers ?? {})) {
    headers[name] = (Array.isArray(value) ? value : [value]).map(String);
  }
  let body = response.body ?? null;
  if (body !== null && typeof body !== 'string') {
    body = JSON.stringify(body);
    if (!Object.keys(headers).some((name) => name.toLowerCase() === 'content-type')) {
      headers['Content-Type'] = ['application/json'];
    }
  }
  return { status: response.status ?? 200, headers, body };
}

function matches(route, request) {
  if (route.method && route.method.toUpperCase() !== request.method) {
    return false;
  }
  return route.url instanceof RegExp ? route.url.test(request.url) : route.url === request.url;
}

// mocks: a function (request) => response, or an array of { method?, url, response | respond(request) }
function resolveMock(mocks, request) {
  if (typeof mocks === 'function') {
    return mocks(request);
  }
  const route = (mocks ?? []).find((r) => matches(r, request));
  if (!route) {
    return undefined;
  }
  return typeof route.respond === 'function' ? route.respond(request) : route.response;
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// FusionAuth updates the original object, so top-level keys the lambda deleted keep their original value
function mergeTopLevel(original, changed) {
  return isObject(original) && isObject(changed) ? { ...original, ...changed } : changed;
}

// claim maps: reserved claims keep their original value, and a null value removes the claim
function applyClaimRules(original, merged, definition) {
  if (!isObject(merged)) {
    return merged;
  }
  const result = { ...merged };
  for (const claim of Object.keys(result)) {
    const keep = definition.reservedClaims.includes(claim) || (result[claim] === null && definition.keepWhenNull?.includes(claim));
    if (keep && isObject(original) && Object.hasOwn(original, claim)) {
      result[claim] = original[claim];
    } else if (keep || result[claim] === null) {
      delete result[claim];
    }
  }
  return result;
}

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);

const stringList = (value) => (Array.isArray(value) ? value : [value]).filter((v) => typeof v === 'string' && v.trim() !== '');

// keeps the claim values in the granted list, or uses the whole granted list when none match
function narrow(current, granted) {
  const kept = current.filter((v) => granted.includes(v));
  return kept.length ? kept : granted;
}

// what FusionAuth does to the claims after the populate lambda returns
function finalizeClaims(original, claims, definition, args) {
  if (!isObject(claims)) {
    return claims;
  }
  if (definition.capExp && isNumber(original?.exp) && (!isNumber(claims.exp) || claims.exp > original.exp)) {
    claims.exp = original.exp;
  }
  if (definition.narrowToExchange) {
    delete claims.fa_uid;
    const audiences = args.exchange?.audiences ?? [];
    if (audiences.length) {
      claims.aud = narrow(stringList(claims.aud ?? []), audiences);
    } else {
      delete claims.aud;
    }
    const scopes = args.exchange?.scopes ?? [];
    const current = typeof claims.scope === 'string' ? claims.scope.split(' ').filter(Boolean) : stringList(claims.scope ?? []);
    if (scopes.length) {
      claims.scope = narrow(current, scopes).join(' ');
    } else {
      delete claims.scope;
    }
  }
  return claims;
}

function guidToString(encoded) {
  const b = Buffer.from(encoded, 'base64');
  const hex = (bytes) => bytes.map((x) => x.toString(16).padStart(2, '0')).join('');
  return [
    hex([b[3], b[2], b[1], b[0]]),
    hex([b[5], b[4]]),
    hex([b[7], b[6]]),
    hex([b[8], b[9]]),
    hex([...b.subarray(10, 16)]),
  ].join('-');
}

/**
 * Loads lambda source into a sandbox that provides the same globals as FusionAuth.
 * The returned lambda keeps its top-level state between invocations.
 *
 * options.fetch     fetch mocks, see resolveMock
 * options.secrets   { name: value } returned by context.services.secrets.get(name)
 * options.licensed  false makes fetch() return the 402 response an unlicensed instance returns
 * options.debug     true keeps console.debug output, as the lambda's Debug setting does
 * options.requestPath  the API path that triggered the lambda; fetch() to that path returns 400
 */
export function loadLambda(source, type, options = {}) {
  const definition = lambdaTypes[type];
  if (!definition) {
    throw new Error(`Unknown lambda type [${type}]. Known types: ${Object.keys(lambdaTypes).join(', ')}`);
  }

  let logs = { info: '', debug: '', error: '' };
  let requests = [];
  const secrets = options.secrets ?? {};

  const bridge = {
    log(level, text) {
      if (level !== 'debug' || options.debug) {
        logs[level] += text;
      }
    },
    unlicensed() {
      if (options.licensed !== false) {
        return null;
      }
      return errorResponse(402, 'This function is part of the Advanced Lambdas feature. Please contact FusionAuth for more information about this feature.');
    },
    fetch(json) {
      const request = JSON.parse(json);
      requests.push(request);
      if (options.requestPath && new URL(request.url).pathname === options.requestPath) {
        return errorResponse(400, `Lambda invocation error.Id: (harness)Name: (harness)Cause: Illegal recursive request.Description: You cannot call the API from a lambda that is currently invoking this lambda. That would be bad.Requested URL: ${request.url}`);
      }
      let response;
      try {
        response = resolveMock(options.fetch, request);
      } catch (e) {
        return JSON.stringify({ error: `The fetch mock for ${request.method} ${request.url} threw: ${e.message}` });
      }
      if (response === undefined) {
        return JSON.stringify({ error: `No fetch mock matches ${request.method} ${request.url}` });
      }
      return JSON.stringify(normalizeResponse(response));
    },
    secret(name) {
      return Object.hasOwn(secrets, name) ? String(secrets[name]) : null;
    },
    guid: guidToString,
  };

  const context = vm.createContext({});
  const runtime = vm.runInContext(sandboxSource, context, { filename: 'sandbox.js' })(bridge);
  vm.runInContext(source, context, { filename: options.filename ?? `${type}.js` });

  const fn = vm.runInContext(`typeof ${definition.fn} === 'function' ? ${definition.fn} : undefined`, context);
  if (!fn) {
    throw new Error(`A ${type} lambda must define a function named ${definition.fn}.`);
  }

  return {
    /**
     * Calls the lambda function. args holds the arguments by name, and a missing argument is null.
     * Returns the mutable arguments as FusionAuth keeps them, plus logs and the fetch requests made.
     */
    invoke(args = {}, invokeOptions = {}) {
      logs = { info: '', debug: '', error: '' };
      requests = [];

      const unknown = Object.keys(invokeOptions.context ?? {}).filter((key) => !(definition.context ?? []).includes(key));
      if (unknown.length) {
        throw new Error(`FusionAuth doesn't pass ${type} lambdas context.${unknown.join(', context.')}.`);
      }

      const inputs = definition.args.map((arg) => args[arg.name] ?? null);
      const lambdaArgs = inputs.map((value) => runtime.toLambda(JSON.stringify(value)));
      const lambdaContext = runtime.context(JSON.stringify(invokeOptions.context ?? {}));

      const returned = fn(...lambdaArgs, lambdaContext);
      if (runtime.isThenable(returned)) {
        throw new Error(`${definition.fn}() returned a Promise. FusionAuth doesn't wait for promises, so lambda functions must be synchronous.`);
      }

      const result = { logs, requests };
      definition.args.forEach((arg, n) => {
        if (arg.mutable) {
          const json = runtime.fromLambda(lambdaArgs[n]);
          const merged = mergeTopLevel(inputs[n], json === undefined ? null : JSON.parse(json));
          result[arg.name] = n === 0 && definition.reservedClaims
            ? finalizeClaims(inputs[n], applyClaimRules(inputs[n], merged, definition), definition, args)
            : merged;
        }
      });
      return result;
    },
  };
}

export function loadLambdaFile(fileUrl, type, options = {}) {
  const source = readFileSync(fileUrl, 'utf8');
  return loadLambda(source, type, { filename: String(fileUrl).split('/').pop(), ...options });
}

// loads and invokes once, for tests that don't need state between calls
export function runLambda(source, type, args, options = {}) {
  return loadLambda(source, type, options).invoke(args, { context: options.context });
}
