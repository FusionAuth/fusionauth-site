import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
const s3 = new S3Client({ region: 'us-east-1' });

// Location of the file containing the redirect rules.
const fileBucket = 'fusionauth-dev-us-east-1-artifacts';
const fileKey = 'lambda/site-origin-request-handler/redirects.json';

let redirectRules = null;

// When is the last time the rules were updated? This is stored
// in globals so it can be shared between lambda invocations.
let lastUpdatedTime = 0;
// How frequently (in seconds) should we refresh the redirect rules?
let intervalBetweenUpdates = 300;

export const handler = async (event) => {
  var req = event.Records[0].cf.request;
  var uri = req.uri;
  var result = req;

  await syncRedirectRules();

  try {
    // Try to load the redirect rules from s3.
    if (!redirectRules) {
      console.error("[ERROR] missing redirect rules");
      return;
    }
    // If we successfully retrieved the rules, parse them as JSON.
    else {
      redirectRules = JSON.parse(redirectRules);
    }

    // If any requests come in with .html extensions, trim the extension.
    if (uri.endsWith('.html')) {
      result = redir(uri.substring(0, uri.length - 5));
    }
    // If this looks like a reference to a file but with a trailing slash, remove it.
    else if (uri.endsWith('/') && removeSlash(uri)) {
      result = redir(uri.substring(0, uri.length - 1));
    }
    // If this is a reference to an index page that's missing its slash, add it.
    else if (!uri.endsWith('/') && redirectRules.indexPaths[uri + '/'] === true) {
      result = redir(uri + '/');
    }
    else {
      var redirect = calculateRedirect(uri);
      if (redirect !== null) {
        result = redir(redirect);
      } else {
        req.uri = calculateURI(uri);
      }
    }

    return result;
  }
  catch (err) {
    console.error('[ERROR] %s', err);
  }
};

async function syncRedirectRules() {
  // If we're within the sync interval period, do nothing.
  let currentTime = new Date().getTime();
  if (lastUpdatedTime && (currentTime - lastUpdatedTime) < (intervalBetweenUpdates * 1000)) {
    return;
  }

  console.log('Synchronizing redirect rules from s3');

  try {
    const command = new GetObjectCommand({
      Bucket: fileBucket,
      Key: fileKey,
    });
    const response = await s3.send(command);
    redirectRules = await response.Body.transformToString();
    intervalBetweenUpdates = redirectRules.refreshTime;
    lastUpdatedTime = currentTime;
  } catch (err) {
    console.error('[ERROR] failed to retrieve redirect rules file from s3: %s', err);
    redirectRules = null;
    lastUpdatedTime = currentTime;
  }
}

// returns true if this seems to be a link to a page with a trailing slash that should just be removed
function removeSlash(uri) {
  return redirectRules.indexPaths[uri] !== true &&
    (!uri.startsWith('/blog') || (uri.match('^/blog/[\\w\\d-]*/$') && !uri.match('^/blog/latest/$'))) &&
    redirectRules.redirectsByPrefix.find(e => uri.startsWith(e[0])) === undefined;
}

function calculateRedirect(uri) {
  var result = redirectRules.redirects.hasOwnProperty(uri) ? redirectRules.redirects[uri] : null;

  if (result === null) {
    var prefix_replacement = redirectRules.redirectsByPrefix.find(e => uri.startsWith(e[0]));

    if (prefix_replacement !== undefined) {
      result = uri.replace(prefix_replacement[0], prefix_replacement[1]);
    }
  }

  if (result === null) {
    redirectRules.redirectsByRegex.forEach(function (regexValueArray) {
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
  for (i = 0; i < redirectRules.s3Prefixes.length; i++) {
    if (uri.startsWith(redirectRules.s3Prefixes[i])) {
      return uri.endsWith('/') ? uri + 'index.html' : appendHTML(uri);
    }
  }

  for (i = 0; i < redirectRules.s3Paths.length; i++) {
    if (uri === redirectRules.s3Paths[i]) {
      return appendHTML(uri);
    }
  }

  return uri;
}

function redir(loc) {
  return {
    'status': 301,
    'statusDescription': 'Moved',
    'headers': {
      'location': [
        {
          'key': 'Location',
          'value': loc
        }
      ]
    }
  };
}
