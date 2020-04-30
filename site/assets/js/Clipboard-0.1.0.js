Prime.Document.onReady(function() {
  var clipboard = new ClipboardJS('[data-clipboard-target]');

  clipboard.on('success', function(e) {
    const span = new Prime.Document.Element(e.trigger).getParent().getPreviousSibling().queryFirst('span');
    span.show();
    setTimeout(function() {
      span.hide();
    }, 2000);
  });
})