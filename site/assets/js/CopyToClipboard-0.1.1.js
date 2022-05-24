/*
 * Copyright (c) 2022, Inversoft Inc., All Rights Reserved
 */
'use strict';

class FusionAuthCopyToClipboard {
  constructor() {
    document.addEventListener('click', this._handleClick.bind(this));
  }

  _handleClick(event) {
    const copyButton = event.target.closest('[data-widget="copy-button"]');
    if (copyButton === null) {
      return;
    }

    const id = copyButton.dataset.copySource;
    let source = null;
    if (id) {
      source = document.getElementById(id);
    } else {
      source = event.target.closest('pre').querySelector('code');
    }
    
    if (source === null) {
      throw `Invalid copy-source`;
    }

    navigator.clipboard
             .writeText(source.innerText)
             .then(() => {
               const tooltip = document.createElement('div');
               tooltip.classList.add('text-white', "z-10");
               tooltip.innerHTML = 'Copied <div data-popper-arrow></div>';
               copyButton.parentNode.appendChild(tooltip);
               Popper.createPopper(copyButton, tooltip,
                   {
                     modifiers: [
                       {
                         name: 'offset',
                         options: {
                           offset: [-40, -15],
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

document.addEventListener('DOMContentLoaded', () => new FusionAuthCopyToClipboard());
