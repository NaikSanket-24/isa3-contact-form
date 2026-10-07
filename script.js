const form = document.getElementById('contactForm');
const btn = document.getElementById('submitBtn');
const statusEl = document.getElementById('status');
const message = document.getElementById('message');
const count = document.getElementById('count');

const rules = {
  name:    v => v.trim().length >= 2 ? '' : 'Please enter your full name.',
  email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email address.',
  phone:   v => v === '' || /^[6-9]\d{9}$/.test(v) ? '' : 'Enter a valid 10-digit mobile number.',
  subject: v => v.trim().length >= 3 ? '' : 'Subject must be at least 3 characters.',
  message: v => v.trim().length >= 10 && v.length <= 500 ? '' : 'Message must be 10–500 characters.'
};

function validateField(input) {
  const msg = rules[input.name](input.value);
  const wrap = input.closest('.field');
  wrap.classList.toggle('invalid', !!msg);
  wrap.querySelector('.error').textContent = msg;
  return !msg;
}

form.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('blur', () => validateField(el));
  el.addEventListener('input', () => el.closest('.field').classList.contains('invalid') && validateField(el));
});

message.addEventListener('input', () => { count.textContent = message.value.length; });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = '';
  statusEl.className = '';

  const fields = [...form.querySelectorAll('input, textarea')];
  const allValid = fields.map(validateField).every(Boolean);
  if (!allValid) return;

  const data = Object.fromEntries(new FormData(form).entries());

  btn.disabled = true;
  btn.classList.add('loading');

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Something went wrong.');

    statusEl.textContent = '✅ Thank you! Your message has been sent.';
    statusEl.className = 'ok';
    form.reset();
    count.textContent = '0';
  } catch (err) {
    statusEl.textContent = '❌ ' + err.message;
    statusEl.className = 'fail';
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
});
