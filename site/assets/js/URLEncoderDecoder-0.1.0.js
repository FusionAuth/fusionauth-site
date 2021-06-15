var EncoderDecoder = function() {
  Prime.Utils.bindAll(this);
  Prime.Document.queryById('decoded-textarea').addEventListener('keyup', this._handleKeyUp);
  Prime.Document.queryById('encoded-textarea').addEventListener('keyup', this._handleKeyUp);
};

EncoderDecoder.constructor = EncoderDecoder;
EncoderDecoder.prototype = {
  _encodeDecode: function(s, encoding) {
    var parts = [];
    var vars = s.split('&');
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

    return parts.join('');
  },

  _handleKeyUp: function(event) {
    var target = new Prime.Document.Element(event.target);
    var encoding = target.getId().startsWith('decoded');

    var src = Prime.Document.queryById(encoding ? 'decoded-textarea' : 'encoded-textarea');
    var dst = Prime.Document.queryById(encoding ? 'encoded-textarea' : 'decoded-textarea');
    var s = src.getValue();

    var index = s.indexOf('?');
    if (index === -1) {
      dst.setValue(this._encodeDecode(s, encoding));
    } else {
      dst.setValue(s.substring(0, index) + '?' + this._encodeDecode(s.substring(index + 1), encoding));
    }
  }
};

Prime.Document.onReady(function() {
  new EncoderDecoder();
});