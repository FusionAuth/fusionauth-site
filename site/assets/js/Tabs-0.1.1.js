"use strict";
Prime.Document.onReady(function() {
  Prime.Document.query('.tabs').each(e => new Prime.Widgets.Tabs(e)
    .withLocalStorageKey(e.getDataAttribute('tabStorageKey') || null)
    .withTabContentClass('active')
    .initialize());
});
