document.querySelector('#copy-docs-markdown-llm-button').addEventListener('click', async event => {
  const button = event.currentTarget;
  const href = button.dataset.href;
  const resetTextMS = 2000;
  const btnText = 'Copy as Markdown for LLMs';

  try {
    // Create the clipboard item immediately within the user gesture
    const clipboardItem = new ClipboardItem({
      'text/plain': fetch(href).then(async response => {
        if (!response.ok) throw new Error('Failed to fetch file');
        return response.text();
      })
    });

    await navigator.clipboard.write([clipboardItem]);
    button.textContent = 'Copied';
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
