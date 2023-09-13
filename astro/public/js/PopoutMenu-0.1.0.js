'use strict';

class PopoutMenu {
  #toggleMap = {};

  #unClickedState = ['lg:opacity-0', 'lg:group-hover:opacity-100', 'lg:group-hover:scale-100', 'lg:scale-[.25]', 'lg:duration-300', 'lg:transition'];
  #clickedState = ['lg:opacity-100', 'lg:scale=100'];

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
      elem.classList.remove(...this.#unClickedState);
      elem.classList.add(...this.#clickedState);
    } else {
      elem.classList.remove(...this.#clickedState);
      elem.classList.add(...this.#unClickedState);
    }

    this.#toggleMap[id] = !this.#toggleMap[id];
  }
}

document.addEventListener('DOMContentLoaded', () => new PopoutMenu());
