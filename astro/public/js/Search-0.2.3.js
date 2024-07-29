'use strict';

class Search {
  #altKey;
  #isMac;
  #moveX;
  #moveY;
  #pagefind;
  #searchInput;
  #searchKeyHint;
  #searchModal;
  #searchResults;

  constructor() {
    this.#searchModal = document.querySelector('[data-widget=search]');
    this.#searchModal.querySelectorAll('[data-widget="search-close"]');
    this.#searchModal.addEventListener('mousemove', event => this.#handleMouseMove(event));
    this.#searchResults = document.querySelector('[data-widget="search-results"] ul');
    this.#searchInput = document.querySelector('[data-widget="search-input"]');
    this.#searchInput.addEventListener('input', this.#debounce(event => this.#handleSearch(event)));
    this.#searchKeyHint = document.querySelector('[data-widget="search-key-hint"]');

    document.addEventListener('click', event => this.#handleClick(event));
    document.addEventListener('keydown', event => this.#handleKeyDown(event));
    document.addEventListener('keyup', event => this.#handleKeyUp(event));

    this.#handleResults({});
    if (this.#searchKeyHint) {
      this.#isMac = window.navigator.platform === 'MacIntel';
      this.#altKey = this.#isMac ? 'Meta' : 'Alt';
      this.#searchKeyHint.innerText = this.#isMac ? '⌘K' : 'Alt+K';
    }
  }

  closeSearch() {
    this.#searchModal.classList.add('hidden');
  }

  toggleSearch() {
    if (!this.#searchModal.classList.toggle('hidden')) {
      this.#searchInput.focus();
    }
  }

  #debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), timeout);
    };
  }

  #handleClick(event) {
    let button = event.target.closest('[data-widget="search-button"]');
    if (button) {
      this.toggleSearch();
      return;
    }

    button = event.target.closest('[data-widget="search-close"]');
    if (button) {
      this.closeSearch();
    }

    //close if background clicked
    if (event.target === this.#searchModal) {
      this.closeSearch();
    }
  }

  #handleKeyDown(event) {
    if (event.key === this.#altKey) {
      this.alt = true;
      return;
    } else if (event.key === 'k' && this.alt) {
      this.toggleSearch();
    }

    if (this.#searchModal.classList.contains('hidden')) {
      return;
    }

