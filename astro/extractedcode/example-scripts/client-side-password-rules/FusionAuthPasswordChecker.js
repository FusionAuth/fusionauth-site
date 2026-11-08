class FusionAuthPasswordChecker {
  #minLength;
  #maxLength;
  #passwordField;
  #feedbackContainer;
  #requireMixedCase;
  #requireNonAlpha;
  #requireNumber;
  #submitButton;
  #timer;

  constructor(minLength, maxLength, requireMixedCase, requireNonAlpha, requireNumber) {
    this.#minLength = minLength;
    this.#maxLength = maxLength;

    this.#requireMixedCase = requireMixedCase;
    this.#requireNonAlpha = requireNonAlpha;
    this.#requireNumber = requireNumber;

    this.#passwordField = document.querySelector('input[type="password"]');
    const form = this.#passwordField?.closest('form');
    this.#submitButton = [...(form?.querySelectorAll('button, input[type="submit"]') ?? [])]
      .find((button) => button.type === 'submit');
    this.#feedbackContainer = this.#passwordField?.closest('.form-row') ?? this.#passwordField?.parentElement?.parentElement;
    this.#timer = null;

    if (this.#passwordField && this.#submitButton && this.#feedbackContainer) {
      this.#passwordField.addEventListener('input', () => this.#score());
      this.#setSubmitEnabled(false);
      this.#score();
    }
  }

  #setSubmitEnabled(enabled) {
    this.#submitButton.disabled = !enabled;
    this.#submitButton.classList.toggle('disabled', !enabled);
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
      this.#feedbackContainer.querySelector('.fa-password-rule-error')?.remove();

      const password = this.#passwordField.value;
      if (password.length === 0) {
        this.#passwordField.classList.remove('ok', 'validation');
        this.#setSubmitEnabled(false);
        return;
      }

      this.#check(password, (value) => value.length >= this.#minLength, () => 'too short');
      this.#check(password, (value) => value.length <= this.#maxLength, () => 'too long');

      if (this.#requireNumber) {
        this.#check(password, (value) => /\d/.test(value), () => 'must contain a number');
      }

      if (this.#requireMixedCase) {
        this.#check(password, (value) => /[a-z]/.test(value) && /[A-Z]/.test(value), () => 'must contain mixed case');
      }

      if (this.#requireNonAlpha) {
        this.#check(password, (value) => /\W/.test(value), () => 'must contain a special character');
      }

      if (this.#feedbackContainer.querySelector('.fa-password-rule-error') === null) {
        // Add classes, or style to provide visual feedback
        this.#passwordField.classList.add('ok');
        this.#passwordField.classList.remove('validation');

        this.#setSubmitEnabled(true);
      }

    }, 500);
  }

  #invalid(errorText) {
    // Add classes, or style to provide visual feedback
    this.#passwordField.classList.add('validation');
    this.#passwordField.classList.remove('ok');

    let errorSpan = this.#feedbackContainer.querySelector('.fa-password-rule-error');
    if (errorSpan === null) {
      errorSpan = document.createElement("span");
      errorSpan.classList.add('error', 'fa-password-rule-error');
      this.#feedbackContainer.appendChild(errorSpan);
    }

    if (errorSpan.textContent !== '') {
      errorSpan.textContent += ', ';
    }

    errorSpan.textContent += errorText;
    this.#setSubmitEnabled(false);
  }
}
