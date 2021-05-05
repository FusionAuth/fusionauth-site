"use strict";

/*
 * Copyright (c) 2020, Inversoft Inc., All Rights Reserved
 */

'use strict';

var FusionAuth = FusionAuth || {};
FusionAuth.Account = FusionAuth.Account || {};

FusionAuth.Account.PriceCalculator = function() {
  Prime.Utils.bindAll(this);

  // Setup the pricing model
  this.priceModel = null;
  // [brettp]TODO: CORS?
  new Prime.Ajax.Request('https://account.fusionauth.io/ajax/edition/price-model', 'GET')
      .withSuccessHandler(this._handlePriceModelResponse)
      .withErrorHandler(this._handlePriceModelResponse)
      .go();

  this.monthlyActiveUserSlider = Prime.Document.queryById('monthly-active-users')
      .addEventListener('input', this._handleSliderChange)
      .addEventListener('mouseup', this._handleSliderChange);
  this.monthlyActiveUserSliderLabel = Prime.Document.queryFirst('label[for=monthly-active-users]');

  this.hostingRadio = Prime.Document.queryFirst('input[type=radio][name="hosting"]');
  Prime.Document.query('input[type=radio][name="hosting"]').each(function(e) {
    e.addEventListener('click', this._handleHostingChange);
  }.bind(this));
};

