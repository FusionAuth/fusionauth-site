'use strict';

class PopoutMenu {
  #toggleMap = {};

  #outState = ['lg:ease-out', 'lg:duration-100', 'lg:opacity-0', 'lg:scale-95'];
  #inState = ['lg:ease-in', 'lg:duration-75', 'lg:opacity-100', 'lg:scale-100'];

  constructor() {
    document.addEventListener('click', () => this.#handleClick(event));
  }

  #handleClick(event) {
    const button = event.target.closest('[data-widget="popout-button"]');
    if (!button || !button.dataset.element) {
      return;
    }

    const id = button.dataset.element;
    const element = document.getElementById(id);
    this.#toggleMenuClicked(id, element);
  }

  #toggleMenuClicked(id, elem) {
    if (!Object.keys(this.#toggleMap).includes(id)) {
      this.#toggleMap[id] = false;
    }

    if (!this.#toggleMap[id]) {
      elem.classList.remove(...this.#outState);
      elem.classList.add(...this.#inState);
    } else {
      elem.classList.remove(...this.#inState);
      elem.classList.add(...this.#outState);
    }

    this.#toggleMap[id] = !this.#toggleMap[id];
  }
}

document.addEventListener('DOMContentLoaded', () => new PopoutMenu());
