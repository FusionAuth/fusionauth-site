'use strict';

class ScrollSpy {
  #headers;
  #shift;

  constructor() {
    document.addEventListener('scroll', event => this.#handleScroll(event));

    this.#headers = [];
    const elements = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    for (const e of elements) {
      this.#headers.push(e);
    }
    this.#headers.sort((one, two) => one.offsetTop - two.offsetTop);
    this.#shift = 100;
    this.#handleScroll();
  }

  #handleScroll() {
    const scroll = document.documentElement.scrollTop;
    let header = this.#headers[0];
    for (const h of this.#headers) {
      if (scroll + this.#shift > h.offsetTop) {
        header = h;
      }
    }

    document.querySelectorAll('[data-widget="scroll-spy"] div[data-widget="scroll-spy-item"]').forEach(li => li.classList.remove('active', 'section-active'));

    const group = document.querySelector(`a[href="#${header.id}"]`).closest('div[data-widget="scroll-spy-item"]');
    group.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => new ScrollSpy());