FusionAuth.Account.PriceCalculator.constructor = FusionAuth.Account.PriceCalculator;
FusionAuth.Account.PriceCalculator.prototype = {
  _handlePriceModelResponse: function(xhr) {
    if (xhr.status === 200) {
      this.priceModel = JSON.parse(xhr.responseText);
    } else {
      console.log('AJAX request for prices failed!');
    }

    // [brettp]TODO: Remove before release
    this.priceModel = {"ec2":{"large":150,"medium":75,"regionAdjustments":{"US_EAST_1":{"medium":0,"large":0,"xlarge":0},"US_EAST_2":{"medium":0,"large":0,"xlarge":0},"US_WEST_1":{"medium":15,"large":25,"xlarge":50},"US_WEST_2":{"medium":0,"large":0,"xlarge":0},"EU_WEST_1":{"medium":15,"large":25,"xlarge":50},"EU_WEST_2":{"medium":15,"large":25,"xlarge":50},"EU_WEST_3":{"medium":15,"large":25,"xlarge":50},"EU_CENTRAL_1":{"medium":15,"large":25,"xlarge":50},"EU_NORTH_1":{"medium":15,"large":25,"xlarge":50},"AP_EAST_1":{"medium":25,"large":60,"xlarge":120},"AP_SOUTH_1":{"medium":15,"large":25,"xlarge":50},"AP_SOUTHEAST_1":{"medium":15,"large":25,"xlarge":50},"AP_SOUTHEAST_2":{"medium":15,"large":25,"xlarge":50},"AP_NORTHEAST_1":{"medium":15,"large":25,"xlarge":50},"AP_NORTHEAST_2":{"medium":15,"large":25,"xlarge":50},"SA_EAST_1":{"medium":50,"large":100,"xlarge":175},"CA_CENTRAL_1":{"medium":15,"large":25,"xlarge":50},"ME_SOUTH_1":{"medium":15,"large":25,"xlarge":50}},"xlarge":300},"elb":{"base":50,"regionAdjustments":{"US_EAST_1":0,"US_EAST_2":0,"US_WEST_1":5,"US_WEST_2":0,"EU_WEST_1":5,"EU_WEST_2":5,"EU_WEST_3":5,"EU_CENTRAL_1":5,"EU_NORTH_1":5,"AP_EAST_1":10,"AP_SOUTH_1":5,"AP_SOUTHEAST_1":5,"AP_SOUTHEAST_2":5,"AP_NORTHEAST_1":5,"AP_NORTHEAST_2":5,"SA_EAST_1":15,"CA_CENTRAL_1":5,"ME_SOUTH_1":5}},"rds":{"large":300,"medium":150,"regionAdjustments":{"US_EAST_1":{"medium":0,"large":0,"xlarge":0},"US_EAST_2":{"medium":0,"large":0,"xlarge":0},"US_WEST_1":{"medium":40,"large":50,"xlarge":85},"US_WEST_2":{"medium":0,"large":0,"xlarge":0},"EU_WEST_1":{"medium":40,"large":50,"xlarge":85},"EU_WEST_2":{"medium":40,"large":50,"xlarge":85},"EU_WEST_3":{"medium":40,"large":50,"xlarge":85},"EU_CENTRAL_1":{"medium":40,"large":50,"xlarge":85},"EU_NORTH_1":{"medium":40,"large":50,"xlarge":85},"AP_EAST_1":{"medium":70,"large":150,"xlarge":300},"AP_SOUTH_1":{"medium":40,"large":50,"xlarge":85},"AP_SOUTHEAST_1":{"medium":40,"large":50,"xlarge":85},"AP_SOUTHEAST_2":{"medium":40,"large":50,"xlarge":85},"AP_NORTHEAST_1":{"medium":40,"large":50,"xlarge":85},"AP_NORTHEAST_2":{"medium":40,"large":50,"xlarge":85},"SA_EAST_1":{"medium":100,"large":150,"xlarge":200},"CA_CENTRAL_1":{"medium":40,"large":50,"xlarge":85},"ME_SOUTH_1":{"medium":40,"large":50,"xlarge":85}},"xlarge":600},"support":{"sliderMax":1000000,"sliderStep":10000,"tierPricing":{"DEVELOPER":{"BASE":{"maximumUserCount":10000,"minimumUserCount":0,"pricePerUnit":125.00},"TIER_2":{"maximumUserCount":100000,"minimumUserCount":10001,"pricePerUnit":75.00},"TIER_3":{"maximumUserCount":1000000,"minimumUserCount":100001,"pricePerUnit":25.00},"TIER_4":{"maximumUserCount":-1,"minimumUserCount":1000001,"pricePerUnit":5.00}},"PREMIUM":{"BASE":{"maximumUserCount":10000,"minimumUserCount":0,"pricePerUnit":500.00},"TIER_2":{"maximumUserCount":100000,"minimumUserCount":10001,"pricePerUnit":125.00},"TIER_3":{"maximumUserCount":1000000,"minimumUserCount":100001,"pricePerUnit":50.00},"TIER_4":{"maximumUserCount":-1,"minimumUserCount":1000001,"pricePerUnit":10.00}},"ENTERPRISE":{"BASE":{"maximumUserCount":10000,"minimumUserCount":0,"pricePerUnit":2500.0},"TIER_2":{"maximumUserCount":100000,"minimumUserCount":10001,"pricePerUnit":250.00},"TIER_3":{"maximumUserCount":1000000,"minimumUserCount":100001,"pricePerUnit":125.00},"TIER_4":{"maximumUserCount":-1,"minimumUserCount":1000001,"pricePerUnit":25.00}}},"usersPerUnit":10000}};
    this._handleSliderChange();
  },

  _handleHostingChange: function () {
    this._updatePrices();
  },

  _handleSliderChange: function() {
    var mau = this.monthlyActiveUserSlider.getValue();
    var mauText = new Intl.NumberFormat('en').format(mau);
    this.monthlyActiveUserSliderLabel.setTextContent(mauText);
    this._updatePrices();
  },

  _updatePrices: function() {
    var priceKeyMap = {
      'COMMUNITY': 'green-border',
      'DEVELOPER': 'purple-border',
      'PREMIUM': 'blue-border',
      'ENTERPRISE': 'orange-border'
    }

    for (var key in priceKeyMap) {
      var hostingPrice = this._calculateHostingPrice(key);
      var supportPrice = this._calculateSupportPrice(key);
      var price = this._calculateHostingPrice(key) + this._calculateSupportPrice(key);
      price = Math.floor(price / 5) * 5;
      var text = price === 0 ? 'FREE' : '$' + new Intl.NumberFormat('en').format(price);
      Prime.Document.queryFirst('.pricing-cards .' + priceKeyMap[key] + ' .amount').setTextContent(text);
    }
  },

  _calculateHostingPrice: function(plan) {
    var mau = this.monthlyActiveUserSlider.getValue();
    var hosting = this.hostingRadio.getSelectedValues()[0];

    if (hosting === 'self-hosted') {
      return 0;
    }

    // var size = 'medium';
    // // [brettp]TODO: Keep this code?
    // if (mau >= 750000 && mau < 3500000) {
    //   size = 'large';
    // } else if (mau >= 3500000) {
    //   size = 'xlarge';
    // }
    var size = {
      'basic-cloud': 'medium',
      'business-cloud': 'large',
      'ha-cloud': 'xlarge'
    }[hosting];
    return this.priceModel.ec2[size] + this.priceModel.elb.base + this.priceModel.rds[size];
  },

  _calculateSupportPrice: function(plan) {
    if (plan === 'COMMUNITY') {
      return 0;
    }

    var supportPrice = 0;
    var mau = this.monthlyActiveUserSlider.getValue();
    var planTiers = Object.values(this.priceModel.support.tierPricing[plan]);

    planTiers.forEach(function (tier) {
      var adjustment = tier.minimumUserCount === 0 ? 0 : 1;
      if (mau > tier.minimumUserCount) {
        // MAU is past this tier so add ppu times total users in tier
        if (mau > tier.maximumUserCount && tier.maximumUserCount !== -1) {
          supportPrice += tier.pricePerUnit * (tier.maximumUserCount - tier.minimumUserCount + adjustment);
        }
        // MAU is inside this tier so add ppu for users in this tier
        if (mau <= tier.maximumUserCount || tier.maximumUserCount === -1) {
          supportPrice += tier.pricePerUnit * (mau - tier.minimumUserCount + 1);
        }
      }
    });

    // [brettp]TODO: Testing against old math...
    var testPrice;
    var increments = mau / 10000;
    var edition = this.priceModel.support.tierPricing[plan];
    if (increments < 10) {
      testPrice = edition.BASE.pricePerUnit + (edition.TIER_2.pricePerUnit * (increments - 1));
    } else if (increments < 100) {
      testPrice = edition.BASE.pricePerUnit + (edition.TIER_2.pricePerUnit * 9) + (edition.TIER_3.pricePerUnit * (increments - 10));
    } else {
      testPrice = edition.BASE.pricePerUnit + (edition.TIER_2.pricePerUnit * 9) + (edition.TIER_3.pricePerUnit * 90) + (edition.TIER_4.pricePerUnit * (increments - 100));
    }
    var tmp = Math.floor(supportPrice / this.priceModel.support.usersPerUnit);
    if (tmp !== testPrice) console.log(mau, tmp, testPrice);
    // [brettp]END: Testing code block

    return supportPrice / this.priceModel.support.usersPerUnit;
  }
}

