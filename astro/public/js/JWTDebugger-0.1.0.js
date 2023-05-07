CodeMirror.defineMode("encoded-jwt", function() {
  return {
    token: function(stream, state) {
      if (stream.eatWhile(/[^.]/)) {
        if (state.position === 'header') {
          state.position = 'payload';
          return 'jwt-header';
        } else if (state.position === 'payload') {
          state.position = 'signature';
          return 'jwt-payload';
        } else {
          return 'jwt-signature';
        }
      }

      stream.next();
      return null;
    },
    startState: function() {
      return {
        position : 'header'
      };
    }
  };
});

var JWTDecoder = function() {
  Prime.Utils.bindAll(this);
  this.encoded = Prime.Document.queryById('encoded-textarea');

  this.encoded.focus();
  this.jwtHeader = Prime.Document.queryById('header-textarea');
  this.jwtBody = Prime.Document.queryById('payload-textarea');

  this.encoedEditor = CodeMirror.fromTextArea(this.encoded.domElement, {
    autofocus: true,
    lineNumbers: true,
    lineWrapping: true,
    viewportMargin: 100,
    mode: 'encoded-jwt'
  });
  this.encoedEditor.setSize(null, 50);
  this.encoedEditor.on('keyup', this._handleKeyUp);

  this.jwtHeaderEditor = CodeMirror.fromTextArea(this.jwtHeader.domElement, {
    autofocus: false,
    lineNumbers: true,
    lineWrapping: false,
    viewportMargin: 100,
    mode: 'javascript'
  });
  this.jwtHeaderEditor.setSize(null, 80);
  this.jwtHeaderEditor.on('keyup', this._handleJSONKeyUp);

  this.jwtBodyEditor = CodeMirror.fromTextArea(this.jwtBody.domElement, {
    autofocus: false,
    lineNumbers: true,
    lineWrapping: false,
    viewportMargin: 100,
    mode: 'javascript'
  });
  this.jwtBodyEditor.setSize(null, 120);
  this.jwtBodyEditor.on('keyup', this._handleJSONKeyUp);
};

JWTDecoder.constructor = JWTDecoder;
JWTDecoder.prototype = {
  _handleJSONKeyUp: function() {
    var current = this.encoedEditor.getValue().split('.');
    // Do each part separately so that if we exception we can continue

    try {
      var headValue = this.jwtHeaderEditor.getValue();
      if (headValue === '') {
        current[0] = headValue;
      } else {
        var headStringified = JSON.stringify(JSON.parse(headValue));
        current[0] = window.btoa(headStringified).replace(/=/g, '');
      }
    } catch (error) {
      console.info(error);
      // Ignore
    }

    try {
      var bodyValue = this.jwtBodyEditor.getValue();
      if (bodyValue === '') {
        current[1] = bodyValue;
      } else {
        var bodyStringified = JSON.stringify(JSON.parse(bodyValue));
        current[1] = window.btoa(bodyStringified).replace(/=/g, '');
      }
    } catch (error) {
      console.info(error);
      // Ignore
    }

    this.encoedEditor.setValue(current.join('.'));
  },

  _handleKeyUp: function() {
    try {
      this.encoedEditor.setSize(null, this.encoded.getNextSibling().queryFirst('.CodeMirror-sizer').getOuterHeight() + 5);
      var s = this.encoedEditor.getValue().split('.');
      if (s.length > 0) {
        var header = JSON.parse(window.atob(s[0]));
        this.jwtHeaderEditor.setValue(JSON.stringify(header, null, 2));
        try {
          this.jwtHeaderEditor.setSize(null, this.jwtHeader.getNextSibling().queryFirst('.CodeMirror-sizer').getOuterHeight() + 5);
        } catch (error) {
          // Ignore
        }
      }

      if (s.length > 1) {
        var body = JSON.parse(window.atob(s[1]));
        this.jwtBodyEditor.setValue(JSON.stringify(body, null, 2));
        try {
          this.jwtBodyEditor.setSize(null, this.jwtBody.getNextSibling().queryFirst('.CodeMirror-sizer').getOuterHeight() + 5);
        } catch (error) {
          // Ignore
        }
      }
    } catch (error) {
      // Ignore
    }
  }
};
Prime.Document.onReady(function() {
  new JWTDecoder();
});