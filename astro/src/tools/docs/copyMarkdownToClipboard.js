const button = document.querySelector('#copy-docs-markdown-llm-button');
button.addEventListener('click',async event => {
  const href = button.dataset.href;
  const resetTextMS = 2000;

  // if you change this, change the initial value in the astro component as well
  const btnText = 'Copy as Markdown for LLMs';

  try {
    const response = await fetch(href);
    if (!response.ok) throw new Error('Failed to fetch file');

    const text = await response.text();

    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied';

    // Optionally reset button text after 2 seconds
    setTimeout(() => {
      button.textContent = btnText;
    }, resetTextMS);
  } catch (err) {
    console.error('Error copying file contents:', err);
    button.textContent = 'Failed';
    setTimeout(() => {
      button.textContent = btnText;
    }, resetTextMS);
  }
});
