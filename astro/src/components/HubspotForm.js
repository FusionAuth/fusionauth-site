
const HUBSPOT_PORTAL_ID = '634739';

class HubSpotForm {
  constructor(formId) {
    this.portalId = HUBSPOT_PORTAL_ID;
    this.formId = formId;
    this.apiUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${this.portalId}/${formId}`;
    this.init();
  }

  init() {
    this.loadTrackingScript();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupFormHandlers());
    } else {
      this.setupFormHandlers();
    }
  }

  loadTrackingScript() {
    if (!document.querySelector('#hs-script-loader')) {
      const script = document.createElement('script');
      script.id = 'hs-script-loader';
      script.src = `//js.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  setupFormHandlers() {
    const forms = document.querySelectorAll('[data-hubspot-form]');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    });
  }

  getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  getFormData(form) {
    const formData = new FormData(form);
    const fields = [];
    for (let [name, value] of formData.entries()) {
      if (name !== 'submit') {
        fields.push({
          objectType: name.toLowerCase() === 'email' ? 'CONTACT' : undefined,
          name: name,
          value: value
        });
      }
    }
    return fields;
  }

  getContext() {
    return {
      hutk: this.getCookie('hubspotutk'),
      pageUri: window.location.href,
      pageName: document.title
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase());
  }

  async handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('[type="submit"]');
    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    this.clearErrors(form);

    const formFieldsData = this.getFormData(form);
    let clientSideErrors = [];

    // Client-Side Email Validation, HubSpot allows test@test without tld
    const emailFieldData = formFieldsData.find(field => field.name.toLowerCase() === 'email'); 
    if (emailFieldData) {
      if (!emailFieldData.value) {
        clientSideErrors.push({ message: 'Email address is required.' });
      } else if (!this.isValidEmail(emailFieldData.value)) {
        clientSideErrors.push({ message: `Enter a valid email address.` }); 
      }
    }

    if (clientSideErrors.length > 0) {
      this.handleError(form, {
        message: 'Please correct the issues below:',
        errors: clientSideErrors 
      });
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      return;
    }

    try {
      const context = this.getContext();
      const payload = {
        fields: formFieldsData,
        context: context
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        this.handleSuccess(form);
      } else {
        const errorData = await response.json();
        if (errorData.message && !errorData.errors) {
            this.handleError(form, { errors: [{ message: errorData.message }] });
        } else {
             this.handleError(form, errorData);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.handleError(form, { message: 'Network error. Please try again.' });
    }

    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }

  handleSuccess(form) {
    const formFieldsContainer = form.querySelector('.form-fields');
    if (formFieldsContainer) {
      formFieldsContainer.style.display = 'none';
    } else { 
      const allInputs = form.querySelectorAll('input:not([type="submit"]), textarea, select');
      allInputs.forEach(f => {
        if(f.parentElement) f.parentElement.style.display = 'none';
      });
    }
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
        submitButton.style.display = 'none'; 
    }

    let successMessage = form.querySelector('.success-message');
    if (!successMessage) {
      successMessage = document.createElement('div');
      successMessage.className = 'success-message mt-4'; 
      form.appendChild(successMessage); 
    }
    successMessage.innerHTML = `
      <div class="border border-green-200 rounded-md p-4">
        <div class="flex">
          <div class="ml-3">
            <p class="text-sm font-medium">
              Thank you! Your submission has been received.
            </p>
          </div>
        </div>
      </div>
    `;
    successMessage.style.display = 'block';
  }

  handleError(form, errorData) {
    let errorContainer = form.querySelector('.error-container');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'error-container mb-4';
      form.insertBefore(errorContainer, form.firstChild);
    }

    let errorMessagesHTML = '';
    const uniqueMessages = new Set();

    if (errorData && errorData.message && (!errorData.errors || errorData.errors.length === 0)) {
      uniqueMessages.add(errorData.message);
    } else if (errorData && errorData.message) {
      errorMessagesHTML += `<p class="text-sm font-medium mb-2">${errorData.message}</p>`;
    }

    if (errorData && errorData.errors && errorData.errors.length > 0) {
      errorMessagesHTML += '<ul class="list-disc list-inside pl-1 text-sm">';
      errorData.errors.forEach(error => {
        let message = error.message;
        if (error.path) {
            const fieldNameFromPath = error.path.split('.').pop();
            if (message.includes("VALIDATION_ERROR_MESSAGE") && fieldNameFromPath) {
                 message = `Invalid input for ${fieldNameFromPath.replace(/([A-Z])/g, ' $1').toLowerCase()}.`; 
            } else if (!message.toLowerCase().includes(fieldNameFromPath?.toLowerCase())) {
                 // Prepend field name if not already in message
                 message = `${fieldNameFromPath.charAt(0).toUpperCase() + fieldNameFromPath.slice(1)}: ${message}`;
            }
        } else if (error.name && !message.toLowerCase().includes(error.name.toLowerCase())) {
            message = `${error.name.charAt(0).toUpperCase() + error.name.slice(1)}: ${message}`;
        }
        if (!uniqueMessages.has(message)) {
            errorMessagesHTML += `<li>${message}</li>`;
            uniqueMessages.add(message);
        }
      });
      errorMessagesHTML += '</ul>';
    } else if (uniqueMessages.size > 0) {
         errorMessagesHTML += '<ul class="list-disc list-inside pl-1 text-sm">';
         uniqueMessages.forEach(msg => {
            errorMessagesHTML += `<li>${msg}</li>`;
         });
         errorMessagesHTML += '</ul>';
    }

    if (errorMessagesHTML.trim() === '' && uniqueMessages.size === 0) {
        errorMessagesHTML = `<p class="text-sm font-medium">An unexpected error occurred. Please try again.</p>`;
    }

    errorContainer.innerHTML = `
      <div class="border border-red-400 rounded-md p-4">
        <div class="flex">
          <div class="ml-3">
            ${errorMessagesHTML}
          </div>
        </div>
      </div>
    `;
    errorContainer.style.display = 'block';
  }

  clearErrors(form) {
    const errorContainer = form.querySelector('.error-container');
    if (errorContainer) {
      errorContainer.innerHTML = '';
      errorContainer.style.display = 'none';
    }
  }
}

export default HubSpotForm;

export function initHubSpotForm(formId) {
  return new HubSpotForm(formId);
}