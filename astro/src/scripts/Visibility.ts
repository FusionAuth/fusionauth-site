/**
 * Keeps track of the currently active visibility button.
 */
let activeButton: HTMLElement | null = null;

/**
 * Retrieves the target navigation element associated with a given button.
 * The button must have a `data-element` attribute containing the target element's ID.
 *
 * @param button - The button element that triggers visibility.
 * @returns The target HTML element or null if not found.
 */
const getNavElementByButton = (button?: HTMLElement): HTMLElement | null => {
  const targetId = button?.dataset.element;
  return targetId ? document.getElementById(targetId) : null;
}

/**
 * Hides the target element of the currently active button and removes the outside click listener.
 */
const hideActiveElement = () => {
  if (!activeButton) return;

  getNavElementByButton(activeButton)?.classList.add('hidden');
  activeButton = null;
  document.removeEventListener('click', handleClickOutside);
}

/**
 * Handles document clicks to hide the active element when clicking outside it.
 *
 * @param event - The mouse event triggered by clicking on the document.
 */
const handleClickOutside = (event: MouseEvent) => {
  const navElement = getNavElementByButton(activeButton);

  // If the click is outside the target element, hide it
  if (!navElement?.contains(event.target as Node)) {
    hideActiveElement();
  }
};

/**
 * Toggles the visibility of the target element associated with the clicked button.
 *
 * @param event - The mouse event triggered by clicking the button.
 */
const handleButtonClick = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement;
  const element = getNavElementByButton(button);

  if (!element) return;

  // If another button is active, hide its element first
  if (activeButton && activeButton !== button) {
    hideActiveElement();
  }

  // Toggle visibility
  if (element.classList.contains('hidden')) {
    activeButton = button;
    element.classList.remove('hidden');

    // Defer the click listener attachment so it doesn't immediately catch this button click
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    return;
  }
  hideActiveElement();
};

// Clean up listeners and state before an Astro page swap
document.addEventListener('astro:before-swap', () => {
  hideActiveElement();

  document.querySelectorAll('[data-widget="visibility-button"]').forEach((button: HTMLButtonElement) => {
    button.removeEventListener('click', handleButtonClick);
  });
});

// Initialize listeners on Astro page load
document.addEventListener('astro:page-load', () => {
  document.querySelectorAll('[data-widget="visibility-button"]').forEach((button: HTMLButtonElement) => {
    // Only attach the listener if the target element exists in the DOM
    if (getNavElementByButton(button)) {
      button.addEventListener('click', handleButtonClick);
    }
  });
});
