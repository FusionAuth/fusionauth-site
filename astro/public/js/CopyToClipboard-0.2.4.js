'use strict';

class CopyToClipboard {
  static #codeBlockCounter = 1;

  constructor() {
    const pres = document.querySelectorAll('pre.astro-code');
    
    pres.forEach(pre => {
      const code = pre.querySelector('code');
      if (!code) return;

      if (!code.id) {
        code.id = `code-block-${CopyToClipboard.#codeBlockCounter++}`;
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'relative group'; 
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const copyButton = document.createElement('button');
      copyButton.className = 'absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 text-sm rounded hover:bg-indigo-700 text-white leading-none';
      copyButton.dataset.copySource = code.id;
      copyButton.title = 'Copy contents';

      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-copy'; 
      copyButton.appendChild(icon);

      wrapper.appendChild(copyButton);

      copyButton.addEventListener('click', (event) => this.#handleCopy(event));
    });
  }

  #handleCopy(event) {
    const copyButton = event.currentTarget; 
    const id = copyButton.dataset.copySource;
    const source = document.getElementById(id);
    
    if (!source) {
      console.error(`Invalid copy-source [${id}]`);
      return;
    }

    navigator.clipboard
      .writeText(source.innerText)
      .then(() => {
        const i = copyButton.querySelector('i');
        if (i && i.classList.contains('fa-copy')) {
          // Swap the icon
          i.classList.replace('fa-copy', 'fa-check');
          
          // Temporarily force the button to stay visible even if the mouse leaves the code block
          copyButton.classList.remove('opacity-0', 'group-hover:opacity-100');
          
          setTimeout(() => {
            // Swap back to copy icon
            i.classList.replace('fa-check', 'fa-copy');
            // Restore the hover-only visibility
            copyButton.classList.add('opacity-0', 'group-hover:opacity-100');
          }, 1500);
        }
      })
      .catch(err => {
         console.error('Failed to copy text: ', err);
      });
  }
}

document.addEventListener('DOMContentLoaded', () => new CopyToClipboard());