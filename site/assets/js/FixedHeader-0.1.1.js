"use strict";

//noinspection JSUnusedAssignment
var FusionAuth = FusionAuth || {};

FusionAuth.FixedHeader = function() {
  Prime.Utils.bindAll(this);
  this.header = Prime.Document.queryFirst('header.page-header');
  Prime.Window.addEventListener('scroll', this._handleOnScroll);
};

FusionAuth.FixedHeader.constructor = FusionAuth.FixedHeader;
FusionAuth.FixedHeader.prototype = {
  hide: function() {
    this.header.removeClass('gray').removeClass('animate');
  },

  show: function() {
    this.header.addClass('gray').addClass('animate');
  },

  _handleOnScroll: function() {
    if (window.pageYOffset > 50) {
      this.show();
    } else {
      this.hide();
    }
  },
};


Prime.Document.onReady(function() {
  new FusionAuth.FixedHeader();
});