    if (event.key === 'Escape') {
      this.closeSearch();
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.stopPropagation();
      event.preventDefault();

      let active = this.#searchModal.querySelector('[data-widget="search-result"].active');
      if (active) {
        active = event.key === 'ArrowDown' ? active.nextElementSibling : active.previousElementSibling;
      } else {
        active = this.#searchModal.querySelector('[data-widget="search-result"]'); // First one
      }

      if (active) {
        this.#highlightMenuItem(active, true);
      }
    } else if (event.key === 'Enter') {
    }
  }

  #handleKeyUp(event) {
    if (event.key === this.#altKey) {
      this.alt = false;
    }
  }

  #handleMouseMove(event) {
    const option = event.target.closest('[data-widget="search-result"]');
    if (!option || (event.screenX === this.#moveX && event.screenY === this.#moveY)) {
      return;
    }

    this.#highlightMenuItem(option, false);
    this.#moveX = event.screenX; // Hack because scroll fires this event if the <li> under the mouse changes
    this.#moveY = event.screenY;
  }

  #doSearch(filters) {
    return this.#pagefind.search(this.#searchInput.value, { filters })
  }

  async #handleDocsSearch(paths) {
    const filterSet = paths.map((val, idx, arr) => {
      const filters = { environment: 'docs' };
      for (let i= 0; i <= idx; i++) {
        const key = {
          0: 'section',
          1: 'subcategory',
          2: 'tertcategory',
          3: 'quatercategory'
        }[i];
        filters[key] = arr[i].replaceAll('-', ' ');
      }
      return filters;
    });
    filterSet.reverse();
    filterSet.push({ environment: 'docs' });

    const promises = filterSet.map(filters => this.#doSearch(filters));
    promises.push(this.#doSearch(null))

    const filterThreshold = 0.3;

    const resolved = await Promise.all(promises);
    const results = [];
    resolved.filter(response => !!response)
            .forEach((response, idx, arr) => response.results
               .filter(result => idx + 1 === arr.length || result.score > filterThreshold )
               .forEach(result => {
                 if (!results.find(r => r.id === result.id)) {
                   results.push(result);
                 }
               }));
    return results;
  }

  async #handleDefaultSearch() {
    return (await this.#doSearch(null)).results;
  }

  async #handleSearch() {
    if (this.#searchModal.classList.contains('hidden')) {
      return;
    }

    let paths = window.location.pathname.split('/');
    paths = paths.slice(1, paths.length);
    const environment = paths.shift();

    try {
      if (gtag) {
        gtag('event', 'site_search', {
          'search_parameter': this.#searchInput.value,
        });
      }
    } catch (e) {
      //ignore
    }

    if (!this.#pagefind) {
      this.#pagefind = await import("/pagefind/pagefind.js");
      // some tuning of the search ranking
      // https://pagefind.app/docs/ranking/
      await this.#pagefind.options({
        ranking: {
          termFrequency: 0.1,
          termSimilarity: 0.2,
          pageLength: 0,
          termSaturation: 1.8,
        }
      })
      // prime the filters
      await this.#pagefind.filters();
    }

    let results;
    switch(environment) {
      case 'docs':
        results = await this.#handleDocsSearch(paths);
        break;
      default:
        results = await this.#handleDefaultSearch();
        break;
    }

    await this.#handleResults(results);
  }

  #highlightMenuItem(option, focus) {
    this.#searchModal.querySelectorAll('[data-widget="search-result"].active').forEach(e => e.classList.remove('active'));
    option.classList.add('active');

    if (focus) {
      option.querySelector('a').focus();
    }
  }

  async #handleResults(results) {
    if (this.#searchInput.value.trim() !== '' && results && results.length > 0) {
      const spinner = this.#spinner;
      this.#searchResults.innerHTML = '';
      this.#searchResults.appendChild(spinner);
      let html = '';
      (await Promise.all(results.slice(0, 100).map(result => result.data()))).forEach(data => {
        html += `<li class="group" data-widget="search-result">
          <a href="${data.url}" class="bg-slate-100 rounded-md flex group items-center px-4 py-2 dark:bg-slate-700 group-[.active]:bg-indigo-600 group-[.active]:text-white">
            <i class="bg-white border border-slate-900/10 fa-regular fa-hashtag mr-4 px-1 py-0.5 rounded-md shadow-sm text-slate-400 text-sm dark:bg-slate-600 group-[.active]:bg-indigo-600 group-[.active]:border-indigo-300 group-[.active]:text-white"></i>
            <div class="flex flex-col">
              <span class="bg-slate-200 border border-slate-900/10 font-semibold mb-2 px-2 py-0.5 rounded-full text-slate-700 text-xs w-fit dark:bg-slate-600 dark:text-slate-400 group-[.active]:bg-indigo-500 group-[.active]:border-indigo-300 group-[.active]:text-white">
                ${data.meta.title}
              </span>
              <span class="mr-auto text-slate-700 text-sm dark:text-slate-400 group-[.active]:text-white">
                ${data.excerpt}
              </span>
            </div>
            <i class="fa-regular fa-angle-right"></i>
          </a>
        </li>`;
      });
      this.#searchResults.innerHTML = html;
    } else {
      this.#searchResults.innerHTML = `<li data-widget="search-no-results">
        <div class="font-semibold px-2">
          If you search it, they will come.
        </div>
      </li>`;
    }
  }

  get #spinner() {
    const div = document.createElement('div');
    div.classList.add('flex', 'items-center', 'justify-center', 'w-full', 'h-full');
    div.innerHTML = `
      <img src="/img/gif/dark/bouncing-balls.gif" alt="Loading..." class="h-12 w-12 dark:block hidden" />
      <img src="/img/gif/light/bouncing-balls.gif" alt="Loading..." class="h-12 w-12 dark:hidden" />
    `;
    return div;
  }
}

document.addEventListener('DOMContentLoaded', () => new Search());
