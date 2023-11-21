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
    this.#searchInput.addEventListener('input', event => this.#handleSearch(event));
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

  async #handleSearch() {
    if (this.#searchModal.classList.contains('hidden')) {
      return;
    }

    if (!this.#pagefind) {
      this.#pagefind = await import("/_pagefind/pagefind.js");
    }

    const response = await this.#pagefind.debouncedSearch(this.#searchInput.value);
    if (response) {
      await this.#handleResults(response.results);
    }
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
}

document.addEventListener('DOMContentLoaded', () => new Search());
