FusionAuth = FusionAuth || {};

FusionAuth.DirectDownloads = function() {
  Prime.Utils.bindAll(this);
  this.container = Prime.Document.queryById('downloads')
  if (!this.loadCache()) {
    this.fetch();
  } else {
    this.render();
    setTimeout(this.fetch, 1000);
  }
};

FusionAuth.DirectDownloads.constructor = FusionAuth.DirectDownloads;
FusionAuth.DirectDownloads.prototype = {
  fetch: function() {
    new Prime.Ajax.Request('https://account-local.fusionauth.io/api/version', 'GET')
        .withSuccessHandler(this._parseResponse)
        .go();
  },

  loadCache: function() {
    var cachedResponse = localStorage.getItem('io.fusionauth.downloads');
    if (cachedResponse === null || typeof cachedResponse === 'undefined') {
      return false;
    }

    var response = JSON.parse(cachedResponse);
    if (Object.keys(response).length === 0) {
      return false;
    }

    this.versions = response.versions;
    this.crcs = response.crcs;
    return this.versions !== null && typeof this.versions !== 'undefined' && this.versions.length > 0 &&
      this.crcs !== null && typeof this.crcs !== 'undefined';
  },

  render: function() {
    var archived = false;
    var cutOverVersion = "1.22.2";
    for (var i = this.versions.length - 1; i > 0; i--) {
      var version = this.versions[i];

      var idVersion = version.replace(/\./g, '_');
      var versionDiv = document.getElementById(idVersion);
      if (versionDiv) {
        continue;
      }

      if (version === cutOverVersion) {
        archived = true;
      }
      var mVersion = version.replace('-', '.');

      var releaseNotesLink = archived ? "/docs/v1/tech/archive/release-notes{anchor}" : "/docs/v1/tech/release-notes{anchor}";
      var appzipfilename = "fusionauth-app-"+version+".zip";
      var appzipcrc = this.crcs[appzipfilename];
      var appdebfilename = "fusionauth-app_"+version+"-1_all.deb";
      var appdebcrc = this.crcs[appdebfilename];
      var apprpmfilename = "fusionauth-app-"+mVersion+"-1.noarch.rpm";
      var apprpmcrc = this.crcs[apprpmfilename];

      var searchzipfilename = "fusionauth-search-"+version+".zip";
      var searchzipcrc = this.crcs[searchzipfilename];
      var searchdebfilename = "fusionauth-search_"+version+"-1_all.deb";
      var searchdebcrc = this.crcs[searchdebfilename];
      var searchrpmfilename = "fusionauth-search-"+mVersion+"-1.noarch.rpm";
      var searchrpmcrc = this.crcs[searchrpmfilename];

      var dbfilename = "fusionauth-database-schema-"+mVersion+".zip";
      var dbcrc = this.crcs[dbfilename];

      var div =
          (i === this.versions.length - 1 ? '<div id="' + idVersion + '">' : '<div id="' + idVersion + '" class="mt-5">') +
          '<h4 class="border-bottom">{version}\
             <span style="font-size: 0.5em;" class="font-weight-light"><a href=' + releaseNotesLink + '>Release Notes</a></span>\
             <span style="font-size: 0.5em;" class="font-weight-light">| <a href="/docs/v1/tech/installation-guide/packages/">Installation Guide</a></span>\
          </h4>\
            <a href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-app-{version}.zip">fusionauth-app-{version}.zip</a> ( CRC32C checksum: <code>{appzipcrc}</code> )\
            <br>\
            <a href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-app_{version}-1_all.deb">fusionauth-app_{version}-1_all.deb</a> ( CRC32C checksum: <code>{appdebcrc}</code> )\
            <br>\
            <a href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-app-{mVersion}-1.noarch.rpm">fusionauth-app-{mVersion}-1.noarch.rpm</a> ( CRC32C checksum: <code>{apprpmcrc}</code> )\
            <br>\
            <br>\
            <a href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-search-{version}.zip">fusionauth-search-{version}.zip</a> ( CRC32C checksum: <code>{searchzipcrc}</code> )\
            <br>\
            <a href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-search_{version}-1_all.deb">fusionauth-search_{version}-1_all.deb</a> ( CRC32C checksum: <code>{searchdebcrc}</code> )\
            <br>\
            <a href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-search-{mVersion}-1.noarch.rpm">fusionauth-search-{mVersion}-1.noarch.rpm</a> ( CRC32C checksum: <code>{searchrpmcrc}</code> )\
            <br>\
            <br>\
            <a href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-database-schema-{version}.zip">fusionauth-database-schema-{version}.zip</a> ( CRC32C checksum: <code>{dbcrc}</code> )\
            <a href="/docs/v1/tech/installation-guide/fusionauth-app#advanced-installation"> (See Advanced Installation)</a> \
           </div>';

      this.container.appendHTML(
          div.replace(/\{version\}/g, version)
              .replace(/\{mVersion\}/g, mVersion)
              .replace(/\{appzipcrc\}/g, appzipcrc)
              .replace(/\{appdebcrc\}/g, appdebcrc)
              .replace(/\{apprpmcrc\}/g, apprpmcrc)
              .replace(/\{searchzipcrc\}/g, searchzipcrc)
              .replace(/\{searchdebcrc\}/g, searchdebcrc)
              .replace(/\{searchrpmcrc\}/g, searchrpmcrc)
              .replace(/\{dbcrc\}/g, dbcrc)
              .replace(/\{anchor\}/g, '#version-' + version.replace(/\./g, '-')));
    }
  },

  _parseResponse: function(xhr) {
    // Store it off so the pages loads faster
    localStorage.setItem('io.fusionauth.downloads', xhr.responseText);
    var response = JSON.parse(xhr.responseText);
    this.versions = response.versions;
    this.crcs = response.crcs;
    this.render();
  }
};

Prime.Document.onReady(function() {
  new FusionAuth.DirectDownloads();
});
