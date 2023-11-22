//language=HTML
const template = '<h4 class="text-xl flex flex-row">{version}\
 <span style="font-size: 0.5em;" class="mx-2"><a class="text-blue-700 visited:text-indigo-500" href={releaseNotesLink}>Release Notes</a></span>\
 <span style="font-size: 0.5em;">|</span>\
 <span style="font-size: 0.5em;" class="mx-2 text-blue-700 visited:text-indigo-500"><a class="text-blue-700 visited:text-indigo-500" href="/docs/get-started/download-and-install/packages">Installation Guide</a></span>\
</h4>\
<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-app-{version}.zip">fusionauth-app-{version}.zip</a>\
&nbsp;<span style="font-size: 0.8em;">[<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-app-{version}.zip.sha256">sha256</a>]</span>\
<br>\
<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-app_{version}-1_all.deb">fusionauth-app_{version}-1_all.deb</a>\
&nbsp;<span style="font-size: 0.8em;">[<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-app_{version}-1_all.deb.sha256">sha256</a>]</span>\
<br>\
<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-app-{mVersion}-1.noarch.rpm">fusionauth-app-{mVersion}-1.noarch.rpm</a>\
&nbsp;<span style="font-size: 0.8em;">[<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-app-{mVersion}-1.noarch.rpm.sha256">sha256</a>]</span>\
<br>\
<br>\
<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-search-{version}.zip">fusionauth-search-{version}.zip</a>\
&nbsp;<span style="font-size: 0.8em;">[<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-search-{version}.zip.sha256">sha256</a>]</span>\
<br>\
<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-search_{version}-1_all.deb">fusionauth-search_{version}-1_all.deb</a>\
&nbsp;<span style="font-size: 0.8em;">[<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-search_{version}-1_all.deb.sha256">sha256</a>]</span>\
<br>\
<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-search-{mVersion}-1.noarch.rpm">fusionauth-search-{mVersion}-1.noarch.rpm</a>\
&nbsp;<span style="font-size: 0.8em;">[<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-search-{mVersion}-1.noarch.rpm.sha256">sha256</a>]</span>\
<br>\
<br>\
<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-database-schema-{version}.zip">fusionauth-database-schema-{version}.zip</a>\
&nbsp;<span style="font-size: 0.8em;">[<a class="text-blue-700 visited:text-indigo-500" href="https://files.fusionauth.io/products/fusionauth/{version}/fusionauth-database-schema-{version}.zip.sha256">sha256</a>]</span>\
&nbsp;(<a class="text-blue-700 visited:text-indigo-500" href="/docs/get-started/download-and-install/fusionauth-app#advanced-installation">See Advanced Installation</a>) \
</div>';

class DirectDownloads {
  #container;
  #versions;

  constructor() {
    this.#container = document.getElementById('downloads');

    if (!this.#loadCache()) {
      this.#getVersions();
    } else {
      this.#render();
      setTimeout(this.#getVersions.bind(this), 1000);
    }
  }

  #loadCache() {
    const cachedResponse = localStorage.getItem('io.fusionauth.downloads');
    if (cachedResponse === null || typeof cachedResponse === 'undefined') {
      return false;
    }

    const response = JSON.parse(cachedResponse);
    if (Object.keys(response).length === 0) {
      return false;
    }

    this.#versions = response.versions;
    return this.#versions !== null && typeof this.#versions !== 'undefined' && this.#versions.length > 0;
  }

  async #getVersions() {
    const resp = await fetch('https://account.fusionauth.io/api/version');
    await this.#parseResponse(resp);
  }

  async #parseResponse(resp) {
    const responseText = await resp.text();
    // Store it off so the pages loads faster
    localStorage.setItem('io.fusionauth.downloads', responseText);
    const response = JSON.parse(responseText);
    this.#versions = response.versions;
    this.#render();
  }

  #render() {
    let archived = false;
    const cutOverVersion = "1.22.2";
    for (let i = this.#versions.length - 1; i > 0; i--) {
      const version = this.#versions[i];

      const idVersion = version.replace(/\./g, '_');
      const versionDiv = document.getElementById(idVersion);
      if (versionDiv) {
        continue;
      }

      if (version === cutOverVersion) {
        archived = true;
      }

      const releaseNotesLink = archived ? "/docs/release-notes/archive{anchor}" : "/docs/release-notes{anchor}";
      const div = '<div id="' + idVersion + '" class="mt-5">' + template;

      this.#container.insertAdjacentHTML('beforeend', div.replace('{releaseNotesLink}', releaseNotesLink)
             .replace(/\{version\}/g, version)
             .replace(/\{mVersion\}/g, version.replace('-', '.'))
             .replace(/\{anchor\}/g, '#version-' + version.replace(/\./g, '-')));
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new DirectDownloads());