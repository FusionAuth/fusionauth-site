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
      });
      anchor.parentElement.classList.add('active');

      // Determine the id
      var href = anchor.getAttribute('href');
      if (href !== null) {
        href = href.substring(1);
      }

      // Find the div
      console.log(href);
      const div = document.getElementById(href);
      console.log(div);
      if (div !== null && div.matches('[data-tab-content')) {
        const tabs = div.parentElement.querySelectorAll(':scope > [data-tab-content]')
        tabs.forEach(tab => {
          tab.classList.add('hidden');
        });

        div.classList.remove('hidden');
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new Tabs());
