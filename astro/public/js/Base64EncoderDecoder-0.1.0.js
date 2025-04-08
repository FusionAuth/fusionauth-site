'use strict';

class Base64EncoderDecoder {
  #decoded;
  #decodedEditor;
  #encoded;
  #encodedEditor;
  #urlSafe;
  #withoutPadding;

  constructor() {
    this.#decoded = document.getElementById('decoded-textarea');
    this.#encoded = document.getElementById('encoded-textarea');
    this.#urlSafe = document.getElementById('url_safe');
    this.#urlSafe.addEventListener('change', event => this.#handleChange(event))
    this.#withoutPadding = document.getElementById('without_padding');
    this.#withoutPadding.addEventListener('change', event => this.#handleChange(event))

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

  decode(s) {
    return atob(s);
  }

  encode(s) {
    return btoa(s);
  }

  urlSafeDecode(s) {
    return this.decode(s.replace(/-/g, '+').replace(/_/g, '\\'));
  }

  urlSafeEncode(s) {
    return this.encode(s).replace(/\+/g, '-').replace(/\//g, '_');
  }

  #handleChange(event) {
    const encoding = event.target === this.#decodedEditor.display.wrapper.querySelector('textarea') || event.target === this.#urlSafe || event.target === this.#withoutPadding;
    const src = encoding ? this.#decodedEditor : this.#encodedEditor;
    const dst = encoding ? this.#encodedEditor : this.#decodedEditor;
    this.#update(src.getValue(), encoding, dst)
  }

  #update(value, encoding, dst) {
    if (encoding) {
      var encoded = this.#urlSafe.checked ? this.urlSafeEncode(value) : this.encode(value);
      if (this.#withoutPadding.checked) {
        encoded = encoded.replace(/=+$/, '');
      }

      dst.setValue(encoded);
    } else {
      dst.setValue(this.#urlSafe.checked ? this.urlSafeDecode(value) : this.decode(value));
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new Base64EncoderDecoder());
