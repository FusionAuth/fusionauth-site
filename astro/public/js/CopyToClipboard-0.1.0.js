/*
 * Copyright (c) 2022, Inversoft Inc., All Rights Reserved
 */
'use strict';

class CopyToClipboard {
  constructor() {
    document.addEventListener('click', event => this.#handleClick(event));
  }

  #handleClick(event) {
    const copyButton = event.target.closest('[data-widget="copy-button"]');
    if (copyButton === null) {
      return;
    }

    const id = copyButton.dataset.copySource;
    const source = document.getElementById(id);
    if (source === null) {
      throw `Invalid copy-source [${id}]`;
    }

    navigator.clipboard
             .writeText(source.innerText)
             .then(() => {
               const tooltip = document.createElement('div');
               tooltip.classList.add('bg-gray-500', 'mb-3', 'p-2', 'rounded', 'shadow-md', 'text-white', "z-10");
               tooltip.innerHTML = 'Copied <div data-popper-arrow></div>';
               copyButton.parentNode.appendChild(tooltip);
               Popper.createPopper(copyButton, tooltip,
                   {
                     modifiers: [
                       {
                         name: 'offset',
                         options: {
                           offset: [0, 10],
                         },
                       },
                     ],
                     placement: 'top'
                   }
               );
               setTimeout(() => tooltip.remove(), 1000);
             });
  }
}

document.addEventListener('DOMContentLoaded', () => new CopyToClipboard());