Prime.Document.onReady(function() {
  const dialog = new Prime.Widgets.HTMLDialog(Prime.Document.queryFirst('#cloud-hosting-dialog'))
      .initialize();
  Prime.Document.queryFirst('.hosting-option-button')
      .addEventListener('click', function () {
        dialog.open();
        if (dialog.element.getTop() < 0) {
          dialog.element.setTop(0);
        }
      });

  Prime.Document.query('.radio-bar li').each(function(e) {
    e.addEventListener('click', function(event) {
      e.queryUp('.radio-bar').queryFirst('li.checked').removeClass('checked');
      e.addClass('checked');
      Prime.Document.queryFirst('.pricing-cards')
          .removeClass('show-self-hosted show-basic-cloud show-business-cloud show-ha-cloud')
          .addClass('show-' + e.queryFirst('input').getValue());
    });
  });

  var _changeSliderBackground = function () {
    var monthlyActiveUserSlider = Prime.Document.queryById('monthly-active-users');
    var mau = monthlyActiveUserSlider.getValue();
    var percent = 100 * (mau - 10000) / (5000000 - 10000);
    monthlyActiveUserSlider.setStyle('background', 'linear-gradient(to right, #000 0%, #000 ' + percent + '%, #fff ' + percent + '%, white 100%)');
  };

  Prime.Document.queryById('monthly-active-users')
      .addEventListener('input', _changeSliderBackground)
      .addEventListener('mouseup', _changeSliderBackground);
  _changeSliderBackground();

  new FusionAuth.Account.PriceCalculator();
});