"use strict";
Prime.Document.onReady(function() {
  Prime.Document.query('.carousel').each(function(e) {
    e.queryFirst('.changer-left').addEventListener('click', function(event) {
      Prime.Utils.stopEvent(event);
      const scroll = e.queryFirst('.scroll');
      scroll.scrollLeftTo(scroll.getScrollLeft() - 380);
    });
    e.queryFirst('.changer-right').addEventListener('click', function(event) {
      Prime.Utils.stopEvent(event);
      const scroll = e.queryFirst('.scroll');
      scroll.scrollLeftTo(scroll.getScrollLeft() + 380);
    });
  });
});
