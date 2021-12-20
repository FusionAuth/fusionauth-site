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

  this.scrollNav = Prime.Document.queryById('scroll-nav');
  if (this.scrollNav !== null) {
    this._setupScrollNav();
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

  _handleNavMenuClick: function(event) {
    Prime.Utils.stopEvent(event);
    if (this.scrollNavTitles.isVisible()) {
      this.scrollNavTitles.hide();
    } else {
      this.scrollNavTitles.show();
    }
  },

  _handleNavTitleClick: function(event) {
    // Prime.Utils.stopEvent(event);
    setTimeout(function() {
      this.scrollNavTitles.hide();
    }.bind(this), 500);
  },

  _setupScrollNav: function() {
    this.scrollNavMenu = this.scrollNav.query('div')[0];
    this.scrollNavMenu.addEventListener('click', this._handleNavMenuClick);

    this.scrollNavTitles = this.scrollNav.query('ul')[0];
    this.scrollNavTitles.addEventListener('click', this._handleNavTitleClick);
    var headers = Prime.Document.query('article H2, article H3');
    var titleList = '';

    var needsClosing = false;
    for (var i = 0; i < headers.length; i++) {
      var id = headers[i].getId();
      if (id !== '') {
        if (headers[i].getTagName() === 'H2' && i > 0 && needsClosing) {
          titleList += '</ul>';
          needsClosing = false;
        }
        if (headers[i].getTagName() === 'H3' && !needsClosing) {
          titleList += '<ul>';
          needsClosing = true;
        }
        titleList += '<li><a href="#' + id + '">' + headers[i].getHTML() + '</a></li>';
      }
    }
    if (needsClosing) {
      titleList += '</ul>';
    }
    this.scrollNavTitles.setHTML(titleList).hide();
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

      element.setHTML(innerHTML
          .replace(/→/g, '<i class="fa fa-chevron-right"></i>')
          .replace(/->/g, '<i class="fa fa-chevron-right"></i>'));
    });
  }
}


Prime.Document.onReady(function() {
  new FusionAuth.Documentation();
});
