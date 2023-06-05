/*
 * Copyright (c) 2022, Inversoft Inc., All Rights Reserved
 */
'use strict';

var codeBlock = 1;

class CopyToClipboard {
  constructor() {
    document.addEventListener('click', event => this.#handleClick(event));

    // Find the code blocks and set them up automatically
    const pres = document.querySelectorAll('pre.astro-code');
    pres.forEach(pre => {
      pre.classList.add('relative');

      const code = pre.querySelector('code');
      if (!code.id) {
        code.id = codeBlock.toString();
        codeBlock++;
      }

      const copyButton = document.createElement('button');
      copyButton.className = 'absolute top-2 right-2';
      copyButton.dataset.widget = 'copy-button';
      copyButton.dataset.copySource = code.id;

      const icon = document.createElement('i');
      icon.className = 'fa-duotone fa-copy bg-slate-800 leading-4 py-2 px-2.5 rounded text-center text-indigo-200 w-10 dark:hover:text-indigo-400 hover:text-indigo-600';
      icon.title = 'Copy contents';
      copyButton.appendChild(icon);

      pre.appendChild(copyButton);
    })
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
               const i = copyButton.querySelector('i.fa-copy');
               i.classList.replace('fa-copy', 'fa-check');
               setTimeout(() => i.classList.replace('fa-check', 'fa-copy'), 1000);
             });
  }
}

document.addEventListener('DOMContentLoaded', () => new CopyToClipboard());