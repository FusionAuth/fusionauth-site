/*
 * Copyright (c) 2020, FusionAuth, All Rights Reserved
 */
'use strict';

var FusionAuth = FusionAuth || {};
FusionAuth.Account = FusionAuth.Account || {};

FusionAuth.Account.Offer = function(date) {
  Prime.Utils.bindAll(this);

  this.date = new Date(date);

  var today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of the day.

  // If the date is in the past, skip the event binding etc, and just don't show anything.
  if (today < this.date) {
    // You have to use jQuery to capture 'closed.bs.alert', so lame.
    // https://stackoverflow.com/questions/24211185/twitter-bootstrap-why-do-modal-events-work-in-jquery-but-not-in-pure-js
    $('#top-bar-offer').on('closed.bs.alert', this._setCookie);

    // Show the alert if it has not been dismissed
    var cookie = ("; " + document.cookie).split("; fusionauth.offer=").pop().split(";").shift();
    if (cookie === '') {
      document.getElementById('top-bar-offer').removeAttribute('hidden');
    }

    // Set the cookie on click as well so we don't bother them.
    var offerButton = document.getElementById('top-bar-offer-button');
    if (Prime.Utils.isDefined(offerButton)) {
      offerButton.addEventListener('click', this._setCookie);
    }
  }
};

FusionAuth.Account.Offer.constructor = FusionAuth.Account.Offer;
FusionAuth.Account.Offer.prototype = {
  _setCookie: function() {
    document.cookie = 'fusionauth.offer=hide; path=/; Expires=' + this.date.toUTCString() + ';';
  }
};

