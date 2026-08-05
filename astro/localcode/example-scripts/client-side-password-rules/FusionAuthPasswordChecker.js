class FusionAuthPasswordChecker {
  #minLength;
  #maxLength;
  #passwordField;
  #requireMixedCase;
  #requireNonAlpha;
  #requireNumber;
  #timer;

  constructor(minLength, maxLength, requireMixedCase, requireNonAlpha, requireNumber) {
    this.#minLength = minLength;
    this.#maxLength = maxLength;

    this.#requireMixedCase = requireMixedCase;
    this.#requireNonAlpha = requireNonAlpha;
    this.#requireNumber = requireNumber;

    this.#passwordField = document.querySelector('input[type="password"]');

    if (this.#passwordField !== null) {
      this.#passwordField.addEventListener('input', () => this.#score());
      this.#passwordField.closest('form').querySelector('button').disabled = true;
      this.#passwordField.closest('form').querySelector('button').classList.add('disabled');
    }
  }

  #check(password, check, errorTextSupplier) {
    if (check(password)) {
      return;
    }
    
    this.#invalid(errorTextSupplier());
  }

  #score() {
    if (this.#timer !== null) {
      clearTimeout(this.#timer);
    }

    this.#timer = setTimeout(() => {
      const error = this.#passwordField.closest('.form-row').querySelector('span.error');
      if (error !== null) {
        error.remove();
      }

      const password = this.#passwordField.value;
      if (password.length === 0) {
        return;
      }

      this.#check(password, (value) => value.length >= this.#minLength, () => 'too short');
      this.#check(password, (value) => value.length <= this.#maxLength, () => 'too long');

      if (this.#requireNumber) {
        this.#check(password, (value) => /\d/.test(value), () => 'must container a number');
      }

      if (this.#requireMixedCase) {
        this.#check(password, (value) => /[a-z]/.test(value) && /[A-Z]/.test(value), () => 'must contain mixed case');
      }

      if (this.#requireNonAlpha) {
        this.#check(password, (value) => /\W/.test(value), () => 'must contain a special character');
      }

      if (this.#passwordField.closest('.form-row').querySelector('span.error') === null) {
        // Add classes, or style to provide visual feedback
        this.#passwordField.classList.add('ok');
        this.#passwordField.classList.remove('validation');

        this.#passwordField.closest('form').querySelector('button').disabled = false;
        this.#passwordField.closest('form').querySelector('button').classList.remove('disabled');
      }
      
    }, 500);
  }

  #invalid(errorText) {
    // Add classes, or style to provide visual feedback
    this.#passwordField.classList.add('validation');
    this.#passwordField.classList.remove('ok');

    let errorSpan = this.#passwordField.closest('.form-row').querySelector('span.error');
    if (errorSpan === null) {
      errorSpan = document.createElement("span");
      errorSpan.classList.add('error');
      this.#passwordField.closest('.form-row').appendChild(errorSpan);
    }

    if (errorSpan.innerHTML !== '') {
      errorSpan.innerHTML = errorSpan.innerHTML + ', ';
    }

    errorSpan.innerHTML = errorSpan.innerHTML + errorText;
    this.#passwordField.closest('form').querySelector('button').disabled = true;
    this.#passwordField.closest('form').querySelector('button').classList.add('disabled');
  }
}

// Note, this will initialize these values during the server side .ftl template rendering.
const minLength = ${passwordValidationRules.minLength};
const maxLength = ${passwordValidationRules.maxLength}; 
const requireMixedCase = ${passwordValidationRules.requireMixedCase?c};
const requireNonAlpha = ${passwordValidationRules.requireNonAlpha?c};
const requireNumber = ${passwordValidationRules.requireNumber?c};
                        
document.addEventListener('DOMContentLoaded', () => new FusionAuthPasswordChecker(minLength, maxLength, requireMixedCase, requireNonAlpha, requireNumber));    