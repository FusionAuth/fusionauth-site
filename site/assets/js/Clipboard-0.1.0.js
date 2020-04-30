Prime.Document.onReady(function() {
  var clipboard = new ClipboardJS('[data-clipboard-target]');

  clipboard.on('success', function(e) {
    console.info(e);
    // console.info('Action:', e.action);
    // console.info('Text:', e.text);
    // console.info('Trigger:', e.trigger);
    //
    // e.clearSelection();
    const span = new Prime.Document.Element(e.trigger).getParent().getPreviousSibling().queryFirst('span');
    span.show();
    setTimeout(function() {
      span.hide();
    }, 2000);
  });

  clipboard.on('error', function(e) {
    // console.error('Action:', e.action);
    // console.error('Trigger:', e.trigger);
  });
})