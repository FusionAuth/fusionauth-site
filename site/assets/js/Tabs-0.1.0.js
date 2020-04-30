"use strict";
Prime.Document.onReady(function() {
  Prime.Document.query('.tabs').each(e => new Prime.Widgets.Tabs(e)
    .withTabContentClass('active')
    .initialize());
});
