"use strict";
Prime.Document.onReady(function() {
  // Social shares
  Prime.Document.query(".social-share-buttons a").each(function(e) {
    e.addEventListener("click", function(event) {
      Prime.Utils.stopEvent(event);

      var url = event.currentTarget.getAttribute("href").substring(1);
      window.open(url, "pop", "width=600, height=400, scrollbars=no");
    });
  });
});
