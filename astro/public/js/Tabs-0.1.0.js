/*
 * Copyright (c) 2019-2022, Inversoft Inc., All Rights Reserved
 */
'use strict';

class Tabs {
  constructor() {
    document.addEventListener('click', this.#handleClick.bind(this));
  }

  #handleClick(event) {
    const anchor = event.target.closest('a[data-tab-button]');
    if (anchor !== null) {
      event.stopPropagation();
      event.preventDefault();

      // Change the tab selection (the li's)
      const buttons = anchor.closest('ul').querySelectorAll('a[data-tab-button]');
      buttons.forEach(button => {
        button.parentElement.classList.remove('active');

        // Hide all the tabs
        var href = button.getAttribute('href');
        if (href === null) {
          return;
        }
        href = href.substring(1);

        const div = document.getElementById(href);
        if (div) {
          div.classList.add('hidden');
        }
      });
      anchor.parentElement.classList.add('active');

      // Determine the id
      var href = anchor.getAttribute('href');
      if (href !== null) {
        href = href.substring(1);
      }

      // Find the div
      const div = document.getElementById(href);
      if (div) {
        div.classList.remove('hidden');
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new Tabs());
