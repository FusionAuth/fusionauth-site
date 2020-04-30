"use strict";
Prime.Document.onReady(function() {
  Prime.Document.query('.collapsible .collapse-button').each(function(e) {
    e.addEventListener('click', function(event) {
      Prime.Utils.stopEvent(event);

      const content = e.queryUp('.collapsible').queryFirst('.collapsible-content');
      if (content.isVisible()) {
        e.queryFirst('i').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
        content.hide();
      } else {
        e.queryFirst('i').removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
        content.show(content.domElement.nodeName === 'TABLE' ? 'table' : 'block');
      }
    });
  });
});