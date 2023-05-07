'use strict';

class UUIDGenerator {
  #lut;

  constructor() {
    this.#lut = [];
    for (let i = 0; i < 256; i++) {
      this.#lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }

    this.uuidValue = document.getElementById('uuid-value');
    document.getElementById('uuid-button').addEventListener('click', event => this.#handleClick(event));
    this.#handleClick();
  }

  #handleClick() {
    this.uuidValue.innerHTML = this.generate();
  }

  /**
   * Fast UUID generator, RFC4122 version 4 compliant.
   * @author Jeff Ward (jcward.com).
   * @license MIT license
   * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
   **/
  generate() {
    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return this.#lut[d0 & 0xff] + this.#lut[d0 >> 8 & 0xff] + this.#lut[d0 >> 16 & 0xff] + this.#lut[d0 >> 24 & 0xff] + '-' +
        this.#lut[d1 & 0xff] + this.#lut[d1 >> 8 & 0xff] + '-' +
        this.#lut[d1 >> 16 & 0x0f | 0x40] + this.#lut[d1 >> 24 & 0xff] + '-' +
        this.#lut[d2 & 0x3f | 0x80] + this.#lut[d2 >> 8 & 0xff] + '-' +
        this.#lut[d2 >> 16 & 0xff] + this.#lut[d2 >> 24 & 0xff] + this.#lut[d3 & 0xff] + this.#lut[d3 >> 8 & 0xff] + this.#lut[d3 >> 16 & 0xff] + this.#lut[d3 >> 24 & 0xff];
  }
}
document.addEventListener('DOMContentLoaded', () => new UUIDGenerator());