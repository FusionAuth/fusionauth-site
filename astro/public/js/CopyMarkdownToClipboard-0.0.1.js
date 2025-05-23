'use strict';

class CopyMarkdownToClipboard {
  constructor() {
    console.log("in constructor");
    document.addEventListener('click', event => this.#handleClick(event));
  }

  async #handleClick(event) {
    console.log("in click");
    const button = event.target;
    const href = button.getAttribute('data-href');
    console.log(href);

    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error('Failed to fetch file');
  
      const text = await response.text();
  
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
  
      // Optionally reset button text after 2 seconds
      setTimeout(() => {
        button.textContent = 'Copy File Contents';
      }, 2000);
    } catch (err) {
      console.error('Error copying file contents:', err);
      button.textContent = 'Failed';
      setTimeout(() => {
        button.textContent = 'Copy File Contents';
      }, 2000);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new CopyMarkdownToClipboard());
