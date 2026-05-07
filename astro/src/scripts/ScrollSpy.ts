import { head, throttle } from 'es-toolkit';

let scrollSpyInitialized = false;

/** Distance in pixels from the top of the viewport to trigger the scroll spy */
const SHIFT = 100 as const;

/** Sorted list of trackable headers on the page */
let headers: HTMLElement[] | null = null;

/**
 * Updates the active state of scroll spy items based on the current scroll position.
 * Finds the currently visible section and highlights its corresponding link.
 */
const handleScroll = () => {
  if (!headers?.length) return;

  const scroll = document.documentElement.scrollTop;

  // Find the last header that we've scrolled past, or default to the first one
  const header = headers.findLast((h) => scroll + SHIFT > h.offsetTop) ?? head(headers);
  if (!header) return;

  const headerLink = document.querySelector(`[data-widget="scroll-spy"] a[href="#${header.id}"]`);
  if (!headerLink) return;

  const group = headerLink.closest('[data-widget="scroll-spy-item"]');
  if (!group || group.classList.contains('active')) return;

  // Clear previously active items
  document.querySelectorAll('[data-widget="scroll-spy"] [data-widget="scroll-spy-item"].active')
    .forEach((li) => li.classList.remove('active'));

  group.classList.add('active');
};

/**
 * Registers the scroll event listener with a throttled handler for performance.
 */
const registerScrollSpy = () => {
  if (scrollSpyInitialized) return;

  document.addEventListener('scroll', throttle(handleScroll, 50));
  scrollSpyInitialized = true;
};

/**
 * Discovers and caches all trackable headers on the page, then triggers an initial scroll check.
 */
const updateHeaders = () => {
  headers = [...document.querySelectorAll<HTMLElement>('h2[id], h3[id]')]
    .sort((a, b) => a.offsetTop - b.offsetTop);

  handleScroll();
};

// Initialize scroll listener on initial page load, and update headers when navigating via Astro view transitions
document.addEventListener('astro:page-load', () => {
  registerScrollSpy();

  // Prevent blocking of main thread during initialization
  if (window.requestIdleCallback) {
    window.requestIdleCallback(updateHeaders);
  } else {
    setTimeout(updateHeaders, 0);
  }
});
