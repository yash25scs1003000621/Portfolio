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

    /* Persistent to-do list */
    (() => {
      const storageKey = 'portfolio-todo-tasks';
      const todoForm = document.getElementById('todo-form');
      const todoInput = document.getElementById('todo-input');
      const todoList = document.getElementById('todo-list');
      const todoEmpty = document.getElementById('todo-empty');
      const todoSummary = document.getElementById('todo-summary');
      const todoError = document.getElementById('todo-error');
      const todoFilters = document.querySelector('.todo-filters');
      const clearCompleted = document.getElementById('todo-clear-completed');
      let activeFilter = 'all';
      let tasks = loadTasks();

      function loadTasks() { try { const saved = JSON.parse(localStorage.getItem(storageKey)); return Array.isArray(saved) ? saved.filter(task => task && typeof task.title === 'string') : []; } catch { return []; } }
      function saveTasks() { localStorage.setItem(storageKey, JSON.stringify(tasks)); }
      function escapeHtml(text) { const el = document.createElement('span'); el.textContent = text; return el.innerHTML; }
      function visibleTasks() { return tasks.filter(task => activeFilter === 'all' || (activeFilter === 'active' && !task.completed) || (activeFilter === 'completed' && task.completed)); }
      function renderTasks() {
        const shown = visibleTasks();
        const remaining = tasks.filter(task => !task.completed).length;
        todoSummary.textContent = remaining === 1 ? '1 task left' : `${remaining} tasks left`;
        todoList.innerHTML = shown.map(task => `<li class="todo-item ${task.completed ? 'is-completed' : ''}" data-task-id="${task.id}"><input class="todo-check" type="checkbox" aria-label="Mark ${escapeHtml(task.title)} as ${task.completed ? 'active' : 'complete'}" ${task.completed ? 'checked' : ''}><span class="todo-title">${escapeHtml(task.title)}</span><div class="todo-actions"><button class="todo-action todo-edit" type="button">Edit</button><button class="todo-action todo-delete" type="button">Delete</button></div></li>`).join('');
        todoEmpty.hidden = shown.length > 0;
        clearCompleted.hidden = !tasks.some(task => task.completed);
      }

      todoForm.addEventListener('submit', event => {
        event.preventDefault();
        const title = todoInput.value.trim();
        if (!title) { todoError.textContent = 'Please enter a task first.'; todoInput.focus(); return; }
        tasks.unshift({ id: window.crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), title, completed: false });
        saveTasks(); renderTasks(); todoForm.reset(); todoError.textContent = ''; todoInput.focus();
      });
      todoFilters.addEventListener('click', event => {
        const button = event.target.closest('[data-todo-filter]');
        if (!button) return;
        activeFilter = button.dataset.todoFilter;
        todoFilters.querySelectorAll('[data-todo-filter]').forEach(filter => { const selected = filter === button; filter.classList.toggle('is-active', selected); filter.setAttribute('aria-pressed', String(selected)); });
        renderTasks();
      });
      todoList.addEventListener('change', event => {
        if (!event.target.matches('.todo-check')) return;
        const task = tasks.find(item => item.id === event.target.closest('.todo-item').dataset.taskId);
        if (task) { task.completed = event.target.checked; saveTasks(); renderTasks(); }
      });
      todoList.addEventListener('click', event => {
        const item = event.target.closest('.todo-item');
        if (!item) return;
        const task = tasks.find(entry => entry.id === item.dataset.taskId);
        if (!task) return;
        if (event.target.closest('.todo-delete')) { tasks = tasks.filter(entry => entry.id !== task.id); saveTasks(); renderTasks(); }
        if (event.target.closest('.todo-edit')) editTask(item, task);
      });
      function editTask(item, task) {
        const title = item.querySelector('.todo-title');
        const editor = document.createElement('input');
        editor.className = 'todo-edit-input'; editor.value = task.title; editor.maxLength = 160; editor.setAttribute('aria-label', 'Edit task');
        title.replaceWith(editor); editor.focus(); editor.select();
        const finish = () => { const value = editor.value.trim(); if (value) task.title = value; saveTasks(); renderTasks(); };
        editor.addEventListener('blur', finish, { once: true });
        editor.addEventListener('keydown', event => { if (event.key === 'Enter') editor.blur(); if (event.key === 'Escape') { editor.value = task.title; editor.blur(); } });
      }
      clearCompleted.addEventListener('click', () => { tasks = tasks.filter(task => !task.completed); saveTasks(); renderTasks(); });
      renderTasks();
    })();

    /* Live weather dashboard — Open-Meteo geocoding + forecast APIs */
    (() => {
      const form = document.getElementById('weather-form');
      const input = document.getElementById('weather-city');
      const submit = document.getElementById('weather-submit');
      const error = document.getElementById('weather-error');
      const loading = document.getElementById('weather-loading');
      const result = document.getElementById('weather-result');
      const placeholder = document.getElementById('weather-placeholder');
      const codes = {
        0: ['Clear sky', '☀'], 1: ['Mainly clear', '🌤'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁'],
        45: ['Foggy', '🌫'], 48: ['Rime fog', '🌫'], 51: ['Light drizzle', '🌦'], 53: ['Drizzle', '🌦'],
        55: ['Heavy drizzle', '🌧'], 61: ['Slight rain', '🌦'], 63: ['Rain', '🌧'], 65: ['Heavy rain', '🌧'],
        71: ['Light snow', '🌨'], 73: ['Snow', '🌨'], 75: ['Heavy snow', '❄'], 80: ['Rain showers', '🌦'],
        81: ['Rain showers', '🌧'], 82: ['Violent showers', '⛈'], 95: ['Thunderstorm', '⛈'],
        96: ['Thunderstorm with hail', '⛈'], 99: ['Thunderstorm with hail', '⛈']
      };

      function setLoading(isLoading) {
        loading.hidden = !isLoading;
        submit.disabled = isLoading;
        submit.firstChild.textContent = isLoading ? 'Loading… ' : 'Check weather ';
      }
      function showError(message) { error.textContent = message; result.hidden = true; placeholder.hidden = false; }
      function renderWeather(place, data) {
        const current = data.current;
        const [condition, icon] = codes[current.weather_code] || ['Current conditions', '◌'];
        document.getElementById('weather-location').textContent = `${place.name}${place.country ? `, ${place.country}` : ''}`;
        document.getElementById('weather-condition').textContent = condition;
        document.getElementById('weather-icon').textContent = icon;
        document.getElementById('weather-temp').textContent = Math.round(current.temperature_2m);
        document.getElementById('weather-humidity').textContent = `${current.relative_humidity_2m}%`;
        document.getElementById('weather-wind').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
        document.getElementById('weather-feels-like').textContent = `${Math.round(current.apparent_temperature)}°C`;
        document.getElementById('weather-updated').textContent = `Updated ${current.time.replace('T', ' · ')} local time`;
        placeholder.hidden = true;
        result.hidden = false;
      }
      async function getWeather(city) {
        const placeResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        if (!placeResponse.ok) throw new Error('Unable to look up that city right now.');
        const placeData = await placeResponse.json();
        const place = placeData.results?.[0];
        if (!place) throw new Error('No city found with that name. Try a different spelling.');
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`);
        if (!weatherResponse.ok) throw new Error('Weather data is temporarily unavailable. Please try again.');
        const weatherData = await weatherResponse.json();
        if (!weatherData.current) throw new Error('The weather service returned incomplete data. Please try again.');
        renderWeather(place, weatherData);
      }
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const city = input.value.trim();
        if (!city) { showError('Enter a city name to search.'); input.focus(); return; }
        error.textContent = '';
        setLoading(true);
        try { await getWeather(city); }
        catch (requestError) {
          showError(requestError instanceof TypeError ? 'Network error. Check your connection and try again.' : requestError.message);
        } finally { setLoading(false); }
      });
    })();
