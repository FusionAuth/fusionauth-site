/*
 * Copyright (c) 2020-2023, Inversoft Inc., All Rights Reserved
 */
'use strict';

const monthlyInterval = 'Monthly';
const yearlyInterval = 'Yearly';
const defaultPlanPrice = { base: 0, mau: 0 };

// noinspection DuplicatedCode
class FusionAuthPriceCalculator {
  constructor() {

    this.hostingSelectionDiv = document.getElementById('hosting-selection');
    this.hostingPriceDiv = document.getElementById('hosting-price');
    this.planSelectionDiv = document.getElementById('plan-selection');
    this.planBasePriceDiv = document.getElementById('plan-price');
    this.planMauPriceDiv = document.getElementById('mau-price');
    this.sumDiv = document.getElementById('sum');
    this.monthlyActiveUserSlider = document.querySelector('input[name=monthly-active-users]');
    this.monthlyActiveUserSlider.addEventListener('input', event => this.#handleSliderChange(event));
    this.monthlyActiveUserSlider.addEventListener('mouseup', event => this.#handleSliderChange(event));
    this.monthlyActiveUserSliderMin = parseInt(this.monthlyActiveUserSlider.getAttribute('min'));
    this.monthlyActiveUserSliderMax = parseInt(this.monthlyActiveUserSlider.getAttribute('max'));
    this.monthlyActiveUserValue = document.getElementById('monthly-active-users-value');
    this.communityButton = document.querySelector('a[data-plan=Community]');
    this.starterButton = document.querySelector('a[data-plan=Starter]');
    this.purchaseButton = document.getElementById('purchase-button');

    this.billingToggle = document.getElementById('billing-toggle');
    this.billingToggle.addEventListener('mouseup', event => this.#handleBillingIntervalChange(event));

    this.hostingPrice = 0;
    this.planPrice = defaultPlanPrice;
    this.#loadState();

    this.billingInterval = this.#yearlySelected() ? yearlyInterval : monthlyInterval;

    document.querySelectorAll('a[data-step]')
            .forEach(e => e.addEventListener('click', event => this.#handleStepClick(event)));
    document.querySelectorAll('a[data-plan]')
            .forEach(e => e.addEventListener('click', event => this.#handlePlanClick(event)));
    window.addEventListener('popstate', event => this.#handleStateChange(event));

    fetch('https://account.fusionauth.io/ajax/purchase/price-model')
        .then(response => response.json())
        .then(json => {
          this.priceModel = json;
          let maxDiscount = Object.values(json.plan.tierPricing)
                                  .map(val => 100 * (1 - (val.base.pricePerUnitYearly / (12 * val.base.pricePerUnitMonthly))))
                                  .reduce((discount, currentMax) => discount > currentMax ? discount : currentMax);
          document.getElementById("max-discount-text").innerText = `(Save up to ${Math.round(maxDiscount)}%)`;
          this.#changeStep();
          this.#drawPlanPrices();
        });
  }

  #calculateHostingPrice(type) {
    let price = 0;

    if (type === 'basic-cloud') {
      price = this.priceModel.ec2['medium'] / 2;
    } else if (type === 'business-cloud') {
      price = this.priceModel.ec2['medium'] + this.priceModel.rds['medium'];
    } else if (type === 'ha-cloud') {
      price = (2 * this.priceModel.ec2['medium']) + this.priceModel.elb.base + (this.priceModel.rds['medium'] * 2);
    }

    if (this.billingInterval === yearlyInterval) {
      price = price * 12;
    }

    return price;
  }

  /**
   * Inspects the billing toggle to get its state, which is done with the toggle-on CSS class
   * @returns {boolean} true if the toggle is set to yearly, false if it's set to monthly
   */
  #yearlySelected() {
    return this.billingToggle.classList.contains('toggle-on');
  }

  /**
   * Provides the key to use to look up pricing items in the pricing data
   * @param {string} interval an optional billing interval. Defaults to what is currently set on the page.
   * @returns {string} a key for looking up in the pricing JSON
   */
  #getBillingIntervalKey(interval = this.billingInterval) {
    return 'pricePerUnit' + (interval === yearlyInterval ? 'Yearly' : 'Monthly');
  }

  /**
   *
   * @param plan
   * @returns {{mau: number, base: number}|{mau: number, base: *}} an object containing the base price of the selected
   * plan, and the expected MAU charge based on the MAU slider value
   */
  #calculatePlanPrice(plan) {
    if (plan === 'Community') {
      return defaultPlanPrice;
    }

    let mau = parseInt(this.monthlyActiveUserSlider.value);
    let planPricing = this.priceModel.plan.tierPricing[plan];
    let billingKey = this.#getBillingIntervalKey();
    let increments = mau / 10000;
    let mauPrice;

    if (increments < 10) {
      mauPrice = (planPricing.tier2[billingKey] * (increments - 1));
    } else if (increments < 100) {
      mauPrice = (planPricing.tier2[billingKey] * 9) + (planPricing.tier3[billingKey] * (increments - 10));
    } else {
      mauPrice = (planPricing.tier2[billingKey] * 9) + (planPricing.tier3[billingKey] * 90) + (planPricing.tier4[billingKey] * (increments - 100));
    }

    return {
      base: planPricing.base[billingKey],
      mau: mauPrice
    };
  }

  #changeStep() {
    this.#redraw();
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

  #handlePlanClick(event) {
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
    this.#redraw();
  }

  #handleSliderChange() {
    const mau = parseInt(this.monthlyActiveUserSlider.value);
    let mauText = new Intl.NumberFormat('en').format(mau);
    if (mau === 1000000) {
      mauText += '+';
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
    this.#redraw();
  }

  #handleBillingIntervalChange() {
    let yearlySelected = !this.#yearlySelected();

    // Flip the toggle
    this.billingToggle.classList.remove('toggle-' + (yearlySelected ? 'off' : 'on'));
    this.billingToggle.classList.add('toggle-' + (yearlySelected ? 'on' : 'off'));

    // Set the billing interval
    this.billingInterval = yearlySelected ? yearlyInterval : monthlyInterval;

    this.#redraw();
  }


  #handleStateChange() {
    this.#loadState();
    this.#redraw();
  }

  #handleStepClick(event) {
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
    this.#changeStep();
    window.history.pushState({}, '', this.url);
  }

