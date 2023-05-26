export const initCodeCopyIcons = async (): Promise<void> => {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('pre.astro-code').forEach((codeBlock) => {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';

      const copyButton = document.createElement('button');
      copyButton.className = 'absolute top-2.5 right-2.5 text-xs leading-4';

      const icon = document.createElement('i');
      icon.className = 'fad fa-copy w-10 py-2 px-2.5 bg-slate-800 text-center text-indigo-200 leading-4 rounded-sm hover:text-indigo-600 dark:hover:text-indigo-400 [.active]:text-indigo-600 dark:[.active]:text-indigo-400';
      icon.title = 'Copy contents';
      copyButton.appendChild(icon);

      wrapper.appendChild(copyButton);

      // wrap codebock with relative parent element
      codeBlock.parentNode.insertBefore(wrapper, codeBlock);
      wrapper.appendChild(codeBlock);

      copyButton.addEventListener('click', () => {
        copyCode(codeBlock, icon);
      });
    });
  });
}

const copyCode = async (block: Element, icon: HTMLElement): Promise<void> => {
  const code = block.querySelector('code');
  const text = code.innerText;

  await navigator.clipboard.writeText(text);

  icon.classList.replace('fa-copy', 'fa-check');

  setTimeout(() => {
    icon.classList.replace('fa-check', 'fa-copy');
  }, 1000);
}