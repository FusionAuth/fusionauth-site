/*
 * Copyright (c) 2020, Inversoft Inc., All Rights Reserved
 */
'use strict';

// noinspection DuplicatedCode
class FusionAuthPriceCalculator {
  constructor() {
    this.hostingSelectionDiv = document.getElementById('hosting-selection');
    this.hostingPriceDiv = document.getElementById('hosting-price');
    this.planSelectionDiv = document.getElementById('plan-selection');
    this.planPriceDiv = document.getElementById('plan-price');
    this.sumDiv = document.getElementById('sum');
    this.monthlyActiveUserSlider = document.querySelector('input[name=monthly-active-users]');
    this.monthlyActiveUserSlider.addEventListener('input', event => this._handleSliderChange(event));
    this.monthlyActiveUserSlider.addEventListener('mouseup', event => this._handleSliderChange(event));
    this.monthlyActiveUserSliderMin = parseInt(this.monthlyActiveUserSlider.getAttribute('min'));
    this.monthlyActiveUserSliderMax = parseInt(this.monthlyActiveUserSlider.getAttribute('max'));
    this.monthlyActiveUserValue = document.getElementById('monthly-active-users-value');
    this.communityButton = document.querySelector('a[data-plan=Community]');
    this.starterButton = document.querySelector('a[data-plan=Starter]');
    this.purchaseButton = document.getElementById('purchase-button');

    this.hostingPrice = 0;
    this.planPrice = 0;
    this._loadState();

    document.querySelectorAll('a[data-step]')
            .forEach(e => e.addEventListener('click', event => this._handleStepClick(event)))
    document.querySelectorAll('a[data-plan]')
            .forEach(e => e.addEventListener('click', event => this._handlePlanClick(event)))
    window.addEventListener('popstate', event => this._handleStateChange(event));

    fetch('https://account.fusionauth.io/ajax/purchase/price-model')
        .then(response => response.json())
        .then(json => {
          this.priceModel = json;
          this._changeStep();
        })
  }

  _calculateHostingPrice(type) {
    let price = 0;

    if (type === 'basic-cloud') {
      price = this.priceModel.ec2['medium'] / 2;
    } else if (type === 'business-cloud') {
      price = this.priceModel.ec2['medium'] + this.priceModel.rds['medium'];
    } else if (type === 'ha-cloud') {
      price = (2 * this.priceModel.ec2['medium']) + this.priceModel.elb.base + (this.priceModel.rds['medium'] * 2);
    }

    return price;
  }

  _calculatePlanPrice(plan) {
    if (plan === 'Community') {
      return 0;
    }

    var mau = parseInt(this.monthlyActiveUserSlider.value);
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

    return price;
  }

  _changeStep() {
    this._redraw();
    if (this.step) {
      this.url.searchParams.set('step', this.step);
    }
    if (this.hosting) {
      this.url.searchParams.set('hosting', this.hosting);
    }
    if (this.plan) {
      this.url.searchParams.set('plan', this.plan);
    }
  }

