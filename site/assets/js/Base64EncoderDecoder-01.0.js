

var Base64EncoderDecoder = function() {
  Prime.Utils.bindAll(this);
  Prime.Document.queryById('decoded-textarea').addEventListener('keyup', this._handleKeyUp);
  Prime.Document.queryById('encoded-textarea').addEventListener('keyup', this._handleKeyUp);
  this.urlSafe = Prime.Document.queryById('url_safe');
  this.withoutPadding = Prime.Document.queryById('without_padding');
};

Base64EncoderDecoder.constructor = Base64EncoderDecoder;
Base64EncoderDecoder.prototype = {
  decode: function(s) {
    return atob(s);
  },

  encode: function(s) {
    return btoa(s);
  },

  urlSafeDecode: function(s) {
    return this.decode(s.replace(/-/g, '+')
        .replace(/_/g, '\\'));
  },

  urlSafeEncode: function(s) {
    return this.encode(s)
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
  },

  _handleKeyUp: function(event) {
    var target = new Prime.Document.Element(event.target);
    var encoding = target.getId().startsWith('decoded');

    var src = Prime.Document.queryById(encoding ? 'decoded-textarea' : 'encoded-textarea');
    var dst = Prime.Document.queryById(encoding ? 'encoded-textarea' : 'decoded-textarea');
    var s = src.getValue();

    if (encoding) {
      var encoded = this.urlSafe.isChecked() ? this.urlSafeEncode(s) : this.encode(s);
      if (this.withoutPadding.isChecked()) {
        encoded = encoded.replace(/=+$/, '');
      }

      dst.setValue(encoded);
    } else {
      dst.setValue(this.urlSafe.isChecked() ? this.urlSafeDecode(s) : this.decode(s));
    }
  }
};

Prime.Document.onReady(function() {
  new Base64EncoderDecoder();
});