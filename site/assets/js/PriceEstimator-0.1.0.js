/*
 * Copyright (c) 2019-2020, Inversoft Inc., All Rights Reserved
 */

'use strict';

var FusionAuth = FusionAuth || {};

FusionAuth.PriceEstimator = function () {
  Prime.Utils.bindAll(this);

  var communityInput = Prime.Document.queryById('community-monthly-active-users').addEventListener('input', this._handleSliderChange);
  communityInput.domElement.element = communityInput;
  communityInput.domElement.label = Prime.Document.queryFirst('label[for=community-monthly-active-users]');
  communityInput.domElement.amount = communityInput.queryUp('.cost').queryFirst('.amount');
  communityInput.domElement.plan = 'COMMUNITY';

  var premiumInput = Prime.Document.queryById('premium-monthly-active-users').addEventListener('input', this._handleSliderChange);
  premiumInput.domElement.element = premiumInput;
  premiumInput.domElement.label = Prime.Document.queryFirst('label[for=premium-monthly-active-users]');
  premiumInput.domElement.amount = premiumInput.queryUp('.cost').queryFirst('.amount');
  premiumInput.domElement.plan = 'PREMIUM';

  var enterpriseInput = Prime.Document.queryById('enterprise-monthly-active-users').addEventListener('input', this._handleSliderChange);
  enterpriseInput.domElement.element = enterpriseInput;
  enterpriseInput.domElement.label = Prime.Document.queryFirst('label[for=enterprise-monthly-active-users]');
  enterpriseInput.domElement.amount = enterpriseInput.queryUp('.cost').queryFirst('.amount');
  enterpriseInput.domElement.plan = 'ENTERPRISE';

  this.currentAmount = null;
};

FusionAuth.PriceEstimator.constructor = FusionAuth.PriceEstimator;
FusionAuth.PriceEstimator.prototype = {
  _handleSliderChange: function (event) {
    var element = event.currentTarget.element;
    var label = event.currentTarget.label;
    var plan = event.currentTarget.plan;
    this.currentAmount = event.currentTarget.amount;

    // Set the slider label
    var userCount = element.getValue();
    label.setHTML(new Intl.NumberFormat('en').format(userCount));

    if (plan !== 'COMMUNITY') {
      var requestData = {
        "license.plan": plan,
        "monthlyActiveUserCount": userCount
      };

      new Prime.Ajax.Request('https://account.fusionauth.io/ajax/support-price-estimate', 'GET')
        .withData(requestData)
        .withSuccessHandler(this._handleResponse)
        .withErrorHandler(this._handleResponse)
        .go();
    }
  },

  _handleResponse: function(xhr) {
    if (xhr.status === 200 && this.currentAmount !== null) {
      var price = JSON.parse(xhr.responseText).priceText.replace('.00', '');
      this.currentAmount.setHTML(price);
    }
  }
};

Prime.Document.onReady(function() {
  new FusionAuth.PriceEstimator();
});