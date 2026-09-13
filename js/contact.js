// Contact form: client-side validation only (no backend yet, matching
// the copy in the form itself).

const form = document.querySelector('[data-contact-form]');
const success = document.querySelector('[data-contact-success]');

if (form) {
  const fields = {
    name: form.querySelector('#cf-name'),
    email: form.querySelector('#cf-email'),
    message: form.querySelector('#cf-msg'),
  };
  const errors = {
    name: form.querySelector('[data-error="name"]'),
    email: form.querySelector('[data-error="email"]'),
    message: form.querySelector('[data-error="message"]'),
  };

  function validate() {
    const messages = {};
    if (!fields.name.value.trim()) messages.name = 'A name, or something to call you.';
    const email = fields.email.value.trim();
    if (!email) messages.email = 'We need an address to reply to.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) messages.email = 'That address does not look complete.';
    if (fields.message.value.trim().length < 12) messages.message = 'A sentence or two, so we know what to answer.';
    return messages;
  }

  function applyErrors(messages) {
    Object.keys(fields).forEach((key) => {
      const hasError = Boolean(messages[key]);
      fields[key].style.borderColor = hasError ? 'var(--signal)' : 'var(--rule-bone-28)';
      fields[key].setAttribute('aria-invalid', hasError ? 'true' : 'false');
      errors[key].textContent = messages[key] || '';
      errors[key].style.display = hasError ? '' : 'none';
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const messages = validate();
    applyErrors(messages);
    if (Object.keys(messages).length) return;
    form.hidden = true;
    success.hidden = false;
  });
}
