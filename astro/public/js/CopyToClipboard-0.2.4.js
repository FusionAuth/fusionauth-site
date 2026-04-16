'use strict';

var codeBlock = 1;

class CopyToClipboard {
  constructor() {
    document.addEventListener('click', event => this.#handleClick(event));

    // Find the code blocks and set them up automatically
    const pres = document.querySelectorAll('pre.astro-code');
    pres.forEach(pre => {
      const code = pre.querySelector('code');
      if (!code.id) {
        code.id = codeBlock.toString();
        codeBlock++;
      }

      const insertPoint = pre.nextElementSibling;
      const wrapper = document.createElement('div');
      wrapper.classList.add('relative');
      pre.parentElement.insertBefore(wrapper, insertPoint);
      wrapper.appendChild(pre);

      const copyButton = document.createElement('button');
      copyButton.className = 'absolute top-1 right-1';
      copyButton.dataset.widget = 'copy-button';
      copyButton.dataset.copySource = code.id;

      // This is for code blocks that are always dark, so we don't need dark states for the button
      const icon = document.createElement('i');
      icon.className = 'fa-duotone fa-copy leading-4 py-2 px-2 rounded text-center text-white hover:bg-indigo-700';
      icon.title = 'Copy contents';
      copyButton.appendChild(icon);

      wrapper.appendChild(copyButton);
    });
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
               if (i) {
                 i.classList.replace('fa-copy', 'fa-check');
                 setTimeout(() => i.classList.replace('fa-check', 'fa-copy'), 1000);
               }
             });
  }
}

document.addEventListener('DOMContentLoaded', () => new CopyToClipboard());