  #loadState() {
    this.url = new URL(window.location);
    this.step = this.url.searchParams.get('step');
    this.hosting = this.url.searchParams.get('hosting');
    this.plan = this.url.searchParams.get('plan');
    if (this.step === null) {
      this.step = 'start';
    }
  }

  #drawPlanPrices() {
    let monthlyBillingKey = this.#getBillingIntervalKey(monthlyInterval);
    let yearlyBillingKey = this.#getBillingIntervalKey(yearlyInterval);
    let billingPreferenceLabel = this.billingInterval === monthlyInterval ? 'Monthly' : 'Annually';

    // turn on/off the undiscounted monthly price and change the "Billed x-ly" text on the plan cards
    document.querySelectorAll('.amount-div.discount').forEach(e => e.style.display = (this.billingInterval === monthlyInterval ? 'none' : 'flex'));
    document.querySelectorAll('.billing-preference-text').forEach(e => e.innerText = 'Billed ' + billingPreferenceLabel);
    document.getElementById('sum-billing-preference').innerText = billingPreferenceLabel;

    // Update the price values on the plan cards
    for (const plan in FusionAuthPriceCalculator.plans) {
      if (plan !== 'community') {
        let planPricing = this.priceModel.plan.tierPricing[FusionAuthPriceCalculator.plans[plan]];

        let monthlyPrice = planPricing.base[monthlyBillingKey];
        let yearlyPrice = planPricing.base[yearlyBillingKey];
        let planPrice = this.billingInterval === monthlyInterval ? monthlyPrice : Math.round(yearlyPrice / 12);

        document.getElementById(plan + '-price-struck').textContent = monthlyPrice.toLocaleString();
        document.getElementById(plan + '-price').textContent = planPrice.toLocaleString();
      }
    }

    // Update summary text
    document.getElementById('mau-charge-text').innerText = this.billingInterval === 'monthly' ? 'Estimated MAU Charge' : 'Annual MAU charge';
  }

  #redraw() {
    document.querySelectorAll(`div[data-step]`).forEach(e => e.style.display = 'none');
    document.querySelector(`div[data-step=${this.step}]`).style.display = 'block';

    this.hostingSelectionDiv.innerText = this.hosting ? FusionAuthPriceCalculator.names[this.hosting] : '-';
    this.planSelectionDiv.innerText = this.plan ? this.plan : '-';

    if (this.hosting) {
      this.hostingPrice = this.#calculateHostingPrice(this.hosting);
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
      this.planPrice = this.#calculatePlanPrice(this.plan);
      this.planBasePriceDiv.innerText = '$' + new Intl.NumberFormat('en').format(Math.floor(this.planPrice.base));
      this.planMauPriceDiv.innerText = '$' + new Intl.NumberFormat('en').format(Math.floor(this.planPrice.mau));
      document.querySelector(`div[data-plan=${this.plan}]`).style.border = '2px solid #f58320';
    } else {
      this.planPrice = defaultPlanPrice;
      this.planBasePriceDiv.innerText = '-';
      this.planMauPriceDiv.innerText = '-';
    }

    if (this.hosting && this.plan) {
      let purchaseHref = `https://account.fusionauth.io/account/purchase/start?hosting=${this.hosting}&plan=${this.plan}&renewal=${this.billingInterval}&monthlyActiveUsers=${this.monthlyActiveUserSlider.value}`;

      this.purchaseButton.removeAttribute('disabled');
      this.purchaseButton.classList.remove('grayed-out');

      this.purchaseButton.setAttribute('href', purchaseHref);
    } else {
      this.purchaseButton.setAttribute('disabled', 'disabled');
      this.purchaseButton.classList.add('grayed-out');
    }

    if (this.billingInterval === monthlyInterval && (!this.hosting || this.hosting === 'self-hosting' || this.hosting === 'basic-cloud') && (!this.plan || this.plan === 'Community' || this.plan === 'Starter')) {
      this.sumDiv.innerText = 'Free trial';
      this.sumDiv.nextElementSibling.style.display = 'none';
      this.purchaseButton.innerHTML = 'Start trial';
    } else if (this.hostingPrice !== 0 || this.planPrice.base > 0) {
      this.sumDiv.innerText = '$' + new Intl.NumberFormat('en').format(Math.floor(this.hostingPrice + this.planPrice.base + this.planPrice.mau));
      this.purchaseButton.innerHTML = 'Buy online';
    } else {
      this.sumDiv.innerText = '-';
      this.purchaseButton.innerHTML = 'Buy online';
    }

    this.#drawPlanPrices();
  }
}

FusionAuthPriceCalculator.names = {
  'basic-cloud': 'Basic',
  'business-cloud': 'Business',
  'ha-cloud': 'HA',
  'self-hosting': 'Self-hosting'
}

FusionAuthPriceCalculator.plans = {
  'community': 'Community',
  'starter': 'Starter',
  'essentials': 'Essentials',
  'enterprise': 'Enterprise'
}

document.addEventListener('DOMContentLoaded', () => new FusionAuthPriceCalculator());