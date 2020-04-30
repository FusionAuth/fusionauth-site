"use strict";

//noinspection JSUnusedAssignment
var FusionAuth = FusionAuth || {};

FusionAuth.Documentation = function() {
  Prime.Utils.bindAll(this);

  this.tripHeight = 2000;

  this.scrollTop = Prime.Document.queryById('scroll-top');
  if (this.scrollTop !== null) {
    this.scrollTop.addEventListener('click', this._handleClick);
    window.addEventListener('scroll', this._handleScroll);
  }

  // Hide if the page is short so we don't this button high up on the page.
  if (window.scrollY < this.tripHeight) {
    this.scrollTop.hide();
  }

  this._replaceBreadcrumbsWithGlyphs();
}

FusionAuth.Documentation.constructor = FusionAuth.Documentation;
FusionAuth.Documentation.prototype = {

  _handleClick: function(event) {
    Prime.Utils.stopEvent(event);
    this.scrolling = true;

    // Hide the scroll-to button and scroll to the top
    this.scrollTop.removeClass('show')
    window.scrollTo(0, 0);

    setTimeout(this._resetScrollingState, 1500);
  },

  _resetScrollingState: function() {
    this.scrolling = false;
  },

  _handleScroll: function() {
    if (!this.scrolling) {
      if (window.pageYOffset > this.tripHeight) {
        this.scrollTop.show();
        this.scrollTop.addClass('show');
      } else {
        this.scrollTop.removeClass('show')
      }
    }
  },

  _replaceBreadcrumbsWithGlyphs: function() {
    // Use a Font Awesome glyph for bread crumbs
    Prime.Document.query('span.breadcrumb').each(function(element) {
      var innerHTML = element.domElement.innerHTML;

      // TODO I should just replace all usages of these arrows with one or the other
      element.setHTML(innerHTML
          .replace(/→/g, '<i class="fa fa-chevron-right"></i>')
          .replace(/->/g, '<i class="fa fa-chevron-right"></i>'));
    });
  }
}


Prime.Document.onReady(function() {
  new FusionAuth.Documentation();
});
