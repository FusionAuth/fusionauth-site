---
---
/*
 * Copyright (c) 2020, Inversoft Inc., All Rights Reserved
 */
"use strict";

var FusionAuth = FusionAuth || {};
FusionAuth.Account = FusionAuth.Account || {};
FusionAuth.siteURL = '{% if jekyll.environment == "development" %}https://site-local.fusionauth.io{% else %}https://fusionauth.io{% endif %}';
FusionAuth.accountURL = '{% if jekyll.environment == "development" %}https://account-local.fusionauth.io{% else %}https://account.fusionauth.io{% endif %}';

FusionAuth.Account.PriceCalculator = function() {
  Prime.Utils.bindAll(this);

  // Find the slider and bail early because this isn't the pricing page
  this.monthlyActiveUserSlider = Prime.Document.queryFirst('#monthly-active-users input[type=range]');
  if (this.monthlyActiveUserSlider === null) {
    return;
  }

  this.monthlyActiveUserSliderMin = this.monthlyActiveUserSlider.getAttribute('min');
  this.monthlyActiveUserSliderMax = this.monthlyActiveUserSlider.getAttribute('max');
  this.monthlyActiveUserSlider.addEventListener('input', this._handleSliderChange)
      .addEventListener('mouseup', this._handleSliderChange);
  this.monthlyActiveUserSliderLabel = Prime.Document.queryById('monthly-active-users-value');

  this.frequencyToggle = Prime.Document.queryById('frequency-toggle')
      .addEventListener('change', this._handleFrequencyChange);
  this.monthly = true;

  // Fetch the pricing model
  this.priceModel = null;
  new Prime.Ajax.Request(FusionAuth.accountURL + '/ajax/purchase/price-model', 'GET')
      .withSuccessHandler(this._handlePriceModelResponse)
      .withErrorHandler(this._handlePriceModelResponse)
      .go();

  // Save off the original href's and text for the pricing buttons
  Prime.Document.query('.main-pricing-section a.pricing').each(function(e) {
    var href = e.getAttribute('href').replace('#', FusionAuth.accountURL);
    e.setAttribute('href-orig', href);
    e.setAttribute('html-orig', e.getHTML());
  });
};

FusionAuth.Account.PriceCalculator.constructor = FusionAuth.Account.PriceCalculator;
FusionAuth.Account.hostingTypes = ['self-hosted', 'basic-cloud', 'business-cloud', 'ha-cloud'];
FusionAuth.Account.plans = ['Community', 'Starter', 'Essentials', 'Enterprise'];

FusionAuth.Account.PriceCalculator.prototype = {
  _calculateHostingPrice: function(type) {
    var price = 0;

    if (type === 'basic-cloud') {
      price = this.priceModel.ec2['medium'] / 2;
    } else if (type === 'business-cloud') {
      price = this.priceModel.ec2['medium'] + this.priceModel.rds['medium'];
    } else if (type === 'ha-cloud') {
      price = (2 * this.priceModel.ec2['medium']) + this.priceModel.elb.base + (this.priceModel.rds['medium'] * 2);
    }

    return price;
  },

  _calculatePlanPrice: function(plan) {
    if (plan === 'Community') {
      return 0;
    }

    var mau = parseInt(this.monthlyActiveUserSlider.getValue());
    var planPricing = this.priceModel.plan.tierPricing[plan];
    var increments = mau / 10000;
    var price;
    if (increments < 10) {
      price = planPricing.base.pricePerUnit + (planPricing.tier2.pricePerUnit * (increments - 1));
    } else if (increments < 100) {
      price = planPricing.base.pricePerUnit + (planPricing.tier2.pricePerUnit * 9) + (planPricing.tier3.pricePerUnit * (increments - 10));
    } else {
      price = planPricing.base.pricePerUnit + (planPricing.tier2.pricePerUnit * 9) + (planPricing.tier3.pricePerUnit * 90) + (planPricing.tier4.pricePerUnit * (increments - 100));
    }

    if (!this.monthly) {
      price = Math.floor(price - (price * planPricing.annualDiscountPercentage));
    }
    return price;
  },

  _handleFrequencyChange: function() {
    this.monthly = !this.frequencyToggle.isChecked();
    this._updatePrices();
  },

  _handlePriceModelResponse: function(xhr) {
    if (xhr.status === 200) {
      this.priceModel = JSON.parse(xhr.responseText);
    } else {
      console.log('AJAX request for prices failed!');
    }

    this._handleSliderChange();
  },

  _handleSliderChange: function() {
    var mau = parseInt(this.monthlyActiveUserSlider.getValue());
    var mauText = new Intl.NumberFormat('en').format(mau);
    if (mau === 1000000) {
      mauText += "+";
    }
    this.monthlyActiveUserSliderLabel.setTextContent(mauText);

    var width = this.monthlyActiveUserSlider.getWidth();
    var ratio = (mau - this.monthlyActiveUserSliderMin) / (this.monthlyActiveUserSliderMax - this.monthlyActiveUserSliderMin);
    var left = (ratio * (width - 30)) - 49;
    this.monthlyActiveUserSliderLabel.setLeft(left);
    this._updatePrices();
  },

  _updateButtons: function() {
    var mau = parseInt(this.monthlyActiveUserSlider.getValue());
    if (mau === 1000000 || !this.monthly) {
      Prime.Document.query('.pricing-table a.pricing').each(function(e) {
        e.setAttribute('href', '/contact')
            .setHTML('Contact sales');
      });
    } else {
      Prime.Document.query('.pricing-table a.pricing').each(function(e) {
        e.setAttribute('href', e.getAttribute('href-orig'))
            .setHTML(e.getAttribute('html-orig'));
      });
    }

    if (mau > 10000) {
      Prime.Document.query('.starter-button').each(function(e) {
        e.setHTML('Not available');
      });
    }
  },

  _updatePrices: function() {
    for (var hIndex in FusionAuth.Account.hostingTypes) {
      for (var eIndex in FusionAuth.Account.plans) {
        var hostingType = FusionAuth.Account.hostingTypes[hIndex];
        var plan = FusionAuth.Account.plans[eIndex];
        var hostingPrice = this._calculateHostingPrice(hostingType);
        var planPrice = this._calculatePlanPrice(plan);
        var price = hostingPrice + planPrice;
        price = Math.floor(price);
        var text = price === 0 ? 'FREE' : new Intl.NumberFormat('en').format(price);
        var name = hostingType + "-" + plan.toLowerCase();
        var amount = Prime.Document.queryById(name);
        if (amount === null) {
          continue;
        }

        amount.setHTML(text);
      }
    }

    this._updateButtons();
  }
}

Prime.Document.onReady(function() {
  new FusionAuth.Account.PriceCalculator();
});