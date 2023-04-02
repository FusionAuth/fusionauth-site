'use strict';

class Visibility {
  constructor() {
    document.addEventListener('click', () => this.#handleClick(event));
  }

  #handleClick(event) {
    const button = event.target.closest('[data-widget="visibility-button"]');
    if (!button || !button.dataset.element) {
      return;
    }

    const element = document.getElementById(button.dataset.element);
    element.classList.toggle('hidden')
  }
}

document.addEventListener('DOMContentLoaded', () => new Visibility());