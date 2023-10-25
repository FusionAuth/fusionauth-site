import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
const s3 = new S3Client({ region: 'us-east-1' });

let redirectRules = null;
let lastUpdatedTime = 0;
let intervalBetweenUpdates = 60;

export const handler = async (event, context) => {
  var req = event.Records[0].cf.request;
  var uri = req.uri;
  var result = req;

  await syncRedirectRules()

  try {
    // Try to load the redirect rules from s3.
    if (!redirectRules) {
      console.error("[ERROR] missing redirect rules");
      return;
    } else {
      redirectRules = JSON.parse(redirectRules);
    }

    // There shouldn't be links to .html files out there.
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
  const command = new GetObjectCommand({
    Bucket: 'fusionauth-dev-us-east-1-artifacts',
    Key: 'lambda-at-edge/cloudfront-redirects/redirects.json',
  });

  // If we're within the sync interval period, do nothing.
  let currentTime = new Date().getTime();
  if (lastUpdatedTime && (currentTime - lastUpdatedTime) < (intervalBetweenUpdates * 1000)) {
    return;
  }

  try {
    const response = await s3.send(command)
    redirectRules = await response.Body.transformToString()
    intervalBetweenUpdates = redirectRules.refreshTime;
    lastUpdatedTime = currentTime;
  } catch (err) {
    console.error('[ERROR] failed to retrieve redirect rules file from s3: %s', err)
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
  return {status:301,statusDescription:'Moved',headers:{'location':[{key: 'Location', value: loc}]}}
}
