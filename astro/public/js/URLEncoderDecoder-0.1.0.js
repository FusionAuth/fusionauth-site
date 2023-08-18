'use strict';

class EncoderDecoder {
  #decoded;
  #decodedEditor;
  #encoded;
  #encodedEditor;

  constructor() {
    this.#decoded = document.getElementById('decoded-textarea');
    this.#encoded = document.getElementById('encoded-textarea');

    let options = {
      autofocus: false,
      lineNumbers: true,
      lineWrapping: true,
      mode: 'text'
    };
    this.#decodedEditor = CodeMirror.fromTextArea(this.#decoded, options);
    this.#decodedEditor.display.wrapper.querySelector('textarea').addEventListener('keyup', event => this.#handleChange(event))
    this.#encodedEditor = CodeMirror.fromTextArea(this.#encoded, options);
    this.#encodedEditor.display.wrapper.querySelector('textarea').addEventListener('keyup', event => this.#handleChange(event))
  }

  #handleChange(event) {
    const encoding = event.target === this.#decodedEditor.display.wrapper.querySelector('textarea');
    const src = encoding ? this.#decodedEditor : this.#encodedEditor;
    const dst = encoding ? this.#encodedEditor : this.#decodedEditor;
    this.#update(src.getValue(), encoding, dst)
  }

  #update(value, encoding, dst) {
    const parts = [];
    const vars = value.split('&');
    for (var i = 0; i < vars.length; i++) {
      if (parts.length !== 0) {
        parts.push('&');
      }

      var pair = vars[i].split('=');
      if (pair.length > 0) {
        if (encoding) {
          parts.push(encodeURIComponent(pair[0]));
        } else {
          parts.push(decodeURIComponent(pair[0]));
        }
      }

      if (pair.length === 2) {
        parts.push('=');
        if (encoding) {
          parts.push(encodeURIComponent(pair[1]));
        } else {
          parts.push(decodeURIComponent(pair[1]));
        }
      }
    }

    dst.setValue(parts.join(''));
  }
}

document.addEventListener('DOMContentLoaded', () => new EncoderDecoder());