  _handlePlanClick(event) {
    // Let the download click bubble
    const plan = event.currentTarget.dataset.plan;
    if (this.hosting === 'self-hosting' && plan === 'Community') {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    if (plan) {
      this.plan = plan;
    }
    this._redraw();
  }

  _handleSliderChange() {
    const mau = parseInt(this.monthlyActiveUserSlider.value);
    let mauText = new Intl.NumberFormat('en').format(mau);
    if (mau === 1000000) {
      mauText += "+";
    }
    this.monthlyActiveUserValue.innerText = mauText;

    const width = this.monthlyActiveUserSlider.offsetWidth;
    const ratio = (mau - this.monthlyActiveUserSliderMin) / (this.monthlyActiveUserSliderMax - this.monthlyActiveUserSliderMin);
    let left = ((ratio * (width - 30)) + 5);
    if (left > (width / 2)) {
      left -= 10;
    }
    if (left > (width - 50)) {
      left -= 15;
    }
    this.monthlyActiveUserValue.style.left = left + 'px';
    this._redraw();
  }

  _handleStateChange() {
    this._loadState();
    this._redraw();
  }

  _handleStepClick(event) {
    event.stopPropagation();
    event.preventDefault();
    if (event.currentTarget.dataset.step === 'back') {
      window.history.back();
      return;
    }

    this.step = event.currentTarget.dataset.step;
    if (event.currentTarget.dataset.hosting) {
      this.hosting = event.currentTarget.dataset.hosting;
    }
    if (event.currentTarget.dataset.plan) {
      this.plan = event.currentTarget.dataset.plan;
    }
    this._changeStep();
    window.history.pushState({}, '', this.url);
  }

  _loadState() {
    this.url = new URL(window.location);
    this.step = this.url.searchParams.get('step');
    this.hosting = this.url.searchParams.get('hosting');
    this.plan = this.url.searchParams.get('plan');
    if (this.step === null) {
      this.step = 'start';
    }
  }

  _redraw() {
    document.querySelectorAll(`div[data-step]`).forEach(e => e.style.display = 'none');
    document.querySelector(`div[data-step=${this.step}]`).style.display = 'block';

    this.hostingSelectionDiv.innerText = this.hosting ? FusionAuthPriceCalculator.names[this.hosting] : '-';
    this.planSelectionDiv.innerText = this.plan ? this.plan : '-';

    if (this.hosting) {
      this.hostingPrice = this._calculateHostingPrice(this.hosting);
      this.hostingPriceDiv.innerText = '$' + new Intl.NumberFormat('en').format(Math.floor(this.hostingPrice));
    } else {
      this.hostingPrice = 0;
      this.hostingPriceDiv.innerText = '-';
    }

    if (this.hosting === 'ha-cloud') {
      this.communityButton.href = '#';
      this.communityButton.innerText = 'Not available';
      this.communityButton.classList.add('grayed-out');
      this.communityButton.classList.remove('sales');
      this.communityButton.setAttribute('disabled', 'disabled');
      this.starterButton.innerText = 'Not available';
      this.starterButton.setAttribute('disabled', 'disabled');
      this.starterButton.classList.add('grayed-out');
      this.starterButton.classList.remove('sales');
    } else if (this.hosting !== 'self-hosting') {
      this.communityButton.href = '#';
      this.communityButton.innerText = 'Select';
      this.communityButton.classList.remove('grayed-out');
      this.communityButton.classList.add('sales');
      this.communityButton.removeAttribute('disabled');
      this.starterButton.innerText = 'Select';
      this.starterButton.removeAttribute('disabled');
      this.starterButton.classList.remove('grayed-out');
      this.starterButton.classList.add('sales');
    } else {
      this.communityButton.href = '/download';
      this.communityButton.innerText = 'Download';
    }

    document.querySelectorAll('div[data-plan]').forEach(e => e.style.border = '2px solid transparent');
    if (this.plan) {
      this.planPrice = this._calculatePlanPrice(this.plan);
      this.planPriceDiv.innerText = '$' + new Intl.NumberFormat('en').format(Math.floor(this.planPrice));
      document.querySelector(`div[data-plan=${this.plan}]`).style.border = '2px solid #f58320';
    } else {
      this.planPrice = 0;
      this.planPriceDiv.innerText = '-';
    }

    if (this.hosting && this.plan) {
      this.purchaseButton.removeAttribute('disabled');
      this.purchaseButton.classList.remove('grayed-out');
      this.purchaseButton.setAttribute('href', `https://account.fusionauth.io/account/purchase/start?hosting=${this.hosting}&plan=${this.plan}`)
    } else {
      this.purchaseButton.setAttribute('disabled', 'disabled');
      this.purchaseButton.classList.add('grayed-out');
    }

    if ((!this.hosting || this.hosting === 'self-hosting' || this.hosting === 'basic-cloud') && (!this.plan || this.plan === 'Community' || this.plan === 'Starter')) {
      this.sumDiv.innerText = 'Free trial';
      this.sumDiv.nextElementSibling.style.display = 'none';
      this.purchaseButton.innerHTML = 'Start trial';
    } else if (this.hostingPrice !== 0 || this.planPrice !== 0) {
      this.sumDiv.innerText = '$' + new Intl.NumberFormat('en').format(Math.floor(this.hostingPrice + this.planPrice));
      this.sumDiv.nextElementSibling.style.display = 'inline';
      this.purchaseButton.innerHTML = 'Buy online';
    } else {
      this.sumDiv.innerText = '-';
      this.sumDiv.nextElementSibling.style.display = 'inline';
      this.purchaseButton.innerHTML = 'Buy online';
    }
  }
}

FusionAuthPriceCalculator.names = {
  'basic-cloud': 'Basic',
  'business-cloud': 'Business',
  'ha-cloud': 'HA',
  'self-hosting': 'Self-hosting'
}

document.addEventListener('DOMContentLoaded', () => new FusionAuthPriceCalculator());