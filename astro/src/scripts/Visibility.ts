let activeButton: HTMLElement | null = null;
const navElements: WeakMap<HTMLElement, HTMLElement | null> = new WeakMap();

const hideActiveElement = () => {
  if (!activeButton) return;

  navElements.get(activeButton)?.classList.add('hidden');
  activeButton = null;
  document.removeEventListener('click', handleClickOutside);
}

const handleClickOutside = (event: MouseEvent) => {
  if (!activeButton) return;

  const navElement = navElements.get(activeButton);
  if (navElement?.contains(event.target as HTMLElement)) return;

  hideActiveElement();
}

const handleButtonClick = (button: HTMLButtonElement, element: HTMLElement) => {
  const hidden = element.classList.contains('hidden');

  if (activeButton && activeButton !== button) {
    hideActiveElement();
  }

  if (hidden) {
    activeButton = button;
    element.classList.remove('hidden');
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
    return;
  }
  hideActiveElement();
}

window.addEventListener('load', () => {
  document.querySelectorAll('[data-widget="visibility-button"]').forEach((button: HTMLButtonElement) => {
    const targetId = button.dataset.element;
    if (!targetId) return;

    const element = document.getElementById(targetId);
    if (!element) return;
    navElements.set(button, element);

    button.addEventListener('click', () => handleButtonClick(button, element));
  });
});