'use strict';

class ThemeSelector {
  #button;
  #menu;
  #theme;

  constructor() {
    // Bail if there is no theme selector
    if (!document.querySelector('[data-widget="theme-selector"]')) {
      return;
    }

    this.#button = document.querySelector('[data-widget="theme-selector"] > button');
    this.#button.addEventListener('click', event => this.#handleMenu(event));
    this.#menu = document.querySelector('[data-widget="theme-selector"] > ul');
    this.#menu.addEventListener('mousemove', event => this.#handleMouseMove(event));
    this.#menu.querySelectorAll('button').forEach(button => button.addEventListener('click', event => this.#handleChange(event)))

    this.#theme = localStorage.getItem('theme') || 'system';
    this.changeTheme(this.#theme);
    this.closeMenu();

    document.addEventListener('click', () => this.closeMenu());
    document.addEventListener('keydown', event => this.#handleKeyDown(event));
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => this.#handleChange(event));
  }

  changeTheme(theme) {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    this.#theme = theme;
    this.closeMenu();
    localStorage.setItem('theme', theme);
  }

  closeMenu() {
    this.#menu.classList.add('hidden');
  }

  openMenu() {
    this.#menu.classList.toggle('hidden');
  }

  #handleChange(event) {
    const theme = (event.target.dataset && event.target.dataset.theme) || 'system';
    this.changeTheme(theme);
  }

  #handleKeyDown(event) {
    if (this.#menu.classList.contains('hidden')) {
      return;
    }

    if (event.key === 'Escape' || event.key === 'Tab') {
      this.closeMenu();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.stopPropagation();
      event.preventDefault();

      if (this.#menu.classList.contains('hidden')) {
        this.openMenu();
      }

      this.#highlightSiblingMenuItem(event.key === 'ArrowDown');
    } else if (event.key === 'Enter') {
      const button = this.#menu.querySelector('ul:not(.hidden) li.active button');
      if (button) {
        this.changeTheme(button.dataset.theme);
        this.closeMenu();
      }
    }
  }

  #handleMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    this.openMenu();
  }

  #handleMouseMove(event) {
    const option = event.target.closest('li');
    if (!option) {
      return;
    }

    this.#highlightMenuItem(option);
  }

  #highlightMenuItem(option) {
    this.#menu.querySelectorAll('li').forEach(e => e.classList.remove('active'));
    option.classList.add('active');
  }

  #highlightSiblingMenuItem(next) {
    let li = this.#menu.querySelector('ul:not(.hidden) li.active');
    if (li) {
      li = next ? li.nextElementSibling : li.previousElementSibling;
    } else {
      li = this.#menu.querySelector('ul:not(.hidden) li'); // First
    }

    if (li) {
      this.#highlightMenuItem(li);
    }
  }
}

// Initialize the class on the body
const theme = localStorage.getItem('theme') || 'system';
if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}
document.addEventListener('DOMContentLoaded', () => new ThemeSelector());
