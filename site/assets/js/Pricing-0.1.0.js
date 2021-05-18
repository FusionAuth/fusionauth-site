/*
 * Copyright (c) 2020, Inversoft Inc., All Rights Reserved
 */
"use strict";

var FusionAuth = FusionAuth || {};
FusionAuth.Account = FusionAuth.Account || {};

FusionAuth.Account.PriceCalculator = function() {
  Prime.Utils.bindAll(this);

  // Find the slider
  this.monthlyActiveUserSlider = Prime.Document.queryById('monthly-active-users')
      .addEventListener('input', this._handleSliderChange)
      .addEventListener('mouseup', this._handleSliderChange);
  this.monthlyActiveUserSliderLabel = Prime.Document.queryFirst('label[for=monthly-active-users]');

  // Bail early because this isn't the pricing page
  if (this.monthlyActiveUserSlider === null) {
    return;
  }

  // Fetch the pricing model
  this.priceModel = null;
  new Prime.Ajax.Request(FusionAuth.accountURL + '/ajax/edition/price-model', 'GET')
      .withSuccessHandler(this._handlePriceModelResponse)
      .withErrorHandler(this._handlePriceModelResponse)
      .go();

  this.hostingRadio = Prime.Document.queryFirst('input[type=radio][name=hosting]');
  Prime.Document.query('input[type=radio][name=hosting]').each(function(e) {
    e.addEventListener('click', this._handleHostingChange);
  }.bind(this));

  var dialogElement = Prime.Document.queryById('cloud-hosting-dialog');
  if (dialogElement !== null) {
    this.cloudHostingDialog = new Prime.Widgets.HTMLDialog(dialogElement).initialize();
    Prime.Document.queryFirst('.hosting-option-button').addEventListener('click', this._handleHostingButtonClick);
  }

  Prime.Document.query('.radio-bar li').each(function(e) {
    e.addEventListener('click', function() {
      e.queryUp('.radio-bar').queryFirst('li.checked').removeClass('checked');
      e.addClass('checked');
      Prime.Document.queryFirst('.pricing-cards')
          .removeClass('show-self-hosted show-basic-cloud show-business-cloud show-ha-cloud')
          .addClass('show-' + e.queryFirst('input').getValue());
    });
  });

  Prime.Document.queryById('monthly-active-users')
      .addEventListener('input', this._changeSliderBackground)
      .addEventListener('mouseup', this._changeSliderBackground);
  this._changeSliderBackground();
};

FusionAuth.Account.PriceCalculator.constructor = FusionAuth.Account.PriceCalculator;
FusionAuth.Account.hostingKeyMap = {
  'basic-cloud': 'SINGLE',
  'business-cloud': 'SINGLE_RDS',
  'ha-cloud': 'HA'
};
FusionAuth.Account.priceKeyMap = {
  'COMMUNITY': 'green-border',
  'DEVELOPER': 'purple-border',
  'PREMIUM': 'blue-border',
  'ENTERPRISE': 'orange-border'
};

FusionAuth.Account.PriceCalculator.prototype = {
  _calculateHostingPrice: function() {
    var hosting = this.hostingRadio.getSelectedValues()[0];
    var price = 0;

    if (hosting === 'basic-cloud') {
      price = this.priceModel.ec2['medium'];
    } else if (hosting === 'business-cloud') {
      price = this.priceModel.ec2['medium'] + this.priceModel.rds['medium'];
    } else if (hosting === 'ha-cloud') {
      price = (2 * this.priceModel.ec2['medium']) + this.priceModel.elb.base + this.priceModel.rds['medium'];
    }

    return price;
  },

  _calculateSupportPrice: function(plan) {
    if (plan === 'COMMUNITY') {
      return 0;
    }

    var supportPrice = 0;
    var mau = this.monthlyActiveUserSlider.getValue();
    var planTiers = Object.values(this.priceModel.support.tierPricing[plan]);

    planTiers.forEach(function(tier) {
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

    return supportPrice / this.priceModel.support.usersPerUnit;
  },

  _changeSliderBackground: function() {
    var mau = this.monthlyActiveUserSlider.getValue();
    var percent = 100 * (mau - 10000) / (5000000 - 10000);
    this.monthlyActiveUserSlider.setStyle('background', 'linear-gradient(to right, #000 0%, #000 ' + percent + '%, #fff ' + percent + '%, white 100%)');
  },

  _handleHostingButtonClick: function(event) {
    Prime.Utils.stopEvent(event);
    this.cloudHostingDialog.open();
    if (this.cloudHostingDialog.element.getTop() < 0) {
      this.cloudHostingDialog.element.setTop(0);
    }
  },

  _handlePriceModelResponse: function(xhr) {
    if (xhr.status === 200) {
      this.priceModel = JSON.parse(xhr.responseText);
    } else {
      console.log('AJAX request for prices failed!');
    }

    this._handleSliderChange();
  },

  _handleHostingChange: function() {
    this._updatePrices();
    this._updateDownloadLinks();
  },

  _handleSliderChange: function() {
    var mau = this.monthlyActiveUserSlider.getValue();
    var mauText = new Intl.NumberFormat('en').format(mau);
    this.monthlyActiveUserSliderLabel.setTextContent(mauText);
    this._updatePrices();
  },

  _updateDownloadLinks: function() {
    var hosting = this.hostingRadio.getSelectedValues()[0];
    Prime.Document.query('.community.button').each(function(element) {
      if (hosting === 'basic-cloud' || hosting === 'business-cloud' || hosting === 'ha-cloud') {
        element.setAttribute('href', FusionAuth.accountURL + '/account/deployment/add?deployment.architecture=' + FusionAuth.Account.hostingKeyMap[hosting] + '&deployment.size=medium&deployment.region=US_EAST_1');
        element.setHTML('GET STARTED');
      } else {
        element.setAttribute('href', FusionAuth.siteURL + '/download/');
        element.setHTML('DOWNLOAD NOW');
      }
    });
    Prime.Document.query('.developer.button').each(function(element) {
      if (hosting === 'basic-cloud' || hosting === 'business-cloud' || hosting === 'ha-cloud') {
        element.setHTML('GET STARTED');
      } else {
        element.setHTML('TRY IT FREE');
      }
    });
  },

  _updatePrices: function() {
    for (var key in FusionAuth.Account.priceKeyMap) {
      var hostingPrice = this._calculateHostingPrice();
      var supportPrice = this._calculateSupportPrice(key);
      var price = hostingPrice + supportPrice;
      price = Math.floor(price / 5) * 5;
      var text = price === 0 ? 'FREE' : '$' + new Intl.NumberFormat('en').format(price);
      Prime.Document.queryFirst('.pricing-cards .' + FusionAuth.Account.priceKeyMap[key] + ' .amount').setTextContent(text);
    }
  }
}

Prime.Document.onReady(function() {
  new FusionAuth.Account.PriceCalculator();
});