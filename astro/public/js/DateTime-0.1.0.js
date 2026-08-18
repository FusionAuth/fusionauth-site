'use strict';

class DateTimeTools {
  constructor() {
    this.secondsInput = document.getElementById('seconds');
    this.secondsInput.addEventListener('keyup', event => this.#repaint(event));
    this.dateFromSecondsResult = document.getElementById('date-when-seconds');
    this.dateFromMillisecondsResult = document.getElementById('date-when-milliseconds');

    this.dateInput = document.getElementById('date');
    this.dateInput.addEventListener('keyup', event => this.#repaint(event));
    this.secondsFromDateResult = document.getElementById('seconds-since-epoch');
    this.millisecondsFromDateResult = document.getElementById('milliseconds-since-epoch');

    this.currentTimeMilliseconds = document.getElementById('current-time-milliseconds');
    this.currentTimeSeconds = document.getElementById('current-time-seconds');
    this.currentDate = document.getElementById('current-date');
    this.currentTime = document.getElementById('current-time');

    this.secondsInput.value = new Date().getTime();
    this.dateInput.value = new Date().toISOString();
    this.#repaint();
  }

  #repaint() {
    let value = this.secondsInput.value;
    let milliseconds;
    if (value.trim() !== '') {
      const number = parseInt(value);
      if (isNaN(number) || !/^[0-9]+$/.test(value)) {
        this.dateFromSecondsResult.innerHTML = "Invalid value";
        this.dateFromMillisecondsResult.innerHTML = "Invalid value";
      } else {
        try {
          const seconds = new Date(number * 1000);
          this.dateFromSecondsResult.innerHTML = seconds.toString();
        } catch (e) {
          this.dateFromSecondsResult.innerHTML = "Invalid value";
        }

        try {
          milliseconds = new Date(number);
          this.dateFromMillisecondsResult.innerHTML = milliseconds.toString();
        } catch (e) {
          this.dateFromMillisecondsResult.innerHTML = "Invalid value";
        }
      }
    }

    value = this.dateInput.value;
    if (value.trim() !== '') {
      try {
        milliseconds = Date.parse(value);
        if (!isNaN(milliseconds)) {
          this.secondsFromDateResult.innerHTML = milliseconds / 1000;
          this.millisecondsFromDateResult.innerHTML = milliseconds;
        } else {
          this.secondsFromDateResult.innerHTML = "Invalid value";
          this.millisecondsFromDateResult.innerHTML = "Invalid value";
        }
      } catch (e) {
        this.secondsFromDateResult.innerHTML = "Invalid value";
        this.millisecondsFromDateResult.innerHTML = "Invalid value";
      }
    }

    var date = new Date();
    this.currentTimeMilliseconds.innerHTML = date.getTime();
    this.currentTimeSeconds.innerHTML = Math.round(date.getTime() / 1000);
    this.currentDate.innerHTML = date.toDateString();
    this.currentTime.innerHTML = date.toTimeString();
  }
}

document.addEventListener('DOMContentLoaded', () => new DateTimeTools());
