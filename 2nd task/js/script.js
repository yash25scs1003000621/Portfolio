/* ── Mobile nav toggle ── */
    const themeToggle = document.querySelector('.theme-toggle');
    const savedTheme = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    function applyTheme(theme) {
      document.documentElement.dataset.theme = theme;
      const isDark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
    }

    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem('portfolio-theme', nextTheme);
    });

    const toggle = document.querySelector('.nav-toggle');
    const nav    = document.getElementById('primary-nav');

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      nav.setAttribute('aria-hidden', String(isOpen));
    });

    // Close nav when a link inside it is clicked (mobile UX)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
      });
    });

    // Close nav on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
        toggle.focus();
      }
    });

    /* ── Active nav link on scroll ── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const isCurrent = link.getAttribute('href') === '#' + entry.target.id;
            link.setAttribute('aria-current', isCurrent ? 'page' : 'false');
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));

    /* ── Contact form validation & submit ── */
    const form       = document.getElementById('contact-form');
    const submitBtn  = document.getElementById('cf-submit');
    const statusEl   = document.getElementById('form-status');

    function showFieldError(fieldId, errorId, show) {
      const errorEl = document.getElementById(errorId);
      if (!errorEl) return;
      errorEl.style.display = show ? 'block' : 'none';
      document.getElementById(fieldId)?.setAttribute('aria-invalid', show ? 'true' : 'false');
    }

    function clearStatus() {
      statusEl.textContent = '';
      statusEl.className   = 'form-status';
      statusEl.removeAttribute('role');
    }

    function setStatus(message, type) {
      clearStatus();
      statusEl.textContent = message;
      statusEl.classList.add(`form-status--${type}`);
      statusEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearStatus();

      const name    = document.getElementById('cf-name');
      const email   = document.getElementById('cf-email');
      const message = document.getElementById('cf-message');
      const consent = document.getElementById('cf-consent');

      let valid = true;

      // Name
      if (!name.value.trim()) {
        showFieldError('cf-name', 'cf-name-error', true);
        valid = false;
      } else { showFieldError('cf-name', 'cf-name-error', false); }

      // Email (basic pattern)
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (!emailOk) {
        showFieldError('cf-email', 'cf-email-error', true);
        valid = false;
      } else { showFieldError('cf-email', 'cf-email-error', false); }

      // Message length
      if (message.value.trim().length < 20) {
        showFieldError('cf-message', 'cf-message-error', true);
        valid = false;
      } else { showFieldError('cf-message', 'cf-message-error', false); }

      // Consent
      if (!consent.checked) {
        showFieldError('cf-consent', 'cf-consent-error', true);
        valid = false;
      } else { showFieldError('cf-consent', 'cf-consent-error', false); }

      if (!valid) {
        setStatus("Please fix the errors above before submitting.", 'error');
        // Move focus to first invalid field
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }

      // Simulate async submit
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Sending…';

      await new Promise(r => setTimeout(r, 1500));

      submitBtn.removeAttribute('aria-busy');
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = 'Send message';

      setStatus("Message sent! I'll get back to you within 1–2 business days.", 'success');
      form.reset();

      // Move focus to the status message
      statusEl.setAttribute('tabindex', '-1');
      statusEl.focus();
    });

    /* ── Real-time inline validation (on blur) ── */
    document.getElementById('cf-name').addEventListener('blur', function() {
      showFieldError('cf-name', 'cf-name-error', !this.value.trim());
    });
    document.getElementById('cf-email').addEventListener('blur', function() {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value.trim());
      showFieldError('cf-email', 'cf-email-error', !ok && this.value !== '');
    });
    document.getElementById('cf-message').addEventListener('blur', function() {
      showFieldError('cf-message', 'cf-message-error', this.value.trim().length < 20 && this.value !== '');
    });
