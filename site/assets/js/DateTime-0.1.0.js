var DateTimeTools = function() {
  Prime.Utils.bindAll(this);
  Prime.Document.queryById('seconds-form').addEventListener('submit', this._handleFormSubmit);
  this.secondsInput = Prime.Document.queryById('secondsValue').addEventListener('keyup', this._repaint);
  this.dateFromSecondsResult = Prime.Document.queryById('date-from-seconds-result');
  this.dateFromMillisecondsResult = Prime.Document.queryById('date-from-milliseconds-result');

  Prime.Document.queryById('date-form').addEventListener('submit', this._handleFormSubmit);
  this.dateInput = Prime.Document.queryById('dateValue').addEventListener('keyup', this._repaint);
  this.secondsFromDateResult = Prime.Document.queryById('seconds-from-date-result');
  this.millisecondsFromDateResult = Prime.Document.queryById('milliseconds-from-date-result');

  this.currentTimeMilliseconds = Prime.Document.queryById('current-time-milliseconds');
  this.currentTimeSeconds = Prime.Document.queryById('current-time-seconds');
  this.currentDate = Prime.Document.queryById('current-date');
  this.currentTime = Prime.Document.queryById('current-time');
  setInterval(this._repaint, 1000);
};

DateTimeTools.prototype = {
  _handleFormSubmit: function(e) {
    Prime.Utils.stopEvent(e);
    this._repaint();
  },

  _repaint: function() {
    var value = this.secondsInput.getValue();
    if (value.trim() !== '') {
      var number = parseInt(value);
      if (isNaN(number) || !/^[0-9]+$/.test(value)) {
        this.dateFromSecondsResult.setHTML("Invalid value");
        this.dateFromMillisecondsResult.setHTML("Invalid value");
      } else {
        try {
          var seconds = new Date(number * 1000);
          this.dateFromSecondsResult.setHTML(seconds.toString());
        } catch (e) {
          this.dateFromSecondsResult.setHTML("Invalid value");
        }

        try {
          var milliseconds = new Date(number);
          this.dateFromMillisecondsResult.setHTML(milliseconds.toString());
        } catch (e) {
          this.dateFromMillisecondsResult.setHTML("Invalid value");
        }
      }
    }

    value = this.dateInput.getValue();
    if (value.trim() !== '') {
      try {
        var milliseconds = Date.parse(value);
        if (!isNaN(milliseconds)) {
          this.secondsFromDateResult.setHTML(milliseconds / 1000);
          this.millisecondsFromDateResult.setHTML(milliseconds);
        } else {
          this.secondsFromDateResult.setHTML("Invalid value");
          this.millisecondsFromDateResult.setHTML("Invalid value");
        }
      } catch (e) {
        this.secondsFromDateResult.setHTML("Invalid value");
        this.millisecondsFromDateResult.setHTML("Invalid value");
      }
    }

    var date = new Date();
    this.currentTimeMilliseconds.setHTML(date.getTime());
    this.currentTimeSeconds.setHTML(Math.round(date.getTime() / 1000));
    this.currentDate.setHTML(date.toDateString());
    this.currentTime.setHTML(date.toTimeString());
  }
};
Prime.Document.onReady(function() {
  new DateTimeTools();
});
