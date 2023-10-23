'use strict';

class Visibility {
  constructor() {
    document.addEventListener('click', () => this.#handleClick(event));
  }

  #handleClick(event) {

    const button = event.target.closest('[data-widget="visibility-button"]');
    if (!button || !button.dataset.element) {
      const navbtns = document.querySelectorAll('[data-widget="visibility-button"]');
      navbtns.forEach(btn => {
        const id = btn.dataset.element;
        const nav = document.getElementById(id);
        if (!nav.classList.contains('hidden') && !nav.contains(event.target)) {
          nav.classList.add('hidden');
        }
      });
      return;
    }

    const element = document.getElementById(button.dataset.element);
    event.preventDefault();
    event.stopPropagation();
    element.classList.toggle('hidden')
  }
}

document.addEventListener('DOMContentLoaded', () => new Visibility());
