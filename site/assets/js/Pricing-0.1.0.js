"use strict";
Prime.Document.onReady(function() {
  Prime.Document.query('.radio-bar li').each(function(e) {
    e.addEventListener('click', function(event) {
      e.queryUp('.radio-bar').queryFirst('li.checked').removeClass('checked');
      e.addClass('checked');
      Prime.Document.queryFirst('.pricing-cards')
          .removeClass('show-self-hosted show-basic-cloud show-business-cloud show-ha-cloud')
          .addClass('show-' + e.queryFirst('input').getValue());
    });
  });

  var _handleSliderChange = function () {
    var monthlyActiveUserSlider = Prime.Document.queryById('monthly-active-users');
    var mau = monthlyActiveUserSlider.getValue();
    var mauDisplay = new Intl.NumberFormat('en').format(mau);
    var monthlyActiveUserSliderLabel = Prime.Document.queryFirst('.slider-bar label');
    monthlyActiveUserSliderLabel.setTextContent(mauDisplay);

    var percent = 100 * (mau - 10000) / (5000000 - 10000);
    monthlyActiveUserSlider.setStyle('background', 'linear-gradient(to right, #000 0%, #000 ' + percent + '%, #fff ' + percent + '%, white 100%)');
  };

  Prime.Document.queryById('monthly-active-users')
      .addEventListener('input', _handleSliderChange)
      .addEventListener('mouseup', _handleSliderChange);
  _handleSliderChange();
});