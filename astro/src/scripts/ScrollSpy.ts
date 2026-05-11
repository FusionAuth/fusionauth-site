import { throttle, head } from 'es-toolkit';

const SHIFT = 100 as const;
let headers: HTMLElement[] | null = null;

const handleScroll = () => {
  if (!headers || headers.length === 0) return;

  const scroll = document.documentElement.scrollTop;
  const header = headers.findLast((h) => scroll + SHIFT > h.offsetTop) ?? head(headers);

  const headerLink = document.querySelector(`[data-widget="scroll-spy"] a[href="#${header.id}"]`);
  if (!headerLink) return;

  document.querySelectorAll('[data-widget="scroll-spy"] [data-widget="scroll-spy-item"].active').forEach(li => li.classList.remove('active'));

  const group = headerLink.closest('[data-widget="scroll-spy-item"]');
  if (!group) return;
  group.classList.add('active');
}

const registerScrollSpy = () => {
  headers = [...document.querySelectorAll<HTMLElement>('h2[id], h3[id]')]
    .sort((a, b) => a.offsetTop - b.offsetTop);

  handleScroll();

  document.addEventListener('scroll', throttle(handleScroll, 50));
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('[data-widget="scroll-spy"]')) return;

  // Prevent blocking of main thread
  if (window.requestIdleCallback) {
    window.requestIdleCallback(registerScrollSpy);
  } else {
    setTimeout(registerScrollSpy, 0);
  }
});
